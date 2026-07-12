<?php

namespace Database\Seeders;

use App\Models\LegalPage;
use Illuminate\Database\Seeder;

class LegalPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            // ── Pages originales ──────────────────────────────────────────────
            [
                'slug'       => 'cgu',
                'title_fr'   => "Conditions Générales d'Utilisation",
                'title_en'   => 'Terms of Service',
                'content_fr' => $this->cguFr(),
                'content_en' => $this->cguEn(),
            ],
            [
                'slug'       => 'privacy',
                'title_fr'   => 'Politique de Confidentialité',
                'title_en'   => 'Privacy Policy',
                'content_fr' => $this->privacyFr(),
                'content_en' => $this->privacyEn(),
            ],
            [
                'slug'       => 'legal',
                'title_fr'   => 'Mentions Légales',
                'title_en'   => 'Legal Notice',
                'content_fr' => $this->legalFr(),
                'content_en' => $this->legalEn(),
            ],
            [
                'slug'       => 'cookies',
                'title_fr'   => 'Politique relative aux Cookies',
                'title_en'   => 'Cookie Policy',
                'content_fr' => $this->cookiesFr(),
                'content_en' => $this->cookiesEn(),
            ],
            // ── 14 nouvelles pages ───────────────────────────────────────────
            [
                'slug'       => 'conditions-commerciales',
                'title_fr'   => 'Conditions Commerciales',
                'title_en'   => 'Commercial Terms',
                'content_fr' => $this->conditionsCommercialesFr(),
                'content_en' => $this->conditionsCommercialesEn(),
            ],
            [
                'slug'       => 'contrat-licence',
                'title_fr'   => 'Contrat de Licence Logiciel',
                'title_en'   => 'Software License Agreement',
                'content_fr' => $this->contratLicenceFr(),
                'content_en' => $this->contratLicenceEn(),
            ],
            [
                'slug'       => 'sauvegarde',
                'title_fr'   => 'Politique de Sauvegarde des Données',
                'title_en'   => 'Data Backup Policy',
                'content_fr' => $this->sauvegardeFr(),
                'content_en' => $this->sauvegardeEn(),
            ],
            [
                'slug'       => 'support',
                'title_fr'   => 'Politique de Support Technique',
                'title_en'   => 'Technical Support Policy',
                'content_fr' => $this->supportFr(),
                'content_en' => $this->supportEn(),
            ],
            [
                'slug'       => 'resiliation',
                'title_fr'   => 'Politique de Résiliation',
                'title_en'   => 'Termination Policy',
                'content_fr' => $this->resiliationFr(),
                'content_en' => $this->resiliationEn(),
            ],
            [
                'slug'       => 'remboursement',
                'title_fr'   => 'Politique de Remboursement',
                'title_en'   => 'Refund Policy',
                'content_fr' => $this->remboursementFr(),
                'content_en' => $this->remboursementEn(),
            ],
            [
                'slug'       => 'traitement-donnees',
                'title_fr'   => 'Accord de Traitement des Données (DPA)',
                'title_en'   => 'Data Processing Agreement (DPA)',
                'content_fr' => $this->traitementDonneesFr(),
                'content_en' => $this->traitementDonneesEn(),
            ],
            [
                'slug'       => 'propriete-intellectuelle',
                'title_fr'   => 'Propriété Intellectuelle',
                'title_en'   => 'Intellectual Property',
                'content_fr' => $this->proprieteIntellectuelleFr(),
                'content_en' => $this->proprieteIntellectuelleEn(),
            ],
            [
                'slug'       => 'protection-marque',
                'title_fr'   => 'Protection de la Marque',
                'title_en'   => 'Brand Protection',
                'content_fr' => $this->protectionMarqueFr(),
                'content_en' => $this->protectionMarqueEn(),
            ],
            [
                'slug'       => 'conditions-essai',
                'title_fr'   => "Conditions d'Essai Gratuit",
                'title_en'   => 'Free Trial Terms',
                'content_fr' => $this->conditionsEssaiFr(),
                'content_en' => $this->conditionsEssaiEn(),
            ],
            [
                'slug'       => 'conditions-sara',
                'title_fr'   => "Conditions d'Utilisation de SARA (IA)",
                'title_en'   => 'SARA AI Terms of Use',
                'content_fr' => $this->conditionsSaraFr(),
                'content_en' => $this->conditionsSaraEn(),
            ],
            [
                'slug'       => 'limitation-ia',
                'title_fr'   => "Limitations et Avertissements sur l'IA",
                'title_en'   => 'AI Limitations & Disclaimers',
                'content_fr' => $this->limitationIaFr(),
                'content_en' => $this->limitationIaEn(),
            ],
            [
                'slug'       => 'gestion-compte',
                'title_fr'   => 'Politique de Gestion des Comptes',
                'title_en'   => 'Account Management Policy',
                'content_fr' => $this->gestionCompteFr(),
                'content_en' => $this->gestionCompteEn(),
            ],
            [
                'slug'       => 'gestion-reclamations',
                'title_fr'   => 'Politique de Gestion des Réclamations',
                'title_en'   => 'Complaints Handling Policy',
                'content_fr' => $this->gestionReclamationsFr(),
                'content_en' => $this->gestionReclamationsEn(),
            ],
        ];

        foreach ($pages as $page) {
            LegalPage::updateOrCreate(['slug' => $page['slug']], array_merge($page, [
                'is_published'    => true,
                'last_updated_at' => now(),
            ]));
        }
    }

    // ── Pages originales ──────────────────────────────────────────────────────

    private function cguFr(): string
    {
        return <<<MD
## 1. Objet

Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'accès et d'utilisation du logiciel **CONSTRUIRO**, solution ERP pour le secteur BTP, édité par **IBIG Soft** (IBIG SARL – Intermark Business International Group).

## 2. Acceptation des conditions

L'accès et l'utilisation du logiciel impliquent l'acceptation pleine et entière des présentes CGU. Toute personne n'acceptant pas ces conditions doit cesser d'utiliser le service.

## 3. Description du service

CONSTRUIRO est une application de gestion d'entreprise (ERP) dédiée aux entreprises de BTP et de construction. Elle propose notamment la gestion de projets, la facturation, la gestion des ressources humaines, la trésorerie, la comptabilité, la gestion des équipements et plusieurs autres modules métier.

## 4. Accès au service

L'accès au service est conditionné à la création d'un compte utilisateur et à la souscription d'une licence active. L'utilisateur est responsable de la confidentialité de ses identifiants.

## 5. Utilisation autorisée

L'utilisateur s'engage à utiliser CONSTRUIRO conformément à sa destination, dans le cadre légal en vigueur dans son pays, et à ne pas tenter de contourner les mécanismes de sécurité.

## 6. Propriété intellectuelle

CONSTRUIRO est la propriété exclusive d'IBIG Soft. Toute reproduction, distribution ou modification sans autorisation écrite est interdite.

## 7. Données personnelles

Le traitement des données personnelles est décrit dans la Politique de Confidentialité disponible sur le site.

## 8. Responsabilité

IBIG Soft s'efforce d'assurer la disponibilité du service mais ne peut garantir une disponibilité continue. IBIG Soft ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du service.

## 9. Modification des CGU

IBIG Soft se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par notification dans l'application.

## 10. Droit applicable

Les présentes CGU sont régies par le droit applicable dans le pays du siège social d'IBIG Soft. Tout litige sera soumis aux juridictions compétentes.

---
*Ces conditions générales doivent être validées par un professionnel juridique compétent avant toute mise en production commerciale.*
MD;
    }

    private function cguEn(): string
    {
        return <<<MD
## 1. Purpose

These Terms of Service (ToS) define the terms and conditions of access and use of the **CONSTRUIRO** software, an ERP solution for the construction sector, published by **IBIG Soft** (IBIG SARL – Intermark Business International Group).

## 2. Acceptance

Accessing and using the software implies full and unreserved acceptance of these ToS. Any person not accepting these terms must stop using the service.

## 3. Service Description

CONSTRUIRO is a business management application (ERP) dedicated to construction companies. It includes project management, invoicing, HR, treasury, accounting, equipment management, and other business modules.

## 4. Access

Access to the service requires creating a user account and subscribing to an active license. The user is responsible for keeping their credentials confidential.

## 5. Authorized Use

The user agrees to use CONSTRUIRO in accordance with its intended purpose, within the legal framework applicable in their country, and not to attempt to circumvent security mechanisms.

## 6. Intellectual Property

CONSTRUIRO is the exclusive property of IBIG Soft. Any reproduction, distribution, or modification without written authorization is prohibited.

## 7. Personal Data

The processing of personal data is described in the Privacy Policy available on the website.

## 8. Liability

IBIG Soft strives to ensure service availability but cannot guarantee uninterrupted availability. IBIG Soft shall not be held liable for indirect damages resulting from use of the service.

## 9. Changes to ToS

IBIG Soft reserves the right to modify these ToS at any time. Users will be notified via an in-app notification.

## 10. Governing Law

These ToS are governed by the law applicable in the country of IBIG Soft's registered office. Any dispute shall be submitted to the competent courts.

---
*These terms must be reviewed by a qualified legal professional before any commercial deployment.*
MD;
    }

    private function privacyFr(): string
    {
        return <<<MD
## 1. Responsable du traitement

**IBIG Soft** (IBIG SARL) est responsable du traitement des données personnelles collectées via CONSTRUIRO.

## 2. Données collectées

Nous collectons les données suivantes :
- Informations d'identification (nom, prénom, email, poste)
- Données de connexion (adresse IP, navigateur, date/heure)
- Données métier saisies par l'utilisateur dans le logiciel
- Données de facturation et de licences

## 3. Finalités du traitement

Les données sont utilisées pour :
- Fournir et améliorer le service
- Gérer les comptes et les licences
- Assurer la sécurité du service
- Envoyer des notifications transactionnelles
- Respecter les obligations légales

## 4. Conservation des données

Les données sont conservées pendant la durée d'utilisation du service, augmentée d'une période de 12 mois après résiliation, sauf obligation légale contraire.

## 5. Droits des utilisateurs

Conformément à la réglementation applicable, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour exercer ces droits, contactez : support@ibigsoft.com

## 6. Sécurité

IBIG Soft met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé.

## 7. Partage des données

Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec des prestataires techniques dans le cadre de l'exécution du service (hébergement, envoi d'emails).

