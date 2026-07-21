<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des sauvegardes de base de données.
 * Accessible uniquement par les super_admin de la société.
 */
class BackupController extends Controller
{
    public function index(Request $request): Response
    {
        $files = $this->listBackups();

        return Inertia::render('Backup/Index', [
            'backups' => $files,
            'can' => [
                'create'   => $request->user()->can('administration.create'),
                'download' => $request->user()->can('administration.view'),
                'delete'   => $request->user()->can('administration.delete'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('administration.create');

        $exitCode = \Artisan::call('backup:run');

        if ($exitCode !== 0) {
            return back()->withErrors(['backup' => 'Le backup a échoué. Vérifiez les logs.']);
        }

        return back()->with('success', 'Backup créé avec succès.');
    }

    public function download(Request $request, string $filename): HttpResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $this->authorize('administration.view');

        // Sécurité : empêcher la traversée de répertoire
        $filename = basename($filename);
        if (!preg_match('/^backup_[\w\-]+\.sql\.gz$/', $filename)) {
            abort(404);
        }

        $path = storage_path('app/backups/' . $filename);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->download($path, $filename, [
            'Content-Type'        => 'application/gzip',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function destroy(Request $request, string $filename): RedirectResponse
    {
        $this->authorize('administration.delete');

        $filename = basename($filename);
        if (!preg_match('/^backup_[\w\-]+\.sql\.gz$/', $filename)) {
            abort(404);
        }

        $path = storage_path('app/backups/' . $filename);

        if (file_exists($path)) {
            @unlink($path);
        }

        return back()->with('success', 'Backup supprimé.');
    }

    public function restore(Request $request, string $filename): RedirectResponse
    {
        $this->authorize('administration.create');

        $filename = basename($filename);
        if (!preg_match('/^backup_[\w\-]+\.sql\.gz$/', $filename)) {
            abort(404);
        }

        $path = storage_path('app/backups/' . $filename);
        if (!file_exists($path)) {
            abort(404);
        }

        $db   = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port', 3306);

        // Écriture du mot de passe dans un fichier de config temporaire (non visible dans ps aux)
        $tempConfig = tempnam(sys_get_temp_dir(), 'mysql_');
        file_put_contents($tempConfig, "[client]\npassword={$pass}\n");
        chmod($tempConfig, 0600);

        try {
            // Décompresser le .gz puis piper dans mysql
            $cmd = sprintf(
                'gunzip -c %s | mysql --defaults-extra-file=%s --host=%s --port=%d --user=%s %s 2>&1',
                escapeshellarg($path),
                escapeshellarg($tempConfig),
                escapeshellarg($host),
                (int) $port,
                escapeshellarg($user),
                escapeshellarg($db)
            );

            exec($cmd, $output, $exitCode);
        } finally {
            // Toujours supprimer le fichier de config, même en cas d'erreur
            if (file_exists($tempConfig)) {
                unlink($tempConfig);
            }
        }

        if ($exitCode !== 0) {
            \Log::error('Restore backup failed', ['output' => implode("\n", $output)]);
            return back()->withErrors(['restore' => 'La restauration a échoué. Consultez les logs.']);
        }

        return back()->with('success', "Base de données restaurée depuis « {$filename} » avec succès.");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function listBackups(): array
    {
        $dir   = storage_path('app/backups');
        $files = glob($dir . '/backup_*.sql.gz') ?: [];

        // Plus récents en premier
        usort($files, fn ($a, $b) => filemtime($b) - filemtime($a));

        return array_map(function ($path) {
            $size  = filesize($path);
            $bytes = $size;
            if ($size > 1048576) $human = round($size / 1048576, 1) . ' Mo';
            elseif ($size > 1024) $human = round($size / 1024, 1) . ' Ko';
            else $human = $size . ' o';

            return [
                'filename'   => basename($path),
                'size'       => $human,
                'created_at' => date('d/m/Y H:i', filemtime($path)),
            ];
        }, $files);
    }
}
