<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingResource extends Model
{
    protected $fillable = [
        'category_id', 'type', 'title_fr', 'title_en',
        'description_fr', 'description_en', 'url', 'thumbnail',
        'duration_minutes', 'level', 'role_restriction',
        'is_published', 'sort_order', 'view_count',
    ];

    protected $casts = [
        'is_published'     => 'boolean',
        'duration_minutes' => 'integer',
        'sort_order'       => 'integer',
        'view_count'       => 'integer',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(TrainingCategory::class, 'category_id');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(TrainingProgress::class, 'resource_id');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isVideo(): bool
    {
        return $this->type === 'video';
    }

    public function isDocument(): bool
    {
        return $this->type === 'document';
    }
}
