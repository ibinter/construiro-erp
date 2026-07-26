<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HealthController extends Controller
{
    public function index(): Response
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'smtp'     => $this->checkSmtp(),
            'disk'     => $this->checkDisk(),
            'queue'    => $this->checkQueue(),
            'cache'    => $this->checkCache(),
            'storage'  => $this->checkStorage(),
        ];

        return Inertia::render('SuperAdmin/Health/Index', [
            'checks'         => $checks,
            'phpVersion'     => PHP_VERSION,
            'laravelVersion' => app()->version(),
            'appVersion'     => config('construiro.version', '1.0.0'),
        ]);
    }

    private function checkDatabase(): array
    {
        try {
            DB::select('SELECT 1');
            return ['status' => 'ok', 'label' => 'Base de données', 'detail' => 'Connexion active'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'label' => 'Base de données', 'detail' => $e->getMessage()];
        }
    }

    private function checkSmtp(): array
    {
        $host   = config('mail.mailers.smtp.host', '');
        $status = $host && $host !== 'localhost' ? 'ok' : 'warning';

        return [
            'status' => $status,
            'label'  => 'SMTP',
            'detail' => $host ?: 'Non configuré',
        ];
    }

    private function checkDisk(): array
    {
        $free    = disk_free_space(storage_path());
        $total   = disk_total_space(storage_path());
        $usedPct = round((($total - $free) / $total) * 100, 1);
        $status  = $usedPct > 90 ? 'error' : ($usedPct > 75 ? 'warning' : 'ok');

        return [
            'status' => $status,
            'label'  => 'Espace disque',
            'detail' => round($free / 1073741824, 1) . ' Go libres (' . $usedPct . '% utilisé)',
        ];
    }

    private function checkQueue(): array
    {
        try {
            $failedCount = DB::table('failed_jobs')->count();

            return [
                'status' => $failedCount > 10 ? 'error' : ($failedCount > 0 ? 'warning' : 'ok'),
                'label'  => "File d'attente",
                'detail' => $failedCount . ' job(s) en échec',
            ];
        } catch (\Exception $e) {
            return ['status' => 'warning', 'label' => "File d'attente", 'detail' => 'Table failed_jobs inaccessible'];
        }
    }

    private function checkCache(): array
    {
        try {
            Cache::put('health_check', true, 5);
            Cache::get('health_check');

            return ['status' => 'ok', 'label' => 'Cache', 'detail' => config('cache.default')];
        } catch (\Exception $e) {
            return ['status' => 'error', 'label' => 'Cache', 'detail' => $e->getMessage()];
        }
    }

    private function checkStorage(): array
    {
        $writable = is_writable(storage_path('logs'));

        return [
            'status' => $writable ? 'ok' : 'error',
            'label'  => 'Stockage',
            'detail' => $writable
                ? 'storage/logs accessible en écriture'
                : 'storage/logs non accessible',
        ];
    }
}
