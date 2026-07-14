<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Crée un dump SQL de la base de données et le stocke dans storage/app/backups/.
 * Conserve les 30 derniers fichiers, supprime les plus anciens.
 */
class BackupDatabase extends Command
{
    protected $signature   = 'backup:run {--company= : Limiter à une company_id (non implémenté, full DB uniquement)}';
    protected $description = 'Créer un backup complet de la base de données MySQL';

    public function handle(): int
    {
        $db   = config('database.connections.mysql.database');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port', 3306);
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');

        if (!$db || !$user) {
            $this->error('Configuration MySQL incomplète.');
            return self::FAILURE;
        }

        $filename  = 'backup_' . $db . '_' . now()->format('Y-m-d_His') . '.sql.gz';
        $localPath = storage_path('app/backups/' . $filename);

        if (!is_dir(dirname($localPath))) {
            mkdir(dirname($localPath), 0755, true);
        }

        $passArg = $pass ? "-p" . escapeshellarg($pass) : '';
        $cmd = sprintf(
            'mysqldump --single-transaction --quick --lock-tables=false -h %s -P %s -u %s %s %s | gzip > %s 2>&1',
            escapeshellarg($host),
            (int) $port,
            escapeshellarg($user),
            $passArg,
            escapeshellarg($db),
            escapeshellarg($localPath)
        );

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0 || !file_exists($localPath) || filesize($localPath) < 100) {
            $this->error('mysqldump a échoué. Sortie : ' . implode("\n", $output));
            return self::FAILURE;
        }

        $this->info("Backup créé : {$filename} (" . $this->humanSize(filesize($localPath)) . ')');

        // Purger les anciens (garder 30 derniers)
        $files = glob(storage_path('app/backups/backup_*.sql.gz'));
        if ($files && count($files) > 30) {
            usort($files, fn ($a, $b) => filemtime($a) - filemtime($b));
            $toDelete = array_slice($files, 0, count($files) - 30);
            foreach ($toDelete as $old) {
                @unlink($old);
                $this->line('Supprimé : ' . basename($old));
            }
        }

        return self::SUCCESS;
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes > 1048576) return round($bytes / 1048576, 1) . ' Mo';
        if ($bytes > 1024)    return round($bytes / 1024, 1) . ' Ko';
        return $bytes . ' o';
    }
}
