<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VoucherCode extends Model
{
    protected $fillable = ['code','batch_id','value','currency','plan_id_restriction','is_used','used_by_company_id','used_by_payment_order_id','used_at','expires_at','created_by'];
    protected $casts = ['is_used' => 'boolean', 'used_at' => 'datetime', 'expires_at' => 'datetime', 'value' => 'decimal:2'];

    public static function generateBatch(int $quantity, float $value, string $currency = 'XOF', ?\DateTime $expiresAt = null, ?int $createdBy = null): string
    {
        $batchId = (string) Str::uuid();
        $created = 0;
        while ($created < $quantity) {
            $code = strtoupper(Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4));
            if (!static::where('code', $code)->exists()) {
                static::create(['code' => $code, 'batch_id' => $batchId, 'value' => $value, 'currency' => $currency, 'expires_at' => $expiresAt, 'created_by' => $createdBy]);
                $created++;
            }
        }
        return $batchId;
    }

    public function scopeAvailable($query) { return $query->where('is_used', false)->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now())); }
    public function usedByCompany() { return $this->belongsTo(Company::class, 'used_by_company_id'); }
    public function paymentOrder() { return $this->belongsTo(PaymentOrder::class, 'used_by_payment_order_id'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
