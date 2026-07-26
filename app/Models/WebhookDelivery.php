<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'webhook_id',
        'event_type',
        'payload',
        'response_status',
        'response_body',
        'success',
        'delivered_at',
    ];

    protected $casts = [
        'payload'      => 'array',
        'success'      => 'boolean',
        'delivered_at' => 'datetime',
    ];

    // ── Relations ──────────────────────────────────────────────

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }
}
