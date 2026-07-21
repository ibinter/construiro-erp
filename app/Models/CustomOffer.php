<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomOffer extends Model
{
    protected $fillable = [
        'company_id', 'created_by', 'description', 'discount_percent',
        'valid_until', 'sent_at', 'accepted_at', 'status',
    ];

    protected $casts = [
        'valid_until'      => 'date',
        'sent_at'          => 'datetime',
        'accepted_at'      => 'datetime',
        'discount_percent' => 'float',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
