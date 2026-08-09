<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\LicenseStateResolver;
use Illuminate\Console\Command;

/**
 * Matérialise les transitions d'état de licence hors trafic HTTP (cahier §9.6, 03:00).
 *   TRIAL échu  -> FREE (Découverte)
 *   ACTIVE échu -> GRACE (grace_jours)
 *   GRACE échu  -> EXPIRED (purge_at = +retention_jours)
 */
class RecalculateLicenseStates extends Command
{
    protected $signature = 'construiro:recalculate-license-states';
    protected $description = 'Recalcule et matérialise les états de licence (transitions temporelles)';

    public function handle(LicenseStateResolver $resolver): int
    {
        $count = 0;

        Subscription::query()
            ->whereIn('status', [Subscription::TRIAL, Subscription::ACTIVE, Subscription::GRACE])
            ->chunkById(200, function ($subs) use ($resolver, &$count) {
                foreach ($subs as $sub) {
                    $attrs = $resolver->transitionAttributes($sub);
                    if ($attrs !== []) {
                        $old = $sub->status;
                        $sub->update($attrs);
                        $count++;
                        $this->line("  #{$sub->id} {$old} -> {$attrs['status']}");
                    }
                }
            });

        $this->info("Transitions matérialisées : {$count}");

        return self::SUCCESS;
    }
}
