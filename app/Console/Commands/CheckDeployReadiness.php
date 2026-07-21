<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class CheckDeployReadiness extends Command
{
    protected $signature   = 'construiro:check-deploy';
    protected $description = 'Vérifie que l\'environnement est prêt pour la mise en production';

    public function handle(): int
    {
        $errors   = [];
        $warnings = [];

        // ─── Vérifications critiques ────────────────────────────────────────
        if (config('app.debug') === true) {
            $errors[] = 'APP_DEBUG=true — doit être false en production';
        }

        if (empty(config('app.key'))) {
            $errors[] = 'APP_KEY manquant — php artisan key:generate';
        }

        if (config('queue.default') === 'sync') {
            $errors[] = 'QUEUE_CONNECTION=sync — les jobs ne seront pas traités';
        }

        // ─── Vérifications base de données ──────────────────────────────────
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $errors[] = 'Connexion base de données impossible : ' . $e->getMessage();
        }

        // ─── Avertissements ─────────────────────────────────────────────────
        if (config('app.env') !== 'production') {
            $warnings[] = 'APP_ENV n\'est pas "production" (valeur actuelle : ' . config('app.env') . ')';
        }

        if (config('session.driver') === 'file') {
            $warnings[] = 'SESSION_DRIVER=file — recommandé en production : redis';
        }

        if (config('cache.default') === 'file') {
            $warnings[] = 'CACHE_STORE=file — recommandé en production : redis';
        }

        if (empty(config('services.groq.api_key'))) {
            $warnings[] = 'GROQ_API_KEY non configuré — SARA IA sera indisponible';
        }

        // ─── Vérification Redis (si configuré) ──────────────────────────────
        if (in_array(config('cache.default'), ['redis']) || in_array(config('session.driver'), ['redis'])) {
            try {
                Redis::ping();
            } catch (\Exception $e) {
                $errors[] = 'Redis inaccessible : ' . $e->getMessage();
            }
        }

        // ─── Vérification migrations en attente ─────────────────────────────
        try {
            $exitCode = Artisan::call('migrate:status', ['--no-interaction' => true]);
            $output   = Artisan::output();

            if (str_contains($output, 'Pending')) {
                $warnings[] = 'Des migrations sont en attente — php artisan migrate';
            }
        } catch (\Exception $e) {
            $warnings[] = 'Impossible de vérifier les migrations : ' . $e->getMessage();
        }

        // ─── Rapport final ──────────────────────────────────────────────────
        $this->newLine();

        if (empty($errors) && empty($warnings)) {
            $this->info('✅  Environnement prêt pour le déploiement !');
            $this->newLine();
            return Command::SUCCESS;
        }

        foreach ($errors as $error) {
            $this->error('❌  ' . $error);
        }

        foreach ($warnings as $warning) {
            $this->warn('⚠️   ' . $warning);
        }

        $this->newLine();

        if (!empty($errors)) {
            $this->error(count($errors) . ' erreur(s) critique(s) à corriger avant déploiement.');
            return Command::FAILURE;
        }

        $this->warn(count($warnings) . ' avertissement(s) — déploiement possible mais non optimal.');
        return Command::SUCCESS;
    }
}
