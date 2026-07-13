<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Opportunité commerciale (CRM). Étape du pipeline de prospection,
 * rattachée à une entreprise (multi-tenant).
 */
class Opportunity extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    /** Étapes du pipeline commercial. */
    public const STAGES = ['prospect', 'qualifie', 'proposition', 'negociation', 'gagne', 'perdu'];

    protected $fillable = [
        'company_id', 'client_id', 'assignee_id',
        'code', 'title', 'client_name',
        'estimated_amount', 'currency',
        'stage', 'probability',
        'expected_close_date', 'source', 'notes',
    ];

    protected $casts = [
        'estimated_amount'    => 'decimal:2',
        'probability'         => 'integer',
        'expected_close_date' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
