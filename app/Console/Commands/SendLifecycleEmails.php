<?php

namespace App\Console\Commands;

use App\Mail\LifecycleEmail;
use App\Models\EmailLog;
use App\Models\Subscription;
use App\Services\LicenseConfig;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Séquence d'e-mails du cycle de vie (cahier §5.4, §8.6, §8.8) — planifiée 03:30.
 *   J+1  onboarding          (essai démarré la veille)
 *   J-3  closing             (ce qui se ferme à la fin)
 *   J-1  last_day            (dernier jour, données conservées)
 *   J0   switched            (bascule en Découverte, non punitif)
 *   J+7  followup            (relance commerciale UNIQUE)
 *   J+60 / J+83  purge       (avertissements avant suppression J+90)
 * Idempotent via EmailLog. Ne remplace pas les rappels de renouvellement
 * des abonnements payants (SendSubscriptionExpirationReminders).
 */
class SendLifecycleEmails extends Command
{
    protected $signature = 'construiro:lifecycle-emails';
    protected $description = 'Séquence d\'e-mails du cycle de vie de licence (essai → Découverte → purge)';

    public function handle(): int
    {
        $today = now();

        // J+1 — onboarding (essai démarré hier)
        $this->stage(
            Subscription::where('status', Subscription::TRIAL)->whereDate('starts_at', $today->copy()->subDay()->toDateString()),
            'onboarding',
            fn ($s) => "lifecycle_onboarding_{$s->id}",
        );

        // J-3 / J-1 — fermeture imminente
        foreach (['closing' => 3, 'last_day' => 1] as $stage => $d) {
            $target = $today->copy()->addDays($d)->toDateString();
            $this->stage(
                Subscription::where('status', Subscription::TRIAL)->whereDate('trial_ends_at', $target),
                $stage,
                fn ($s) => "lifecycle_{$stage}_{$s->id}_{$s->trial_ends_at->toDateString()}",
                ['daysLeft' => $d],
            );
        }

        // J0 — bascule en Découverte (essai terminé hier, désormais FREE)
        $this->stage(
            Subscription::where('status', Subscription::FREE)->whereDate('trial_ends_at', $today->copy()->subDay()->toDateString()),
            'switched',
            fn ($s) => "lifecycle_switched_{$s->id}_{$s->trial_ends_at?->toDateString()}",
        );

        // J+7 — relance commerciale unique (Découverte depuis 7 jours)
        $this->stage(
            Subscription::where('status', Subscription::FREE)->whereDate('trial_ends_at', $today->copy()->subDays(7)->toDateString()),
            'followup',
            fn ($s) => "lifecycle_followup_{$s->id}_{$s->trial_ends_at?->toDateString()}",
        );

        // J+60 / J+83 — avertissements avant purge (30 j, puis 7 j avant purge_at)
        foreach ([30, 7] as $before) {
            $target = $today->copy()->addDays($before)->toDateString();
            $this->stage(
                Subscription::where('status', Subscription::EXPIRED)->whereDate('purge_at', $target),
                'purge',
                fn ($s) => "lifecycle_purge_{$before}_{$s->id}_{$s->purge_at?->toDateString()}",
                fn ($s) => ['purgeDate' => $s->purge_at?->format('d/m/Y')],
            );
        }

        return self::SUCCESS;
    }

    /**
     * Envoie une étape aux admins des sociétés correspondant à la requête, idempotent.
     */
    private function stage($query, string $stage, callable $keyFor, array|callable $extra = []): void
    {
        $base = [
            'capChantiers'   => LicenseConfig::quotaChantiersGratuit(),
            'essaiJours'     => LicenseConfig::essaiJours(),
            'retentionJours' => LicenseConfig::retentionJours(),
        ];

        $query->with('company.users')->each(function (Subscription $s) use ($stage, $keyFor, $extra, $base) {
            $company = $s->company;
            if (!$company) {
                return;
            }

            $admins = $company->users()->whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->get();
            if ($admins->isEmpty()) {
                $admins = $company->users()->take(1)->get();
            }

            $vars = array_merge($base, is_callable($extra) ? $extra($s) : $extra);

            foreach ($admins as $user) {
                $key = $keyFor($s) . "_{$user->id}";
                if (EmailLog::alreadySent($key)) {
                    continue;
                }
                try {
                    Mail::to($user->email)->send(new LifecycleEmail($stage, $user->name, $vars));
                    EmailLog::record("lifecycle_{$stage}", $user->email, "Cycle de vie : {$stage}", $user->id, $key);
                    $this->info("Sent {$stage} to {$user->email}");
                } catch (\Throwable $e) {
                    EmailLog::record("lifecycle_{$stage}", $user->email, "Cycle de vie : {$stage}", $user->id, $key, 'failed', $e->getMessage());
                    $this->error("Failed {$stage} for {$user->email}: {$e->getMessage()}");
                }
            }
        });
    }
}
