<?php

namespace App\Console\Commands;

use App\Models\SupportSession;
use Illuminate\Console\Command;

class CleanExpiredSupportSessions extends Command
{
    protected $signature = 'construiro:clean-support-sessions';
    protected $description = 'Expire les sessions de support SuperAdmin dont la durée est dépassée';

    public function handle(): void
    {
        $expired = SupportSession::whereNull('ended_at')
            ->where('expires_at', '<', now())
            ->update(['ended_at' => now()]);

        $this->info("Closed {$expired} expired support session(s).");
    }
}
