<?php

namespace Database\Seeders;

use App\Models\LegalPage;
use Illuminate\Database\Seeder;

class LegalPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
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
        ];

        foreach ($pages as $page) {
            LegalPage::updateOrCreate(['slug' => $page['slug']], array_merge($page, [
                'is_published'    => true,
                'last_updated_at' => now(),
            ]));
        }
    }

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

CONSTRUIRO utilise des cookies strictement nécessaires au fonctionnement du service (session, sécurité CSRF). Aucun cookie publicitaire ou de traçage tiers n'est utilisé sans votre consentement.

## Cookies utilisés

| Nom | Finalité | Durée |
|-----|----------|-------|
| session | Authentification sécurisée | Session |
| XSRF-TOKEN | Protection contre les attaques CSRF | Session |
| locale | Préférence de langue | 1 an |

## Gestion des cookies

Vous pouvez configurer votre navigateur pour refuser les cookies. Cela peut affecter le bon fonctionnement de l'application.

---
*Cette politique doit être adaptée selon les cookies réellement utilisés en production.*
MD;
    }

    private function cookiesEn(): string
    {
        return <<<MD
## Cookie Usage

CONSTRUIRO uses cookies strictly necessary for the operation of the service (session, CSRF security). No advertising or third-party tracking cookies are used without your consent.

## Cookies Used

| Name | Purpose | Duration |
|------|---------|----------|
| session | Secure authentication | Session |
| XSRF-TOKEN | Protection against CSRF attacks | Session |
| locale | Language preference | 1 year |

## Managing Cookies

You can configure your browser to refuse cookies. This may affect the proper functioning of the application.

---
*This policy should be adapted based on cookies actually used in production.*
MD;
    }
}
