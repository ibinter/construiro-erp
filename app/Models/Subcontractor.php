<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Sous-traitant rattaché à une entreprise.
 */
class Subcontractor extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const SPECIALTIES = [
        'gros_oeuvre', 'electricite', 'plomberie', 'peinture',
        'etancheite', 'menuiserie', 'vrd', 'autre',
    ];

    protected $fillable = [
        'company_id',
        'code', 'name', 'specialty', 'contact_name',
        'phone', 'email', 'address', 'city', 'country',
        'tax_id', 'rating', 'notes', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'rating'    => 'integer',
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
