<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeBase extends Model
{
    protected $table = 'knowledge_base';

    protected $fillable = [
        'category',
        'title_fr',
        'title_en',
        'content_fr',
        'content_en',
        'keywords',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'keywords'  => 'array',
        'is_active' => 'boolean',
    ];

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    // ─── Recherche plein-texte MySQL avec fallback LIKE ───────────────────────

    /**
     * Recherche les entrées pertinentes pour enrichir le prompt SARA (RAG).
     *
     * @param  string  $query   Message utilisateur
     * @param  int     $limit   Nombre max de résultats
     * @return \Illuminate\Support\Collection
     */
    public static function search(string $query, int $limit = 3): \Illuminate\Support\Collection
    {
        $safe  = preg_replace('/[^\w\s]/u', ' ', $query);
        $words = array_filter(explode(' ', $safe), fn ($w) => strlen($w) >= 3);

        try {
            if (! empty($words)) {
                $ftQuery = implode(' ', array_map(fn ($w) => '+' . $w . '*', $words));
                $results = static::active()
                    ->whereRaw('MATCH(title_fr, content_fr) AGAINST(? IN BOOLEAN MODE)', [$ftQuery])
                    ->orderByDesc('priority')
                    ->limit($limit)
                    ->get(['title_fr', 'content_fr', 'category', 'priority']);

                if ($results->count() > 0) {
                    return $results;
                }
            }
        } catch (\Throwable) {
            // Si FULLTEXT non disponible (ex : SQLite en tests), on passe au fallback
        }

        // Fallback LIKE
        return static::active()
            ->where(function ($q) use ($words) {
                foreach (array_slice($words, 0, 3) as $w) {
                    $q->orWhere('title_fr', 'LIKE', "%{$w}%")
                      ->orWhere('content_fr', 'LIKE', "%{$w}%");
                }
            })
            ->orderByDesc('priority')
            ->limit($limit)
            ->get(['title_fr', 'content_fr', 'category', 'priority']);
    }
}
