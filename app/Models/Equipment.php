<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Équipement du parc matériel (engin, véhicule, matériel, outillage).
 * Peut être affecté à un chantier et suit un statut opérationnel.
 * Isolation multi-tenant par entreprise.
 */
class Equipment extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    // La table s'appelle « equipment » (invariable), on la force explicitement.
    protected $table = 'equipment';

    public const CATEGORIES = ['engin', 'vehicule', 'materiel', 'outillage'];
    public const STATUSES = ['available', 'in_use', 'maintenance', 'out_of_service'];

    protected $fillable = [
        'company_id', 'current_site_id',
        'code', 'name', 'category', 'brand', 'model', 'registration',
        'status', 'acquisition_date', 'acquisition_value', 'currency',
        'notes', 'is_active',
    ];

    protected $casts = [
        'acquisition_date'  => 'date',
        'acquisition_value' => 'decimal:2',
        'is_active'         => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function currentSite(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'current_site_id');
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
