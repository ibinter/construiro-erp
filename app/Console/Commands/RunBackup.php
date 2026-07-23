<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class RunBackup extends Command
{
    protected $signature = 'construiro:backup {--type=full : full, database}';
    protected $description = 'Run a system backup';

    public function handle(BackupService $backupService): void
    {
        $type = $this->option('type');
        $this->info("Démarrage sauvegarde ($type)...");
        $log = $backupService->runBackup($type);
        $this->info($log->status === 'completed'
            ? "Sauvegarde terminée : {$log->filename} (" . round($log->size_bytes / 1024 / 1024, 2) . " Mo)"
            : "Sauvegarde échouée : {$log->error_message}");
    }
}
