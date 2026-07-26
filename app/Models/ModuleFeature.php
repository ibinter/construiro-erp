<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Source de vérité unique modules × plans.
 *
 * Chaque ligne représente une fonctionnalité rattachée à un module,
 * avec la liste des plans dans lesquels elle est disponible.
 * Quand available_in_plans change, l'événement EvolutionPublished est
 * dispatché par ModuleFeatureController pour propager automatiquement
 * les changements (landing, guides, PWA SW).
 */
class ModuleFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_key',
        'feature_key',
        'label_fr',
        'label_en',
        'available_in_plans',
        'is_active',
        'last_changed_by',
        'last_changed_at',
    ];

    protected $casts = [
        'available_in_plans' => 'array',
        'is_active'          => 'boolean',
        'last_changed_at'    => 'datetime',
    ];

    /** Plans supportés dans CONSTRUIRO ERP. */
    public const PLANS = ['starter', 'pro', 'enterprise'];

    /**
     * Vérifie si cette fonctionnalité est disponible dans un plan donné.
     */
    public function isAvailableIn(string $plan): bool
    {
        return in_array($plan, $this->available_in_plans ?? []);
    }

    /**
     * Retourne toutes les features actives groupées par module_key.
     *
     * @return \Illuminate\Support\Collection<string, \Illuminate\Support\Collection>
     */
    public static function groupedByModule(): \Illuminate\Support\Collection
    {
        return static::where('is_active', true)
            ->orderBy('module_key')
            ->orderBy('feature_key')
            ->get()
            ->groupBy('module_key');
    }
}
