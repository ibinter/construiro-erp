<?php

namespace App\Models;

use App\Services\LicenseConfig;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    // ── Les 6 états du cahier IBIG v1.1 (valeurs DB stables ; libellés FR via i18n) ──
    public const DEMO    = 'demo';
    public const FREE    = 'free';    // Palier « Découverte »
    public const TRIAL   = 'trial';   // « Essai »
    public const ACTIVE  = 'active';
    public const GRACE   = 'grace';
    public const EXPIRED = 'expired';

    /** États où l'écriture et l'export complets sont ouverts. */
    public const ETATS_COMPLETS = [self::TRIAL, self::ACTIVE, self::GRACE];

    protected $fillable = [
        'company_id', 'plan_id', 'status', 'billing_cycle',
        'trial_ends_at', 'starts_at', 'ends_at', 'grace_ends_at',
        'purge_at', 'trial_extended_at', 'extension_reason',
        'cancelled_at', 'activation_key', 'meta',
    ];

    protected $casts = [
        'trial_ends_at'     => 'datetime',
        'starts_at'         => 'datetime',
        'ends_at'           => 'datetime',
        'grace_ends_at'     => 'datetime',
        'purge_at'          => 'datetime',
        'trial_extended_at' => 'datetime',
        'cancelled_at'      => 'datetime',
        'meta'              => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    // ── Prédicats d'état ───────────────────────────────────────────────────────

    public function isDemo(): bool
    {
        return $this->status === self::DEMO;
    }

    /** Palier gratuit « Découverte ». */
    public function isDecouverte(): bool
    {
        return $this->status === self::FREE;
    }

    public function isActive(): bool
    {
        return in_array($this->status, self::ETATS_COMPLETS, true);
    }

    public function isInGrace(): bool
    {
        return $this->status === self::GRACE
            && $this->grace_ends_at
            && $this->grace_ends_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->status === self::EXPIRED
            || ($this->status === self::ACTIVE && $this->ends_at && $this->ends_at->isPast() && !$this->isInGrace());
    }

    /**
     * L'export (CSV/Excel/PDF de données) est-il autorisé ?
     * Fermé au palier Découverte et en démo (leviers de conversion, cahier §3.3).
     */
    public function canExport(): bool
    {
        return in_array($this->status, self::ETATS_COMPLETS, true);
    }

    /**
     * Plafond de chantiers (modèle Site) applicable à cet abonnement.
     * null = illimité. Découverte = plafond gratuit (1). Essai/Active/Grace = plafond de la formule.
     */
    public function chantierCap(): ?int
    {
        // La démo publique présente le produit complet (données fictives réinitialisées
        // chaque nuit) — aucun plafond. Le palier gratuit Découverte, lui, est plafonné.
        if ($this->isDemo()) {
            return null;
        }
        if ($this->isDecouverte()) {
            return LicenseConfig::quotaChantiersGratuit();
        }

        return LicenseConfig::chantiersPourFormule($this->plan?->slug);
    }

    public function daysRemaining(): int
    {
        $end = $this->status === self::TRIAL ? $this->trial_ends_at : $this->ends_at;
        if (!$end || $end->isPast()) {
            return 0;
        }

        return (int) now()->diffInDays($end);
    }

    public function libelleEtat(): string
    {
        return LicenseConfig::libelleEtat($this->status);
    }
}
