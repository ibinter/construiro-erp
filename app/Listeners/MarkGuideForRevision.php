<?php

namespace App\Listeners;

use App\Events\EvolutionPublished;

class MarkGuideForRevision
{
    public function handle(EvolutionPublished $event): void
    {
        // Créer une entrée dans la table d'alertes de révision
        try {
            \DB::table('guide_revision_flags')->updateOrInsert(
                ['module_key' => $event->moduleKey],
                [
                    'needs_revision' => true,
                    'reason'         => 'Feature ' . $event->featureKey . ' changed in plans: ' . implode(', ', $event->changedPlans),
                    'flagged_at'     => now(),
                    'flagged_by'     => $event->changedBy,
                ]
            );
        } catch (\Throwable) {
            // Silencieux si table non migrée
        }
    }
}
