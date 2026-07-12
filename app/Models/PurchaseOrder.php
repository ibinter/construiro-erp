<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Bon de commande (Achats). Rattaché à un fournisseur et, optionnellement,
 * à un projet. Regroupe des lignes d'articles dont découlent les totaux
 * (sous-total HT, TVA, total TTC). Isolation multi-tenant.
 */
class PurchaseOrder extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'sent', 'confirmed', 'received', 'cancelled'];

    protected $fillable = [
        'company_id', 'supplier_id', 'project_id',
        'code', 'status', 'currency',
        'order_date', 'expected_date',
        'tax_rate', 'subtotal', 'tax_amount', 'total',
        'notes',
    ];

    protected $casts = [
        'order_date'    => 'date',
        'expected_date' => 'date',
        'tax_rate'      => 'decimal:2',
        'subtotal'      => 'decimal:2',
        'tax_amount'    => 'decimal:2',
        'total'         => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseLine::class)->orderBy('position');
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }

    /**
     * Recalcule les totaux à partir des lignes puis persiste le bon de commande.
     * subtotal = somme des line_total ; tax_amount = subtotal * tax_rate/100 ;
     * total = subtotal + tax_amount.
     */
    public function recalculateTotals(): void
    {
        $subtotal = (float) $this->lines()->sum('line_total');
        $taxAmount = $subtotal * ((float) $this->tax_rate / 100);

        $this->subtotal = $subtotal;
        $this->tax_amount = $taxAmount;
        $this->total = $subtotal + $taxAmount;

        $this->save();
    }
}
