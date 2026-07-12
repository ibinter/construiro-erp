<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'company_id', 'plan_id', 'status', 'billing_cycle',
        'trial_ends_at', 'starts_at', 'ends_at', 'grace_ends_at',
        'cancelled_at', 'activation_key', 'meta',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'grace_ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'meta' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['trial', 'active', 'grace']);
    }

    public function isInGrace(): bool
    {
        return $this->status === 'grace'
            && $this->grace_ends_at
            && $this->grace_ends_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired'
            || ($this->ends_at && $this->ends_at->isPast() && !$this->isInGrace());
    }

    public function daysRemaining(): int
    {
        $end = $this->status === 'trial' ? $this->trial_ends_at : $this->ends_at;
        if (!$end || $end->isPast()) {
            return 0;
        }
        return (int) now()->diffInDays($end);
    }
}
