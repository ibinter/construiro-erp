<?php

namespace App\Services\Payment;

use App\Models\Company;
use App\Models\PaymentMethodConfig;
use App\Models\PaymentOrder;
use App\Models\SubscriptionPlan;
use App\Models\VoucherCode;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function createOrder(
        Company $company,
        SubscriptionPlan $plan,
        string $billingCycle,
        string $methodType,
        ?string $methodSub = null,
        array $metadata = []
    ): PaymentOrder {
        $amount = $billingCycle === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        return PaymentOrder::create([
            'reference'           => PaymentOrder::generateReference(),
            'company_id'          => $company->id,
            'plan_id'             => $plan->id,
            'billing_cycle'       => $billingCycle,
            'amount'              => $amount,
            'currency'            => $plan->currency ?? 'XOF',
            'payment_method_type' => $methodType,
            'payment_method_sub'  => $methodSub,
            'status'              => PaymentOrder::STATUS_PENDING,
            'idempotency_key'     => PaymentOrder::generateIdempotencyKey(),
            'expires_at'          => now()->addHours(48),
            'metadata'            => $metadata,
        ]);
    }

    public function submitProof(PaymentOrder $order, UploadedFile $file): void
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

        if (!in_array($file->getMimeType(), $allowedMimes, true)) {
            throw new \RuntimeException('Type de fichier non autorisé.');
        }

        $hash = hash_file('sha256', $file->getRealPath());

        if (PaymentOrder::where('proof_sha256', $hash)->where('status', '!=', PaymentOrder::STATUS_REJECTED)->exists()) {
            throw new \RuntimeException('Ce fichier a déjà été soumis comme preuve de paiement.');
        }

        $path = $file->store('payment-proofs/' . $order->company_id, 'private');

        $order->update([
            'proof_path'   => $path,
            'proof_sha256' => $hash,
            'status'       => PaymentOrder::STATUS_SUBMITTED,
        ]);
    }

    public function confirmManually(PaymentOrder $order, int $adminId, ?string $notes = null): void
    {
        if (!$order->isSubmitted() && !$order->isPending()) {
            throw new \RuntimeException('Cet ordre ne peut pas être confirmé dans son état actuel.');
        }

        DB::transaction(function () use ($order, $adminId, $notes) {
            if ($order->status === PaymentOrder::STATUS_CONFIRMED) {
                return;
            }

            $order->update([
                'status'       => PaymentOrder::STATUS_CONFIRMED,
                'confirmed_by' => $adminId,
                'confirmed_at' => now(),
                'metadata'     => array_merge($order->metadata ?? [], ['admin_notes' => $notes]),
            ]);

            $this->activateSubscription($order);
        });
    }

    public function confirmViaWebhook(PaymentOrder $order, string $eventId, array $gatewayResponse): void
    {
        if (PaymentOrder::where('event_id', $eventId)->where('status', PaymentOrder::STATUS_CONFIRMED)->exists()) {
            return;
        }

        DB::transaction(function () use ($order, $eventId, $gatewayResponse) {
            $order->update([
                'status'           => PaymentOrder::STATUS_CONFIRMED,
                'event_id'         => $eventId,
                'gateway_response' => $gatewayResponse,
                'confirmed_at'     => now(),
            ]);

            $this->activateSubscription($order);
        });
    }

    private function activateSubscription(PaymentOrder $order): void
    {
        $plan = $order->plan;
        $duration = $order->billing_cycle === 'yearly' ? 365 : 30;
        $endsAt = now()->addDays($duration);

        $subscription = $order->company->subscription
            ?? \App\Models\Subscription::where('company_id', $order->company_id)->latest()->firstOrNew(['company_id' => $order->company_id]);

        $subscription->fill([
            'plan_id'        => $plan?->id,
            'status'         => 'active',
            'billing_cycle'  => $order->billing_cycle,
            'starts_at'      => now(),
            'ends_at'        => $endsAt,
            'grace_ends_at'  => $endsAt->copy()->addDays(7),
            'trial_ends_at'  => null,
            'activation_key' => null,
        ]);

        $subscription->save();

        \App\Models\SubscriptionInvoice::create([
            'company_id'      => $order->company_id,
            'subscription_id' => $subscription->id,
            'reference'       => 'INV-' . $order->reference,
            'amount'          => $order->amount,
            'currency'        => $order->currency,
            'status'          => 'paid',
            'paid_at'         => now(),
        ]);
    }

    public function redeemVoucher(
        Company $company,
        string $code,
        SubscriptionPlan $plan,
        string $billingCycle
    ): PaymentOrder {
        $voucher = VoucherCode::available()
            ->where('code', strtoupper(trim($code)))
            ->lockForUpdate()
            ->firstOrFail();

        $expectedAmount = $billingCycle === 'yearly' ? $plan->price_yearly : $plan->price_monthly;

        if ($voucher->value < $expectedAmount) {
            throw new \RuntimeException('La valeur du voucher est insuffisante pour ce plan.');
        }

        return DB::transaction(function () use ($company, $plan, $billingCycle, $voucher) {
            $order = $this->createOrder(
                $company,
                $plan,
                $billingCycle,
                PaymentMethodConfig::TYPE_VOUCHER,
                null,
                ['voucher_code' => $voucher->code]
            );

            $eventId = 'voucher_' . $voucher->code . '_' . $company->id;

            $voucher->update([
                'is_used'                  => true,
                'used_by_company_id'       => $company->id,
                'used_by_payment_order_id' => $order->id,
                'used_at'                  => now(),
            ]);

            $this->confirmViaWebhook($order, $eventId, ['type' => 'voucher', 'code' => $voucher->code]);

            return $order;
        });
    }

    public function expireOldOrders(): int
    {
        return PaymentOrder::whereIn('status', [PaymentOrder::STATUS_PENDING, PaymentOrder::STATUS_SUBMITTED])
            ->where('expires_at', '<', now())
            ->update(['status' => PaymentOrder::STATUS_EXPIRED]);
    }
}
