<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportSession extends Model
{
    protected $fillable = [
        'company_id', 'support_user_id', 'reason', 'expires_at', 'ended_at', 'token',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function isActive(): bool
    {
        return $this->ended_at === null && $this->expires_at->isFuture();
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function supportUser()
    {
        return $this->belongsTo(User::class, 'support_user_id');
    }
}
