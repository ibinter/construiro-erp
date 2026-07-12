<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $fillable = ['user_id', 'channel', 'type', 'enabled'];

    protected $casts = ['enabled' => 'boolean'];

    public static function getForUser(int $userId): array
    {
        $channels = ['app', 'email'];
        $types = Notification::TYPES;

        $existing = static::where('user_id', $userId)
            ->get()
            ->keyBy(fn($p) => "{$p->channel}_{$p->type}");

        $prefs = [];
        foreach ($channels as $channel) {
            foreach ($types as $type) {
                $key = "{$channel}_{$type}";
                $prefs[$channel][$type] = $existing->has($key)
                    ? $existing[$key]->enabled
                    : true; // default: all enabled
            }
        }

        return $prefs;
    }

    public static function isEnabled(int $userId, string $channel, string $type): bool
    {
        $pref = static::where('user_id', $userId)
            ->where('channel', $channel)
            ->where('type', $type)
            ->first();

        return $pref ? $pref->enabled : true;
    }
}
