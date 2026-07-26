<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DemoRequest extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'company', 'sector', 'message', 'status', 'notes',
    ];

    public function demoSession(): HasOne
    {
        return $this->hasOne(DemoSession::class);
    }
}
