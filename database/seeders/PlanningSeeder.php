<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Peuple des tâches de planning réalistes pour le projet de démonstration.
 */
class PlanningSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $project = Project::where('company_id', $company->id)
            ->where('code', 'PRJ-2026-001')
            ->first();
        if (! $project) {
            return;
        }

        $chef = User::where('email', 'chef@construiro.com')->first();
        $manager = User::where('email', 'dp@construiro.com')->first();

        // Tâches échelonnées d'un chantier de bâtiment R+8.
        $tasks = [
            ['name' => 'Installation de chantier', 'start_date' => '2026-02-01', 'end_date' => '2026-02-15', 'progress' => 100, 'status' => 'done'],
            ['name' => 'Terrassement',            'start_date' => '2026-02-16', 'end_date' => '2026-03-15', 'progress' => 100, 'status' => 'done'],
            ['name' => 'Fondations',              'start_date' => '2026-03-16', 'end_date' => '2026-04-30', 'progress' => 80,  'status' => 'in_progress'],
            ['name' => 'Élévation R+1 à R+4',     'start_date' => '2026-05-01', 'end_date' => '2026-07-31', 'progress' => 40,  'status' => 'in_progress'],
            ['name' => 'Élévation R+5 à R+8',     'start_date' => '2026-08-01', 'end_date' => '2026-10-31', 'progress' => 0,   'status' => 'todo'],
            ['name' => 'Second œuvre',            'start_date' => '2026-11-01', 'end_date' => '2027-02-28', 'progress' => 0,   'status' => 'blocked'],
            ['name' => 'Finitions',               'start_date' => '2027-03-01', 'end_date' => '2027-05-31', 'progress' => 0,   'status' => 'todo'],
            ['name' => 'Réception & livraison',   'start_date' => '2027-06-01', 'end_date' => '2027-06-30', 'progress' => 0,   'status' => 'todo'],
        ];

        foreach ($tasks as $i => $data) {
            Task::updateOrCreate(
                ['company_id' => $company->id, 'project_id' => $project->id, 'name' => $data['name']],
                array_merge($data, [
                    'company_id'  => $company->id,
                    'project_id'  => $project->id,
                    'assignee_id' => $i % 2 === 0 ? $chef?->id : $manager?->id,
                    'position'    => $i,
                ])
            );
        }
    }
}
