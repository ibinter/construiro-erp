<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportLog extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'module',
        'filename',
        'status',
        'total_rows',
        'imported_rows',
        'skipped_rows',
        'error_rows',
        'errors',
        'column_mapping',
        'file_path',
    ];

    protected $casts = [
        'errors'         => 'array',
        'column_mapping' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ──────────────────────────────────────────────────────────────────

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function successRate(): float
    {
        if ($this->total_rows === 0) {
            return 0.0;
        }

        return round(($this->imported_rows / $this->total_rows) * 100, 1);
    }
}
