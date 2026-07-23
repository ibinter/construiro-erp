<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethodConfig extends Model
{
    protected $fillable = ['type','name','is_active','config','countries','instructions_fr','instructions_en','min_amount','max_amount','currency','sort_order','updated_by'];
    protected $casts = ['config' => 'array', 'countries' => 'array', 'is_active' => 'boolean', 'min_amount' => 'decimal:2', 'max_amount' => 'decimal:2'];

    const TYPE_MOBILE_MONEY         = 'mobile_money';
    const TYPE_BANK_NATIONAL        = 'bank_transfer_national';
    const TYPE_BANK_INTERNATIONAL   = 'bank_transfer_international';
    const TYPE_ELECTRONIC           = 'electronic';
    const TYPE_MONEY_TRANSFER       = 'money_transfer';
    const TYPE_CASH_AGENCY          = 'cash_agency';
    const TYPE_CHECK                = 'check';
    const TYPE_CRYPTO               = 'crypto';
    const TYPE_VOUCHER              = 'voucher';
    const TYPE_CASH_ON_DELIVERY     = 'cash_on_delivery';
    const TYPE_WIRE_TRANSFER        = 'wire_transfer';

    public function getConfigValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->config, $key, $default);
    }

    public function scopeActive($query) { return $query->where('is_active', true)->orderBy('sort_order'); }

    public function updatedBy() { return $this->belongsTo(User::class, 'updated_by'); }
}
