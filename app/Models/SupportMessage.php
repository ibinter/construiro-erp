<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    protected $fillable = ['ticket_id', 'user_id', 'body', 'is_internal', 'is_agent'];
    protected $casts = ['is_internal' => 'boolean', 'is_agent' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }
    public function ticket() { return $this->belongsTo(SupportTicket::class, 'ticket_id'); }
}
