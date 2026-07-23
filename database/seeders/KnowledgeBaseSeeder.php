<?php

namespace Database\Seeders;

use App\Models\KnowledgeBase;
use Illuminate\Database\Seeder;

class KnowledgeBaseSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            // ── GÉNÉRAL ─────────────────────────────────────────────────────────
            [
                'category'   => 'general',
                'priority'   => 20,
                'title_fr'   => 'Qu\'est-ce que CONSTRUIRO ERP ?',
                'content_fr' => 'CONSTRUIRO ERP est un logiciel de gestion complet pour les entreprises du secteur BTP (Bâtiment et Travaux Publics) et de la construction en Afrique. Il est édité par IBIG Soft (Intermark Business International Group) basé à Abidjan, Côte d\'Ivoire. Il couvre : gestion de projets et chantiers, devis et facturation, ressources humaines, stock et matériaux, équipements, finance, HSE, bureau d\'études et reporting BI.',
            ],
            [
                'category'   => 'general',
                'priority'   => 10,
                'title_fr'   => 'Essai gratuit CONSTRUIRO — comment démarrer ?',
                'content_fr' => 'CONSTRUIRO offre 14 jours d\'essai gratuit sans carte bancaire. Pour démarrer : allez sur construiro.com, cliquez sur "Essai gratuit 14 jours", créez votre compte avec votre email professionnel. Vous aurez accès à tous les modules pendant 14 jours. À la fin de l\'essai, choisissez un plan tarifaire pour continuer. Déploiement en moins de 48h.',
            ],
            [
                'category'   => 'general',
                'priority'   => 5,
                'title_fr'   => 'CONSTRUIRO est-il disponible sur mobile ?',
                'content_fr' => 'Oui, CONSTRUIRO est une Progressive Web App (PWA). Vous pouvez l\'installer sur votre smartphone Android ou iOS directement depuis le navigateur (pas besoin de l\'App Store ou du Play Store). Il fonctionne aussi hors connexion pour les fonctionnalités essentielles, avec synchronisation automatique au retour du réseau.',
            ],
            [
                'category'   => 'general',
                'priority'   => 5,
                'title_fr'   => 'Dans quels pays CONSTRUIRO est-il disponible ?',
                'content_fr' => 'CONSTRUIRO est disponible dans toute l\'Afrique francophone et anglophone. Clients actuels en : Côte d\'Ivoire, Sénégal, Mali, Cameroun, Burkina Faso, Guinée, Congo, Gabon et d\'autres pays africains. Le logiciel supporte le FCFA (XOF, XAF), USD et EUR. L\'interface est disponible en français et en anglais.',
            ],
            [
                'category'   => 'general',
                'priority'   => 5,
                'title_fr'   => 'CONSTRUIRO est-il disponible en multi-société ?',
                'content_fr' => 'Oui, CONSTRUIRO supporte le mode multi-société (multi-tenant). Chaque entreprise dispose de son propre espace isolé, avec ses propres données, utilisateurs et paramètres. Un même groupe peut gérer plusieurs filiales depuis une console SuperAdmin centralisée. La facturation peut être consolidée ou individuelle par filiale.',
            ],

            // ── TARIFS ──────────────────────────────────────────────────────────
            [
                'category'   => 'pricing',
                'priority'   => 20,
                'title_fr'   => 'Tarifs et plans d\'abonnement CONSTRUIRO',
                'content_fr' => 'CONSTRUIRO propose plusieurs plans tarifaires payables en FCFA. Plan Starter : pour les petites entreprises jusqu\'à 5 utilisateurs. Plan Pro : jusqu\'à 20 utilisateurs, tous les modules inclus. Plan Enterprise : utilisateurs illimités, support dédié. Les prix exacts sont disponibles sur demande à contact@ibigsoft.com ou en demandant une démonstration. Paiement possible par Mobile Money (Orange Money, MTN MoMo, Wave), virement bancaire ou chèque.',
            ],
            [
                'category'   => 'pricing',
                'priority'   => 10,
                'title_fr'   => 'Modes de paiement acceptés par CONSTRUIRO',
                'content_fr' => 'CONSTRUIRO accepte les paiements par : Mobile Money (Orange Money CI/SN, MTN MoMo CI/CM, Wave CI/SN), virement bancaire national (banques africaines), virement international SWIFT, chèque (sur accord préalable), espèces en agence IBIG Soft. Les paiements sont en FCFA principalement, aussi en USD et EUR sur demande.',
            ],
            [
                'category'   => 'pricing',
                'priority'   => 5,
                'title_fr'   => 'Vouchers et codes promo CONSTRUIRO',
                'content_fr' => 'CONSTRUIRO propose des vouchers prépayés disponibles chez les revendeurs partenaires IBIG Partners. Un code voucher peut être saisi directement dans votre espace pour activer ou renouveler votre abonnement. Des codes promotionnels sont également envoyés lors de campagnes commerciales. Contactez contact@ibigsoft.com pour plus d\'informations.',
            ],

            // ── MODULES ─────────────────────────────────────────────────────────
            [
                'category'   => 'modules',
                'priority'   => 10,
                'title_fr'   => 'Liste des modules disponibles dans CONSTRUIRO',
                'content_fr' => 'CONSTRUIRO comprend 15+ modules : (1) Gestion de Projets — planification, jalons, tâches, budget par chantier. (2) RH & Paie — personnel, présences, congés, fiches de paie. (3) Finance & Comptabilité — facturation, trésorerie, budget analytique. (4) Matériaux & Stock — entrepôts, commandes, livraisons, inventaires. (5) Équipements & Engins — parc roulant, maintenance, affectation chantiers. (6) Devis & Contrats — métré, DQE, devis clients, contrats, avenants. (7) HSE & Qualité — incidents, contrôles, non-conformités. (8) Bureau d\'Études — plans, métrés, bibliothèque de prix. (9) BI & Reporting — tableaux de bord, KPIs, rapports automatiques. (10) Notifications, (11) Licences, (12) Console SuperAdmin, (13) Centre d\'aide, (14) Onboarding, (15) Journal d\'audit.',
            ],
            [
                'category'   => 'modules',
                'priority'   => 10,
                'title_fr'   => 'Gestion de projets BTP dans CONSTRUIRO',
                'content_fr' => 'Le module Projets de CONSTRUIRO permet de : créer des chantiers avec localisation GPS, définir des lots et jalons, affecter des ressources humaines et matérielles, suivre l\'avancement en temps réel, comparer budget prévu vs réalisé, générer des rapports d\'avancement hebdomadaires et des situations de travaux.',
            ],
            [
                'category'   => 'modules',
                'priority'   => 10,
                'title_fr'   => 'Devis BTP et métrés dans CONSTRUIRO',
                'content_fr' => 'Le module Devis de CONSTRUIRO est spécialisé BTP : création de DQE (Détail Quantitatif Estimatif), métré par lot et sous-lot, bibliothèque de prix unitaires actualisable, génération automatique de devis PDF avec logo entreprise, suivi des avenants et révisions de prix. Compatible avec les normes de facturation africaines.',
            ],
            [
                'category'   => 'modules',
                'priority'   => 10,
                'title_fr'   => 'Gestion RH et paie BTP dans CONSTRUIRO',
                'content_fr' => 'Le module RH de CONSTRUIRO gère : la fiche de chaque employé (contrat, compétences, affectation chantier), les pointages journaliers par chantier (biométrie ou saisie manuelle), les absences et congés, le calcul automatique des bulletins de paie selon la législation ivoirienne (CNPS, IR, etc.), la génération des fiches de paie PDF et les virements salaires.',
            ],
            [
                'category'   => 'modules',
                'priority'   => 5,
                'title_fr'   => 'Facturation et comptabilité dans CONSTRUIRO',
                'content_fr' => 'Le module Finance de CONSTRUIRO couvre : création de factures clients avec numérotation automatique, suivi des règlements et relances, plan comptable SYSCOHADA, saisie des écritures comptables, budget analytique par chantier, trésorerie multi-comptes, rapprochement bancaire. Les factures sont générables en PDF avec QR code de vérification.',
            ],
            [
                'category'   => 'modules',
                'priority'   => 5,
                'title_fr'   => 'Maintenance et gestion des équipements BTP',
                'content_fr' => 'Le module Équipements de CONSTRUIRO gère votre parc matériel : engins de chantier, véhicules, outillage. Fonctionnalités : fiche technique par équipement, affectation aux chantiers, planification des maintenances préventives, saisie des maintenances correctives, suivi consommation carburant, alertes d\'échéance (visite technique, assurance), coût total d\'utilisation par équipement.',
            ],
            [
                'category'   => 'modules',
                'priority'   => 5,
                'title_fr'   => 'HSE et qualité dans CONSTRUIRO',
                'content_fr' => 'Le module HSE (Hygiène, Sécurité, Environnement) de CONSTRUIRO permet : la déclaration et le suivi des incidents et accidents de travail, les contrôles qualité et non-conformités, les rapports HSE réglementaires, les plans de prévention, les audits internes. Conforme aux normes OHSAS 18001 et ISO 45001 adaptées au contexte africain.',
            ],
            [
                'category'   => 'modules',
                'priority'   => 5,
                'title_fr'   => 'Tableaux de bord BI et rapports dans CONSTRUIRO',
                'content_fr' => 'Le module BI de CONSTRUIRO offre des tableaux de bord interactifs : avancement des chantiers en temps réel, rentabilité par projet et par client, KPIs financiers (CA, marges, trésorerie), consommation de matériaux, performance RH, synthèse HSE. Les rapports sont exportables en PDF et Excel. Des rapports automatiques peuvent être planifiés par email.',
            ],

            // ── SUPPORT ─────────────────────────────────────────────────────────
            [
                'category'   => 'support',
                'priority'   => 10,
                'title_fr'   => 'Comment contacter le support CONSTRUIRO ?',
                'content_fr' => 'L\'équipe support IBIG Soft est disponible par email : support@ibigsoft.com. Téléphone : +225 27 22 27 60 14 et +225 05 55 05 99 01. Adresse : Abidjan, Côte d\'Ivoire. Vous pouvez aussi créer un ticket depuis votre espace CONSTRUIRO > Centre d\'aide > Nouveau ticket. Délai de réponse : 24h ouvrables.',
            ],
            [
                'category'   => 'support',
                'priority'   => 5,
                'title_fr'   => 'Comment réinitialiser mon mot de passe ?',
                'content_fr' => 'Pour réinitialiser votre mot de passe CONSTRUIRO : cliquez sur "Mot de passe oublié" sur la page de connexion, entrez votre adresse email, recevez un email de réinitialisation, cliquez sur le lien dans l\'email (valable 60 minutes), définissez votre nouveau mot de passe. Si vous ne recevez pas l\'email, vérifiez les spams ou contactez support@ibigsoft.com.',
            ],
            [
                'category'   => 'support',
                'priority'   => 5,
                'title_fr'   => 'SLA — niveaux de service CONSTRUIRO',
                'content_fr' => 'Les niveaux de service CONSTRUIRO (SLA) varient selon le plan : Plan Starter : support email, réponse sous 48h ouvrables. Plan Pro : support email + téléphone, réponse sous 24h. Plan Enterprise : support dédié, réponse sous 4h, gestionnaire de compte attitré. Incidents critiques (plateforme inaccessible) : traitement prioritaire sous 2h pour tous les plans. Disponibilité garantie : 99,5% uptime mensuel.',
            ],
            [
                'category'   => 'support',
                'priority'   => 5,
                'title_fr'   => 'Comment importer mes données existantes dans CONSTRUIRO ?',
                'content_fr' => 'CONSTRUIRO propose un outil d\'import de données. Formats supportés : Excel (.xlsx), CSV. Données importables : clients, fournisseurs, matériaux, liste d\'employés, plan comptable, projets. Procédure : téléchargez le modèle Excel depuis CONSTRUIRO > Paramètres > Import, remplissez-le, puis importez-le. L\'équipe support peut aussi réaliser la migration depuis votre ancien logiciel (prestation sur devis). Contactez support@ibigsoft.com.',
            ],

            // ── FAQ ─────────────────────────────────────────────────────────────
            [
                'category'   => 'faq',
                'priority'   => 10,
                'title_fr'   => 'Sécurité et protection des données CONSTRUIRO',
                'content_fr' => 'CONSTRUIRO assure la sécurité de vos données par : chiffrement SSL/TLS pour tous les échanges, hébergement sur serveurs sécurisés (OVH / équivalent africain), sauvegardes quotidiennes automatiques, authentification à deux facteurs (2FA) disponible pour tous les comptes, contrôle d\'accès par rôles et permissions. Conformité RGPD adaptée au contexte africain. Vos données ne sont jamais partagées avec des tiers.',
            ],
            [
                'category'   => 'faq',
                'priority'   => 10,
                'title_fr'   => 'Rôles et permissions utilisateurs dans CONSTRUIRO',
                'content_fr' => 'CONSTRUIRO dispose d\'un système de rôles granulaire : Directeur de Projet, Conducteur de Travaux, Chef de Chantier, Magasinier, Comptable, Acheteur, Responsable RH, Commercial, Responsable HSE, Direction, Client (accès limité). Chaque rôle a des permissions précises sur les modules. L\'administrateur peut créer des rôles personnalisés et ajuster finement les accès.',
            ],
            [
                'category'   => 'faq',
                'priority'   => 5,
                'title_fr'   => 'Formation et Académie CONSTRUIRO',
                'content_fr' => 'IBIG Soft propose CONSTRUIRO Académie : des ressources de formation pour maîtriser le logiciel. Contenus disponibles : vidéos tutoriels, guides PDF par module, webinaires en direct. Des formations sur site peuvent être organisées à Abidjan ou dans votre ville (prestation sur devis). Un guide utilisateur téléchargeable est disponible depuis le menu Aide > Guide utilisateur.',
            ],
            [
                'category'   => 'faq',
                'priority'   => 5,
                'title_fr'   => 'IBIG Partners — programme revendeurs',
                'content_fr' => 'Le programme IBIG Partners permet aux entreprises de devenir revendeurs et intégrateurs certifiés de CONSTRUIRO. Avantages : commissions sur ventes, accès à des démonstrations clients, support technique dédié, formation certifiante. Pour rejoindre le réseau : contactez partners@ibigsoft.com ou visitez ibigsoft.com/partners.',
            ],
            [
                'category'   => 'faq',
                'priority'   => 5,
                'title_fr'   => 'API et intégrations tierces CONSTRUIRO',
                'content_fr' => 'CONSTRUIRO dispose d\'une API REST permettant des intégrations avec des systèmes tiers. Intégrations disponibles ou en développement : logiciels de comptabilité (Sage, etc.), plateformes Mobile Money (Orange, MTN, Wave), outils RH, ERP partenaires. Documentation API disponible sur demande. Contactez technique@ibigsoft.com pour les projets d\'intégration.',
            ],
            [
                'category'   => 'faq',
                'priority'   => 5,
                'title_fr'   => 'Demander une démonstration de CONSTRUIRO',
                'content_fr' => 'Pour obtenir une démonstration personnalisée de CONSTRUIRO : remplissez le formulaire de demande sur construiro.com > "Demander une démo", ou envoyez un email à demo@ibigsoft.com, ou appelez le +225 27 22 27 60 14. Un consultant IBIG Soft vous contacte sous 24h pour planifier une session démo en ligne ou en présentiel à Abidjan.',
            ],
        ];

        foreach ($entries as $entry) {
            KnowledgeBase::updateOrCreate(
                ['title_fr' => $entry['title_fr']],
                array_merge(['is_active' => true], $entry)
            );
        }

        $this->command?->info('KnowledgeBaseSeeder : ' . count($entries) . ' entrées insérées/mises à jour.');
    }
}
