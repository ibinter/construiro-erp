<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $manager = User::where('email', 'dp@construiro.com')->first();
        $chef = User::where('email', 'chef@construiro.com')->first();

        $projects = [
            [
                'code' => 'PRJ-2026-001', 'name' => 'Immeuble R+8 Plateau', 'client_name' => 'SCI Horizon',
                'type' => 'batiment', 'status' => 'in_progress', 'budget_amount' => 1250000000, 'progress' => 45,
                'city' => 'Abidjan', 'start_date' => '2026-02-01', 'end_date' => '2027-06-30',
                'sites' => [
                    ['code' => 'CH-01', 'name' => 'Gros œuvre R+8', 'status' => 'in_progress', 'progress' => 60, 'city' => 'Abidjan'],
                    ['code' => 'CH-02', 'name' => 'Second œuvre', 'status' => 'preparation', 'progress' => 5, 'city' => 'Abidjan'],
                ],
            ],
            [
                'code' => 'PRJ-2026-002', 'name' => 'Réhabilitation route Yamoussoukro-Bouaké', 'client_name' => 'AGEROUTE',
                'type' => 'route', 'status' => 'in_progress', 'budget_amount' => 8500000000, 'progress' => 30,
                'city' => 'Bouaké', 'start_date' => '2026-01-15', 'end_date' => '2028-12-31',
                'sites' => [
                    ['code' => 'CH-01', 'name' => 'Terrassement PK0-PK40', 'status' => 'in_progress', 'progress' => 40, 'city' => 'Bouaké'],
                ],
            ],
            [
                'code' => 'PRJ-2026-003', 'name' => 'Château d\'eau Korhogo', 'client_name' => 'ONEP',
                'type' => 'hydraulique', 'status' => 'draft', 'budget_amount' => 620000000, 'progress' => 0,
                'city' => 'Korhogo', 'start_date' => '2026-09-01', 'end_date' => '2027-03-31',
                'sites' => [],
            ],
            [
                'code' => 'PRJ-2025-014', 'name' => 'Villa Cocody Angré', 'client_name' => 'M. Koné',
                'type' => 'batiment', 'status' => 'completed', 'budget_amount' => 180000000, 'progress' => 100,
                'city' => 'Abidjan', 'start_date' => '2025-03-01', 'end_date' => '2025-12-20',
                'sites' => [
                    ['code' => 'CH-01', 'name' => 'Construction villa', 'status' => 'completed', 'progress' => 100, 'city' => 'Abidjan'],
                ],
            ],
        ];

        foreach ($projects as $data) {
            $sites = $data['sites'];
            unset($data['sites']);

            $project = Project::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'manager_id' => $manager?->id,
                    'currency'   => 'XOF',
                    'country'    => 'CI',
                ])
            );

            foreach ($sites as $site) {
                $project->sites()->updateOrCreate(
                    ['code' => $site['code']],
                    array_merge($site, [
                        'company_id'      => $company->id,
                        'site_manager_id' => $chef?->id,
                    ])
                );
            }
        }
    }
}
