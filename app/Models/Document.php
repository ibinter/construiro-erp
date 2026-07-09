<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * Document (GED) — métadonnées et fichier d'un document (nom / chemin / type).
 * Upload réel sur le disque « public » ; rattachement optionnel à un projet.
 * Isolation multi-tenant par entreprise.
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

    /** URL publique du fichier attaché (exposée au front). */
    protected $appends = ['file_url'];

    /** URL publique du fichier stocké, ou null si aucun fichier. */
    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }

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
