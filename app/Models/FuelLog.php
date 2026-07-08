<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Plein de carburant d'un équipement du parc roulant.
 * Le coût total est recalculé automatiquement à l'enregistrement
 * (quantité × prix unitaire). Isolation multi-tenant par entreprise.
 */
class FuelLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'equipment_id', 'user_id',
        'date', 'quantity', 'unit_price', 'total_cost',
        'odometer', 'station', 'notes',
    ];

    protected $casts = [
        'date'       => 'date',
        'quantity'   => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'odometer'   => 'decimal:1',
    ];

    /** Recalcule le coût total avant chaque sauvegarde. */
    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (FuelLog $log) {
            $log->total_cost = (float) $log->quantity * (float) $log->unit_price;
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
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
