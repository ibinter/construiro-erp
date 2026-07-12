<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price_monthly', 'price_yearly',
        'currency', 'max_users', 'max_projects', 'storage_gb',
        'modules', 'is_active', 'trial_days', 'sort_order',
    ];

    protected $casts = [
        'modules' => 'array',
        'is_active' => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    public function hasModule(string $module): bool
    {
        if ($this->modules === null) {
            return true; // null = all modules enabled
        }
        return in_array($module, $this->modules);
    }
}
