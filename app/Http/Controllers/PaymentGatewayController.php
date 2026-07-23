<?php
namespace App\Http\Controllers;

use App\Models\PaymentMethodConfig;
use App\Models\PaymentOrder;
use App\Models\SubscriptionPlan;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentGatewayController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    // GET /billing/payment — choisir un plan + méthode
    public function index(Request $request): Response
    {
        $company = $request->user()->company;
        $plans = SubscriptionPlan::where('is_active', true)->orderBy('sort_order')->get();
        $methods = PaymentMethodConfig::active()->get()->map(fn($m) => [
            'type'         => $m->type,
            'name'         => $m->name,
            'instructions' => app()->getLocale() === 'en' ? $m->instructions_en : $m->instructions_fr,
            'min_amount'   => $m->min_amount,
            'max_amount'   => $m->max_amount,
        ]);
        return Inertia::render('Billing/Payment', [
            'plans'   => $plans->map(fn($p) => ['id'=>$p->id,'name'=>$p->name,'slug'=>$p->slug,'price_monthly'=>$p->price_monthly,'price_yearly'=>$p->price_yearly,'currency'=>$p->currency,'max_users'=>$p->max_users,'trial_days'=>$p->trial_days]),
            'methods' => $methods,
        ]);
    }

    // POST /billing/payment/initiate — crée un ordre + redirige ou affiche instructions
    public function initiate(Request $request): mixed
    {
        $validated = $request->validate([
            'plan_id'       => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'method_type'   => 'required|string',
            'method_sub'    => 'nullable|string',
        ]);
        $company = $request->user()->company;
        $plan    = SubscriptionPlan::findOrFail($validated['plan_id']);
        $method  = PaymentMethodConfig::where('type', $validated['method_type'])->where('is_active', true)->firstOrFail();

        if ($validated['method_type'] === PaymentMethodConfig::TYPE_VOUCHER) {
            return redirect()->route('billing.payment.voucher', ['plan' => $plan->id, 'cycle' => $validated['billing_cycle']]);
        }

        $order = $this->paymentService->createOrder($company, $plan, $validated['billing_cycle'], $validated['method_type'], $validated['method_sub']);

        // Pour CinetPay / passerelles électroniques : rediriger vers passerelle
        if ($validated['method_type'] === PaymentMethodConfig::TYPE_ELECTRONIC) {
            $gateway = app(\App\Services\Payment\CinetPayGateway::class);
            return redirect()->away($gateway->initiate($order));
        }

        // Pour méthodes manuelles : afficher les instructions + formulaire d'upload
        return redirect()->route('billing.payment.order', $order->reference);
    }

    // GET /billing/payment/order/{reference} — instructions + upload preuve
    public function showOrder(Request $request, string $reference): Response
    {
        $order = PaymentOrder::where('reference', $reference)
            ->where('company_id', $request->user()->company_id)
            ->with('plan')
            ->firstOrFail();

        $methodConfig = PaymentMethodConfig::where('type', $order->payment_method_type)->first();
        $instructions = app()->getLocale() === 'en' ? $methodConfig?->instructions_en : $methodConfig?->instructions_fr;

        return Inertia::render('Billing/PaymentOrder', [
            'order' => [
                'id'            => $order->id,
                'reference'     => $order->reference,
                'amount'        => $order->amount,
                'currency'      => $order->currency,
                'method_type'   => $order->payment_method_type,
                'method_name'   => $methodConfig?->name ?? $order->payment_method_type,
                'status'        => $order->status,
                'expires_at'    => $order->expires_at?->format('d/m/Y H:i'),
                'instructions'  => $instructions,
                'plan_name'     => $order->plan?->name,
                'billing_cycle' => $order->billing_cycle,
            ],
        ]);
    }

    // POST /billing/payment/order/{reference}/proof — upload preuve
    public function uploadProof(Request $request, string $reference): \Illuminate\Http\RedirectResponse
    {
        $request->validate(['proof' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf']);
        $order = PaymentOrder::where('reference', $reference)
            ->where('company_id', $request->user()->company_id)
            ->firstOrFail();
        if (!$order->isPending() && !$order->isSubmitted()) {
            return back()->withErrors(['proof' => 'Cet ordre ne peut plus recevoir de preuve.']);
        }
        try {
            $this->paymentService->submitProof($order, $request->file('proof'));
            return back()->with('success', 'Preuve soumise. Notre équipe va valider votre paiement sous 24h.');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['proof' => $e->getMessage()]);
        }
    }

    // GET /billing/payment/voucher — page de saisie voucher
    public function voucherPage(Request $request): Response
    {
        return Inertia::render('Billing/VoucherPayment', [
            'plan_id' => $request->query('plan'),
            'cycle'   => $request->query('cycle', 'monthly'),
        ]);
    }

    // POST /billing/payment/voucher/redeem
    public function redeemVoucher(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate(['code'=>'required|string','plan_id'=>'required|exists:subscription_plans,id','billing_cycle'=>'required|in:monthly,yearly']);
        $company = $request->user()->company;
        $plan    = SubscriptionPlan::findOrFail($validated['plan_id']);
        try {
            $this->paymentService->redeemVoucher($company, $validated['code'], $plan, $validated['billing_cycle']);
            return redirect()->route('billing.index')->with('success', 'Voucher validé ! Votre abonnement est activé.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return back()->withErrors(['code' => 'Code voucher invalide ou expiré.']);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['code' => $e->getMessage()]);
        }
    }

    // GET /billing/payment/return/{reference} — retour depuis passerelle électronique
    public function gatewayReturn(Request $request, string $reference): Response
    {
        $order = PaymentOrder::where('reference', $reference)
            ->where('company_id', $request->user()->company_id)
            ->firstOrFail();
        // NE PAS activer ici — l'activation se fait uniquement via webhook
        return Inertia::render('Billing/PaymentReturn', [
            'order' => ['reference' => $order->reference, 'status' => $order->status],
        ]);
    }
}
