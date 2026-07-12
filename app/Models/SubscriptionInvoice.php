<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionInvoice extends Model
{
    protected $fillable = [
        'company_id', 'subscription_id', 'reference', 'amount',
        'currency', 'payment_method', 'status', 'paid_at', 'payment_data',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'payment_data' => 'array',
        'amount' => 'decimal:2',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