---
*Cette politique doit être adaptée et validée par un professionnel juridique compétent.*
MD;
    }

    private function privacyEn(): string
    {
        return <<<MD
## 1. Data Controller

**IBIG Soft** (IBIG SARL) is the controller of personal data collected through CONSTRUIRO.

## 2. Data Collected

We collect the following data:
- Identification information (name, email, job title)
- Connection data (IP address, browser, date/time)
- Business data entered by users in the software
- Billing and license data

## 3. Purposes of Processing

Data is used to:
- Provide and improve the service
- Manage accounts and licenses
- Ensure service security
- Send transactional notifications
- Comply with legal obligations

## 4. Data Retention

Data is retained for the duration of service use, plus 12 months after termination, unless otherwise required by law.

## 5. User Rights

You have the right to access, rectify, erase, port, and object to processing of your personal data. To exercise these rights, contact: support@ibigsoft.com

## 6. Security

IBIG Soft implements appropriate technical and organizational measures to protect your data against unauthorized access.

## 7. Data Sharing

Your data is not sold to third parties. It may be shared with technical service providers in the context of service delivery (hosting, email).

---
*This policy must be adapted and validated by a qualified legal professional.*
MD;
    }

    private function legalFr(): string
    {
        return <<<MD
## Éditeur

**IBIG Soft** est une marque de **IBIG SARL – Intermark Business International Group**.

Site officiel de l'éditeur : [https://ibigsoft.com](https://ibigsoft.com)

Slogan : *L'excellence est notre passion*

## Hébergement

Le logiciel CONSTRUIRO est hébergé sur un serveur dédié sécurisé.

## Propriété intellectuelle

L'ensemble du contenu de l'application CONSTRUIRO (interface, code source, bases de données, marques, logos) est protégé par les lois applicables sur la propriété intellectuelle. Toute reproduction sans autorisation écrite préalable d'IBIG Soft est interdite.

## Contact

Pour toute question juridique : legal@ibigsoft.com

---
*Ces mentions légales doivent être complétées avec les informations juridiques exactes d'IBIG SARL.*
MD;
    }

    private function legalEn(): string
    {
        return <<<MD
## Publisher

**IBIG Soft** is a brand of **IBIG SARL – Intermark Business International Group**.

Official website: [https://ibigsoft.com](https://ibigsoft.com)

Tagline: *Excellence is our passion*

## Hosting

The CONSTRUIRO software is hosted on a dedicated secure server.

## Intellectual Property

All content in the CONSTRUIRO application (interface, source code, databases, trademarks, logos) is protected by applicable intellectual property laws. Any reproduction without prior written authorization from IBIG Soft is prohibited.

## Contact

For legal questions: legal@ibigsoft.com

---
*These legal notices must be completed with the exact legal information of IBIG SARL.*
MD;
    }

    private function cookiesFr(): string
    {
        return <<<MD
## Utilisation des cookies

CONSTRUIRO utilise des cookies pour assurer le bon fonctionnement du site et, avec votre accord, pour analyser notre trafic et personnaliser votre expérience.

## Catégories de cookies

### Nécessaires (toujours actifs)
Indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.

| Nom | Finalité | Durée |
|-----|----------|-------|
| session | Authentification sécurisée | Session |
| XSRF-TOKEN | Protection contre les attaques CSRF | Session |

### Préférences
Mémorisent vos choix d'interface.

| Nom | Finalité | Durée |
|-----|----------|-------|
| locale | Préférence de langue | 1 an |
| construiro-pwa-banner | Préférence d'installation PWA | Permanent |

### Statistiques
Nous aident à comprendre comment les visiteurs utilisent le site.

### Marketing
Utilisés pour personnaliser les annonces et mesurer les campagnes.

### IA & Personnalisation
Permettent à SARA d'améliorer ses réponses selon votre contexte.

### Contenus externes
Nécessaires pour afficher des contenus intégrés tiers.

## Gestion de vos préférences

Vous pouvez modifier vos préférences à tout moment via le panneau de gestion des cookies accessible en bas de chaque page.

---
*Cette politique doit être adaptée selon les cookies réellement utilisés en production.*
MD;
    }

    private function cookiesEn(): string
    {
        return <<<MD
## Cookie Usage

CONSTRUIRO uses cookies to ensure the proper functioning of the site and, with your consent, to analyze traffic and personalize your experience.

## Cookie Categories

### Necessary (always active)
Essential for the website to function. They cannot be disabled.

| Name | Purpose | Duration |
|------|---------|----------|
| session | Secure authentication | Session |
| XSRF-TOKEN | CSRF attack protection | Session |

### Preferences
Remember your interface choices.

| Name | Purpose | Duration |
|------|---------|----------|
| locale | Language preference | 1 year |
| construiro-pwa-banner | PWA installation preference | Permanent |

### Statistics
Help us understand how visitors use the site.

### Marketing
Used to personalize ads and measure campaign effectiveness.

### AI & Personalization
Allow SARA to improve responses based on your context.

### External Content
Required to display embedded third-party content.

## Managing Your Preferences

You can change your preferences at any time via the cookie management panel accessible at the bottom of each page.

---
*This policy should be adapted based on cookies actually used in production.*
MD;
    }

    // ── 14 nouvelles pages ────────────────────────────────────────────────────

    private function conditionsCommercialesFr(): string
    {
        return <<<MD
## 1. Tarification

Les prix des licences CONSTRUIRO sont indiqués en Francs CFA (XOF) ou en devise locale selon le pays. Les tarifs en vigueur sont ceux affichés sur le site au moment de la commande.

## 2. Modalités de paiement

Le paiement s'effectue par virement bancaire, Mobile Money (Orange Money, Wave, MTN MoMo) ou tout autre moyen accepté par IBIG Soft. La licence est activée à réception du paiement.

## 3. Durée des licences

Les licences sont souscrites pour des périodes d'un (1) mois ou d'un (1) an. Le renouvellement est automatique sauf résiliation notifiée 30 jours avant l'échéance.

## 4. Facturation

Les factures sont émises électroniquement et disponibles dans l'espace client. L'entreprise cliente est responsable de la fourniture d'informations de facturation exactes.

## 5. Retard de paiement

Tout retard de paiement peut entraîner la suspension temporaire de l'accès au service. Un délai de grâce de 7 jours est accordé avant toute suspension.

## 6. Révision tarifaire

IBIG Soft se réserve le droit de réviser ses tarifs avec un préavis de 30 jours. Les clients existants sont informés par email.

---
*Ces conditions commerciales doivent être validées par un professionnel juridique avant toute mise en production.*
MD;
    }

    private function conditionsCommercialesEn(): string
    {
        return <<<MD
## 1. Pricing

CONSTRUIRO license prices are quoted in CFA Francs (XOF) or local currency depending on the country. Current prices are those displayed on the website at the time of order.

## 2. Payment Terms

Payment is made by bank transfer, Mobile Money (Orange Money, Wave, MTN MoMo), or any other method accepted by IBIG Soft. The license is activated upon receipt of payment.

## 3. License Duration

Licenses are subscribed for periods of one (1) month or one (1) year. Renewal is automatic unless termination is notified 30 days before expiry.

## 4. Invoicing

Invoices are issued electronically and available in the customer portal. The client company is responsible for providing accurate billing information.

## 5. Late Payment

Any late payment may result in temporary suspension of service access. A grace period of 7 days is granted before any suspension.

## 6. Price Revision

IBIG Soft reserves the right to revise its pricing with 30 days' notice. Existing customers are informed by email.

---
*These commercial terms must be validated by a legal professional before any commercial deployment.*
MD;
    }

    private function contratLicenceFr(): string
    {
        return <<<MD
## 1. Objet du contrat

Le présent Contrat de Licence Logiciel (CLL) régit les droits d'utilisation du logiciel **CONSTRUIRO** accordés par **IBIG Soft** au licencié.

## 2. Droits accordés

IBIG Soft accorde au licencié un droit d'utilisation non exclusif, non transférable et limité à la durée de la licence souscrite. Ce droit couvre :
- L'installation et l'utilisation sur les postes autorisés
- L'accès aux mises à jour incluses dans la licence
- L'utilisation pour les besoins propres de l'entreprise licenciée

## 3. Restrictions

Le licencié s'interdit de :
- Céder, sous-licencier ou louer le logiciel à des tiers
- Décompiler, désassembler ou tenter d'accéder au code source
- Créer des œuvres dérivées basées sur le logiciel
- Utiliser le logiciel à des fins concurrentielles

## 4. Mises à jour

Les mises à jour correctives sont incluses dans la licence active. Les nouvelles versions majeures peuvent nécessiter une mise à niveau de licence.

## 5. Résiliation

La licence prend fin automatiquement en cas de non-paiement, de violation des présentes conditions, ou à l'expiration de la période souscrite sans renouvellement.

## 6. Limitation de responsabilité

La responsabilité d'IBIG Soft est limitée au montant payé pour la licence au cours des 12 derniers mois. IBIG Soft n'est pas responsable des pertes de données ou de profits.

---
*Ce contrat de licence doit être validé par un professionnel juridique compétent.*
MD;
    }

    private function contratLicenceEn(): string
    {
        return <<<MD
## 1. Purpose

This Software License Agreement (SLA) governs the rights of use of the **CONSTRUIRO** software granted by **IBIG Soft** to the licensee.

## 2. Rights Granted

IBIG Soft grants the licensee a non-exclusive, non-transferable right of use limited to the duration of the subscribed license. This right covers:
- Installation and use on authorized workstations
- Access to updates included in the license
- Use for the licensee's own business needs

## 3. Restrictions

The licensee shall not:
- Assign, sub-license, or rent the software to third parties
- Decompile, disassemble, or attempt to access source code
- Create derivative works based on the software
- Use the software for competitive purposes

## 4. Updates

Corrective updates are included in the active license. Major new versions may require a license upgrade.

## 5. Termination

The license terminates automatically upon non-payment, breach of these terms, or expiration of the subscribed period without renewal.

## 6. Limitation of Liability

IBIG Soft's liability is limited to the amount paid for the license in the last 12 months. IBIG Soft is not liable for data loss or loss of profits.

---
*This license agreement must be validated by a qualified legal professional.*
MD;
    }

    private function sauvegardeFr(): string
    {
        return <<<MD
## 1. Sauvegardes automatiques

CONSTRUIRO effectue des sauvegardes automatiques des données clients selon le planning suivant :
- **Sauvegarde quotidienne** : tous les jours à 02h00 (heure locale serveur)
- **Sauvegarde hebdomadaire** : chaque dimanche
- **Sauvegarde mensuelle** : le 1er de chaque mois

## 2. Rétention des sauvegardes

| Type | Durée de conservation |
|------|----------------------|
| Quotidienne | 7 jours |
| Hebdomadaire | 4 semaines |
| Mensuelle | 12 mois |

## 3. Chiffrement

Toutes les sauvegardes sont chiffrées en transit et au repos (AES-256).

## 4. Restauration

En cas d'incident, IBIG Soft s'engage à restaurer les données dans un délai de 4 heures ouvrées à compter de la demande formulée par le client.

## 5. Responsabilité du client

Le client est encouragé à effectuer ses propres exports réguliers via les fonctionnalités d'export de CONSTRUIRO. IBIG Soft ne saurait être tenu responsable en cas de perte de données résultant d'actions directes du client.

## 6. Exportation des données

À tout moment, le client peut exporter l'intégralité de ses données aux formats CSV, Excel ou PDF depuis son espace client.

---
*Cette politique de sauvegarde est donnée à titre indicatif et peut évoluer.*
MD;
    }

    private function sauvegardeEn(): string
    {
        return <<<MD
## 1. Automatic Backups

CONSTRUIRO performs automatic backups of client data on the following schedule:
- **Daily backup**: every day at 02:00 (server local time)
- **Weekly backup**: every Sunday
- **Monthly backup**: on the 1st of each month

## 2. Backup Retention

| Type | Retention Period |
|------|----------------|
| Daily | 7 days |
| Weekly | 4 weeks |
| Monthly | 12 months |

## 3. Encryption

All backups are encrypted in transit and at rest (AES-256).

## 4. Restoration

In the event of an incident, IBIG Soft commits to restoring data within 4 business hours from the client's request.

## 5. Client Responsibility

Clients are encouraged to perform their own regular exports via CONSTRUIRO's export features. IBIG Soft cannot be held liable for data loss resulting from direct client actions.

## 6. Data Export

At any time, clients can export all their data in CSV, Excel, or PDF format from their customer portal.

---
*This backup policy is provided for information purposes and may evolve.*
MD;
    }

    private function supportFr(): string
    {
        return <<<MD
## 1. Canaux de support

IBIG Soft propose les canaux de support suivants :
- **Email** : support@ibigsoft.com
- **WhatsApp** : +225 27 22 27 60 14
- **Portail client** : tickets en ligne disponibles dans l'application
- **Formation en ligne** : vidéos et documentation dans la base de connaissances

## 2. Niveaux de service (SLA)

| Priorité | Description | Délai de réponse | Délai de résolution |
|----------|-------------|-----------------|-------------------|
| Critique | Service totalement indisponible | 2h | 8h |
| Haute | Fonctionnalité majeure défaillante | 4h | 24h |
| Normale | Bug ou question générale | 8h | 72h |
| Basse | Amélioration ou suggestion | 48h | Selon roadmap |

## 3. Horaires de support

Support disponible du **lundi au vendredi, 8h00 – 18h00 (GMT)**.
Support d'urgence 24/7 pour les incidents critiques uniquement.

## 4. Périmètre du support

Le support inclut :
- Assistance à l'utilisation des modules CONSTRUIRO
- Résolution de bugs et incidents techniques
- Aide à la configuration et à la prise en main

Le support **n'inclut pas** :
- Le développement de fonctionnalités personnalisées
- La formation initiale (facturable séparément)
- L'assistance sur des environnements non maintenus

---
*Les niveaux de service peuvent varier selon le plan souscrit.*
MD;
    }

    private function supportEn(): string
    {
        return <<<MD
## 1. Support Channels

IBIG Soft offers the following support channels:
- **Email**: support@ibigsoft.com
- **WhatsApp**: +225 27 22 27 60 14
- **Customer Portal**: online tickets available in the application
- **Online Training**: videos and documentation in the knowledge base

## 2. Service Levels (SLA)

| Priority | Description | Response Time | Resolution Time |
|----------|-------------|--------------|----------------|
| Critical | Service completely unavailable | 2h | 8h |
| High | Major feature failing | 4h | 24h |
| Normal | Bug or general question | 8h | 72h |
| Low | Enhancement or suggestion | 48h | Per roadmap |

## 3. Support Hours

Support available **Monday to Friday, 8:00 AM – 6:00 PM (GMT)**.
24/7 emergency support for critical incidents only.

## 4. Support Scope

Support includes:
- Assistance with using CONSTRUIRO modules
- Bug and technical incident resolution
- Configuration and onboarding assistance

Support **does not include**:
- Custom feature development
- Initial training (billed separately)
- Assistance on unsupported environments

---
*Service levels may vary depending on the subscribed plan.*
MD;
    }

    private function resiliationFr(): string
    {
        return <<<MD
## 1. Résiliation à l'initiative du client

Le client peut résilier sa licence à tout moment en notifiant IBIG Soft par email (support@ibigsoft.com) avec un préavis de **30 jours**. La résiliation prend effet à la fin de la période en cours.

## 2. Résiliation à l'initiative d'IBIG Soft

IBIG Soft peut résilier la licence avec un préavis de **30 jours** en cas de :
- Non-paiement après délai de grâce
- Violation des conditions d'utilisation
- Fermeture du service (avec remboursement prorata)

## 3. Résiliation immédiate

IBIG Soft se réserve le droit de suspendre ou résilier immédiatement l'accès en cas de :
- Utilisation frauduleuse ou illicite
- Attaque informatique avérée depuis le compte client
- Violation grave des présentes conditions

## 4. Effets de la résiliation

À la date de résiliation :
- L'accès au logiciel est désactivé
- Les données sont conservées 30 jours supplémentaires pour permettre l'export
- Au-delà de 30 jours, les données sont supprimées définitivement

## 5. Export des données avant résiliation

IBIG Soft recommande au client d'exporter toutes ses données avant la date de résiliation. Une assistance à l'export est disponible sur demande.

---
*Ces conditions de résiliation doivent être validées par un professionnel juridique.*
MD;
    }

    private function resiliationEn(): string
    {
        return <<<MD
## 1. Termination by Client

The client may terminate their license at any time by notifying IBIG Soft by email (support@ibigsoft.com) with **30 days' notice**. Termination takes effect at the end of the current period.

## 2. Termination by IBIG Soft

IBIG Soft may terminate the license with **30 days' notice** in case of:
- Non-payment after grace period
- Breach of terms of use
- Service closure (with prorated refund)

## 3. Immediate Termination

IBIG Soft reserves the right to immediately suspend or terminate access in case of:
- Fraudulent or unlawful use
- Proven cyberattack from the client account
- Serious breach of these terms

## 4. Effects of Termination

On the termination date:
- Access to the software is deactivated
- Data is retained for an additional 30 days to allow export
- After 30 days, data is permanently deleted

## 5. Data Export Before Termination

IBIG Soft recommends clients export all their data before the termination date. Export assistance is available upon request.

---
*These termination terms must be validated by a legal professional.*
MD;
    }

    private function remboursementFr(): string
    {
        return <<<MD
## 1. Politique générale

IBIG Soft s'engage à fournir un service de qualité. Si le service ne correspond pas à vos attentes, nous proposons les remboursements suivants.

## 2. Période d'essai gratuit

Un essai gratuit de **14 jours** est proposé sans engagement. Aucune carte bancaire n'est requise pendant l'essai. À l'issue de l'essai, la facturation commence uniquement si le client souscrit activement.

## 3. Garantie de remboursement

| Situation | Délai | Remboursement |
|-----------|-------|---------------|
| Insatisfaction lors du premier mois | 30 jours après paiement | 100% |
| Panne prolongée (>72h consécutives) | Sur demande | Prorata de la période indisponible |
| Double facturation | Sur constatation | 100% du trop-perçu |

## 4. Procédure de remboursement

Pour demander un remboursement, envoyez un email à **support@ibigsoft.com** avec :
- Votre numéro de client
- La facture concernée
- Le motif de la demande

Le remboursement est traité sous **10 jours ouvrés**.

## 5. Cas exclus

Les remboursements ne sont pas applicables en cas de :
- Résiliation après la période de garantie
- Suspension pour non-respect des CGU
- Services de formation ou d'implémentation déjà réalisés

---
*Cette politique de remboursement peut être modifiée avec préavis de 30 jours.*
MD;
    }

    private function remboursementEn(): string
    {
        return <<<MD
## 1. General Policy

IBIG Soft is committed to providing quality service. If the service does not meet your expectations, we offer the following refunds.

## 2. Free Trial Period

A **14-day free trial** is offered with no commitment. No credit card is required during the trial. After the trial, billing only begins if the client actively subscribes.

## 3. Refund Guarantee

| Situation | Timeframe | Refund |
|-----------|-----------|--------|
| Dissatisfaction during first month | 30 days after payment | 100% |
| Extended outage (>72h consecutive) | Upon request | Prorated for unavailable period |
| Double billing | Upon discovery | 100% of overpayment |

## 4. Refund Process

To request a refund, send an email to **support@ibigsoft.com** with:
- Your customer number
- The relevant invoice
- The reason for the request

Refunds are processed within **10 business days**.

## 5. Exclusions

Refunds do not apply in case of:
- Termination after the guarantee period
- Suspension for ToS violation
- Training or implementation services already rendered

---
*This refund policy may be modified with 30 days' notice.*
MD;
    }

    private function traitementDonneesFr(): string
    {
        return <<<MD
## 1. Objet

Le présent Accord de Traitement des Données (DPA) précise les obligations respectives d'IBIG Soft (sous-traitant) et du client (responsable de traitement) concernant les données personnelles traitées via CONSTRUIRO.

## 2. Nature des traitements

IBIG Soft traite les données personnelles pour le compte du client afin de :
- Fournir les fonctionnalités du logiciel CONSTRUIRO
- Assurer la maintenance et la sécurité du service
- Réaliser des sauvegardes techniques

## 3. Types de données traitées

- Données d'identification des employés (nom, prénom, email, poste)
- Données de paie et de ressources humaines
- Données de clients et fournisseurs du client
- Données financières et comptables

## 4. Obligations d'IBIG Soft

IBIG Soft s'engage à :
- Traiter les données uniquement sur instruction du client
- Mettre en place des mesures de sécurité appropriées
- Notifier le client dans les 72h en cas de violation de données
- Assister le client dans l'exercice des droits des personnes concernées
- Supprimer ou restituer les données à la fin du contrat

## 5. Sous-traitance

IBIG Soft peut faire appel à des sous-traitants ultérieurs (hébergement, emails) après information préalable du client. La liste des sous-traitants est disponible sur demande.

## 6. Transferts internationaux

Les données sont hébergées dans des pays offrant un niveau de protection adéquat selon la réglementation applicable.

---
*Cet accord de traitement des données doit être validé par un professionnel juridique spécialisé en protection des données.*
MD;
    }

    private function traitementDonneesEn(): string
    {
        return <<<MD
## 1. Purpose

This Data Processing Agreement (DPA) specifies the respective obligations of IBIG Soft (processor) and the client (data controller) regarding personal data processed through CONSTRUIRO.

## 2. Nature of Processing

IBIG Soft processes personal data on behalf of the client in order to:
- Provide the features of CONSTRUIRO software
- Ensure maintenance and security of the service
- Perform technical backups

## 3. Types of Data Processed

- Employee identification data (name, email, job title)
- Payroll and HR data
- Client's customer and supplier data
- Financial and accounting data

## 4. IBIG Soft Obligations

IBIG Soft commits to:
- Processing data only on the client's instructions
- Implementing appropriate security measures
- Notifying the client within 72h in case of data breach
- Assisting the client in exercising data subjects' rights
- Deleting or returning data at contract end

## 5. Sub-processing

IBIG Soft may engage sub-processors (hosting, emails) after prior notification to the client. The list of sub-processors is available upon request.

## 6. International Transfers

Data is hosted in countries offering an adequate level of protection under applicable regulations.

---
*This data processing agreement must be validated by a legal professional specializing in data protection.*
MD;
    }

    private function proprieteIntellectuelleFr(): string
    {
        return <<<MD
## 1. Droits d'IBIG Soft

**IBIG Soft** est et demeure le seul et unique titulaire de tous les droits de propriété intellectuelle relatifs à :
- Le logiciel CONSTRUIRO (code source, interface, architecture)
- Les marques CONSTRUIRO et IBIG Soft
- La documentation technique et commerciale
- Les logos, visuels et éléments graphiques

## 2. Droits du client sur ses données

Le client reste propriétaire exclusif de toutes les données qu'il saisit dans CONSTRUIRO. IBIG Soft ne revendique aucun droit sur ces données.

## 3. Contenus générés par l'IA (SARA)

Les réponses générées par SARA sont fournies à titre informatif uniquement. Le client utilise ces contenus sous sa propre responsabilité. IBIG Soft ne garantit pas l'exactitude ou l'exhaustivité des réponses de l'IA.

## 4. Retours et suggestions

Les retours, idées ou suggestions transmis par le client à IBIG Soft peuvent être utilisés pour améliorer le produit sans compensation financière pour le client.

## 5. Signalement de violations

Pour signaler une violation des droits de propriété intellectuelle d'IBIG Soft : legal@ibigsoft.com

---
*Ces dispositions relatives à la propriété intellectuelle doivent être validées par un professionnel juridique compétent.*
MD;
    }

    private function proprieteIntellectuelleEn(): string
    {
        return <<<MD
## 1. IBIG Soft's Rights

**IBIG Soft** is and remains the sole and exclusive owner of all intellectual property rights relating to:
- CONSTRUIRO software (source code, interface, architecture)
- The CONSTRUIRO and IBIG Soft trademarks
- Technical and commercial documentation
- Logos, visuals, and graphic elements

## 2. Client Rights Over Their Data

The client remains the exclusive owner of all data they enter into CONSTRUIRO. IBIG Soft claims no rights over this data.

## 3. AI-Generated Content (SARA)

Responses generated by SARA are provided for informational purposes only. The client uses this content at their own responsibility. IBIG Soft does not guarantee the accuracy or completeness of AI responses.

## 4. Feedback and Suggestions

Feedback, ideas, or suggestions provided by the client to IBIG Soft may be used to improve the product without financial compensation to the client.

## 5. Reporting Violations

To report an infringement of IBIG Soft's intellectual property rights: legal@ibigsoft.com

---
*These intellectual property provisions must be validated by a qualified legal professional.*
MD;
    }

    private function protectionMarqueFr(): string
    {
        return <<<MD
## 1. Marques protégées

Les noms **CONSTRUIRO**, **IBIG Soft**, **IBIG SARL**, **SARA** (dans le contexte de l'assistant IA de CONSTRUIRO) ainsi que leurs logos associés sont des marques protégées d'IBIG Soft.

## 2. Utilisations autorisées

Les clients et partenaires peuvent mentionner CONSTRUIRO dans leurs communications commerciales pour indiquer qu'ils utilisent le logiciel, à condition de :
- Respecter les guidelines de la marque disponibles sur demande
- Ne pas modifier les logos ou créer une confusion avec d'autres produits
- Mentionner CONSTRUIRO comme un produit d'IBIG Soft

## 3. Utilisations interdites

Il est interdit de :
- Utiliser les marques IBIG Soft pour promouvoir des produits concurrents
- Déposer des marques similaires pouvant créer une confusion
- Utiliser les logos dans un contexte susceptible de nuire à l'image d'IBIG Soft
- Créer des noms de domaine incluant les marques sans autorisation

## 4. Partenaires agréés

Les partenaires officiels IBIG PARTNERS disposent d'une licence d'usage de la marque dans le cadre défini par le programme de partenariat.

## 5. Signalement

Pour signaler un usage abusif de la marque : legal@ibigsoft.com

---
*Les informations relatives au dépôt légal des marques seront complétées selon les enregistrements officiels effectués.*
MD;
    }

    private function protectionMarqueEn(): string
    {
        return <<<MD
## 1. Protected Trademarks

The names **CONSTRUIRO**, **IBIG Soft**, **IBIG SARL**, **SARA** (in the context of CONSTRUIRO's AI assistant), and their associated logos are protected trademarks of IBIG Soft.

## 2. Authorized Uses

Clients and partners may mention CONSTRUIRO in their commercial communications to indicate that they use the software, provided they:
- Follow brand guidelines available upon request
- Do not modify logos or create confusion with other products
- Reference CONSTRUIRO as an IBIG Soft product

## 3. Prohibited Uses

It is prohibited to:
- Use IBIG Soft trademarks to promote competing products
- Register similar trademarks that could cause confusion
- Use logos in a context that could damage IBIG Soft's image
- Create domain names including the trademarks without authorization

## 4. Approved Partners

Official IBIG PARTNERS have a license to use the brand within the framework defined by the partnership program.

## 5. Reporting

To report trademark misuse: legal@ibigsoft.com

---
*Trademark registration details will be completed according to official registrations made.*
MD;
    }

    private function conditionsEssaiFr(): string
    {
        return <<<MD
## 1. Durée et portée de l'essai

CONSTRUIRO propose un essai gratuit de **14 jours** donnant accès à l'ensemble des fonctionnalités du plan souscrit sans limitation.

## 2. Sans engagement

Aucune carte bancaire n'est requise pour démarrer l'essai. À l'issue des 14 jours, le compte est automatiquement suspendu (non supprimé) si aucun abonnement n'est souscrit.

## 3. Données pendant l'essai

Les données saisies pendant l'essai sont conservées **30 jours** après la fin de la période d'essai. Le client peut exporter ses données à tout moment.

## 4. Conversion en abonnement

À tout moment pendant l'essai, le client peut souscrire un abonnement payant et continuer sans interruption avec toutes ses données.

## 5. Restrictions de l'essai

Pendant la période d'essai :
- Le support est limité à la documentation en ligne
- Certaines intégrations avancées peuvent nécessiter un abonnement actif
- L'accès multi-utilisateurs peut être limité selon le plan

## 6. Usage équitable

L'essai est réservé à un usage de bonne foi. IBIG Soft se réserve le droit de refuser ou de mettre fin à un essai en cas d'abus constaté.

---
*Un seul essai gratuit est accordé par entreprise.*
MD;
    }

    private function conditionsEssaiEn(): string
    {
        return <<<MD
## 1. Trial Duration and Scope

CONSTRUIRO offers a **14-day free trial** giving access to all features of the subscribed plan without limitation.

## 2. No Commitment

No credit card is required to start the trial. After 14 days, the account is automatically suspended (not deleted) if no subscription is taken out.

## 3. Data During Trial

Data entered during the trial is retained for **30 days** after the trial period ends. Clients can export their data at any time.

## 4. Conversion to Subscription

At any time during the trial, the client can subscribe to a paid plan and continue without interruption with all their data.

## 5. Trial Restrictions

During the trial period:
- Support is limited to online documentation
- Some advanced integrations may require an active subscription
- Multi-user access may be limited depending on the plan

## 6. Fair Use

The trial is reserved for good-faith use. IBIG Soft reserves the right to refuse or terminate a trial in case of detected abuse.

---
*One free trial is granted per company.*
MD;
    }

    private function conditionsSaraFr(): string
    {
        return <<<MD
## 1. Présentation de SARA

**SARA** (Smart Assistant for Rapid Answers) est l'assistante intelligente intégrée à CONSTRUIRO. Elle est propulsée par des modèles d'intelligence artificielle (Groq / LLaMA) et est conçue pour aider les utilisateurs dans leur utilisation quotidienne du logiciel.

## 2. Portée des réponses

SARA fournit des informations générales sur :
- L'utilisation des modules de CONSTRUIRO
- Les bonnes pratiques de gestion BTP
- Les fonctionnalités disponibles dans votre abonnement

## 3. Limitations importantes

SARA **ne remplace pas** :
- Un conseiller juridique ou fiscal
- Un expert-comptable ou auditeur
- Un ingénieur BTP certifié
- Le support technique humain d'IBIG Soft

Les réponses de SARA sont générées automatiquement et peuvent contenir des inexactitudes.

## 4. Confidentialité des échanges

Les conversations avec SARA sont transmises à l'API Groq pour traitement. IBIG Soft ne stocke pas l'historique complet des conversations de manière permanente. Voir notre Politique de Confidentialité pour les détails.

## 5. Utilisation acceptable

Il est interdit d'utiliser SARA pour :
- Générer du contenu malveillant ou illégal
- Tenter de contourner les filtres de sécurité
- Extraire des informations sur l'infrastructure technique d'IBIG Soft

## 6. Amélioration continue

IBIG Soft utilise les retours anonymisés sur les échanges SARA pour améliorer la qualité des réponses.

---
*L'utilisation de SARA implique l'acceptation des présentes conditions et de la Politique de Confidentialité.*
MD;
    }

    private function conditionsSaraEn(): string
    {
        return <<<MD
## 1. About SARA

**SARA** (Smart Assistant for Rapid Answers) is the intelligent assistant integrated into CONSTRUIRO. It is powered by artificial intelligence models (Groq / LLaMA) and is designed to help users in their daily use of the software.

## 2. Scope of Responses

SARA provides general information on:
- Using CONSTRUIRO modules
- BTP management best practices
- Features available in your subscription

## 3. Important Limitations

SARA **does not replace**:
- A legal or tax advisor
- An accountant or auditor
- A certified construction engineer
- Human technical support from IBIG Soft

SARA's responses are automatically generated and may contain inaccuracies.

## 4. Conversation Privacy

Conversations with SARA are transmitted to the Groq API for processing. IBIG Soft does not permanently store the full conversation history. See our Privacy Policy for details.

## 5. Acceptable Use

It is prohibited to use SARA to:
- Generate malicious or illegal content
- Attempt to circumvent security filters
- Extract information about IBIG Soft's technical infrastructure

## 6. Continuous Improvement

IBIG Soft uses anonymized feedback from SARA interactions to improve response quality.

---
*Using SARA implies acceptance of these terms and the Privacy Policy.*
MD;
    }

    private function limitationIaFr(): string
    {
        return <<<MD
## 1. Nature des technologies d'IA utilisées

CONSTRUIRO intègre des technologies d'intelligence artificielle générative pour l'assistant SARA. Ces modèles sont entraînés sur des corpus de données et peuvent générer des réponses plausibles mais incorrectes.

## 2. Avertissements essentiels

**L'IA peut se tromper.** Les réponses de SARA doivent être considérées comme des suggestions à valider, non comme des certitudes.

**L'IA n'a pas de connaissance temps réel.** SARA n'a pas accès à votre base de données en direct ni aux actualités récentes.

**L'IA n'est pas un expert humain.** Pour toute décision importante (juridique, fiscale, technique), consultez un professionnel qualifié.

## 3. Responsabilité

IBIG Soft décline toute responsabilité pour :
- Les décisions prises sur la seule base des réponses de SARA
- Les erreurs factuelles contenues dans les réponses générées
- L'utilisation des réponses de SARA dans un contexte professionnel critique

## 4. Biais et limitations connues

Les modèles d'IA peuvent présenter des biais inhérents à leurs données d'entraînement. IBIG Soft travaille à minimiser ces biais mais ne peut garantir leur absence totale.

## 5. Signalement d'erreurs

Si vous identifiez une réponse incorrecte ou inappropriée de SARA, merci de le signaler à : support@ibigsoft.com. Votre retour contribue à l'amélioration du système.

## 6. Évolution des capacités

Les capacités de l'IA évoluent rapidement. Les présentes limitations peuvent être réduites dans les versions futures de CONSTRUIRO.

---
*Ces avertissements sont essentiels pour une utilisation responsable de l'IA dans un contexte professionnel.*
MD;
    }

    private function limitationIaEn(): string
    {
        return <<<MD
## 1. Nature of AI Technologies Used

CONSTRUIRO integrates generative artificial intelligence technologies for the SARA assistant. These models are trained on data corpora and may generate plausible but incorrect responses.

## 2. Essential Warnings

**AI can be wrong.** SARA's responses should be considered suggestions to validate, not certainties.

**AI has no real-time knowledge.** SARA does not have access to your live database or recent news.

**AI is not a human expert.** For any important decision (legal, tax, technical), consult a qualified professional.

## 3. Liability

IBIG Soft disclaims any liability for:
- Decisions made solely based on SARA's responses
- Factual errors contained in generated responses
- Use of SARA's responses in critical professional contexts

## 4. Known Biases and Limitations

AI models may exhibit biases inherent in their training data. IBIG Soft works to minimize these biases but cannot guarantee their complete absence.

## 5. Error Reporting

If you identify an incorrect or inappropriate response from SARA, please report it to: support@ibigsoft.com. Your feedback contributes to system improvement.

## 6. Evolving Capabilities

AI capabilities evolve rapidly. These limitations may be reduced in future versions of CONSTRUIRO.

---
*These warnings are essential for responsible use of AI in a professional context.*
MD;
    }

    private function gestionCompteFr(): string
    {
        return <<<MD
## 1. Création de compte

La création d'un compte CONSTRUIRO nécessite de fournir des informations exactes et à jour. Chaque entreprise dispose d'un compte administrateur principal.

## 2. Responsabilités de l'administrateur

L'administrateur du compte est responsable de :
- La gestion des accès utilisateurs au sein de l'organisation
- La configuration des rôles et permissions
- La sécurité des identifiants de connexion
- La mise à jour des informations de facturation

## 3. Sécurité du compte

Le client s'engage à :
- Utiliser des mots de passe forts (minimum 8 caractères, mixte majuscules/minuscules/chiffres)
- Activer l'authentification à deux facteurs (2FA) si disponible
- Ne pas partager ses identifiants avec des personnes non autorisées
- Notifier immédiatement IBIG Soft en cas de compromission suspectée

## 4. Comptes inactifs

Les comptes sans activité pendant **6 mois consécutifs** sur un abonnement expiré peuvent être archivés. Les données sont conservées 30 jours avant suppression définitive.

## 5. Transfert de compte

Le transfert du compte à une autre entité nécessite une validation écrite d'IBIG Soft et une mise à jour des informations contractuelles.

## 6. Compte multi-utilisateurs

Chaque utilisateur dispose de son propre identifiant. Le partage d'identifiants entre plusieurs personnes est interdit et peut entraîner la suspension du compte.

---
*La gestion sécurisée des comptes est une responsabilité partagée entre IBIG Soft et le client.*
MD;
    }

    private function gestionCompteEn(): string
    {
        return <<<MD
## 1. Account Creation

Creating a CONSTRUIRO account requires providing accurate and up-to-date information. Each company has one main administrator account.

## 2. Administrator Responsibilities

The account administrator is responsible for:
- Managing user access within the organization
- Configuring roles and permissions
- Security of login credentials
- Updating billing information

## 3. Account Security

The client commits to:
- Using strong passwords (minimum 8 characters, mixed case/numbers)
- Enabling two-factor authentication (2FA) when available
- Not sharing credentials with unauthorized persons
- Immediately notifying IBIG Soft in case of suspected compromise

## 4. Inactive Accounts

Accounts with no activity for **6 consecutive months** on an expired subscription may be archived. Data is retained for 30 days before permanent deletion.

## 5. Account Transfer

Transferring an account to another entity requires written validation from IBIG Soft and an update to contractual information.

## 6. Multi-User Account

Each user has their own login credentials. Sharing credentials between multiple people is prohibited and may result in account suspension.

---
*Secure account management is a shared responsibility between IBIG Soft and the client.*
MD;
    }

    private function gestionReclamationsFr(): string
    {
        return <<<MD
## 1. Notre engagement

IBIG Soft s'engage à traiter toute réclamation avec sérieux, équité et dans les meilleurs délais. La satisfaction de nos clients est au cœur de notre démarche.

## 2. Comment soumettre une réclamation

**Par email** : support@ibigsoft.com (objet : "Réclamation – [votre numéro client]")

**Par WhatsApp** : +225 27 22 27 60 14

**Par courrier** : IBIG SARL – Service Réclamations, Abidjan, Côte d'Ivoire

## 3. Délais de traitement

| Étape | Délai |
|-------|-------|
| Accusé de réception | 24h ouvrées |
| Réponse de fond | 5 jours ouvrés |
| Résolution ou escalade | 10 jours ouvrés |

## 4. Processus de traitement

1. **Réception** : votre réclamation est enregistrée et un numéro de suivi vous est attribué
2. **Analyse** : notre équipe examine les faits et les éléments fournis
3. **Réponse** : une réponse de fond vous est adressée avec les actions correctives envisagées
4. **Clôture** : la réclamation est clôturée après votre confirmation ou à défaut après 15 jours

## 5. Médiation

En cas de désaccord persistant après traitement de la réclamation, les parties peuvent recourir à un médiateur indépendant avant toute action judiciaire.

## 6. Amélioration continue

Toutes les réclamations sont analysées pour identifier les opportunités d'amélioration de nos produits et services.

---
*IBIG Soft considère chaque réclamation comme une opportunité d'amélioration.*
MD;
    }

    private function gestionReclamationsEn(): string
    {
        return <<<MD
## 1. Our Commitment

IBIG Soft commits to handling every complaint seriously, fairly, and as quickly as possible. Customer satisfaction is at the heart of our approach.

## 2. How to Submit a Complaint

**By email**: support@ibigsoft.com (subject: "Complaint – [your customer number]")

**By WhatsApp**: +225 27 22 27 60 14

**By mail**: IBIG SARL – Complaints Department, Abidjan, Côte d'Ivoire

## 3. Processing Timeframes

| Step | Timeframe |
|------|-----------|
| Acknowledgment of receipt | 24 business hours |
| Substantive response | 5 business days |
| Resolution or escalation | 10 business days |

## 4. Handling Process

1. **Receipt**: your complaint is registered and a tracking number is assigned
2. **Analysis**: our team examines the facts and provided documentation
3. **Response**: a substantive response is sent with proposed corrective actions
4. **Closure**: the complaint is closed after your confirmation or after 15 days by default

## 5. Mediation

In case of persistent disagreement after complaint handling, parties may resort to an independent mediator before any legal action.

## 6. Continuous Improvement

All complaints are analyzed to identify opportunities for improvement in our products and services.

---
*IBIG Soft considers every complaint as an opportunity for improvement.*
MD;
    }
}
