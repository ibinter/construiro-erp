<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmtpSetting extends Model
{
    protected $table = 'smtp_settings';

    protected $fillable = [
        'host', 'port', 'username', 'password', 'encryption',
        'from_address', 'from_name', 'is_active',
    ];

    protected $casts = [
        'password'  => 'encrypted',
        'is_active' => 'boolean',
        'port'      => 'integer',
    ];

    public static function active(): ?self
    {
        return static::where('is_active', true)->first();
    }
}
