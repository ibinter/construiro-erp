<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Entreprise — racine du modèle multi-tenant.
 */
class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'legal_name', 'slug', 'registration_number', 'tax_id',
        'country', 'city', 'address', 'phone', 'email', 'website',
        'logo_path', 'base_currency', 'locale', 'timezone', 'is_active', 'settings',
        'enabled_modules', 'onboarding_completed_at',
        'status', 'suspended_at', 'suspension_reason',
        'is_demo',
    ];

    protected $casts = [
        'is_active'               => 'boolean',
        'is_demo'                 => 'boolean',
        'settings'                => 'array',
        'enabled_modules'         => 'array',
        'onboarding_completed_at' => 'datetime',
        'suspended_at'            => 'datetime',
    ];

    public function agencies(): HasMany
    {
        return $this->hasMany(Agency::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
