<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Enregistrement de maintenance d'un équipement du parc matériel.
 * Isolation multi-tenant par entreprise.
 */
class MaintenanceRecord extends Model
{
    use HasFactory;

    public const TYPES = ['preventive', 'curative', 'revision'];

    protected $fillable = [
        'company_id', 'equipment_id',
        'type', 'description', 'cost', 'performed_at', 'notes',
    ];

    protected $casts = [
        'cost'         => 'decimal:2',
        'performed_at' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}
