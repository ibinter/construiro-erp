<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Notification interne ERP.
 * Isolation multi-tenant par company_id. Si user_id est null, la notification
 * est visible par tous les utilisateurs de l'entreprise.
 */
class Notification extends Model
{
    use BelongsToCompany;
    public const TYPES = [
        'invoice_due',
        'quote_accepted',
        'qhse_incident',
        'budget_alert',
        'info',
    ];

    protected $fillable = [
        'company_id',
        'user_id',
        'type',
        'title',
        'body',
        'link',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    /**
     * Scope: notifications visibles par l'utilisateur donné (les siennes + les
     * notifications broadcast à toute l'entreprise).
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query
            ->where('company_id', $user->company_id)
            ->where(function (Builder $q) use ($user) {
                $q->whereNull('user_id')
                  ->orWhere('user_id', $user->id);
            });
    }

    /** Scope: uniquement les notifications non lues. */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }
}
