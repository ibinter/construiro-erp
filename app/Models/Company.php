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
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings'  => 'array',
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
