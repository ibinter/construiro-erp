<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingFaq extends Model
{
    protected $fillable = [
        'category',
        'question_fr', 'question_en',
        'answer_fr', 'answer_en',
        'sort_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function question(): string
    {
        $locale = app()->getLocale();
        return ($locale === 'en' && $this->question_en) ? $this->question_en : $this->question_fr;
    }

    public function answer(): string
    {
        $locale = app()->getLocale();
        return ($locale === 'en' && $this->answer_en) ? $this->answer_en : $this->answer_fr;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
