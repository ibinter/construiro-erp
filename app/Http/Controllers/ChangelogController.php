<?php

namespace App\Http\Controllers;

use App\Models\Changelog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChangelogController extends Controller
{
    /**
     * Données de secours utilisées quand la table changelogs est vide.
     * Permet une expérience cohérente même sans entrées publiées en BDD.
     */
    private const ENTRIES = [
        [
            'version'     => '1.5.0',
            'released_at' => '2026-07-13',
            'is_major'    => true,
            'title'       => 'Vérification QR + Intégrations + Import',
            'changes'     => [
                ['type' => 'feat', 'text' => 'QR code d\'authenticité sur toutes les factures, devis et contrats'],
                ['type' => 'feat', 'text' => 'Système d\'intégrations : Orange Money, MTN MoMo, Wave, Groq IA, WhatsApp Business'],
                ['type' => 'feat', 'text' => 'Import en masse clients / employés / produits via CSV/Excel'],
                ['type' => 'feat', 'text' => 'Barre de navigation mobile (BottomNav) responsive'],
                ['type' => 'feat', 'text' => 'Tour guidé interactif pour les nouveaux utilisateurs'],
                ['type' => 'feat', 'text' => 'Sauvegardes automatiques quotidiennes de la base de données'],
                ['type' => 'feat', 'text' => 'Centre des paramètres (7 catégories)'],
                ['type' => 'feat', 'text' => 'Espace formation Academy'],
                ['type' => 'security', 'text' => 'En-têtes de sécurité CSP / HSTS / X-Frame-Options'],
                ['type' => 'fix', 'text' => 'Correction bannière abonnement sur toutes les pages'],
            ],
        ],
        [
            'version'     => '1.4.0',
            'released_at' => '2026-06-20',
            'is_major'    => false,
            'title'       => 'PWA & Assistant IA SARA',
            'changes'     => [
                ['type' => 'feat', 'text' => 'Application installable (PWA) avec notifications push'],
                ['type' => 'feat', 'text' => 'Assistant IA SARA alimenté par Groq (analyse financière, rapports)'],
                ['type' => 'feat', 'text' => 'Landing page multilingue FR/EN avec SEO avancé'],
                ['type' => 'feat', 'text' => 'Système de licences avec limites utilisateurs/projets'],
                ['type' => 'fix', 'text' => 'Corrections responsiveness mobile niveaux 1 et 2'],
            ],
        ],
        [
            'version'     => '1.3.0',
            'released_at' => '2026-05-15',
            'is_major'    => false,
            'title'       => 'Modules HSE, Qualité, Laboratoire',
            'changes'     => [
                ['type' => 'feat', 'text' => 'Module HSE : incidents, équipements de protection, formations'],
                ['type' => 'feat', 'text' => 'Module Qualité : non-conformités, audits internes'],
                ['type' => 'feat', 'text' => 'Module Laboratoire : analyses sol/béton, rapports'],
                ['type' => 'feat', 'text' => 'Signatures électroniques avec horodatage'],
                ['type' => 'feat', 'text' => 'GED (Gestion électronique de documents)'],
            ],
        ],
        [
            'version'     => '1.2.0',
            'released_at' => '2026-04-01',
            'is_major'    => false,
            'title'       => 'Paie, Présences & Comptabilité',
            'changes'     => [
                ['type' => 'feat', 'text' => 'Module Paie : fiches de paie, bulletins, virements'],
                ['type' => 'feat', 'text' => 'Pointage & présences avec géolocalisation'],
                ['type' => 'feat', 'text' => 'Comptabilité générale : journaux, grand livre, bilan'],
                ['type' => 'feat', 'text' => 'Trésorerie : flux entrants/sortants, prévisions'],
                ['type' => 'fix', 'text' => 'Isolation multi-tenant renforcée (CompanyScope)'],
            ],
        ],
        [
            'version'     => '1.1.0',
            'released_at' => '2026-03-01',
            'is_major'    => false,
            'title'       => 'Matériaux, Stocks & Engins',
            'changes'     => [
                ['type' => 'feat', 'text' => 'Gestion des matériaux et approvisionnements'],
                ['type' => 'feat', 'text' => 'Stocks et entrepôts multi-dépôts'],
                ['type' => 'feat', 'text' => 'Parc d\'engins et véhicules : suivi kilométrique, maintenance'],
                ['type' => 'feat', 'text' => 'Suivi carburant et consommation'],
                ['type' => 'feat', 'text' => 'Module Appels d\'offres (CRM BTP)'],
            ],
        ],
        [
            'version'     => '1.0.0',
            'released_at' => '2026-02-01',
            'is_major'    => true,
            'title'       => 'Lancement officiel CONSTRUIRO ERP',
            'changes'     => [
                ['type' => 'feat', 'text' => 'Multi-tenant SaaS avec isolation totale par entreprise'],
                ['type' => 'feat', 'text' => 'RBAC : 33 rôles granulaires (Spatie Permission)'],
                ['type' => 'feat', 'text' => 'Projets BTP : planning, budgets, jalons'],
                ['type' => 'feat', 'text' => 'Clients, fournisseurs, CRM'],
                ['type' => 'feat', 'text' => 'Factures, devis, contrats avec PDF'],
                ['type' => 'feat', 'text' => 'Employés et RH de base'],
                ['type' => 'feat', 'text' => 'Console SuperAdmin IBIG Soft'],
                ['type' => 'feat', 'text' => 'Journal d\'audit complet'],
            ],
        ],
    ];

    public function index(): Response
    {
        // Lecture depuis la BDD : entrées publiées, plus récentes en premier.
        $dbEntries = Changelog::where('is_published', true)
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->get();

        if ($dbEntries->isNotEmpty()) {
            // Convertit les modèles BDD dans le même format que le fallback hardcodé,
            // garantissant la compatibilité avec le composant Changelog/Index.
            $entries = $dbEntries->map(fn (Changelog $c) => [
                'version'     => $c->version,
                'released_at' => ($c->published_at ?? $c->created_at)->format('Y-m-d'),
                'is_major'    => $c->type === 'feature',
                'title'       => $c->title,
                'changes'     => [['type' => $c->type, 'text' => $c->body]],
            ])->toArray();
        } else {
            // Fallback statique quand la table est vide (ex. : premier déploiement).
            $entries = self::ENTRIES;
        }

        return Inertia::render('Changelog/Index', [
            'entries' => $entries,
        ]);
    }
}
