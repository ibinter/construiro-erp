<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RelanceCampaignRecipient extends Model
{
    protected $fillable = [
        'campaign_id',
        'email',
        'name',
        'company_name',
        'status',
        'sent_at',
        'opened_at',
        'tracking_token',
    ];

    protected $casts = [
        'sent_at'   => 'datetime',
        'opened_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(RelanceCampaign::class, 'campaign_id');
    }
}
