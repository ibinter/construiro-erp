<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Demande de signature électronique — modélise le WORKFLOW de signature
 * (statut) sans signature cryptographique réelle.
 * Rattachement optionnel à un document de la GED.
 * Isolation multi-tenant par entreprise.
 */
class SignatureRequest extends Model
{
    use BelongsToCompany;
    use HasFactory, SoftDeletes;

    public const STATUSES = ['pending', 'signed', 'refused', 'expired'];

    protected $fillable = [
        'company_id', 'document_id',
        'title', 'signer_name', 'signer_email',
        'status', 'sent_at', 'signed_at', 'notes',
    ];

    protected $casts = [
        'sent_at'   => 'date',
        'signed_at' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
