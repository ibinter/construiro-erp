<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $fillable = [
        'user_id', 'email', 'type', 'subject', 'status',
        'idempotency_key', 'error_message', 'context',
    ];

    protected $casts = ['context' => 'array'];

    public static function alreadySent(string $key): bool
    {
        return static::where('idempotency_key', $key)->where('status', 'sent')->exists();
    }

    public static function record(string $type, string $email, string $subject, ?int $userId = null, ?string $key = null, string $status = 'sent', ?string $error = null): void
    {
        static::create([
            'user_id' => $userId,
            'email' => $email,
            'type' => $type,
            'subject' => $subject,
            'status' => $status,
            'idempotency_key' => $key,
            'error_message' => $error,
        ]);
    }
}
