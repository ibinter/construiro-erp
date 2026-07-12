<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeBaseArticle extends Model
{
    protected $fillable = ['title', 'slug', 'content', 'category', 'is_published', 'view_count'];
    protected $casts = ['is_published' => 'boolean'];
}
