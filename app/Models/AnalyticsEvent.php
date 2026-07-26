<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'event_type',
        'page',
        'source',
        'medium',
        'campaign',
        'country',
        'device',
        'referrer',
        'company_id',
        'session_id',
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'metadata'    => 'array',
        'occurred_at' => 'datetime',
    ];
}
