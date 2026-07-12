<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Fournisseur rattaché à une entreprise.
 */
class Supplier extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const CATEGORIES = ['materiaux', 'services', 'location', 'sous_traitance', 'autre'];

    protected $fillable = [
        'company_id',
        'code', 'category', 'name', 'contact_name',
        'phone', 'email', 'address', 'city', 'country',
        'tax_id', 'payment_terms', 'notes', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
