<?php

namespace App\Listeners;

use App\Events\EvolutionPublished;
use Illuminate\Support\Facades\Cache;

class PropagateEvolutionToLanding
{
    public function handle(EvolutionPublished $event): void
    {
        // Invalider le cache des sections landing liées aux modules
        Cache::forget('landing_modules_section');
        Cache::forget('landing_pricing_section');
        Cache::forget('landing_features_section');

        // Logger la propagation
        \Log::info('[Evolution] Landing sections cache invalidated', [
            'module'  => $event->moduleKey,
            'feature' => $event->featureKey,
            'plans'   => $event->changedPlans,
        ]);
    }
}
