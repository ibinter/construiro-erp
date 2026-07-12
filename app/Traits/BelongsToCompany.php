<?php

namespace App\Traits;

use App\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Applique automatiquement :
 *   1. Un global scope qui filtre par company_id de l'utilisateur connecté.
 *   2. L'assignation automatique de company_id à la création.
 *   3. Une relation company().
 *
 * À utiliser sur tout modèle portant une colonne company_id.
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new CompanyScope());

        static::creating(function ($model) {
            if (empty($model->company_id) && auth()->check()) {
                $model->company_id = auth()->user()->company_id;
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Company::class);
    }
}
