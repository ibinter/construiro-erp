<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Décaissement (trésorerie sortante). Paiement effectué par l'entreprise,
 * optionnellement rattaché à un fournisseur, à un bon de commande et/ou à un
 * projet. Isolation multi-tenant.
 */
class OutgoingPayment extends Model
{
    use BelongsToCompany;
    use Auditable;
    use HasFactory, SoftDeletes;

    // Natures de dépense.
    public const CATEGORIES = ['fournisseur', 'salaire', 'sous_traitant', 'charge', 'impot', 'autre'];

    // Modes de règlement disponibles.
    public const METHODS = ['especes', 'virement', 'cheque', 'mobile_money', 'autre'];

    protected $fillable = [
        'company_id', 'supplier_id', 'purchase_order_id', 'project_id',
        'code', 'payee_name',
        'amount', 'currency', 'category', 'method', 'date',
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

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
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
