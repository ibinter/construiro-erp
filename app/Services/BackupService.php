<?php

namespace App\Services;

use App\Models\BackupLog;
use Illuminate\Support\Facades\Storage;

class BackupService
{
    private string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/private/backups');
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0750, true);
        }
    }

    /**
     * Lance une sauvegarde complète (BDD + fichiers uploads).
     */
    public function runBackup(string $type = 'full', ?int $userId = null): BackupLog
    {
        $log = BackupLog::create([
            'filename'     => 'backup_' . date('Ymd_His') . '_' . $type . '.tar.gz',
            'type'         => $type,
            'status'       => BackupLog::STATUS_RUNNING,
            'initiated_by' => $userId ? 'admin' : 'scheduler',
            'user_id'      => $userId,
            'started_at'   => now(),
        ]);

        try {
            $archivePath = $this->backupDir . '/' . $log->filename;

            if ($type === 'database' || $type === 'full') {
                $sqlFile = $this->backupDir . '/' . $log->filename . '.sql';
                $this->dumpDatabase($sqlFile);
            }

            // Construire l'archive tar.gz
            $sqlRelative = 'storage/app/private/backups/' . basename($log->filename . '.sql');
            $tarArgs = escapeshellarg($sqlRelative);

            if ($type === 'full') {
                $uploadsPath = storage_path('app/private/uploads');
                if (is_dir($uploadsPath)) {
                    $tarArgs .= ' ' . escapeshellarg('storage/app/private/uploads');
                }
            }

            shell_exec(
                'tar -czf ' . escapeshellarg($archivePath) .
                ' -C ' . escapeshellarg(base_path()) .
                ' ' . $tarArgs . ' 2>&1'
            );

            // Supprimer le .sql temporaire
            if (isset($sqlFile) && file_exists($sqlFile)) {
                @unlink($sqlFile);
            }

            $size     = file_exists($archivePath) ? filesize($archivePath) : 0;
            $checksum = file_exists($archivePath) ? hash_file('sha256', $archivePath) : null;

            $log->update([
                'status'       => BackupLog::STATUS_COMPLETED,
                'path'         => 'private/backups/' . $log->filename,
                'size_bytes'   => $size,
                'checksum'     => $checksum,
                'completed_at' => now(),
            ]);

            // Nettoyage : garder seulement les 30 dernières sauvegardes
            $this->cleanOldBackups(30);

        } catch (\Throwable $e) {
            $log->update([
                'status'        => BackupLog::STATUS_FAILED,
                'error_message' => $e->getMessage(),
            ]);
        }

        return $log;
    }

    private function dumpDatabase(string $outputPath): void
    {
        $host = config('database.connections.mysql.host', '127.0.0.1');
        $port = config('database.connections.mysql.port', '3306');
        $db   = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');

        $cmd = sprintf(
            'mysqldump --host=%s --port=%s --user=%s --password=%s --single-transaction --routines --triggers %s > %s 2>&1',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($user),
            escapeshellarg($pass),
            escapeshellarg($db),
            escapeshellarg($outputPath)
        );

        shell_exec($cmd);
    }

    private function cleanOldBackups(int $keep): void
    {
        $logs = BackupLog::where('status', BackupLog::STATUS_COMPLETED)
            ->orderByDesc('created_at')
            ->get();

        foreach ($logs->skip($keep) as $old) {
            if ($old->path && Storage::disk('private')->exists($old->path)) {
                Storage::disk('private')->delete($old->path);
            }
            $old->delete();
        }
    }

    public function getBackupsList(): \Illuminate\Database\Eloquent\Collection
    {
        return BackupLog::orderByDesc('created_at')->limit(50)->get();
    }
}
