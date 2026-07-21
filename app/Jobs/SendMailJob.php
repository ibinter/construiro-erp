<?php

namespace App\Jobs;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Job générique d'envoi d'email asynchrone.
 * Dispatch via : dispatch(new SendMailJob($email, new MonMailable(...)));
 */
class SendMailJob implements ShouldQueue
{
    use Queueable;

    /** Nombre de tentatives avant abandon. */
    public int $tries = 3;

    /** Délai (secondes) entre deux tentatives. */
    public int $backoff = 60;

    public function __construct(
        private readonly string $to,
        private readonly Mailable $mailable,
    ) {}

    public function handle(): void
    {
        Mail::to($this->to)->send($this->mailable);
    }

    public function failed(\Throwable $e): void
    {
        Log::error("SendMailJob failed for {$this->to}: " . $e->getMessage());
    }
}
