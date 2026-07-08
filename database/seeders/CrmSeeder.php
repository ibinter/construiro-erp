<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\Tender;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration CRM : opportunités commerciales (pipeline) et
 * appels d'offres réalistes du secteur BTP en Côte d'Ivoire.
 */
class CrmSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Rattachement des opportunités à des clients existants (si présents).
        $clients = Client::where('company_id', $company->id)->orderBy('code')->get()->keyBy('code');
        $assignee = User::where('company_id', $company->id)->where('email', 'dp@construiro.com')->first()
            ?? User::where('company_id', $company->id)->first();

        // --- Opportunités (pipeline commercial) --------------------------------
        $opportunities = [
            [
                'code' => 'OPP-2026-001', 'title' => 'Construction lycée moderne de Bouaké',
                'client_code' => 'CLI-002', 'client_name' => 'AGEROUTE',
                'estimated_amount' => 1850000000, 'stage' => 'proposition', 'probability' => 60,
                'expected_close_date' => '2026-09-30', 'source' => 'Appel d\'offres public',
                'notes' => 'Marché de construction d\'un lycée de 24 classes. Dossier en cours de chiffrage.',
            ],
            [
                'code' => 'OPP-2026-002', 'title' => 'Château d\'eau de 500 m³ à Korhogo',
                'client_code' => 'CLI-003', 'client_name' => 'ONEP',
                'estimated_amount' => 620000000, 'stage' => 'negociation', 'probability' => 75,
                'expected_close_date' => '2026-08-15', 'source' => 'Recommandation',
                'notes' => 'Ouvrage hydraulique — négociation des délais d\'exécution en cours.',
            ],
            [
                'code' => 'OPP-2026-003', 'title' => 'Programme immobilier R+8 au Plateau',
                'client_code' => 'CLI-001', 'client_name' => 'SCI Horizon',
                'estimated_amount' => 3200000000, 'stage' => 'qualifie', 'probability' => 40,
                'expected_close_date' => '2026-12-01', 'source' => 'Salon de l\'immobilier',
                'notes' => 'Immeuble mixte bureaux/logements. Étude de faisabilité en cours.',
            ],
            [
                'code' => 'OPP-2026-004', 'title' => 'Réhabilitation voirie communale Korhogo',
                'client_code' => 'CLI-005', 'client_name' => 'Mairie de Korhogo',
                'estimated_amount' => 480000000, 'stage' => 'gagne', 'probability' => 100,
                'expected_close_date' => '2026-06-20', 'source' => 'Appel d\'offres public',
                'notes' => 'Marché remporté — 3,5 km de voirie urbaine à réhabiliter.',
            ],
            [
                'code' => 'OPP-2026-005', 'title' => 'Villa individuelle Cocody Angré',
                'client_code' => 'CLI-004', 'client_name' => 'M. Ibrahim Koné',
                'estimated_amount' => 95000000, 'stage' => 'perdu', 'probability' => 0,
                'expected_close_date' => '2026-05-10', 'source' => 'Recommandation',
                'notes' => 'Client a retenu un autre prestataire (offre moins-disante).',
            ],
        ];

        foreach ($opportunities as $data) {
            $client = $clients[$data['client_code']] ?? null;

            Opportunity::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                [
                    'company_id'          => $company->id,
                    'client_id'           => $client?->id,
                    'assignee_id'         => $assignee?->id,
                    'title'               => $data['title'],
                    'client_name'         => $data['client_name'],
                    'estimated_amount'    => $data['estimated_amount'],
                    'currency'            => 'XOF',
                    'stage'               => $data['stage'],
                    'probability'         => $data['probability'],
                    'expected_close_date' => $data['expected_close_date'],
                    'source'              => $data['source'],
                    'notes'               => $data['notes'],
                ]
            );
        }

        // Rattachement facultatif à un projet existant (si présent).
        $project = Project::where('company_id', $company->id)->first();

        // --- Appels d'offres (marchés BTP) -------------------------------------
        $tenders = [
            [
                'code' => 'AO-2026-001', 'title' => 'Construction lycée moderne de Bouaké (24 classes)',
                'client_name' => 'Ministère de l\'Éducation Nationale', 'type' => 'public',
                'estimated_amount' => 1850000000, 'status' => 'en_preparation',
                'submission_deadline' => '2026-08-05', 'submitted_at' => null, 'with_project' => false,
                'notes' => 'Dossier d\'appel d\'offres national ouvert. Constitution du dossier de soumission.',
            ],
            [
                'code' => 'AO-2026-002', 'title' => 'Château d\'eau de 500 m³ et réseau AEP à Korhogo',
                'client_name' => 'ONEP', 'type' => 'public',
                'estimated_amount' => 620000000, 'status' => 'soumis',
                'submission_deadline' => '2026-07-01', 'submitted_at' => '2026-06-28', 'with_project' => false,
                'notes' => 'Offre déposée. En attente du dépouillement des plis.',
            ],
            [
                'code' => 'AO-2026-003', 'title' => 'Réhabilitation de la voirie communale de Korhogo',
                'client_name' => 'Mairie de Korhogo', 'type' => 'public',
                'estimated_amount' => 480000000, 'status' => 'gagne',
                'submission_deadline' => '2026-05-15', 'submitted_at' => '2026-05-12', 'with_project' => true,
                'notes' => 'Marché attribué. Notification reçue, ordre de service en préparation.',
            ],
            [
                'code' => 'AO-2026-004', 'title' => 'Aménagement siège social SCI Horizon (gré à gré)',
                'client_name' => 'SCI Horizon', 'type' => 'gre_a_gre',
                'estimated_amount' => 210000000, 'status' => 'identifie',
                'submission_deadline' => '2026-09-10', 'submitted_at' => null, 'with_project' => false,
                'notes' => 'Consultation restreinte identifiée. Prise de contact à planifier.',
            ],
        ];

        foreach ($tenders as $data) {
            Tender::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                [
                    'company_id'          => $company->id,
                    'project_id'          => $data['with_project'] ? $project?->id : null,
                    'title'               => $data['title'],
                    'client_name'         => $data['client_name'],
                    'type'                => $data['type'],
                    'estimated_amount'    => $data['estimated_amount'],
                    'currency'            => 'XOF',
                    'status'              => $data['status'],
                    'submission_deadline' => $data['submission_deadline'],
                    'submitted_at'        => $data['submitted_at'],
                    'notes'               => $data['notes'],
                ]
            );
        }
    }
}
