<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MobileMoneyTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'invoice_id',
        'amount',
        'currency',
        'phone_number',
        'operator',
        'reference',
        'status',
        'webhook_payload',
        'initiated_at',
        'confirmed_at',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'webhook_payload' => 'array',
        'initiated_at'    => 'datetime',
        'confirmed_at'    => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
