<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingTemoignage extends Model
{
    protected $fillable = [
        'initiales', 'nom', 'poste', 'ville',
        'texte_fr', 'texte_en',
        'rating', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function texte(): string
    {
        $locale = app()->getLocale();
        return ($locale === 'en' && $this->texte_en) ? $this->texte_en : $this->texte_fr;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
