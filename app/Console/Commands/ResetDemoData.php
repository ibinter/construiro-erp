<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\LicenseConfig;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Réinitialise la démo publique chaque nuit (cahier §4.4, cron 02:00) :
 * purge les données du tenant démo et régénère des données fictives.
 * Inerte tant que demo.actif = false.
 */
class ResetDemoData extends Command
{
    protected $signature = 'construiro:demo-reset {--force : Exécuter même si demo.actif=false}';
    protected $description = 'Réinitialise les données de la démo publique (données fictives)';

    public function handle(): int
    {
        if (!LicenseConfig::demoActive() && !$this->option('force')) {
            $this->info('Démo inactive (demo.actif=false) — réinitialisation ignorée.');

            return self::SUCCESS;
        }

        DB::transaction(function () {
            // Supprime le(s) tenant(s) démo — les FK en cascade nettoient les données liées.
            Company::where('is_demo', true)->get()->each->delete();
            // Régénère l'entreprise démo + données fictives crédibles (FR).
            $seeder = new DemoDataSeeder();
            $seeder->setContainer(app());
            $seeder->setCommand($this);
            $seeder->run();
        });

        $this->info('Démo réinitialisée avec des données fictives.');

        return self::SUCCESS;
    }
}
