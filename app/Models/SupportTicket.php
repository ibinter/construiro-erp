<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    // -----------------------------------------------------------------------
    // Statuts
    // -----------------------------------------------------------------------
    const STATUS_NEW            = 'new';
    const STATUS_OPEN           = 'open';
    const STATUS_PENDING        = 'pending';
    const STATUS_RESOLVED       = 'resolved';
    const STATUS_CLOSED         = 'closed';
    const STATUS_ASSIGNED       = 'assigned';
    const STATUS_IN_PROGRESS    = 'in_progress';
    const STATUS_WAITING_CLIENT = 'waiting_client';
    const STATUS_WAITING_TECH   = 'waiting_tech';
    const STATUS_ESCALATED      = 'escalated';
    const STATUS_REOPENED       = 'reopened';

    /** Liste de tous les statuts valides */
    const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_OPEN,
        self::STATUS_PENDING,
        self::STATUS_RESOLVED,
        self::STATUS_CLOSED,
        self::STATUS_ASSIGNED,
        self::STATUS_IN_PROGRESS,
        self::STATUS_WAITING_CLIENT,
        self::STATUS_WAITING_TECH,
        self::STATUS_ESCALATED,
        self::STATUS_REOPENED,
    ];

    // -----------------------------------------------------------------------
    // Attributs Eloquent
    // -----------------------------------------------------------------------
    protected $fillable = [
        'number', 'company_id', 'user_id', 'assigned_to',
        'subject', 'description', 'status', 'priority', 'category',
        'attachments',
        'first_response_at', 'resolved_at',
        'first_response_target_at', 'resolved_target_at', 'sla_breached',
    ];

    protected $casts = [
        'attachments'               => 'array',
        'first_response_at'         => 'datetime',
        'resolved_at'               => 'datetime',
        'first_response_target_at'  => 'datetime',
        'resolved_target_at'        => 'datetime',
        'sla_breached'              => 'boolean',
    ];

    // -----------------------------------------------------------------------
    // Boot
    // -----------------------------------------------------------------------
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $ticket) {
            $last = static::max('id') ?? 0;
            $ticket->number = 'TICK-' . str_pad($last + 1, 6, '0', STR_PAD_LEFT);
        });
    }

    // -----------------------------------------------------------------------
    // Relations
    // -----------------------------------------------------------------------
    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function agent(): BelongsTo   { return $this->belongsTo(User::class, 'assigned_to'); }
    public function messages(): HasMany  { return $this->hasMany(SupportMessage::class, 'ticket_id'); }

    // -----------------------------------------------------------------------
    // Accesseurs / helpers
    // -----------------------------------------------------------------------

    /** Vrai si le ticket accepte encore des réponses */
    public function isOpen(): bool
    {
        return in_array($this->status, [
            self::STATUS_NEW,
            self::STATUS_OPEN,
            self::STATUS_PENDING,
            self::STATUS_ASSIGNED,
            self::STATUS_IN_PROGRESS,
            self::STATUS_WAITING_CLIENT,
            self::STATUS_WAITING_TECH,
            self::STATUS_ESCALATED,
            self::STATUS_REOPENED,
        ]);
    }

    /**
     * Vérifie si le SLA de résolution est dépassé.
     * Met à jour sla_breached en base si ce n'est pas encore fait.
     */
    public function isSlaBreached(): bool
    {
        if (!$this->resolved_target_at) {
            return false;
        }

        $breached = now()->gt($this->resolved_target_at)
            && !in_array($this->status, [self::STATUS_RESOLVED, self::STATUS_CLOSED]);

        if ($breached && !$this->sla_breached) {
            $this->updateQuietly(['sla_breached' => true]);
        }

        return $breached;
    }

    /**
     * Pourcentage du SLA de résolution consommé (0-100).
     */
    public function slaResolvedPercent(): int
    {
        if (!$this->resolved_target_at) {
            return 0;
        }

        $total   = $this->created_at->diffInSeconds($this->resolved_target_at);
        $elapsed = $this->created_at->diffInSeconds(now());

        return (int) min(100, round(($elapsed / max(1, $total)) * 100));
    }
}
