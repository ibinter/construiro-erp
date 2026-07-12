<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Scope global qui restreint automatiquement toutes les requêtes Eloquent
 * à la company de l'utilisateur authentifié.
 *
 * Utilisé via le trait BelongsToCompany sur chaque modèle métier.
 */
class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (auth()->check() && auth()->user()->company_id) {
            $builder->where($model->getTable() . '.company_id', auth()->user()->company_id);
        }
    }
}
