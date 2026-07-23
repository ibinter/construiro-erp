<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaymentOrder extends Model
{
    protected $fillable = ['reference','company_id','plan_id','billing_cycle','amount','currency','payment_method_type','payment_method_sub','status','idempotency_key','event_id','gateway_transaction_id','proof_path','proof_sha256','confirmed_by','confirmed_at','rejected_reason','expires_at','gateway_response','metadata'];
    protected $casts = ['gateway_response' => 'array', 'metadata' => 'array', 'confirmed_at' => 'datetime', 'expires_at' => 'datetime', 'amount' => 'decimal:2'];

    const STATUS_PENDING   = 'pending';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_REJECTED  = 'rejected';
    const STATUS_EXPIRED   = 'expired';
    const STATUS_CANCELLED = 'cancelled';

    public static function generateReference(): string
    {
        do {
            $ref = 'PAY-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (static::where('reference', $ref)->exists());
        return $ref;
    }

    public static function generateIdempotencyKey(): string
    {
        return (string) Str::uuid();
    }

    public function company() { return $this->belongsTo(Company::class); }
    public function plan() { return $this->belongsTo(SubscriptionPlan::class, 'plan_id'); }
    public function confirmedBy() { return $this->belongsTo(User::class, 'confirmed_by'); }

    public function isPending(): bool   { return $this->status === self::STATUS_PENDING; }
    public function isSubmitted(): bool { return $this->status === self::STATUS_SUBMITTED; }
    public function isConfirmed(): bool { return $this->status === self::STATUS_CONFIRMED; }
    public function isExpired(): bool   { return $this->status === self::STATUS_EXPIRED || ($this->expires_at && $this->expires_at->isPast()); }
}
