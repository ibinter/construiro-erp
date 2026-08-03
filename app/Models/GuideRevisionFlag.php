<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Marque les modules du guide utilisateur qui nécessitent une révision.
 * Géré par SuperAdmin depuis la console d'administration.
 */
class GuideRevisionFlag extends Model
{
    protected $fillable = [
        'module_key',
        'needs_revision',
        'reason',
        'flagged_at',
        'flagged_by',
        'resolved_at',
    ];

    protected $casts = [
        'needs_revision' => 'boolean',
        'flagged_at'     => 'datetime',
        'resolved_at'    => 'datetime',
    ];

    /** Scope : modules marqués comme nécessitant une révision. */
    public function scopePending($query)
    {
        return $query->where('needs_revision', true)->whereNull('resolved_at');
    }

    /** Marque comme résolu. */
    public function resolve(): void
    {
        $this->update([
            'needs_revision' => false,
            'resolved_at'    => now(),
        ]);
    }
}
