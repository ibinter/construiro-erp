<?php

namespace App\Jobs;

use App\Mail\PaymentConfirmedMail;
use App\Models\MobileMoneyTransaction;
use App\Models\Subscription;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Activé après qu'un paiement Mobile Money est confirmé.
 * Cherche l'abonnement en attente de l'entreprise et l'active
 * de la même façon que BillingController::activate().
 */
class ActivateSubscriptionAfterPayment implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public MobileMoneyTransaction $transaction) {}

    public function handle(): void
    {
        $companyId = $this->transaction->company_id;

        // Chercher l'abonnement le plus récent de la société en statut triable ou inactif
        $subscription = Subscription::where('company_id', $companyId)
            ->whereIn('status', ['pending', 'trial', 'inactive', 'grace'])
            ->with('plan')
            ->latest()
            ->first();

        if (! $subscription) {
            Log::info('ActivateSubscriptionAfterPayment: aucun abonnement en attente.', [
                'company_id'     => $companyId,
                'transaction_id' => $this->transaction->id,
            ]);
            return;
        }

        // Déjà actif (idempotence)
        if ($subscription->status === 'active') {
            return;
        }

        $endsAt = now()->addMonth();

        $subscription->update([
            'status'         => 'active',
            'starts_at'      => now(),
            'ends_at'        => $endsAt,
            'activation_key' => null,  // invalide la clé d'activation manuelle si présente
        ]);

        $subscription->refresh();

        Log::info('ActivateSubscriptionAfterPayment: abonnement activé.', [
            'subscription_id' => $subscription->id,
            'company_id'      => $companyId,
            'transaction_id'  => $this->transaction->id,
        ]);

        // Envoyer l'email de confirmation de paiement
        try {
            // Récupérer l'utilisateur principal de la société (admin ou owner)
            $user = $subscription->company?->users()->orderBy('id')->first();

            if ($user) {
                Mail::to($user->email)->send(new PaymentConfirmedMail(
                    userName:    $user->name,
                    planName:    $subscription->plan?->name ?? 'Standard',
                    amount:      number_format((float) $this->transaction->amount, 0, ',', ' ')
                                 . ' ' . $this->transaction->currency,
                    reference:   $this->transaction->reference,
                    paidAt:      now()->format('d/m/Y'),
                    accessUntil: $endsAt->format('d/m/Y'),
                ));
            }
        } catch (\Exception $e) {
            Log::warning('ActivateSubscriptionAfterPayment: email non envoyé. ' . $e->getMessage());
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ActivateSubscriptionAfterPayment: échec définitif.', [
            'transaction_id' => $this->transaction->id,
            'error'          => $exception->getMessage(),
        ]);
    }
}
