<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Matériau du catalogue (article de construction géré en stock).
 * Le stock courant n'est pas persisté : il se calcule à partir des mouvements.
 * Isolation multi-tenant par entreprise.
 */
class Material extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const CATEGORIES = ['gros_oeuvre', 'second_oeuvre', 'electricite', 'plomberie', 'quincaillerie', 'consommable', 'autre'];
    public const UNITS = ['u', 'kg', 'm', 'm2', 'm3', 'ml', 'sac', 'tonne'];

    protected $fillable = [
        'company_id',
        'code', 'name', 'category', 'unit',
        'unit_price', 'min_stock', 'description', 'is_active',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'min_stock'  => 'decimal:3',
        'is_active'  => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }

    /**
     * Stock courant du matériau : entrées − sorties + ajustements.
     * Optionnellement filtré sur un magasin donné.
     */
    public function currentStock($warehouseId = null): float
    {
        $query = $this->movements();

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $in = (float) (clone $query)->where('type', 'in')->sum('quantity');
        $out = (float) (clone $query)->where('type', 'out')->sum('quantity');
        $adjustment = (float) (clone $query)->where('type', 'adjustment')->sum('quantity');

        return $in - $out + $adjustment;
    }
}
