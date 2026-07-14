<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Integration extends Model
{
    protected $fillable = [
        'company_id', 'type', 'provider', 'is_enabled',
        'config', 'webhook_url', 'webhook_secret',
        'last_tested_at', 'last_test_ok',
    ];

    protected $casts = [
        'is_enabled'     => 'boolean',
        'config'         => 'array',
        'last_tested_at' => 'datetime',
        'last_test_ok'   => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
