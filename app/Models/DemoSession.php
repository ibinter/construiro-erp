<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemoSession extends Model
{
    protected $fillable = [
        'demo_request_id',
        'prospect_name',
        'prospect_email',
        'prospect_company',
        'assigned_to',
        'scheduled_at',
        'duration_minutes',
        'status',
        'meeting_url',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function demoRequest(): BelongsTo
    {
        return $this->belongsTo(DemoRequest::class);
    }
}
