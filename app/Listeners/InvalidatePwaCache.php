<?php

namespace App\Listeners;

use App\Events\EvolutionPublished;

class InvalidatePwaCache
{
    public function handle(EvolutionPublished $event): void
    {
        // Incrémenter la version du SW pour forcer les clients à re-fetch
        try {
            $currentVersion = \Cache::get('pwa_cache_version', 1);
            \Cache::forever('pwa_cache_version', $currentVersion + 1);
            \Log::info('[Evolution] PWA cache version incremented to ' . ($currentVersion + 1));
        } catch (\Throwable) {
            // Silencieux si cache non disponible
        }
    }
}
