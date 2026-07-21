<?php

namespace App\Http\Controllers;

use App\Jobs\ActivateSubscriptionAfterPayment;
use App\Models\Invoice;
use App\Models\MobileMoneyTransaction;
use App\Services\MobileMoney\MtnMomoService;
use App\Services\MobileMoney\OrangeMoneyService;
use App\Services\MobileMoney\WaveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MobileMoneyController extends Controller
{
    /**
     * Initier un paiement Mobile Money pour une facture.
     *
     * Opérateurs supportés : orange_money, mtn_momo, wave
     */
    public function initiate(Request $request, Invoice $invoice)
    {
        abort_if($invoice->company_id !== $request->user()->company_id, 403);

        $request->validate([
            'phone_number' => 'required|string|regex:/^[+]?[0-9]{8,15}$/',
            'operator'     => 'required|in:orange_money,mtn_momo,wave',
            'amount'       => 'required|numeric|min:1',
        ]);

        $internalRef = strtoupper(Str::random(12));

        $transaction = MobileMoneyTransaction::create([
            'company_id'   => $invoice->company_id,
            'invoice_id'   => $invoice->id,
            'amount'       => $request->amount,
            'currency'     => $invoice->currency ?? 'XOF',
            'phone_number' => $request->phone_number,
            'operator'     => $request->operator,
            'reference'    => $internalRef,
            'status'       => 'pending',
            'initiated_at' => now(),
        ]);

        try {
            return match ($request->operator) {
                'orange_money' => $this->initiateOrange($transaction, $request),
                'mtn_momo'     => $this->initiateMtn($transaction, $request),
                'wave'         => $this->initiateWave($transaction, $request),
                default        => abort(422, 'Opérateur non reconnu.'),
            };
        } catch (\RuntimeException $e) {
            // En cas d'erreur API, on marque la transaction comme échouée
            $transaction->update(['status' => 'failed', 'provider_status' => 'INIT_ERROR']);
            Log::error('MobileMoney initiate error', [
                'operator'       => $request->operator,
                'transaction_id' => $transaction->id,
                'error'          => $e->getMessage(),
            ]);

            return back()->withErrors(['operator' => $e->getMessage()]);
        }
    }

    // ─── Initiations par opérateur ─────────────────────────────────────────────

    private function initiateOrange(MobileMoneyTransaction $tx, Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var OrangeMoneyService $svc */
        $svc  = app(OrangeMoneyService::class);
        $data = $svc->initPayment(
            orderId:      $tx->reference,
            amount:       (float) $tx->amount,
            currency:     $tx->currency,
            customerPhone: $request->phone_number,
        );

        // Stocker le pay_token comme référence externe
        $payToken   = $data['pay_token']   ?? null;
        $paymentUrl = $data['payment_url'] ?? null;

        $tx->update(['external_reference' => $payToken]);

        if ($paymentUrl) {
            return redirect()->away($paymentUrl);
        }

        return back()->with('success', "Orange Money : paiement initié. Référence : {$tx->reference}.");
    }

    private function initiateMtn(MobileMoneyTransaction $tx, Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var MtnMomoService $svc */
        $svc        = app(MtnMomoService::class);
        $referenceId = $svc->requestToPay(
            externalId: $tx->reference,
            amount:     (float) $tx->amount,
            msisdn:     $request->phone_number,
            currency:   $tx->currency,
            note:       'Paiement facture CONSTRUIRO ERP',
        );

        // Stocker l'UUID MTN comme référence externe
        $tx->update(['external_reference' => $referenceId]);

        return back()->with('success', "MTN MoMo : demande envoyée. Validez sur votre téléphone. Référence : {$tx->reference}.");
    }

    private function initiateWave(MobileMoneyTransaction $tx, Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var WaveService $svc */
        $svc  = app(WaveService::class);
        $data = $svc->createCheckout(
            orderId:    $tx->reference,
            amount:     (float) $tx->amount,
            currency:   $tx->currency,
            successUrl: url('/billing?status=success&ref=' . $tx->reference),
            errorUrl:   url('/billing?status=error&ref=' . $tx->reference),
        );

        $checkoutId = $data['id']               ?? null;
        $launchUrl  = $data['wave_launch_url']  ?? null;

        $tx->update(['external_reference' => $checkoutId]);

        if ($launchUrl) {
            return redirect()->away($launchUrl);
        }

        return back()->with('success', "Wave : paiement initié. Référence : {$tx->reference}.");
    }

    // ─── Webhook unifié ────────────────────────────────────────────────────────

    /**
     * Webhook de confirmation appelé par l'opérateur.
     * Route publique — exclue du CSRF.
     *
     * URL : POST /webhooks/mobile-money/{operator}
     * Valeurs de {operator} : orange | mtn | wave
     */
    public function webhook(Request $request, string $operator): \Illuminate\Http\JsonResponse|\Illuminate\Http\Response
    {
        return match ($operator) {
            'orange'      => $this->webhookOrange($request),
            'orange_money'=> $this->webhookOrange($request),
            'mtn'         => $this->webhookMtn($request),
            'mtn_momo'    => $this->webhookMtn($request),
            'wave'        => $this->webhookWave($request),
            default       => response()->json(['error' => 'Opérateur inconnu.'], 404),
        };
    }

    // ─── Webhooks par opérateur ────────────────────────────────────────────────

    protected function webhookOrange(Request $request): \Illuminate\Http\JsonResponse
    {
        $rawBody   = $request->getContent();
        $signature = $request->header('X-Orange-Signature', '');

        /** @var OrangeMoneyService $svc */
        $svc = app(OrangeMoneyService::class);

        if (! $svc->verifyWebhookSignature($rawBody, $signature)) {
            Log::warning('Orange Money webhook: signature invalide.', ['ip' => $request->ip()]);
            return response()->json(['error' => 'invalid_signature'], 401);
        }

        $data    = $request->json()->all();
        // Orange envoie : order_id, status (SUCCESS | FAILED | CANCELLED | EXPIRED)
        $orderId = $data['order_id'] ?? $data['reference'] ?? null;
        $status  = $data['status']   ?? null;

        return $this->processWebhookPayload($orderId, $status, $data, [
            'success'  => ['SUCCESS'],
            'failed'   => ['FAILED', 'CANCELLED', 'EXPIRED'],
        ]);
    }

    protected function webhookMtn(Request $request): \Illuminate\Http\JsonResponse
    {
        $rawBody   = $request->getContent();
        $signature = $request->header('X-Callback-Signature', '');

        /** @var MtnMomoService $svc */
        $svc = app(MtnMomoService::class);

        if (! $svc->verifyWebhookSignature($rawBody, $signature)) {
            Log::warning('MTN MoMo webhook: signature invalide.', ['ip' => $request->ip()]);
            return response()->json(['error' => 'invalid_signature'], 401);
        }

        $data = $request->json()->all();
        // MTN envoie : externalId, status (SUCCESSFUL | FAILED | PENDING)
        $orderId = $data['externalId'] ?? $data['external_id'] ?? $data['reference'] ?? null;
        $status  = $data['status']     ?? null;

        return $this->processWebhookPayload($orderId, $status, $data, [
            'success' => ['SUCCESSFUL'],
            'failed'  => ['FAILED'],
        ]);
    }

    protected function webhookWave(Request $request): \Illuminate\Http\JsonResponse
    {
        $rawBody   = $request->getContent();
        $signature = $request->header('Wave-Signature', '');

        /** @var WaveService $svc */
        $svc = app(WaveService::class);

        if (! $svc->verifyWebhookSignature($rawBody, $signature)) {
            Log::warning('Wave webhook: signature invalide.', ['ip' => $request->ip()]);
            return response()->json(['error' => 'invalid_signature'], 401);
        }

        $data = $request->json()->all();
        // Wave envoie : client_reference, checkout_status (complete | error | cancelled)
        $orderId = $data['client_reference'] ?? $data['reference'] ?? null;
        $status  = $data['checkout_status'] ?? $data['status'] ?? null;

        return $this->processWebhookPayload($orderId, $status, $data, [
            'success' => ['complete', 'succeeded'],
            'failed'  => ['error', 'cancelled', 'expired'],
        ]);
    }

    // ─── Logique commune ───────────────────────────────────────────────────────

    /**
     * Traitement idempotent d'un événement webhook.
     *
     * @param  array{success: string[], failed: string[]} $statusMap
     */
    private function processWebhookPayload(
        ?string $orderId,
        ?string $providerStatus,
        array   $rawData,
        array   $statusMap
    ): \Illuminate\Http\JsonResponse {

        if (! $orderId) {
            Log::info('Mobile Money webhook: payload sans order_id ignoré.', ['data' => $rawData]);
            return response()->json(['ok' => true]);
        }

        $tx = MobileMoneyTransaction::where('reference', $orderId)->first();

        if (! $tx) {
            Log::warning('Mobile Money webhook: transaction introuvable.', ['order_id' => $orderId]);
            return response()->json(['error' => 'not_found'], 404);
        }

        // Idempotence : ne pas retraiter un événement déjà finalisé
        if (in_array($tx->status, ['success', 'failed'], true)) {
            return response()->json(['ok' => true]);
        }

        $isSuccess = in_array($providerStatus, $statusMap['success'], true);
        $isFailed  = in_array($providerStatus, $statusMap['failed'],  true);

        if ($isSuccess) {
            $tx->update([
                'status'          => 'success',
                'provider_status' => $providerStatus,
                'confirmed_at'    => now(),
                'webhook_payload' => $rawData,
            ]);

            // Mettre à jour la facture associée
            $this->updateInvoiceOnSuccess($tx);

            // Déclencher l'activation de l'abonnement en arrière-plan
            dispatch(new ActivateSubscriptionAfterPayment($tx));

        } elseif ($isFailed) {
            $tx->update([
                'status'          => 'failed',
                'provider_status' => $providerStatus,
                'confirmed_at'    => now(),
                'webhook_payload' => $rawData,
            ]);

        } else {
            // Statut intermédiaire (PENDING, etc.) — on log sans changer le statut
            Log::info('Mobile Money webhook: statut intermédiaire reçu.', [
                'order_id'        => $orderId,
                'provider_status' => $providerStatus,
            ]);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Met à jour la facture après un paiement confirmé.
     */
    private function updateInvoiceOnSuccess(MobileMoneyTransaction $tx): void
    {
        if (! $tx->invoice_id) {
            return;
        }

        $invoice = Invoice::find($tx->invoice_id);
        if (! $invoice) {
            return;
        }

        $invoice->increment('amount_paid', $tx->amount);
        $invoice->refresh();

        if ($invoice->amount_paid >= $invoice->total) {
            $invoice->update(['status' => 'paid']);
        } elseif ($invoice->amount_paid > 0) {
            $invoice->update(['status' => 'partial']);
        }
    }
}
