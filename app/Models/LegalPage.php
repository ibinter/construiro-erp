<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalPage extends Model
{
    protected $fillable = [
        'slug', 'title_fr', 'title_en',
        'content_fr', 'content_en',
        'is_published', 'last_updated_at',
    ];

    protected $casts = [
        'is_published'    => 'boolean',
        'last_updated_at' => 'datetime',
    ];

    public function title(): string
    {
        $locale = app()->getLocale();
        return $locale === 'en' ? $this->title_en : $this->title_fr;
    }

    public function content(): string
    {
        $locale = app()->getLocale();
        return $locale === 'en' ? $this->content_en : $this->content_fr;
    }
}
