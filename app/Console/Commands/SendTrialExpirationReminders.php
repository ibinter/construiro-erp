<?php

namespace App\Console\Commands;

use App\Mail\AccountExpiredMail;
use App\Mail\TrialExpiringMail;
use App\Models\EmailLog;
use App\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTrialExpirationReminders extends Command
{
    protected $signature = 'construiro:trial-reminders';
    protected $description = 'Send trial expiration reminders at J-7, J-3, J-1 and expiration notice at J+1';

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

        Subscription::where('status', 'trial')
            ->whereDate('trial_ends_at', $targetDate)
            ->with('company.users')
            ->each(function (Subscription $subscription) use ($days) {
                $company = $subscription->company;
                if (!$company) {
                    return;
                }

                // Envoyer au super_admin de la société
                $admins = $company->users()->whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->get();
                if ($admins->isEmpty()) {
                    $admins = $company->users()->take(1)->get();
                }

                foreach ($admins as $user) {
                    $key = "trial_expiring_{$days}d_{$user->id}_{$subscription->trial_ends_at->toDateString()}";

                    if (EmailLog::alreadySent($key)) {
                        continue;
                    }

                    try {
                        Mail::to($user->email)->send(new TrialExpiringMail(
                            userName: $user->name,
                            daysRemaining: $days,
                            expiresAt: $subscription->trial_ends_at->format('d/m/Y'),
                        ));
                        EmailLog::record('trial_expiring', $user->email, "Essai expire dans {$days} jour(s)", $user->id, $key);
                        $this->info("Sent J-{$days} trial reminder to {$user->email}");
                    } catch (\Throwable $e) {
                        EmailLog::record('trial_expiring', $user->email, "Essai expire dans {$days} jour(s)", $user->id, $key, 'failed', $e->getMessage());
                        $this->error("Failed for {$user->email}: {$e->getMessage()}");
                    }
                }
            });
    }

    private function sendExpiredNotices(): void
    {
        $yesterday = now()->subDay()->toDateString();

        Subscription::where('status', 'trial')
            ->whereDate('trial_ends_at', $yesterday)
            ->with('company.users')
            ->each(function (Subscription $subscription) {
                $company = $subscription->company;
                if (!$company) {
                    return;
                }

                $admins = $company->users()->whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->get();
                if ($admins->isEmpty()) {
                    $admins = $company->users()->take(1)->get();
                }

                foreach ($admins as $user) {
                    $key = "trial_expired_{$user->id}_{$subscription->trial_ends_at->toDateString()}";

                    if (EmailLog::alreadySent($key)) {
                        continue;
                    }

                    try {
                        Mail::to($user->email)->send(new AccountExpiredMail(
                            userName: $user->name,
                            expiredAt: $subscription->trial_ends_at->format('d/m/Y'),
                            isTrial: true,
                        ));
                        EmailLog::record('account_expired', $user->email, 'Essai expiré', $user->id, $key);
                        $this->info("Sent trial expiration notice to {$user->email}");
                    } catch (\Throwable $e) {
                        EmailLog::record('account_expired', $user->email, 'Essai expiré', $user->id, $key, 'failed', $e->getMessage());
                        $this->error("Failed for {$user->email}: {$e->getMessage()}");
                    }
                }
            });
    }
}
