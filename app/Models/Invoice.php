<?php

namespace App\Models;

use App\Traits\Auditable;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

/**
 * Facture. Regroupe des lignes de prestation dont découlent les totaux
 * (sous-total HT, TVA, total TTC) et suit les encaissements (amount_paid).
 * Le reste à payer (balance) = total − amount_paid. Isolation multi-tenant.
 */
class Invoice extends Model
{
    use BelongsToCompany;
    use Auditable;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'];

    protected static function booted(): void
    {
        $flush = fn (self $m) => Cache::forget("bi_dashboard_{$m->company_id}");
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'company_id', 'client_id', 'project_id',
        'code', 'status', 'currency',
        'issue_date', 'due_date',
        'tax_rate', 'subtotal', 'tax_amount', 'total', 'amount_paid',
        'notes',
    ];

    protected $casts = [
        'tax_rate'    => 'decimal:2',
        'subtotal'    => 'decimal:2',
        'tax_amount'  => 'decimal:2',
        'total'       => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'issue_date'  => 'date',
        'due_date'    => 'date',
    ];

    // Expose le reste à payer dans les payloads JSON envoyés au front.
    protected $appends = ['balance'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(InvoiceLine::class)->orderBy('position');
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }

    /**
     * Recalcule les totaux à partir des lignes puis persiste la facture.
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

    /** Reste à payer = total TTC − montant déjà encaissé (jamais négatif). */
    public function getBalanceAttribute(): float
    {
        return max(0, (float) $this->total - (float) $this->amount_paid);
    }
}
