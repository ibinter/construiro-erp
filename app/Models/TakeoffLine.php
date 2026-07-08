<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ligne de métré — un poste mesuré. La quantité est recalculée à
 * l'enregistrement : nombre × longueur × largeur × hauteur lorsque des
 * dimensions sont renseignées, sinon la quantité saisie est conservée.
 */
class TakeoffLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'takeoff_id', 'position',
        'designation', 'unit',
        'length', 'width', 'height', 'count', 'quantity', 'notes',
    ];

    protected $casts = [
        'position' => 'integer',
        'length'   => 'decimal:3',
        'width'    => 'decimal:3',
        'height'   => 'decimal:3',
        'count'    => 'decimal:3',
        'quantity' => 'decimal:3',
    ];

    protected static function boot(): void
    {
        parent::boot();

        // Calcule la quantité avant enregistrement : si au moins une dimension
        // est renseignée, quantité = nombre × dimensions renseignées ;
        // sinon on conserve la quantité saisie directement.
        static::saving(function (TakeoffLine $line) {
            $dimensions = array_filter(
                [$line->length, $line->width, $line->height],
                fn ($d) => $d !== null && $d !== ''
            );

            if (! empty($dimensions)) {
                $quantity = (float) ($line->count ?: 1);
                foreach ($dimensions as $dimension) {
                    $quantity *= (float) $dimension;
                }
                $line->quantity = $quantity;
            }
        });
    }

    public function takeoff(): BelongsTo
    {
        return $this->belongsTo(Takeoff::class);
    }
}
