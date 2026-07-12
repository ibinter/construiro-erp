<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Mouvement de stock : entrée (in), sortie (out) ou ajustement d'inventaire.
 * Chaque mouvement porte sur un matériau et un magasin. Isolation multi-tenant.
 */
class StockMovement extends Model
{
    use BelongsToCompany;
    use HasFactory;

    public const TYPES = ['in', 'out', 'adjustment'];

    protected $fillable = [
        'company_id', 'warehouse_id', 'material_id', 'user_id',
        'type', 'quantity', 'unit_price', 'reference', 'notes', 'moved_at',
    ];

    protected $casts = [
        'quantity'   => 'decimal:3',
        'unit_price' => 'decimal:2',
        'moved_at'   => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
