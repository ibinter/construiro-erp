<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Ligne de budget — un poste budgétaire avec son montant planifié et réalisé.
 */
class BudgetLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id', 'position',
        'category', 'label',
        'planned_amount', 'actual_amount',
    ];

    protected $casts = [
        'position'       => 'integer',
        'planned_amount' => 'decimal:2',
        'actual_amount'  => 'decimal:2',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }
}
