<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingProgress extends Model
{
    protected $fillable = [
        'user_id', 'resource_id', 'completed', 'last_viewed_at',
    ];

    protected $casts = [
        'completed'      => 'boolean',
        'last_viewed_at' => 'datetime',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(TrainingResource::class, 'resource_id');
    }
}
