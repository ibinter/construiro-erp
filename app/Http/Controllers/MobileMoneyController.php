<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\MobileMoneyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MobileMoneyController extends Controller
{
    /**
     * Initier un paiement Mobile Money pour une facture.
     */
    public function initiate(Request $request, Invoice $invoice)
    {
        abort_if($invoice->company_id !== $request->user()->company_id, 403);

        $request->validate([
            'phone_number' => 'required|string|regex:/^[+]?[0-9]{8,15}$/',
            'operator'     => 'required|in:orange_money,mtn_momo,wave',
            'amount'       => 'required|numeric|min:1',
        ]);

        $transaction = MobileMoneyTransaction::create([
            'company_id'   => $invoice->company_id,
            'invoice_id'   => $invoice->id,
            'amount'       => $request->amount,
            'currency'     => $invoice->currency ?? 'XOF',
            'phone_number' => $request->phone_number,
            'operator'     => $request->operator,
            'reference'    => strtoupper(Str::random(12)),
            'status'       => 'pending',
            'initiated_at' => now(),
        ]);

        // TODO: appel API réel selon l'opérateur
        // Orange Money CI: https://api.orange.com/orange-money-webpay/...
        // MTN MoMo: https://sandbox.momodeveloper.mtn.com/...

        return back()->with('success', "Paiement initié. Référence : {$transaction->reference}. Validez sur votre téléphone.");
    }

    /**
     * Webhook de confirmation (appelé par l'opérateur).
     * Route publique — exclue du CSRF.
     */
    public function webhook(Request $request, string $operator)
    {
        // Vérification de la signature HMAC (si configurée pour l'opérateur)
        $webhookSecret = config("services.mobile_money.{$operator}.webhook_secret");
        if ($webhookSecret) {
            $signature = $request->header('X-Callback-Signature')
                ?? $request->header('X-Hmac-Signature')
                ?? $request->header('Authorization');

            $expected = 'sha256=' . hash_hmac('sha256', $request->getContent(), $webhookSecret);

            if (!$signature || !hash_equals($expected, $signature)) {
                \Log::warning("Mobile Money webhook signature mismatch", [
                    'operator' => $operator,
                    'ip' => $request->ip(),
                ]);
                return response()->json(['error' => 'invalid_signature'], 401);
            }
        }

        // Normalisation du champ référence selon les conventions des opérateurs
        $reference = $request->input('reference')
            ?? $request->input('externalId')
            ?? $request->input('orderId');

        $status = $request->input('status');

        $transaction = MobileMoneyTransaction::where('reference', $reference)->first();
        if (! $transaction) {
            return response()->json(['error' => 'not found'], 404);
        }

        $isSuccess = in_array($status, ['SUCCESS', 'SUCCESSFUL', 'success'], true);

        $transaction->update([
            'status'          => $isSuccess ? 'success' : 'failed',
            'confirmed_at'    => now(),
            'webhook_payload' => $request->all(),
        ]);

        // Si succès → mettre à jour le solde de la facture
        if ($transaction->status === 'success' && $transaction->invoice_id) {
            $invoice = Invoice::find($transaction->invoice_id);
            if ($invoice) {
                $invoice->increment('amount_paid', $transaction->amount);
                $invoice->refresh();
                if ($invoice->amount_paid >= $invoice->total) {
                    $invoice->update(['status' => 'paid']);
                } elseif ($invoice->amount_paid > 0) {
                    $invoice->update(['status' => 'partial']);
                }
            }
        }

        return response()->json(['ok' => true]);
    }
}
