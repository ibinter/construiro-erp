<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Devis (Bureau d'études). Regroupe des lignes de prestation dont découlent
 * les totaux (sous-total HT, TVA, total TTC). Isolation multi-tenant.
 */
class Quote extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

    protected $fillable = [
        'company_id', 'project_id',
        'code', 'title', 'client_name',
        'status', 'currency', 'tax_rate',
        'subtotal', 'tax_amount', 'total',
        'date', 'valid_until', 'notes',
    ];

    protected $casts = [
        'tax_rate'    => 'decimal:2',
        'subtotal'    => 'decimal:2',
        'tax_amount'  => 'decimal:2',
        'total'       => 'decimal:2',
        'date'        => 'date',
        'valid_until' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(QuoteLine::class)->orderBy('position');
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }

    /**
     * Recalcule les totaux à partir des lignes puis persiste le devis.
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
