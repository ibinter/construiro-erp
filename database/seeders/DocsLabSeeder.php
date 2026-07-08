<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Document;
use App\Models\LabTest;
use App\Models\Project;
use App\Models\SignatureRequest;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration pour les modules Laboratoire (essais),
 * Gestion documentaire (GED) et Signature électronique. Rattachées à
 * l'entreprise de démo et, quand pertinent, au projet PRJ-2026-001 et à
 * ses chantiers.
 */
class DocsLabSeeder extends Seeder
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

        // --- Essais de laboratoire --------------------------------------------
        $tests = [
            [
                'code' => 'LAB-2026-001', 'sample_type' => 'beton', 'test_name' => 'Écrasement éprouvette béton 28 j',
                'sample_date' => '2026-02-12', 'test_date' => '2026-03-12',
                'result_value' => 32.500, 'unit' => 'MPa', 'threshold' => 25.000, 'result' => 'conforme',
                'technician' => 'Laboratoire GéoBTP', 'site_id' => $site1?->id,
                'observations' => 'Résistance à 28 jours supérieure à la valeur requise C25/30.',
            ],
            [
                'code' => 'LAB-2026-002', 'sample_type' => 'granulat', 'test_name' => 'Analyse granulométrique 0/20',
                'sample_date' => '2026-02-20', 'test_date' => '2026-02-22',
                'result_value' => 2.400, 'unit' => '%', 'threshold' => 3.000, 'result' => 'conforme',
                'technician' => 'Laboratoire GéoBTP', 'site_id' => $site1?->id,
                'observations' => 'Teneur en fines conforme au fuseau de spécification.',
            ],
            [
                'code' => 'LAB-2026-003', 'sample_type' => 'sol', 'test_name' => 'Essai Proctor modifié',
                'sample_date' => '2026-03-01', 'test_date' => '2026-03-04',
                'result_value' => 1.950, 'unit' => 'kg/m3', 'threshold' => 1.900, 'result' => 'conforme',
                'technician' => 'Bureau de contrôle Veritas', 'site_id' => $site2?->id,
                'observations' => 'Densité sèche maximale atteinte à la teneur en eau optimale.',
            ],
            [
                'code' => 'LAB-2026-004', 'sample_type' => 'acier', 'test_name' => 'Essai de traction HA12',
                'sample_date' => '2026-03-10', 'test_date' => '2026-03-15',
                'result_value' => 480.000, 'unit' => 'MPa', 'threshold' => 500.000, 'result' => 'non_conforme',
                'technician' => 'Laboratoire GéoBTP', 'site_id' => $site1?->id,
                'observations' => 'Limite d\'élasticité inférieure au seuil Fe500 : lot rejeté.',
            ],
            [
                'code' => 'LAB-2026-005', 'sample_type' => 'beton', 'test_name' => 'Affaissement au cône (slump test)',
                'sample_date' => '2026-04-02', 'test_date' => '2026-04-02',
                'result_value' => null, 'unit' => 'cm', 'threshold' => 10.000, 'result' => 'en_attente',
                'technician' => 'Laboratoire GéoBTP', 'site_id' => $site1?->id,
                'observations' => 'Mesure planifiée à la prochaine livraison de béton.',
            ],
        ];

        foreach ($tests as $data) {
            LabTest::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'project_id' => $project?->id,
                ])
            );
        }

        // --- Documents (GED) ---------------------------------------------------
        $documents = [
            [
                'code' => 'DOC-2026-001', 'title' => 'Plan de coffrage niveau R+2', 'category' => 'plan',
                'file_name' => 'plan-coffrage-r2.pdf', 'file_path' => '/ged/prj-2026-001/plans/plan-coffrage-r2.pdf',
                'mime_type' => 'application/pdf', 'size_kb' => 2048, 'version' => '2.1',
                'uploaded_by' => 'Bureau d\'études', 'description' => 'Plan de coffrage validé pour exécution.',
            ],
            [
                'code' => 'DOC-2026-002', 'title' => 'Plan de ferraillage poteaux', 'category' => 'plan',
                'file_name' => 'plan-ferraillage-poteaux.pdf', 'file_path' => '/ged/prj-2026-001/plans/plan-ferraillage-poteaux.pdf',
                'mime_type' => 'application/pdf', 'size_kb' => 1536, 'version' => '1.3',
                'uploaded_by' => 'Bureau d\'études', 'description' => 'Détails d\'armatures des poteaux du niveau courant.',
            ],
            [
                'code' => 'DOC-2026-003', 'title' => 'Contrat de sous-traitance gros œuvre', 'category' => 'contrat',
                'file_name' => 'contrat-st-gros-oeuvre.pdf', 'file_path' => '/ged/prj-2026-001/contrats/contrat-st-gros-oeuvre.pdf',
                'mime_type' => 'application/pdf', 'size_kb' => 780, 'version' => '1.0',
                'uploaded_by' => 'Direction de projet', 'description' => 'Contrat signé avec le sous-traitant gros œuvre.',
            ],
            [
                'code' => 'DOC-2026-004', 'title' => 'Rapport d\'essais béton 28 j', 'category' => 'rapport',
                'file_name' => 'rapport-essais-beton.pdf', 'file_path' => '/ged/prj-2026-001/rapports/rapport-essais-beton.pdf',
                'mime_type' => 'application/pdf', 'size_kb' => 512, 'version' => '1.0',
                'uploaded_by' => 'Laboratoire GéoBTP', 'description' => 'Synthèse des résultats d\'écrasement des éprouvettes.',
            ],
            [
                'code' => 'DOC-2026-005', 'title' => 'Rapport mensuel d\'avancement — mars', 'category' => 'rapport',
                'file_name' => 'rapport-avancement-mars.pdf', 'file_path' => '/ged/prj-2026-001/rapports/rapport-avancement-mars.pdf',
                'mime_type' => 'application/pdf', 'size_kb' => 1024, 'version' => '1.0',
                'uploaded_by' => 'Directeur de Projet', 'description' => 'Point d\'avancement physique et financier du mois de mars.',
            ],
            [
                'code' => 'DOC-2026-006', 'title' => 'Autorisation de construire', 'category' => 'administratif',
                'file_name' => 'autorisation-construire.pdf', 'file_path' => '/ged/prj-2026-001/admin/autorisation-construire.pdf',
                'mime_type' => 'application/pdf', 'size_kb' => 340, 'version' => '1.0',
                'uploaded_by' => 'Administration', 'description' => 'Arrêté d\'autorisation de construire délivré par la mairie.',
            ],
        ];

        foreach ($documents as $data) {
            Document::updateOrCreate(
                ['company_id' => $company->id, 'code' => $data['code']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'project_id' => $project?->id,
                ])
            );
        }

        // --- Demandes de signature (workflow simulé) --------------------------
        $contract = Document::where('company_id', $company->id)->where('code', 'DOC-2026-003')->first();
        $report = Document::where('company_id', $company->id)->where('code', 'DOC-2026-005')->first();

        $requests = [
            [
                'title' => 'Signature du contrat de sous-traitance gros œuvre',
                'signer_name' => 'M. Koffi Yao', 'signer_email' => 'koffi.yao@st-btp.ci',
                'status' => 'signed', 'sent_at' => '2026-02-25', 'signed_at' => '2026-02-27',
                'notes' => 'Contrat validé et signé par le sous-traitant.', 'document_id' => $contract?->id,
            ],
            [
                'title' => 'Validation du rapport d\'avancement de mars',
                'signer_name' => 'Mme Aïcha Traoré', 'signer_email' => 'aicha.traore@construiro.com',
                'status' => 'pending', 'sent_at' => '2026-04-03', 'signed_at' => null,
                'notes' => 'En attente de validation par la maîtrise d\'ouvrage.', 'document_id' => $report?->id,
            ],
            [
                'title' => 'Approbation du plan de ferraillage',
                'signer_name' => 'M. Jean Kouassi', 'signer_email' => 'j.kouassi@bureau-controle.ci',
                'status' => 'refused', 'sent_at' => '2026-03-18', 'signed_at' => '2026-03-20',
                'notes' => 'Refus : reprise des sections d\'armatures demandée avant approbation.',
                'document_id' => null,
            ],
        ];

        foreach ($requests as $data) {
            SignatureRequest::updateOrCreate(
                ['company_id' => $company->id, 'title' => $data['title']],
                array_merge($data, ['company_id' => $company->id])
            );
        }
    }
}
