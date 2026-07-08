<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Devise — référentiel des monnaies (multi-devises).
 */
class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'name', 'symbol', 'decimal_places', 'exchange_rate', 'is_active',
    ];

    protected $casts = [
        'decimal_places' => 'integer',
        'exchange_rate'  => 'decimal:6',
        'is_active'      => 'boolean',
    ];
}
