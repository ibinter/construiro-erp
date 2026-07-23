<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\BackupLog;
use App\Services\BackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function __construct(private BackupService $backupService) {}

    public function index(): \Inertia\Response
    {
        $backups = BackupLog::orderByDesc('created_at')->paginate(20);

        return Inertia::render('SuperAdmin/Backups/Index', [
            'backups' => $backups->through(fn($b) => [
                'id'            => $b->id,
                'filename'      => $b->filename,
                'type'          => $b->type,
                'status'        => $b->status,
                'size_mb'       => $b->size_bytes ? round($b->size_bytes / 1024 / 1024, 2) : null,
                'checksum'      => $b->checksum,
                'initiated_by'  => $b->initiated_by,
                'started_at'    => $b->started_at?->format('d/m/Y H:i'),
                'completed_at'  => $b->completed_at?->format('d/m/Y H:i'),
                'error_message' => $b->error_message,
            ]),
        ]);
    }

    public function run(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate(['type' => 'required|in:full,database']);
        $log = $this->backupService->runBackup($validated['type'], $request->user()->id);

        return back()->with(
            $log->status === BackupLog::STATUS_COMPLETED ? 'success' : 'error',
            $log->status === BackupLog::STATUS_COMPLETED
                ? 'Sauvegarde créée : ' . $log->filename
                : 'Échec : ' . $log->error_message
        );
    }

    public function download(BackupLog $backup): mixed
    {
        if (!$backup->path || !Storage::disk('private')->exists($backup->path)) {
            abort(404, 'Fichier de sauvegarde introuvable.');
        }

        return Storage::disk('private')->download($backup->path, $backup->filename);
    }

    public function destroy(BackupLog $backup): \Illuminate\Http\RedirectResponse
    {
        if ($backup->path && Storage::disk('private')->exists($backup->path)) {
            Storage::disk('private')->delete($backup->path);
        }

        $backup->delete();

        return back()->with('success', 'Sauvegarde supprimée.');
    }
}
