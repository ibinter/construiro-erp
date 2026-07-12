<?php

namespace App\Console\Commands;

use App\Mail\TrialExpiringMail;
use App\Mail\AccountExpiredMail;
use App\Models\EmailLog;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTrialExpirationReminders extends Command
{
    protected $signature = 'construiro:trial-reminders';
    protected $description = 'Send trial expiration reminders at J-7, J-3, J-1 and expiration notice at J+1';

    public function handle(): void
    {
        $this->sendReminders(7);
        $this->sendReminders(3);
        $this->sendReminders(1);
        $this->sendExpiredNotices();
    }

    private function sendReminders(int $days): void
    {
        $targetDate = now()->addDays($days)->toDateString();

        User::whereNotNull('trial_ends_at')
            ->whereDate('trial_ends_at', $targetDate)
            ->whereNull('subscription_active_until')
            ->each(function (User $user) use ($days) {
                $key = "trial_expiring_{$days}d_{$user->id}_{$user->trial_ends_at}";

                if (EmailLog::alreadySent($key)) {
                    return;
                }

                try {
                    Mail::to($user->email)->send(new TrialExpiringMail(
                        userName: $user->name,
                        daysRemaining: $days,
                        expiresAt: $user->trial_ends_at->format('d/m/Y'),
                    ));
                    EmailLog::record('trial_expiring', $user->email, "Essai expire dans {$days} jour(s)", $user->id, $key);
                    $this->info("Sent J-{$days} reminder to {$user->email}");
                } catch (\Throwable $e) {
                    EmailLog::record('trial_expiring', $user->email, "Essai expire dans {$days} jour(s)", $user->id, $key, 'failed', $e->getMessage());
                    $this->error("Failed for {$user->email}: {$e->getMessage()}");
                }
            });
    }

    private function sendExpiredNotices(): void
    {
        $yesterday = now()->subDay()->toDateString();

        User::whereNotNull('trial_ends_at')
            ->whereDate('trial_ends_at', $yesterday)
            ->whereNull('subscription_active_until')
            ->each(function (User $user) {
                $key = "trial_expired_{$user->id}_{$user->trial_ends_at}";

                if (EmailLog::alreadySent($key)) {
                    return;
                }

                try {
                    Mail::to($user->email)->send(new AccountExpiredMail(
                        userName: $user->name,
                        expiredAt: $user->trial_ends_at->format('d/m/Y'),
                        isTrial: true,
                    ));
                    EmailLog::record('account_expired', $user->email, 'Essai expiré', $user->id, $key);
                    $this->info("Sent expiration notice to {$user->email}");
                } catch (\Throwable $e) {
                    EmailLog::record('account_expired', $user->email, 'Essai expiré', $user->id, $key, 'failed', $e->getMessage());
                    $this->error("Failed for {$user->email}: {$e->getMessage()}");
                }
            });
    }
}
