<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    protected $fillable = [
        'number', 'company_id', 'user_id', 'assigned_to',
        'subject', 'description', 'status', 'priority', 'category',
        'first_response_at', 'resolved_at',
    ];

    protected $casts = [
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $ticket) {
            $last = static::max('id') ?? 0;
            $ticket->number = 'TICK-' . str_pad($last + 1, 6, '0', STR_PAD_LEFT);
        });
    }

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function agent(): BelongsTo   { return $this->belongsTo(User::class, 'assigned_to'); }
    public function messages(): HasMany  { return $this->hasMany(SupportMessage::class, 'ticket_id'); }

    public function isOpen(): bool
    {
        return in_array($this->status, ['new', 'open', 'pending']);
    }
}
