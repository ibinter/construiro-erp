<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Journal append-only des transitions d'état de licence (cahier §9.3).
 * Immuable : pas d'updated_at, aucune méthode de modification.
 */
class LicenseTransition extends Model
{
    public const UPDATED_AT = null; // append-only

    public const CAUSE_SYSTEME    = 'systeme';
    public const CAUSE_SUPERADMIN = 'superadmin';
    public const CAUSE_PAIEMENT   = 'paiement';

    protected $fillable = [
        'company_id', 'subscription_id', 'from_state', 'to_state',
        'cause', 'actor', 'reason',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Enregistre une transition. Silencieux si la table n'existe pas encore
     * (robustesse au boot avant migration).
     */
    public static function log(
        Subscription $sub,
        ?string $from,
        string $to,
        string $cause,
        ?string $actor = null,
        ?string $reason = null,
    ): void {
        try {
            static::create([
                'company_id'      => $sub->company_id,
                'subscription_id' => $sub->id,
                'from_state'      => $from,
                'to_state'        => $to,
                'cause'           => $cause,
                'actor'           => $actor ?? self::CAUSE_SYSTEME,
                'reason'          => $reason,
            ]);
        } catch (\Throwable) {
            // table absente / migration non jouée — ne pas casser le flux
        }
    }
}
