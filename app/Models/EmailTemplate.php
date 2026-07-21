<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'key',
        'subject_fr',
        'subject_en',
        'body_fr',
        'body_en',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Retourne le template actif pour une clé donnée, ou null s'il n'existe pas.
     */
    public static function getOrDefault(string $key): ?self
    {
        return static::where('key', $key)->where('is_active', true)->first();
    }
}
