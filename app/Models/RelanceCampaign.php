<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RelanceCampaign extends Model
{
    protected $fillable = [
        'name',
        'type',
        'subject',
        'body_html',
        'status',
        'target_count',
        'sent_count',
        'opened_count',
        'clicked_count',
        'unsubscribed_count',
        'scheduled_at',
        'completed_at',
        'filters',
        'created_by',
    ];

    protected $casts = [
        'filters'      => 'array',
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function recipients(): HasMany
    {
        return $this->hasMany(RelanceCampaignRecipient::class, 'campaign_id');
    }

    /** Taux d'ouverture en pourcentage (0–100). */
    public function getOpenRateAttribute(): float
    {
        if ($this->sent_count === 0) {
            return 0.0;
        }

        return round(($this->opened_count / $this->sent_count) * 100, 1);
    }

    /** Taux de clic en pourcentage (0–100). */
    public function getClickRateAttribute(): float
    {
        if ($this->sent_count === 0) {
            return 0.0;
        }

        return round(($this->clicked_count / $this->sent_count) * 100, 1);
    }
}
