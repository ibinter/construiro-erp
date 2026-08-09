<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Purge des espaces EXPIRED ayant dépassé date_purge (J+90) — cahier §9.6.
 *
 * SÉCURITÉ : par défaut en dry-run (rapport seul). Avec --force, l'espace est
 * DÉSACTIVÉ (réversible, is_active=false) et non supprimé physiquement : la
 * suppression définitive + sauvegarde froide 12 mois relèvent de l'infra/ops
 * et d'une décision RGPD (hors périmètre code).
 */
class PurgeExpiredData extends Command
{
    protected $signature = 'construiro:purge-expired {--force : Désactive réellement les espaces (sinon rapport seul)}';
    protected $description = 'Identifie (et, avec --force, désactive) les espaces expirés dépassant la rétention J+90';

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $now   = now();
        $count = 0;

        Subscription::query()
            ->where('status', Subscription::EXPIRED)
            ->whereNotNull('purge_at')
            ->where('purge_at', '<=', $now)
            ->with('company')
            ->chunkById(100, function ($subs) use ($force, &$count) {
                foreach ($subs as $sub) {
                    $company = $sub->company;
                    if (!$company) {
                        continue;
                    }
                    $count++;

                    if ($force) {
                        $company->update(['is_active' => false]);
                        Log::warning('licence.purge', [
                            'company_id' => $company->id,
                            'purge_at'   => (string) $sub->purge_at,
                            'action'     => 'desactive',
                        ]);
                        $this->warn("  Espace #{$company->id} désactivé (purge_at {$sub->purge_at}).");
                    } else {
                        $this->line("  [dry-run] Espace #{$company->id} à purger (purge_at {$sub->purge_at}).");
                    }
                }
            });

        $this->info(($force ? 'Espaces désactivés' : 'Espaces à purger (dry-run)') . " : {$count}");

        return self::SUCCESS;
    }
}
