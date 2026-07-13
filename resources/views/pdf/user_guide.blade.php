<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.6; }
.cover { min-height: 100vh; background: linear-gradient(135deg, #F58220, #f59e0b); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 60px; page-break-after: always; }
.cover-logo { font-size: 48px; font-weight: 900; letter-spacing: -2px; margin-bottom: 8px; }
.cover-badge { background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 16px; font-size: 12px; font-weight: 600; margin-bottom: 40px; display: inline-block; }
.cover-title { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
.cover-sub { font-size: 16px; opacity: 0.85; margin-bottom: 60px; }
.cover-meta { font-size: 11px; opacity: 0.7; }
.page { padding: 40px; page-break-after: always; }
.page:last-child { page-break-after: avoid; }
h1 { font-size: 22px; font-weight: 900; color: #F58220; border-bottom: 3px solid #F58220; padding-bottom: 8px; margin-bottom: 20px; }
h2 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 20px 0 8px; }
h3 { font-size: 12px; font-weight: 600; color: #475569; margin: 14px 0 6px; }
p { margin-bottom: 8px; color: #374151; }
ul, ol { margin: 8px 0 12px 20px; }
li { margin-bottom: 4px; }
.tip { background: #fff7ed; border-left: 4px solid #F58220; padding: 10px 14px; margin: 12px 0; border-radius: 0 8px 8px 0; }
.tip-title { font-weight: 700; color: #F58220; margin-bottom: 4px; font-size: 11px; }
.module-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 8px 0; }
.module-title { font-weight: 700; color: #0f172a; font-size: 12px; }
.toc { list-style: none; margin: 0; }
.toc li { padding: 4px 0; border-bottom: 1px dotted #e2e8f0; display: flex; justify-content: space-between; }
.toc li a { color: #F58220; text-decoration: none; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.badge-orange { background: #fff7ed; color: #F58220; }
.badge-green { background: #f0fdf4; color: #16a34a; }
footer-page { text-align: center; font-size: 9px; color: #94a3b8; padding-top: 10px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>

{{-- COUVERTURE --}}
<div class="cover">
    <div class="cover-logo">CONSTRUIRO</div>
    <div class="cover-badge">ERP BTP &bull; IBIG Soft</div>
    <div class="cover-title">{{ $locale === 'fr' ? 'Guide Utilisateur' : 'User Guide' }}</div>
    <div class="cover-sub">{{ $locale === 'fr' ? "L'ERP BTP conçu pour l'Afrique" : 'The BTP ERP designed for Africa' }}</div>
    <div class="cover-meta">
        {{ $locale === 'fr' ? 'Version' : 'Version' }} {{ $version }} &mdash; {{ now()->format('Y') }}<br>
        {{ $locale === 'fr' ? 'IBIG SARL &mdash; Intermark Business International Group' : 'IBIG SARL &mdash; Intermark Business International Group' }}
    </div>
</div>

{{-- TABLE DES MATIÈRES --}}
<div class="page">
    <h1>{{ $locale === 'fr' ? 'Table des matières' : 'Table of Contents' }}</h1>
    <ul class="toc">
        <li><span>{{ $locale === 'fr' ? '1. Introduction à CONSTRUIRO' : '1. Introduction to CONSTRUIRO' }}</span><span>2</span></li>
        <li><span>{{ $locale === 'fr' ? '2. Connexion et navigation' : '2. Login and navigation' }}</span><span>3</span></li>
        <li><span>{{ $locale === 'fr' ? '3. Tableau de bord' : '3. Dashboard' }}</span><span>4</span></li>
        <li><span>{{ $locale === 'fr' ? '4. Gestion des projets' : '4. Project management' }}</span><span>5</span></li>
        <li><span>{{ $locale === 'fr' ? '5. Gestion des chantiers' : '5. Site management' }}</span><span>6</span></li>
        <li><span>{{ $locale === 'fr' ? '6. RH & Paie' : '6. HR & Payroll' }}</span><span>7</span></li>
        <li><span>{{ $locale === 'fr' ? '7. Stock & Matériaux' : '7. Stock & Materials' }}</span><span>8</span></li>
        <li><span>{{ $locale === 'fr' ? '8. Équipements & Engins' : '8. Equipment & Machinery' }}</span><span>9</span></li>
        <li><span>{{ $locale === 'fr' ? '9. Devis & Facturation' : '9. Quotes & Invoicing' }}</span><span>10</span></li>
        <li><span>{{ $locale === 'fr' ? '10. Finance & Comptabilité' : '10. Finance & Accounting' }}</span><span>11</span></li>
        <li><span>{{ $locale === 'fr' ? '11. HSE & Qualité' : '11. HSE & Quality' }}</span><span>12</span></li>
        <li><span>{{ $locale === 'fr' ? "12. Bureau d'études" : '12. Design Office' }}</span><span>13</span></li>
        <li><span>{{ $locale === 'fr' ? '13. Paramètres & Administration' : '13. Settings & Administration' }}</span><span>14</span></li>
        <li><span>{{ $locale === 'fr' ? '14. Support & Aide' : '14. Support & Help' }}</span><span>15</span></li>
    </ul>
</div>

{{-- CHAPITRE 1 --}}
<div class="page">
    <h1>{{ $locale === 'fr' ? '1. Introduction à CONSTRUIRO' : '1. Introduction to CONSTRUIRO' }}</h1>
    @if($locale === 'fr')
    <p>CONSTRUIRO est un ERP (Enterprise Resource Planning) spécialement conçu pour les entreprises du BTP et de la construction en Afrique. Il centralise en une seule plateforme tous les processus métier : projets, chantiers, ressources humaines, stock, équipements, finance et comptabilité.</p>
    <h2>Pourquoi CONSTRUIRO ?</h2>
    <ul>
        <li><strong>15+ modules métier</strong> intégrés et interconnectés</li>
        <li><strong>Multi-entreprise</strong> : isolez les données de chaque filiale</li>
        <li><strong>Multi-devise</strong> : XOF, XAF, GNF, USD, EUR et plus</li>
        <li><strong>Multi-langue</strong> : Français et Anglais</li>
        <li><strong>Accessible partout</strong> : navigateur web sur PC, tablette et mobile</li>
    </ul>
    <h2>Architecture de la plateforme</h2>
    <p>CONSTRUIRO est organisé en <strong>modules</strong>, accessibles depuis la barre latérale gauche. Chaque utilisateur n'accède qu'aux modules autorisés par son rôle.</p>
    <div class="tip">
        <div class="tip-title">&#128161; Conseil</div>
        Votre administrateur peut personnaliser les rôles et permissions depuis Administration &rarr; Utilisateurs.
    </div>
    @else
    <p>CONSTRUIRO is an ERP (Enterprise Resource Planning) specifically designed for BTP and construction companies in Africa. It centralizes all business processes in a single platform: projects, sites, human resources, stock, equipment, finance and accounting.</p>
    <h2>Why CONSTRUIRO?</h2>
    <ul>
        <li><strong>15+ business modules</strong> integrated and interconnected</li>
        <li><strong>Multi-company</strong>: isolate data for each subsidiary</li>
        <li><strong>Multi-currency</strong>: XOF, XAF, GNF, USD, EUR and more</li>
        <li><strong>Multi-language</strong>: French and English</li>
        <li><strong>Accessible everywhere</strong>: web browser on PC, tablet and mobile</li>
    </ul>
    <h2>Platform architecture</h2>
    <p>CONSTRUIRO is organized into <strong>modules</strong>, accessible from the left sidebar. Each user only accesses modules authorized by their role.</p>
    <div class="tip">
        <div class="tip-title">&#128161; Tip</div>
        Your administrator can customize roles and permissions from Administration &rarr; Users.
    </div>
    @endif
</div>

{{-- CHAPITRE 2 --}}
<div class="page">
    <h1>{{ $locale === 'fr' ? '2. Connexion et navigation' : '2. Login and navigation' }}</h1>
    @if($locale === 'fr')
    <h2>Se connecter</h2>
    <ol>
        <li>Ouvrez votre navigateur et allez sur <strong>construiro.com</strong></li>
        <li>Cliquez sur <strong>Se connecter</strong></li>
        <li>Entrez votre <strong>email</strong> et votre <strong>mot de passe</strong></li>
        <li>Cliquez sur <strong>Connexion</strong></li>
    </ol>
    <div class="tip">
        <div class="tip-title">&#128273; Mot de passe oublié</div>
        Cliquez sur "Mot de passe oublié" sur la page de connexion. Un lien de réinitialisation sera envoyé à votre email.
    </div>
    <h2>Navigation principale</h2>
    <ul>
        <li><strong>Barre latérale gauche</strong> : accès à tous les modules</li>
        <li><strong>Barre supérieure</strong> : notifications, paramètres de compte, déconnexion</li>
        <li><strong>Fil d'Ariane</strong> : navigation entre les niveaux (ex: Projets &rarr; Projet A &rarr; Chantiers)</li>
    </ul>
    @else
    <h2>Logging in</h2>
    <ol>
        <li>Open your browser and go to <strong>construiro.com</strong></li>
        <li>Click <strong>Log in</strong></li>
        <li>Enter your <strong>email</strong> and <strong>password</strong></li>
        <li>Click <strong>Login</strong></li>
    </ol>
    <div class="tip">
        <div class="tip-title">&#128273; Forgot password</div>
        Click "Forgot password" on the login page. A reset link will be sent to your email.
    </div>
    <h2>Main navigation</h2>
    <ul>
        <li><strong>Left sidebar</strong>: access to all modules</li>
        <li><strong>Top bar</strong>: notifications, account settings, logout</li>
        <li><strong>Breadcrumb</strong>: navigation between levels (e.g.: Projects &rarr; Project A &rarr; Sites)</li>
    </ul>
    @endif
</div>

{{-- CHAPITRES 3-14 condensés --}}
@php
$chapters = $locale === 'fr' ? [
    ['3. Tableau de bord', "Le tableau de bord affiche une synthèse en temps réel de votre activité : KPIs financiers, projets en cours, alertes, graphiques. Chaque carte est cliquable pour accéder au module correspondant."],
    ['4. Gestion des projets', "Créez et suivez vos projets BTP avec budget, planning, avancement et équipe. Chaque projet peut contenir plusieurs chantiers. Utilisez le Gantt intégré pour visualiser le planning."],
    ['5. Gestion des chantiers', "Chaque chantier est rattaché à un projet. Gérez les tâches, pointages, incidents QHSE et demandes d'approvisionnement directement depuis la fiche chantier."],
    ['6. RH & Paie', "Enregistrez vos employés, suivez leurs présences, gérez les congés et générez les fiches de paie. Supporte les cotisations CNPS et les barèmes locaux."],
    ['7. Stock & Matériaux', "Gérez votre catalogue de matériaux, vos entrepôts et vos mouvements de stock. Les bons de commande fournisseurs alimentent automatiquement le stock à la réception."],
    ['8. Équipements & Engins', "Enregistrez votre parc roulant et vos engins. Planifiez les maintenances préventives, suivez les consommations de carburant et affectez les équipements aux chantiers."],
    ['9. Devis & Facturation', "Créez des devis à partir du bordereau de prix unitaires, transmettez-les aux clients et générez les factures en un clic. Export PDF disponible."],
    ['10. Finance & Comptabilité', "Gérez votre trésorerie, votre plan comptable SYSCOHADA, le journal des écritures, les budgets et les états financiers. Exports Excel et PDF."],
    ['11. HSE & Qualité', "Enregistrez les incidents de sécurité, les contrôles qualité et les non-conformités. Générez les rapports HSE et suivez les actions correctives."],
    ["12. Bureau d'études", "Gérez votre bibliothèque de prix unitaires, vos métrés, DQE et études techniques. Liez les études aux projets pour un suivi intégré."],
    ['13. Paramètres & Administration', "Administrez les utilisateurs et rôles, paramétrez la devise et la langue, personnalisez les modules actifs et gérez les pages légales."],
    ['14. Support & Aide', "Accédez au centre de support depuis le menu principal. Créez un ticket, suivez son avancement et consultez la base de connaissances pour les réponses rapides."],
] : [
    ['3. Dashboard', 'The dashboard displays a real-time summary of your activity: financial KPIs, ongoing projects, alerts, charts. Each card is clickable to access the corresponding module.'],
    ['4. Project management', 'Create and track your BTP projects with budget, planning, progress and team. Each project can contain multiple sites. Use the integrated Gantt chart to visualize the schedule.'],
    ['5. Site management', 'Each site is linked to a project. Manage tasks, timesheets, QHSE incidents and supply requests directly from the site sheet.'],
    ['6. HR & Payroll', 'Register your employees, track their attendance, manage leave and generate payslips. Supports CNPS contributions and local pay scales.'],
    ['7. Stock & Materials', 'Manage your materials catalog, warehouses and stock movements. Supplier purchase orders automatically feed stock upon receipt.'],
    ['8. Equipment & Machinery', 'Register your fleet and equipment. Schedule preventive maintenance, track fuel consumption and assign equipment to sites.'],
    ['9. Quotes & Invoicing', 'Create quotes from the unit price schedule, send them to clients and generate invoices in one click. PDF export available.'],
    ['10. Finance & Accounting', 'Manage your treasury, SYSCOHADA chart of accounts, journal entries, budgets and financial statements. Excel and PDF exports.'],
    ['11. HSE & Quality', 'Record safety incidents, quality controls and non-conformities. Generate HSE reports and track corrective actions.'],
    ['12. Design Office', 'Manage your unit price library, quantities, BOQ and technical studies. Link studies to projects for integrated tracking.'],
    ['13. Settings & Administration', 'Administer users and roles, set currency and language, customize active modules and manage legal pages.'],
    ['14. Support & Help', 'Access the support center from the main menu. Create a ticket, track its progress and browse the knowledge base for quick answers.'],
];
@endphp

@foreach($chapters as $ch)
<div class="page">
    <h1>{{ $ch[0] }}</h1>
    <p>{{ $ch[1] }}</p>
    @if($locale === 'fr')
    <div class="tip">
        <div class="tip-title">&#128222; Besoin d'aide ?</div>
        Contactez notre support via <strong>support@construiro.com</strong> ou ouvrez un ticket depuis l'application.
    </div>
    @else
    <div class="tip">
        <div class="tip-title">&#128222; Need help?</div>
        Contact our support at <strong>support@construiro.com</strong> or open a ticket from the application.
    </div>
    @endif
</div>
@endforeach

</body>
</html>
