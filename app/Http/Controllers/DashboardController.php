<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // KPIs de démonstration — seront branchés sur les vrais modules en V1.
        $stats = [
            ['key' => 'projects',  'label' => 'Projets actifs',      'value' => 8,          'icon' => 'folder-kanban', 'trend' => '+2'],
            ['key' => 'sites',     'label' => 'Chantiers en cours',  'value' => 5,          'icon' => 'construction',  'trend' => '+1'],
            ['key' => 'budget',    'label' => 'Budget engagé',       'value' => '1,2 Md',   'icon' => 'wallet',        'trend' => '68%'],
            ['key' => 'workforce', 'label' => 'Effectif pointé',     'value' => 142,        'icon' => 'users',         'trend' => 'aujourd\'hui'],
        ];

        return Inertia::render('Dashboard', [
            'stats'          => $stats,
            'companyCount'   => User::query()->distinct('company_id')->count('company_id'),
        ]);
    }
}
