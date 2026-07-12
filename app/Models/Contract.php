<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Contrat rattaché à une entreprise (multi-tenant). Peut être lié à un projet.
 */
class Contract extends Model
{
    use BelongsToCompany;
    use Auditable;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'active', 'suspended', 'closed', 'cancelled'];
    public const TYPES = ['client', 'sous_traitance', 'fournisseur', 'autre'];

    protected $fillable = [
        'company_id', 'project_id',
        'code', 'title', 'type', 'party_name',
        'amount', 'currency', 'status',
        'start_date', 'end_date', 'signed_date',
        'notes',
        'signed_at', 'signed_by', 'signature_hash', 'signature_ip',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'start_date'  => 'date',
        'end_date'    => 'date',
        'signed_date' => 'date',
        'signed_at'   => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
