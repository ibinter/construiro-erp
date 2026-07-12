<?php

namespace App\Console\Commands;

use App\Mail\TrialExpiringMail;
use App\Mail\AccountExpiredMail;
use App\Models\EmailLog;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendSubscriptionExpirationReminders extends Command
{
    protected $signature = 'construiro:subscription-reminders';
    protected $description = 'Send subscription expiration reminders at J-7, J-3, J-1 and notice at J+1';

    public function handle(): void
    {
        foreach ([7, 3, 1] as $days) {
            $this->sendReminders($days);
        }
        $this->sendExpiredNotices();
    }

    private function sendReminders(int $days): void
    {
        $targetDate = now()->addDays($days)->toDateString();

        User::whereNotNull('subscription_active_until')
            ->whereDate('subscription_active_until', $targetDate)
            ->each(function (User $user) use ($days) {
                $key = "sub_expiring_{$days}d_{$user->id}_{$user->subscription_active_until}";

                if (EmailLog::alreadySent($key)) {
                    return;
                }

                try {
                    Mail::to($user->email)->send(new TrialExpiringMail(
                        userName: $user->name,
                        daysRemaining: $days,
                        expiresAt: $user->subscription_active_until->format('d/m/Y'),
                    ));
                    EmailLog::record('subscription_expiring', $user->email, "Abonnement expire dans {$days} jour(s)", $user->id, $key);
                    $this->info("Sent J-{$days} subscription reminder to {$user->email}");
                } catch (\Throwable $e) {
                    EmailLog::record('subscription_expiring', $user->email, "Abonnement expire dans {$days} jour(s)", $user->id, $key, 'failed', $e->getMessage());
                    $this->error("Failed for {$user->email}: {$e->getMessage()}");
                }
            });
    }

    private function sendExpiredNotices(): void
    {
        $yesterday = now()->subDay()->toDateString();

        User::whereNotNull('subscription_active_until')
            ->whereDate('subscription_active_until', $yesterday)
            ->each(function (User $user) {
                $key = "sub_expired_{$user->id}_{$user->subscription_active_until}";

                if (EmailLog::alreadySent($key)) {
                    return;
                }

                try {
                    Mail::to($user->email)->send(new AccountExpiredMail(
                        userName: $user->name,
                        expiredAt: $user->subscription_active_until->format('d/m/Y'),
                        isTrial: false,
                    ));
                    EmailLog::record('account_expired', $user->email, 'Abonnement expiré', $user->id, $key);
                    $this->info("Sent subscription expiration notice to {$user->email}");
                } catch (\Throwable $e) {
                    EmailLog::record('account_expired', $user->email, 'Abonnement expiré', $user->id, $key, 'failed', $e->getMessage());
                    $this->error("Failed for {$user->email}: {$e->getMessage()}");
                }
            });
    }
}
