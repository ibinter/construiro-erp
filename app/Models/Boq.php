<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * DQE — Devis quantitatif estimatif. Regroupe des lignes chiffrées dont
 * découle le total. Optionnellement rattaché à un projet. Multi-tenant.
 */
class Boq extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'validated'];

    protected $fillable = [
        'company_id', 'project_id', 'client_id',
        'code', 'title', 'status', 'currency', 'total', 'notes',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(BoqLine::class)->orderBy('position');
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }

    /** Recalcule le total (somme des totaux de ligne) puis persiste le DQE. */
    public function recalculateTotal(): void
    {
        $this->total = (float) $this->lines()->sum('line_total');
        $this->save();
    }
}
