<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Document (GED) — métadonnées d'un document (nom / chemin / type).
 * Pas d'upload réel : le chemin ou l'URL est saisi manuellement.
 * Rattachement optionnel à un projet. Isolation multi-tenant par entreprise.
 */
class Document extends Model
{
    use HasFactory, SoftDeletes;

    public const CATEGORIES = ['plan', 'contrat', 'rapport', 'facture', 'photo', 'administratif', 'autre'];

    protected $fillable = [
        'company_id', 'project_id',
        'code', 'title', 'category',
        'file_name', 'file_path', 'mime_type', 'size_kb',
        'version', 'uploaded_by', 'description',
    ];

    protected $casts = [
        'size_kb' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
