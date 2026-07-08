<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\HseIncident;
use App\Models\Project;
use App\Models\QualityControl;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration pour les modules QHSE (incidents) et Qualité
 * (contrôles). Rattachées à l'entreprise de démo et au projet PRJ-2026-001
 * ainsi qu'à ses chantiers.
 */
class QhseSeeder extends Seeder
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

        // Chantiers du projet (CH-01, CH-02) pour rattachement.
        $sites = $project
            ? $project->sites()->orderBy('code')->get()->keyBy('code')
            : collect();

        $site1 = $sites->get('CH-01');
        $site2 = $sites->get('CH-02');

        // --- Incidents QHSE ----------------------------------------------------
        $incidents = [
            [
                'code' => 'HSE-2026-001', 'title' => 'Chute de plain-pied',
                'type' => 'accident', 'severity' => 'modere', 'status' => 'cloture',
                'description' => 'Ouvrier glissé sur une dalle mouillée en zone de coffrage.',
                'incident_date' => '2026-03-05', 'location' => 'Niveau R+2, zone est',
                'corrective_action' => 'Balisage des zones humides et pose de bandes antidérapantes.',
                'reported_by' => 'Chef de Chantier', 'site_id' => $site1?->id,
            ],
            [
                'code' => 'HSE-2026-002', 'title' => 'Presque-accident manœuvre grue',
                'type' => 'presque_accident', 'severity' => 'majeur', 'status' => 'en_cours',
                'description' => 'Charge de banches passée à faible hauteur au-dessus d\'une équipe au sol.',
                'incident_date' => '2026-03-18', 'location' => 'Aire de levage',
                'corrective_action' => 'Rappel des consignes de levage et interdiction de survol des zones occupées.',
                'reported_by' => 'Conducteur de Travaux', 'site_id' => $site1?->id,
            ],
            [
                'code' => 'HSE-2026-003', 'title' => 'Déversement hydrocarbure',
                'type' => 'environnement', 'severity' => 'majeur', 'status' => 'en_cours',
                'description' => 'Fuite de gasoil depuis un groupe électrogène sur sol non protégé.',
                'incident_date' => '2026-04-02', 'location' => 'Base vie',
                'corrective_action' => 'Mise en place de bacs de rétention et kit anti-pollution.',
                'reported_by' => 'Responsable QHSE', 'site_id' => $site2?->id,
            ],
            [
                'code' => 'HSE-2026-004', 'title' => 'Départ de feu armoire électrique',
                'type' => 'incendie', 'severity' => 'critique', 'status' => 'ouvert',
                'description' => 'Court-circuit provoquant un début d\'incendie sur une armoire de chantier.',
                'incident_date' => '2026-04-20', 'location' => 'Local technique R+1',
                'corrective_action' => 'Contrôle des installations électriques et vérification des extincteurs.',
                'reported_by' => 'Chef de Chantier', 'site_id' => $site1?->id,
            ],
        ];

        foreach ($incidents as $data) {
            HseIncident::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'project_id' => $project?->id,
                ])
            );
        }

        // --- Contrôles qualité -------------------------------------------------
        $controls = [
            [
                'code' => 'QC-2026-001', 'title' => 'Réception béton fondations',
                'control_type' => 'reception', 'result' => 'conforme',
                'description' => 'Contrôle à la livraison du béton C25/30 pour les semelles.',
                'control_date' => '2026-02-10', 'inspector' => 'Laboratoire GéoBTP',
                'observations' => 'Affaissement au cône conforme, bon de livraison validé.',
                'site_id' => $site1?->id,
            ],
            [
                'code' => 'QC-2026-002', 'title' => 'Essai d\'écrasement éprouvettes',
                'control_type' => 'essai', 'result' => 'conforme',
                'description' => 'Essai de compression à 28 jours sur éprouvettes cylindriques.',
                'control_date' => '2026-03-10', 'inspector' => 'Laboratoire GéoBTP',
                'observations' => 'Résistance moyenne 32 MPa, supérieure à la valeur requise.',
                'site_id' => $site1?->id,
            ],
            [
                'code' => 'QC-2026-003', 'title' => 'Contrôle ferraillage poteaux R+2',
                'control_type' => 'en_cours', 'result' => 'non_conforme',
                'description' => 'Vérification des sections et espacements des armatures avant coulage.',
                'control_date' => '2026-03-22', 'inspector' => 'Bureau de contrôle Veritas',
                'observations' => 'Espacement des cadres non conforme au plan, reprise exigée avant bétonnage.',
                'site_id' => $site1?->id,
            ],
            [
                'code' => 'QC-2026-004', 'title' => 'Réception étanchéité toiture',
                'control_type' => 'final', 'result' => 'en_attente',
                'description' => 'Contrôle final de l\'étanchéité de la terrasse avant réception.',
                'control_date' => '2026-04-15', 'inspector' => 'Bureau de contrôle Veritas',
                'observations' => 'Test de mise en eau planifié, résultat en attente.',
                'site_id' => $site2?->id,
            ],
        ];

        foreach ($controls as $data) {
            QualityControl::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'project_id' => $project?->id,
                ])
            );
        }
    }
}
