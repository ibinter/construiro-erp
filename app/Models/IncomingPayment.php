<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Encaissement (trésorerie entrante). Paiement reçu par l'entreprise,
 * optionnellement rattaché à un client, à une facture et/ou à un projet.
 * Isolation multi-tenant.
 */
class IncomingPayment extends Model
{
    use BelongsToCompany;
    use Auditable;
    use HasFactory, SoftDeletes;

    // Modes de règlement disponibles.
    public const METHODS = ['especes', 'virement', 'cheque', 'mobile_money', 'autre'];

    protected $fillable = [
        'company_id', 'client_id', 'invoice_id', 'project_id',
        'code', 'payer_name',
        'amount', 'currency', 'method', 'date',
        'reference', 'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
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
