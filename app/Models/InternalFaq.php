<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InternalFaq extends Model
{
    protected $fillable = [
        'category',
        'question',
        'answer',
        'keywords',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'sort_order'   => 'integer',
    ];
}
