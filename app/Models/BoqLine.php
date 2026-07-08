<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ligne de DQE — un poste chiffré. Le total de ligne est recalculé
 * automatiquement (quantité × prix unitaire) à l'enregistrement.
 */
class BoqLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'boq_id', 'position',
        'designation', 'unit',
        'quantity', 'unit_price', 'line_total',
    ];

    protected $casts = [
        'position'   => 'integer',
        'quantity'   => 'decimal:3',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    protected static function boot(): void
    {
        parent::boot();

        // Calcule systématiquement le total de la ligne avant enregistrement.
        static::saving(function (BoqLine $line) {
            $line->line_total = (float) $line->quantity * (float) $line->unit_price;
        });
    }

    public function boq(): BelongsTo
    {
        return $this->belongsTo(Boq::class);
    }
}
