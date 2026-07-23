<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AiSettingController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\PdfController;
use App\Http\Controllers\PdfListController;
use App\Http\Controllers\DocumentPdfController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\SiteIndexController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SubcontractorController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HseIncidentController;
use App\Http\Controllers\PayslipController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\QualityController;
use App\Http\Controllers\TreasuryController;
// Vague 5 — Bureau d'études
use App\Http\Controllers\UnitPriceController;
use App\Http\Controllers\TakeoffController;
use App\Http\Controllers\BoqController;
use App\Http\Controllers\StudyController;
// Vague 5 — Commercial
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\TenderController;
// Vague 5 — Parc roulant
use App\Http\Controllers\MachineryController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\FuelController;
use App\Http\Controllers\MaintenanceController;
// Vague 5 — Comptabilité
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CostAccountingController;
use App\Http\Controllers\AccountingController;
// Vague 5 — Règlements
use App\Http\Controllers\IncomingPaymentController;
use App\Http\Controllers\OutgoingPaymentController;
// Vague 5 — Labo / GED / Signature
use App\Http\Controllers\LaboratoryController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SignatureController;
// Vague 5 — BI / IA
use App\Http\Controllers\BiController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\MobileMoneyController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\PaymentGatewayController;
use App\Http\Controllers\WebhookPaymentController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboard;
use App\Http\Controllers\SuperAdmin\ClientController as SuperAdminClientController;
use App\Http\Controllers\SuperAdmin\BackupController as SuperAdminBackupController;
use App\Http\Controllers\SuperAdmin\CustomOfferController as SuperAdminCustomOfferController;
use App\Http\Controllers\SuperAdmin\ProspectController as SuperAdminProspectController;
use App\Http\Controllers\SuperAdmin\SupportSessionController;
use App\Http\Controllers\SuperAdmin\LandingController as SuperAdminLandingController;
use App\Http\Controllers\SuperAdmin\EmailTemplateController as SuperAdminEmailTemplateController;
use App\Http\Controllers\SuperAdmin\SmtpController as SuperAdminSmtpController;
use App\Http\Controllers\SuperAdmin\ChangelogController as SuperAdminChangelogController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\DemoRequestController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\AideController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\UserGuideController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\DocumentVerifyController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\AcademyController;
use App\Http\Controllers\SuperAdmin\AcademyController as SuperAdminAcademyController;
use App\Http\Controllers\ChangelogController;
use App\Http\Controllers\GlobalSearchController;
use App\Models\LandingFaq;
use App\Models\LandingTemoignage;
use App\Models\Setting;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Vérification publique de documents (QR) ────────────────────────────────
Route::get('/verify/{token}', [DocumentVerifyController::class, 'show'])->name('verify.document');

// Vérification par type + numéro (bons de commande, bulletins de paie)
Route::get('/verify/{type}/{number}', function (string $type, string $number) {
    $models = [
        'po'      => [\App\Models\PurchaseOrder::class, 'code'],
        'payslip' => [\App\Models\Payslip::class,       'id'],
    ];

    if (!isset($models[$type])) {
        abort(404);
    }

    [$modelClass, $field] = $models[$type];

    if (!class_exists($modelClass)) {
        abort(404);
    }

    $doc = $modelClass::where($field, $number)->first();

    if (!$doc) {
        return Inertia::render('Verify/NotFound', ['number' => $number]);
    }

    $typeLabels = [
        'po'      => 'Bon de commande',
        'payslip' => 'Bulletin de paie',
    ];

    return Inertia::render('Verify/Found', [
        'type'   => $typeLabels[$type] ?? $type,
        'number' => $number,
        'date'   => $doc->created_at?->format('d/m/Y'),
        'status' => $doc->status ?? 'valid',
    ]);
})->name('verify.typed');

// ─── SEO ─────────────────────────────────────────────────────────────────────
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

// ─── Pages légales publiques ────────────────────────────────────────────────
Route::get('/legal/{slug}', [LegalController::class, 'show'])->name('legal.show');
Route::post('/demo-request', [DemoRequestController::class, 'store'])->name('demo.request');

// ─── Centre d'aide public ───────────────────────────────────────────────────
Route::get('/aide',             [AideController::class, 'index'])->name('aide.index');
Route::get('/aide/{section}',   [AideController::class, 'index'])->name('aide.section')
    ->where('section', 'guide|docs|nouveautes|faq');

// ─── Guide utilisateur PDF (public) ─────────────────────────────────────────
Route::get('/guide/{locale}', [UserGuideController::class, 'download'])->name('guide.download')->where('locale', 'fr|en');
Route::redirect('/blog',   'https://ibigsoft.com', 301);
Route::redirect('/statut', 'https://ibigsoft.com', 301);

Route::get('/', function () {
    $locale = app()->getLocale();

    // Données statiques mises en cache 10 min — elles changent rarement
    $plans = Cache::remember('landing:plans', 600, fn() =>
        SubscriptionPlan::where('is_active', true)->orderBy('sort_order')->get()->map(fn($p) => [
            'id'            => $p->id,
            'name'          => $p->name,
            'description'   => $p->description,
            'price_monthly' => $p->price_monthly,
            'price_yearly'  => $p->price_yearly,
            'max_users'     => $p->max_users,
            'max_projects'  => $p->max_projects,
            'trial_days'    => $p->trial_days,
        ])->toArray()
    );

    $faqs = Cache::remember("landing:faqs:{$locale}", 600, fn() =>
        LandingFaq::active()->get()->map(fn($f) => [
            'question' => $locale === 'en' && $f->question_en ? $f->question_en : $f->question_fr,
            'answer'   => $locale === 'en' && $f->answer_en   ? $f->answer_en   : $f->answer_fr,
        ])->toArray()
    );

    $temoignages = Cache::remember("landing:temoignages:{$locale}", 600, fn() =>
        LandingTemoignage::active()->get()->map(fn($t) => [
            'initiales' => $t->initiales,
            'nom'       => $t->nom,
            'poste'     => $t->poste,
            'ville'     => $t->ville,
            'texte'     => $locale === 'en' && $t->texte_en ? $t->texte_en : $t->texte_fr,
            'rating'    => $t->rating,
        ])->toArray()
    );

    $whatsappNumber = Setting::get('footer_whatsapp', '2252722276014');

    return Inertia::render('Welcome', [
        'canLogin'        => Route::has('login'),
        'canRegister'     => Route::has('register'),
        'auth'            => ['user' => auth()->user()],
        'plans'           => $plans,
        'faqs'            => $faqs,
        'temoignages'     => $temoignages,
        'whatsapp_number' => preg_replace('/\D/', '', $whatsappNumber),
    ]);
});

// --- Changelog public (sans authentification) ----------------------------------
Route::get('/changelog', function () {
    $entries = \App\Models\Changelog::where('is_published', true)
        ->orderByDesc('published_at')
        ->get();
    return inertia('Changelog', ['entries' => $entries]);
})->name('changelog');

Route::middleware(['auth', 'verified', 'subscription', 'two-factor'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- Intégrations ----------------------------------------------------------
    Route::prefix('integrations')->name('integrations.')->middleware('can:administration.view')->group(function () {
        Route::get('/', [IntegrationController::class, 'index'])->name('index');
        Route::put('/{type}/{provider}', [IntegrationController::class, 'update'])->name('update');
        Route::post('/{type}/{provider}/test', [IntegrationController::class, 'test'])->name('test');
    });

    // --- Sauvegardes -----------------------------------------------------------
    Route::prefix('backup')->name('backup.')->middleware('can:administration.view')->group(function () {
        Route::get('/',                        [BackupController::class, 'index'])->name('index');
        Route::post('/',                       [BackupController::class, 'store'])->name('store');
        Route::get('/{filename}/download',     [BackupController::class, 'download'])->name('download');
        Route::post('/{filename}/restore',     [BackupController::class, 'restore'])->name('restore');
        Route::delete('/{filename}',           [BackupController::class, 'destroy'])->name('destroy');
    });

    // --- Paramètres société ----------------------------------------------------
    Route::prefix('settings')->name('settings.')->middleware('can:administration.view')->group(function () {
        Route::get('/',                [SettingsController::class, 'index'])->name('index');
        Route::put('/organization',    [SettingsController::class, 'updateOrganization'])->name('organization');
        Route::put('/documents',       [SettingsController::class, 'updateDocuments'])->name('documents');
        Route::put('/notifications',   [SettingsController::class, 'updateNotifications'])->name('notifications');
    });

    // --- Préférences utilisateur -----------------------------------------------
    Route::put('/preferences', [PreferencesController::class, 'update'])->name('preferences.update');

    // --- Académie / Formation --------------------------------------------------
    Route::get('/academy', [AcademyController::class, 'index'])->name('academy.index');
    Route::post('/academy/resources/{resource}/progress', [AcademyController::class, 'markProgress'])->name('academy.progress');

    // --- Changelog / Versionnement --------------------------------------------
    Route::get('/changelog', [ChangelogController::class, 'index'])->name('changelog.index');

    // --- Recherche globale -----------------------------------------------------
    Route::get('/search', [GlobalSearchController::class, 'index'])->name('search.index');

    // --- Import universel -------------------------------------------------------
    Route::prefix('import')->name('import.')->group(function () {
        Route::get('/',                      [ImportController::class, 'index'])->name('index');
        Route::post('/preview',              [ImportController::class, 'preview'])->name('preview');
        Route::post('/validate',             [ImportController::class, 'validateMapping'])->name('validate');
        Route::post('/execute',              [ImportController::class, 'execute'])->name('execute');
        // ── Flux simplifié (upload + mapping en une seule requête) ────────────
        Route::post('/run',                  [ImportController::class, 'run'])->name('run');
        // ── Téléchargement de modèle CSV ──────────────────────────────────────
        Route::get('/template/{module}',     [ImportController::class, 'template'])->name('template');
        // ── 5 imports enrichis ────────────────────────────────────────────────
        Route::post('/projects',  [ImportController::class, 'projects'])->middleware('can:projects.create')->name('projects');
        Route::post('/quotes',    [ImportController::class, 'quotes'])->middleware('can:quotes.create')->name('quotes');
        Route::post('/invoices',  [ImportController::class, 'invoices'])->middleware('can:invoicing.create')->name('invoices');
        Route::post('/stocks',    [ImportController::class, 'stocks'])->middleware('can:stocks.edit')->name('stocks');
        Route::post('/equipment', [ImportController::class, 'equipment'])->middleware('can:equipment.create')->name('equipment');
    });

    // --- Abonnement & Facturation -------------------------------------------
    Route::prefix('billing')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('billing.index');
        Route::post('/activate', [BillingController::class, 'activate'])->name('billing.activate');
    });

    // --- Billing payment (choix plan, paiement, voucher, retour passerelle) ---
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/payment', [PaymentGatewayController::class, 'index'])->name('payment.index');
        Route::post('/payment/initiate', [PaymentGatewayController::class, 'initiate'])->name('payment.initiate');
        Route::get('/payment/order/{reference}', [PaymentGatewayController::class, 'showOrder'])->name('payment.order');
        Route::post('/payment/order/{reference}/proof', [PaymentGatewayController::class, 'uploadProof'])->name('payment.proof');
        Route::get('/payment/voucher', [PaymentGatewayController::class, 'voucherPage'])->name('payment.voucher');
        Route::post('/payment/voucher/redeem', [PaymentGatewayController::class, 'redeemVoucher'])->name('payment.voucher.redeem');
        Route::get('/payment/return/{reference}', [PaymentGatewayController::class, 'gatewayReturn'])->name('payment.return');
    });

    // --- Notifications internes (cloche) ----------------------------------------
    Route::prefix('notifications')->group(function () {
        Route::get('/',                         [NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/{notification}/read',    [NotificationController::class, 'markRead'])->name('notifications.read');
        Route::post('/read-all',                [NotificationController::class, 'markAllRead'])->name('notifications.readAll');
        Route::get('/preferences',              [NotificationPreferenceController::class, 'edit'])->name('notifications.preferences.edit');
        Route::put('/preferences',              [NotificationPreferenceController::class, 'update'])->name('notifications.preferences.update');
    });

    // --- Module Projets --------------------------------------------------------
    Route::get('/projects',            [ProjectController::class, 'index'])->middleware('can:projects.view')->name('projects.index');
    Route::get('/projects/create',     [ProjectController::class, 'create'])->middleware('can:projects.create')->name('projects.create');
    Route::post('/projects',           [ProjectController::class, 'store'])->middleware('can:projects.create')->name('projects.store');
    Route::get('/projects/{project}',  [ProjectController::class, 'show'])->middleware('can:projects.view')->name('projects.show');
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->middleware('can:projects.update')->name('projects.edit');
    Route::put('/projects/{project}',  [ProjectController::class, 'update'])->middleware('can:projects.update')->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('can:projects.delete')->name('projects.destroy');

    // --- Chantiers (rattachés à un projet) -------------------------------------
    Route::post('/projects/{project}/sites',        [SiteController::class, 'store'])->middleware('can:sites.create')->name('sites.store');
    Route::put('/projects/{project}/sites/{site}',  [SiteController::class, 'update'])->middleware('can:sites.update')->name('sites.update');
    Route::delete('/projects/{project}/sites/{site}', [SiteController::class, 'destroy'])->middleware('can:sites.delete')->name('sites.destroy');

    // --- Module Devis (Bureau d'études) ----------------------------------------
    Route::get('/quotes',              [QuoteController::class, 'index'])->middleware('can:quotes.view')->name('quotes.index');
    Route::get('/quotes/create',       [QuoteController::class, 'create'])->middleware('can:quotes.create')->name('quotes.create');
    Route::post('/quotes',             [QuoteController::class, 'store'])->middleware('can:quotes.create')->name('quotes.store');
    Route::get('/quotes/{quote}',      [QuoteController::class, 'show'])->middleware('can:quotes.view')->name('quotes.show');
    Route::get('/quotes/{quote}/edit', [QuoteController::class, 'edit'])->middleware('can:quotes.update')->name('quotes.edit');
    Route::put('/quotes/{quote}',      [QuoteController::class, 'update'])->middleware('can:quotes.update')->name('quotes.update');
    Route::delete('/quotes/{quote}',   [QuoteController::class, 'destroy'])->middleware('can:quotes.delete')->name('quotes.destroy');

    // --- Module Facturation ----------------------------------------------------
    Route::get('/invoices',              [InvoiceController::class, 'index'])->middleware('can:invoicing.view')->name('invoices.index');
    Route::get('/invoices/create',       [InvoiceController::class, 'create'])->middleware('can:invoicing.create')->name('invoices.create');
    Route::post('/invoices',             [InvoiceController::class, 'store'])->middleware('can:invoicing.create')->name('invoices.store');
    Route::get('/invoices/{invoice}',    [InvoiceController::class, 'show'])->middleware('can:invoicing.view')->name('invoices.show');
    Route::get('/invoices/{invoice}/edit', [InvoiceController::class, 'edit'])->middleware('can:invoicing.update')->name('invoices.edit');
    Route::put('/invoices/{invoice}',    [InvoiceController::class, 'update'])->middleware('can:invoicing.update')->name('invoices.update');
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->middleware('can:invoicing.delete')->name('invoices.destroy');
    Route::post('/invoices/{invoice}/payment', [InvoiceController::class, 'registerPayment'])->middleware('can:invoicing.update')->name('invoices.payment');
    Route::post('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->middleware('can:invoicing.update')->name('invoices.mark-paid');
    Route::post('/invoices/{invoice}/send-email', [InvoiceController::class, 'sendEmail'])->middleware('can:invoicing.update')->name('invoices.send-email');
    Route::post('/invoices/{invoice}/mobile-money', [MobileMoneyController::class, 'initiate'])->middleware('can:invoicing.update')->name('mobile-money.initiate');

    // --- Module Matériaux ------------------------------------------------------
    Route::get('/materials',                [MaterialController::class, 'index'])->middleware('can:materials.view')->name('materials.index');
    Route::get('/materials/create',         [MaterialController::class, 'create'])->middleware('can:materials.create')->name('materials.create');
    Route::post('/materials',               [MaterialController::class, 'store'])->middleware('can:materials.create')->name('materials.store');
    Route::get('/materials/{material}',     [MaterialController::class, 'show'])->middleware('can:materials.view')->name('materials.show');
    Route::get('/materials/{material}/edit', [MaterialController::class, 'edit'])->middleware('can:materials.update')->name('materials.edit');
    Route::put('/materials/{material}',     [MaterialController::class, 'update'])->middleware('can:materials.update')->name('materials.update');
    Route::delete('/materials/{material}',  [MaterialController::class, 'destroy'])->middleware('can:materials.delete')->name('materials.destroy');

    // --- Module Magasins -------------------------------------------------------
    Route::get('/warehouses',                 [WarehouseController::class, 'index'])->middleware('can:warehouses.view')->name('warehouses.index');
    Route::get('/warehouses/create',          [WarehouseController::class, 'create'])->middleware('can:warehouses.create')->name('warehouses.create');
    Route::post('/warehouses',                [WarehouseController::class, 'store'])->middleware('can:warehouses.create')->name('warehouses.store');
    Route::get('/warehouses/{warehouse}',     [WarehouseController::class, 'show'])->middleware('can:warehouses.view')->name('warehouses.show');
    Route::get('/warehouses/{warehouse}/edit', [WarehouseController::class, 'edit'])->middleware('can:warehouses.update')->name('warehouses.edit');
    Route::put('/warehouses/{warehouse}',     [WarehouseController::class, 'update'])->middleware('can:warehouses.update')->name('warehouses.update');
    Route::delete('/warehouses/{warehouse}',  [WarehouseController::class, 'destroy'])->middleware('can:warehouses.delete')->name('warehouses.destroy');

    // --- Module Stocks (niveaux + mouvements) ----------------------------------
    Route::get('/stocks',            [StockController::class, 'index'])->middleware('can:stocks.view')->name('stocks.index');
    Route::get('/stocks/movements',  [StockController::class, 'movements'])->middleware('can:stocks.view')->name('stocks.movements');
    Route::post('/stocks/movements', [StockController::class, 'storeMovement'])->middleware('can:stocks.create')->name('stocks.movements.store');

    // --- Module Contrats -------------------------------------------------------
    Route::get('/contracts',                [ContractController::class, 'index'])->middleware('can:contracts.view')->name('contracts.index');
    Route::get('/contracts/create',         [ContractController::class, 'create'])->middleware('can:contracts.create')->name('contracts.create');
    Route::post('/contracts',               [ContractController::class, 'store'])->middleware('can:contracts.create')->name('contracts.store');
    Route::get('/contracts/{contract}',     [ContractController::class, 'show'])->middleware('can:contracts.view')->name('contracts.show');
    Route::get('/contracts/{contract}/edit', [ContractController::class, 'edit'])->middleware('can:contracts.update')->name('contracts.edit');
    Route::put('/contracts/{contract}',     [ContractController::class, 'update'])->middleware('can:contracts.update')->name('contracts.update');
    Route::delete('/contracts/{contract}',  [ContractController::class, 'destroy'])->middleware('can:contracts.delete')->name('contracts.destroy');

    // --- Module Achats (bons de commande) --------------------------------------
    Route::get('/purchases',                 [PurchaseController::class, 'index'])->middleware('can:purchases.view')->name('purchases.index');
    Route::get('/purchases/create',          [PurchaseController::class, 'create'])->middleware('can:purchases.create')->name('purchases.create');
    Route::post('/purchases',                [PurchaseController::class, 'store'])->middleware('can:purchases.create')->name('purchases.store');
    Route::get('/purchases/{purchase}',      [PurchaseController::class, 'show'])->middleware('can:purchases.view')->name('purchases.show');
    Route::get('/purchases/{purchase}/edit', [PurchaseController::class, 'edit'])->middleware('can:purchases.update')->name('purchases.edit');
    Route::put('/purchases/{purchase}',      [PurchaseController::class, 'update'])->middleware('can:purchases.update')->name('purchases.update');
    Route::delete('/purchases/{purchase}',        [PurchaseController::class, 'destroy'])->middleware('can:purchases.delete')->name('purchases.destroy');
    Route::post('/purchases/{purchase}/confirm',       [PurchaseController::class, 'confirm'])->middleware('can:purchases.update')->name('purchases.confirm');
    Route::post('/purchases/{purchase}/mark-received', [PurchaseController::class, 'markReceived'])->middleware('can:purchases.update')->name('purchases.mark-received');

    // --- Module Parc matériel --------------------------------------------------
    Route::get('/equipment',                     [EquipmentController::class, 'index'])->middleware('can:equipment.view')->name('equipment.index');
    Route::get('/equipment/create',              [EquipmentController::class, 'create'])->middleware('can:equipment.create')->name('equipment.create');
    Route::post('/equipment',                    [EquipmentController::class, 'store'])->middleware('can:equipment.create')->name('equipment.store');
    Route::get('/equipment/{equipment}',         [EquipmentController::class, 'show'])->middleware('can:equipment.view')->name('equipment.show');
    Route::get('/equipment/{equipment}/edit',    [EquipmentController::class, 'edit'])->middleware('can:equipment.update')->name('equipment.edit');
    Route::put('/equipment/{equipment}',         [EquipmentController::class, 'update'])->middleware('can:equipment.update')->name('equipment.update');
    Route::delete('/equipment/{equipment}',      [EquipmentController::class, 'destroy'])->middleware('can:equipment.delete')->name('equipment.destroy');
    Route::post('/equipment/{equipment}/maintenance', [EquipmentController::class, 'storeMaintenance'])->middleware('can:equipment.update')->name('equipment.maintenance.store');

    // --- Module Sous-traitants -------------------------------------------------
    Route::get('/subcontractors',                     [SubcontractorController::class, 'index'])->middleware('can:subcontractors.view')->name('subcontractors.index');
    Route::get('/subcontractors/create',              [SubcontractorController::class, 'create'])->middleware('can:subcontractors.create')->name('subcontractors.create');
    Route::post('/subcontractors',                    [SubcontractorController::class, 'store'])->middleware('can:subcontractors.create')->name('subcontractors.store');
    Route::get('/subcontractors/{subcontractor}',     [SubcontractorController::class, 'show'])->middleware('can:subcontractors.view')->name('subcontractors.show');
    Route::get('/subcontractors/{subcontractor}/edit', [SubcontractorController::class, 'edit'])->middleware('can:subcontractors.update')->name('subcontractors.edit');
    Route::put('/subcontractors/{subcontractor}',     [SubcontractorController::class, 'update'])->middleware('can:subcontractors.update')->name('subcontractors.update');
    Route::delete('/subcontractors/{subcontractor}',  [SubcontractorController::class, 'destroy'])->middleware('can:subcontractors.delete')->name('subcontractors.destroy');

    // --- Module Fournisseurs ---------------------------------------------------
    Route::get('/suppliers',               [SupplierController::class, 'index'])->middleware('can:suppliers.view')->name('suppliers.index');
    Route::get('/suppliers/create',        [SupplierController::class, 'create'])->middleware('can:suppliers.create')->name('suppliers.create');
    Route::post('/suppliers',              [SupplierController::class, 'store'])->middleware('can:suppliers.create')->name('suppliers.store');
    Route::get('/suppliers/{supplier}',    [SupplierController::class, 'show'])->middleware('can:suppliers.view')->name('suppliers.show');
    Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->middleware('can:suppliers.update')->name('suppliers.edit');
    Route::put('/suppliers/{supplier}',    [SupplierController::class, 'update'])->middleware('can:suppliers.update')->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->middleware('can:suppliers.delete')->name('suppliers.destroy');

    // --- Module Clients --------------------------------------------------------
    Route::get('/clients',              [ClientController::class, 'index'])->middleware('can:clients.view')->name('clients.index');
    Route::get('/clients/create',       [ClientController::class, 'create'])->middleware('can:clients.create')->name('clients.create');
    Route::post('/clients',             [ClientController::class, 'store'])->middleware('can:clients.create')->name('clients.store');
    Route::get('/clients/{client}',     [ClientController::class, 'show'])->middleware('can:clients.view')->name('clients.show');
    Route::get('/clients/{client}/edit', [ClientController::class, 'edit'])->middleware('can:clients.update')->name('clients.edit');
    Route::put('/clients/{client}',     [ClientController::class, 'update'])->middleware('can:clients.update')->name('clients.update');
    Route::delete('/clients/{client}',  [ClientController::class, 'destroy'])->middleware('can:clients.delete')->name('clients.destroy');

    // --- Administration — Utilisateurs -----------------------------------------
    Route::get('/admin/users',              [UserController::class, 'index'])->middleware('can:administration.view')->name('admin.users.index');
    Route::get('/admin/users/create',       [UserController::class, 'create'])->middleware('can:administration.create')->name('admin.users.create');
    Route::post('/admin/users',             [UserController::class, 'store'])->middleware('can:administration.create')->name('admin.users.store');
    Route::get('/admin/users/{user}/edit',  [UserController::class, 'edit'])->middleware('can:administration.update')->name('admin.users.edit');
    Route::put('/admin/users/{user}',       [UserController::class, 'update'])->middleware('can:administration.update')->name('admin.users.update');
    Route::delete('/admin/users/{user}',    [UserController::class, 'destroy'])->middleware('can:administration.delete')->name('admin.users.destroy');

    // --- Administration — Entreprise -------------------------------------------
    Route::get('/admin/company',            [CompanyController::class, 'edit'])->middleware('can:administration.view')->name('admin.company.edit');
    Route::get('/admin/audit-logs',         [AuditLogController::class, 'index'])->middleware('can:administration.view')->name('admin.audit-logs.index');
    Route::get('/admin/legal',              [LegalController::class, 'adminIndex'])->middleware('can:administration.view')->name('admin.legal.index');
    Route::get('/admin/legal/{slug}/edit',  [LegalController::class, 'adminEdit'])->middleware('can:administration.update')->name('admin.legal.edit');
    Route::put('/admin/legal/{slug}',       [LegalController::class, 'adminUpdate'])->middleware('can:administration.update')->name('admin.legal.update');
    Route::put('/admin/company',            [CompanyController::class, 'update'])->middleware('can:administration.update')->name('admin.company.update');

    // --- Administration — Paramétrage IA ---------------------------------------
    Route::get('/admin/ai-settings',       [AiSettingController::class, 'edit'])->middleware('can:administration.view')->name('admin.ai.edit');
    Route::put('/admin/ai-settings',       [AiSettingController::class, 'update'])->middleware('can:administration.update')->name('admin.ai.update');
    Route::post('/admin/ai-settings/test', [AiSettingController::class, 'test'])->middleware('can:administration.update')->name('admin.ai.test');

    // --- Console SuperAdmin IBIG Soft (accès ibig_superadmin uniquement) -------
    Route::prefix('superadmin')->middleware('superadmin')->group(function () {
        Route::get('/',                                     [SuperAdminDashboard::class, 'index'])->name('superadmin.dashboard');
        Route::get('/clients',                              [SuperAdminClientController::class, 'index'])->name('superadmin.clients.index');
        Route::get('/clients/{company}',                    [SuperAdminClientController::class, 'show'])->name('superadmin.clients.show');
        Route::post('/clients/{company}/subscription',      [SuperAdminClientController::class, 'grantSubscription'])->name('superadmin.clients.grant');
        Route::patch('/clients/{company}/toggle',           [SuperAdminClientController::class, 'toggleActive'])->name('superadmin.clients.toggle');
        Route::post('/clients/{company}/suspend',           [SuperAdminClientController::class, 'suspend'])->name('superadmin.clients.suspend');
        Route::post('/clients/{company}/reactivate',        [SuperAdminClientController::class, 'reactivate'])->name('superadmin.clients.reactivate');
        // Offres personnalisées
        Route::get('/offers',                               [SuperAdminCustomOfferController::class, 'index'])->name('superadmin.offers.index');
        Route::post('/offers',                              [SuperAdminCustomOfferController::class, 'store'])->name('superadmin.offers.store');
        Route::delete('/offers/{offer}',                    [SuperAdminCustomOfferController::class, 'destroy'])->name('superadmin.offers.destroy');
        Route::get('/prospects',                            [SuperAdminProspectController::class, 'index'])->name('superadmin.prospects.index');
        Route::patch('/prospects/{demoRequest}/status',     [SuperAdminProspectController::class, 'updateStatus'])->name('superadmin.prospects.status');
        Route::get('/support-sessions',                      [SupportSessionController::class, 'index'])->name('superadmin.support-sessions.index');
        Route::post('/support-sessions',                     [SupportSessionController::class, 'create'])->name('superadmin.support-sessions.create');
        Route::post('/support-sessions/{session}/end',       [SupportSessionController::class, 'end'])->name('superadmin.support-sessions.end');

        // Gestion des templates d'emails
        Route::get('/email-templates',                              [SuperAdminEmailTemplateController::class, 'index'])->name('superadmin.email-templates.index');
        Route::get('/email-templates/{emailTemplate}/edit',        [SuperAdminEmailTemplateController::class, 'edit'])->name('superadmin.email-templates.edit');
        Route::put('/email-templates/{emailTemplate}',             [SuperAdminEmailTemplateController::class, 'update'])->name('superadmin.email-templates.update');
        Route::get('/email-templates/{emailTemplate}/preview',     [SuperAdminEmailTemplateController::class, 'preview'])->name('superadmin.email-templates.preview');

        // Landing page management
        Route::get('/landing',                                          [SuperAdminLandingController::class, 'index'])->name('superadmin.landing.index');
        Route::post('/landing/faqs',                                    [SuperAdminLandingController::class, 'faqStore'])->name('superadmin.landing.faq.store');
        Route::patch('/landing/faqs/{faq}',                             [SuperAdminLandingController::class, 'faqUpdate'])->name('superadmin.landing.faq.update');
        Route::delete('/landing/faqs/{faq}',                            [SuperAdminLandingController::class, 'faqDestroy'])->name('superadmin.landing.faq.destroy');
        Route::post('/landing/temoignages',                             [SuperAdminLandingController::class, 'temoignageStore'])->name('superadmin.landing.temoignage.store');
        Route::patch('/landing/temoignages/{temoignage}',               [SuperAdminLandingController::class, 'temoignageUpdate'])->name('superadmin.landing.temoignage.update');
        Route::delete('/landing/temoignages/{temoignage}',              [SuperAdminLandingController::class, 'temoignageDestroy'])->name('superadmin.landing.temoignage.destroy');
        Route::post('/landing/settings',                                [SuperAdminLandingController::class, 'settingsUpdate'])->name('superadmin.landing.settings.update');
        Route::patch('/landing/legal/{legalPage}/toggle',               [SuperAdminLandingController::class, 'legalToggle'])->name('superadmin.landing.legal.toggle');
        Route::patch('/landing/plans/{plan}',                           [SuperAdminLandingController::class, 'planUpdate'])->name('superadmin.landing.plan.update');
        Route::patch('/landing/plans/{plan}/toggle',                    [SuperAdminLandingController::class, 'planToggle'])->name('superadmin.landing.plan.toggle');

        // --- Configuration SMTP ------------------------------------------------
        Route::get('/smtp',                         [SuperAdminSmtpController::class, 'show'])->name('superadmin.smtp.show');
        Route::put('/smtp',                         [SuperAdminSmtpController::class, 'update'])->name('superadmin.smtp.update');
        Route::post('/smtp/test',                   [SuperAdminSmtpController::class, 'test'])->name('superadmin.smtp.test');

        // --- Historique MRR ----------------------------------------------------
        Route::get('/mrr-history',                  [SuperAdminDashboard::class, 'mrrHistory'])->name('superadmin.mrr.history');

        // --- Gestion Changelog -------------------------------------------------
        Route::get('/changelogs',                                   [SuperAdminChangelogController::class, 'index'])->name('superadmin.changelogs.index');
        Route::get('/changelogs/create',                            [SuperAdminChangelogController::class, 'create'])->name('superadmin.changelogs.create');
        Route::post('/changelogs',                                  [SuperAdminChangelogController::class, 'store'])->name('superadmin.changelogs.store');
        Route::get('/changelogs/{changelog}/edit',                  [SuperAdminChangelogController::class, 'edit'])->name('superadmin.changelogs.edit');
        Route::put('/changelogs/{changelog}',                       [SuperAdminChangelogController::class, 'update'])->name('superadmin.changelogs.update');
        Route::delete('/changelogs/{changelog}',                    [SuperAdminChangelogController::class, 'destroy'])->name('superadmin.changelogs.destroy');
        Route::post('/changelogs/{changelog}/publish',              [SuperAdminChangelogController::class, 'publish'])->name('superadmin.changelogs.publish');

        // --- Configuration méthodes de paiement --------------------------------
        Route::get('/payment-config',                               [\App\Http\Controllers\SuperAdmin\PaymentConfigController::class, 'index'])->name('superadmin.payment-config.index');
        Route::patch('/payment-config/{type}/toggle',               [\App\Http\Controllers\SuperAdmin\PaymentConfigController::class, 'toggle'])->name('superadmin.payment-config.toggle');
        Route::put('/payment-config/{type}',                        [\App\Http\Controllers\SuperAdmin\PaymentConfigController::class, 'update'])->name('superadmin.payment-config.update');

        // --- Ordres de paiement (validation preuves) ---------------------------
        Route::get('/payment-orders',                               [\App\Http\Controllers\SuperAdmin\PaymentOrderController::class, 'index'])->name('superadmin.payment-orders.index');
        Route::get('/payment-orders/{paymentOrder}/proof',          [\App\Http\Controllers\SuperAdmin\PaymentOrderController::class, 'downloadProof'])->name('superadmin.payment-orders.proof');
        Route::post('/payment-orders/{paymentOrder}/confirm',       [\App\Http\Controllers\SuperAdmin\PaymentOrderController::class, 'confirm'])->name('superadmin.payment-orders.confirm');
        Route::post('/payment-orders/{paymentOrder}/reject',        [\App\Http\Controllers\SuperAdmin\PaymentOrderController::class, 'reject'])->name('superadmin.payment-orders.reject');

        // --- Vouchers prépayés -------------------------------------------------
        Route::get('/vouchers',                    [\App\Http\Controllers\SuperAdmin\VoucherController::class, 'index'])->name('superadmin.vouchers.index');
        Route::post('/vouchers/generate',          [\App\Http\Controllers\SuperAdmin\VoucherController::class, 'generate'])->name('superadmin.vouchers.generate');
        Route::get('/vouchers/export/{batchId}',   [\App\Http\Controllers\SuperAdmin\VoucherController::class, 'export'])->name('superadmin.vouchers.export');

        // --- Configuration IA plateforme (SARA multi-fournisseur) --------------
        Route::get('/ai-setting',  [\App\Http\Controllers\SuperAdmin\AiSettingController::class, 'edit'])->name('superadmin.ai-setting.edit');
        Route::put('/ai-setting',  [\App\Http\Controllers\SuperAdmin\AiSettingController::class, 'update'])->name('superadmin.ai-setting.update');

        // --- Journal d'utilisation IA & quotas SARA ----------------------------
        Route::get('/ai-usage', [\App\Http\Controllers\SuperAdmin\AiUsageController::class, 'index'])->name('superadmin.ai-usage.index');

        // --- Académie / Formation (CRUD contenu) --------------------------------
        Route::post('/academy/{academy}/publish',        [SuperAdminAcademyController::class, 'publish'])->name('superadmin.academy.publish');
        Route::resource('academy', SuperAdminAcademyController::class)->except(['show', 'create', 'edit'])->names([
            'index'   => 'superadmin.academy.index',
            'store'   => 'superadmin.academy.store',
            'update'  => 'superadmin.academy.update',
            'destroy' => 'superadmin.academy.destroy',
        ]);

        // --- Sauvegardes & Restauration ----------------------------------------
        Route::get('/backups',                      [SuperAdminBackupController::class, 'index'])->name('superadmin.backups.index');
        Route::post('/backups/run',                 [SuperAdminBackupController::class, 'run'])->name('superadmin.backups.run');
        Route::get('/backups/{backup}/download',    [SuperAdminBackupController::class, 'download'])->name('superadmin.backups.download');
        Route::delete('/backups/{backup}',          [SuperAdminBackupController::class, 'destroy'])->name('superadmin.backups.destroy');
    });

    // --- Guide utilisateur PDF (auth) --------------------------------------------------
    // Route moved to public section below

    // --- Onboarding post-inscription -------------------------------------------
    Route::prefix('onboarding')->group(function () {
        Route::get('/',                  [OnboardingController::class, 'index'])->name('onboarding.index');
        Route::post('/company',          [OnboardingController::class, 'saveCompany'])->name('onboarding.company');
        Route::post('/logo',             [OnboardingController::class, 'saveLogo'])->name('onboarding.logo');
        Route::post('/settings',         [OnboardingController::class, 'saveSettings'])->name('onboarding.settings');
        Route::post('/complete',         [OnboardingController::class, 'complete'])->name('onboarding.complete');
    });

    // --- Centre de support -----------------------------------------------------
    Route::prefix('support')->group(function () {
        Route::get('/',                         [SupportController::class, 'index'])->name('support.index');
        Route::get('/create',                   [SupportController::class, 'create'])->name('support.create');
        Route::post('/',                        [SupportController::class, 'store'])->name('support.store');
        Route::get('/{ticket}',                 [SupportController::class, 'show'])->name('support.show');
        Route::post('/{ticket}/reply',          [SupportController::class, 'reply'])->name('support.reply');
        Route::post('/{ticket}/close',          [SupportController::class, 'close'])->name('support.close');
        Route::post('/{ticket}/message',        [SupportController::class, 'addMessage'])->name('support.message');
        Route::patch('/{ticket}/status',        [SupportController::class, 'updateStatus'])->name('support.status');
        Route::post('/{ticket}/reopen',         [SupportController::class, 'reopen'])->name('support.reopen');
    });

    // --- Module RH — Employés --------------------------------------------------
    Route::get('/hr',                [EmployeeController::class, 'index'])->middleware('can:hr.view')->name('hr.index');
    Route::get('/hr/create',         [EmployeeController::class, 'create'])->middleware('can:hr.create')->name('hr.create');
    Route::post('/hr',               [EmployeeController::class, 'store'])->middleware('can:hr.create')->name('hr.store');
    Route::get('/hr/{employee}',     [EmployeeController::class, 'show'])->middleware('can:hr.view')->name('hr.show');
    Route::get('/hr/{employee}/edit', [EmployeeController::class, 'edit'])->middleware('can:hr.update')->name('hr.edit');
    Route::put('/hr/{employee}',     [EmployeeController::class, 'update'])->middleware('can:hr.update')->name('hr.update');
    Route::delete('/hr/{employee}',  [EmployeeController::class, 'destroy'])->middleware('can:hr.delete')->name('hr.destroy');

    // --- Module Pointage -------------------------------------------------------
    Route::get('/attendance',                         [AttendanceController::class, 'index'])->middleware('can:attendance.view')->name('attendance.index');
    Route::post('/attendance',                        [AttendanceController::class, 'store'])->middleware('can:attendance.create')->name('attendance.store');
    Route::get('/attendance/{attendance}/edit',       [AttendanceController::class, 'edit'])->middleware('can:attendance.update')->name('attendance.edit');
    Route::put('/attendance/{attendance}',            [AttendanceController::class, 'update'])->middleware('can:attendance.update')->name('attendance.update');
    Route::delete('/attendance/{attendance}',         [AttendanceController::class, 'destroy'])->middleware('can:attendance.delete')->name('attendance.destroy');

    // --- Module Paie -----------------------------------------------------------
    Route::get('/payroll',                   [PayslipController::class, 'index'])->middleware('can:payroll.view')->name('payroll.index');
    Route::post('/payroll',                  [PayslipController::class, 'store'])->middleware('can:payroll.create')->name('payroll.store');
    Route::post('/payroll/generate',         [PayslipController::class, 'generateAll'])->middleware('can:payroll.create')->name('payroll.generate');
    Route::post('/payroll/{payslip}/status', [PayslipController::class, 'updateStatus'])->middleware('can:payroll.update')->name('payroll.status');
    Route::delete('/payroll/{payslip}',      [PayslipController::class, 'destroy'])->middleware('can:payroll.delete')->name('payroll.destroy');

    // --- Module Planning & Gantt -----------------------------------------------
    Route::get('/planning',          [PlanningController::class, 'index'])->middleware('can:planning.view')->name('planning.index');
    Route::post('/planning',         [PlanningController::class, 'store'])->middleware('can:planning.create')->name('planning.store');
    Route::put('/planning/{task}',   [PlanningController::class, 'update'])->middleware('can:planning.update')->name('planning.update');
    Route::delete('/planning/{task}', [PlanningController::class, 'destroy'])->middleware('can:planning.delete')->name('planning.destroy');

    // --- Module Trésorerie -----------------------------------------------------
    Route::get('/treasury',                                        [TreasuryController::class, 'index'])->middleware('can:treasury.view')->name('treasury.index');
    Route::post('/treasury/accounts',                              [TreasuryController::class, 'storeAccount'])->middleware('can:treasury.create')->name('treasury.accounts.store');
    Route::get('/treasury/accounts/{account}',                     [TreasuryController::class, 'showAccount'])->middleware('can:treasury.view')->name('treasury.accounts.show');
    Route::post('/treasury/transactions',                          [TreasuryController::class, 'storeTransaction'])->middleware('can:treasury.create')->name('treasury.transactions.store');
    Route::get('/treasury/transactions/{transaction}/edit',        [TreasuryController::class, 'edit'])->middleware('can:treasury.update')->name('treasury.transactions.edit');
    Route::put('/treasury/transactions/{transaction}',             [TreasuryController::class, 'update'])->middleware('can:treasury.update')->name('treasury.transactions.update');
    Route::delete('/treasury/transactions/{transaction}',          [TreasuryController::class, 'destroy'])->middleware('can:treasury.delete')->name('treasury.transactions.destroy');

    // --- Module QHSE (incidents / sécurité) ------------------------------------
    Route::get('/hse',            [HseIncidentController::class, 'index'])->middleware('can:qhse.view')->name('hse.index');
    Route::get('/hse/create',     [HseIncidentController::class, 'create'])->middleware('can:qhse.create')->name('hse.create');
    Route::post('/hse',           [HseIncidentController::class, 'store'])->middleware('can:qhse.create')->name('hse.store');
    Route::get('/hse/{hse}',      [HseIncidentController::class, 'show'])->middleware('can:qhse.view')->name('hse.show');
    Route::get('/hse/{hse}/edit', [HseIncidentController::class, 'edit'])->middleware('can:qhse.update')->name('hse.edit');
    Route::put('/hse/{hse}',      [HseIncidentController::class, 'update'])->middleware('can:qhse.update')->name('hse.update');
    Route::delete('/hse/{hse}',   [HseIncidentController::class, 'destroy'])->middleware('can:qhse.delete')->name('hse.destroy');

    // --- Module Qualité (contrôles) --------------------------------------------
    Route::get('/quality',                [QualityController::class, 'index'])->middleware('can:quality.view')->name('quality.index');
    Route::get('/quality/create',         [QualityController::class, 'create'])->middleware('can:quality.create')->name('quality.create');
    Route::post('/quality',               [QualityController::class, 'store'])->middleware('can:quality.create')->name('quality.store');
    Route::get('/quality/{quality}',      [QualityController::class, 'show'])->middleware('can:quality.view')->name('quality.show');
    Route::get('/quality/{quality}/edit', [QualityController::class, 'edit'])->middleware('can:quality.update')->name('quality.edit');
    Route::put('/quality/{quality}',      [QualityController::class, 'update'])->middleware('can:quality.update')->name('quality.update');
    Route::delete('/quality/{quality}',   [QualityController::class, 'destroy'])->middleware('can:quality.delete')->name('quality.destroy');

    // ===================== VAGUE 5 =====================

    // --- Bureau d'études : BPU, Métré, DQE, Registre (module:design_office) -----
    Route::middleware('module:design_office')->group(function () {
        Route::get('/unit-prices',                  [UnitPriceController::class, 'index'])->middleware('can:unit_prices.view')->name('unit_prices.index');
        Route::get('/unit-prices/create',           [UnitPriceController::class, 'create'])->middleware('can:unit_prices.create')->name('unit_prices.create');
        Route::post('/unit-prices',                 [UnitPriceController::class, 'store'])->middleware('can:unit_prices.create')->name('unit_prices.store');
        Route::get('/unit-prices/{unitPrice}',      [UnitPriceController::class, 'show'])->middleware('can:unit_prices.view')->name('unit_prices.show');
        Route::get('/unit-prices/{unitPrice}/edit', [UnitPriceController::class, 'edit'])->middleware('can:unit_prices.update')->name('unit_prices.edit');
        Route::put('/unit-prices/{unitPrice}',      [UnitPriceController::class, 'update'])->middleware('can:unit_prices.update')->name('unit_prices.update');
        Route::delete('/unit-prices/{unitPrice}',   [UnitPriceController::class, 'destroy'])->middleware('can:unit_prices.delete')->name('unit_prices.destroy');

        Route::get('/takeoff',                [TakeoffController::class, 'index'])->middleware('can:takeoff.view')->name('takeoff.index');
        Route::get('/takeoff/create',         [TakeoffController::class, 'create'])->middleware('can:takeoff.create')->name('takeoff.create');
        Route::post('/takeoff',               [TakeoffController::class, 'store'])->middleware('can:takeoff.create')->name('takeoff.store');
        Route::get('/takeoff/{takeoff}',      [TakeoffController::class, 'show'])->middleware('can:takeoff.view')->name('takeoff.show');
        Route::get('/takeoff/{takeoff}/edit', [TakeoffController::class, 'edit'])->middleware('can:takeoff.update')->name('takeoff.edit');
        Route::put('/takeoff/{takeoff}',      [TakeoffController::class, 'update'])->middleware('can:takeoff.update')->name('takeoff.update');
        Route::delete('/takeoff/{takeoff}',   [TakeoffController::class, 'destroy'])->middleware('can:takeoff.delete')->name('takeoff.destroy');

        Route::get('/boq',              [BoqController::class, 'index'])->middleware('can:boq.view')->name('boq.index');
        Route::get('/boq/create',       [BoqController::class, 'create'])->middleware('can:boq.create')->name('boq.create');
        Route::post('/boq',             [BoqController::class, 'store'])->middleware('can:boq.create')->name('boq.store');
        Route::get('/boq/{boq}',        [BoqController::class, 'show'])->middleware('can:boq.view')->name('boq.show');
        Route::get('/boq/{boq}/edit',   [BoqController::class, 'edit'])->middleware('can:boq.update')->name('boq.edit');
        Route::put('/boq/{boq}',        [BoqController::class, 'update'])->middleware('can:boq.update')->name('boq.update');
        Route::delete('/boq/{boq}',     [BoqController::class, 'destroy'])->middleware('can:boq.delete')->name('boq.destroy');

        Route::get('/design-office',              [StudyController::class, 'index'])->middleware('can:design_office.view')->name('studies.index');
        Route::get('/design-office/create',       [StudyController::class, 'create'])->middleware('can:design_office.create')->name('studies.create');
        Route::post('/design-office',             [StudyController::class, 'store'])->middleware('can:design_office.create')->name('studies.store');
        Route::get('/design-office/{study}',      [StudyController::class, 'show'])->middleware('can:design_office.view')->name('studies.show');
        Route::get('/design-office/{study}/edit', [StudyController::class, 'edit'])->middleware('can:design_office.update')->name('studies.edit');
        Route::put('/design-office/{study}',      [StudyController::class, 'update'])->middleware('can:design_office.update')->name('studies.update');
        Route::delete('/design-office/{study}',   [StudyController::class, 'destroy'])->middleware('can:design_office.delete')->name('studies.destroy');
    });

    // --- CRM : Opportunités + Appels d'offres (module:crm) --------------------
    Route::middleware('module:crm')->group(function () {
        Route::get('/crm',                    [OpportunityController::class, 'index'])->middleware('can:crm.view')->name('crm.index');
        Route::get('/crm/create',             [OpportunityController::class, 'create'])->middleware('can:crm.create')->name('crm.create');
        Route::post('/crm',                   [OpportunityController::class, 'store'])->middleware('can:crm.create')->name('crm.store');
        Route::get('/crm/{opportunity}',      [OpportunityController::class, 'show'])->middleware('can:crm.view')->name('crm.show');
        Route::get('/crm/{opportunity}/edit', [OpportunityController::class, 'edit'])->middleware('can:crm.update')->name('crm.edit');
        Route::put('/crm/{opportunity}',      [OpportunityController::class, 'update'])->middleware('can:crm.update')->name('crm.update');
        Route::delete('/crm/{opportunity}',   [OpportunityController::class, 'destroy'])->middleware('can:crm.delete')->name('crm.destroy');

        Route::get('/tenders',               [TenderController::class, 'index'])->middleware('can:tenders.view')->name('tenders.index');
        Route::get('/tenders/create',        [TenderController::class, 'create'])->middleware('can:tenders.create')->name('tenders.create');
        Route::post('/tenders',              [TenderController::class, 'store'])->middleware('can:tenders.create')->name('tenders.store');
        Route::get('/tenders/{tender}',      [TenderController::class, 'show'])->middleware('can:tenders.view')->name('tenders.show');
        Route::get('/tenders/{tender}/edit', [TenderController::class, 'edit'])->middleware('can:tenders.update')->name('tenders.edit');
        Route::put('/tenders/{tender}',      [TenderController::class, 'update'])->middleware('can:tenders.update')->name('tenders.update');
        Route::delete('/tenders/{tender}',   [TenderController::class, 'destroy'])->middleware('can:tenders.delete')->name('tenders.destroy');
    });

    // --- Engins / Véhicules (vues filtrées du parc) ----------------------------
    Route::get('/machinery',             [MachineryController::class, 'index'])->middleware('can:machinery.view')->name('machinery.index');
    Route::get('/machinery/{equipment}', [MachineryController::class, 'show'])->middleware('can:machinery.view')->name('machinery.show');
    Route::get('/vehicles',              [VehicleController::class, 'index'])->middleware('can:vehicles.view')->name('vehicles.index');
    Route::get('/vehicles/{equipment}',  [VehicleController::class, 'show'])->middleware('can:vehicles.view')->name('vehicles.show');

    // --- Carburant / Maintenance -----------------------------------------------
    Route::get('/fuel',                      [FuelController::class, 'index'])->middleware('can:fuel.view')->name('fuel.index');
    Route::post('/fuel',                     [FuelController::class, 'storeLog'])->middleware('can:fuel.create')->name('fuel.store');
    Route::get('/fuel/{fuelLog}/edit',       [FuelController::class, 'edit'])->middleware('can:fuel.update')->name('fuel.edit');
    Route::put('/fuel/{fuelLog}',            [FuelController::class, 'update'])->middleware('can:fuel.update')->name('fuel.update');
    Route::delete('/fuel/{fuelLog}',         [FuelController::class, 'destroy'])->middleware('can:fuel.delete')->name('fuel.destroy');

    Route::get('/maintenance',                            [MaintenanceController::class, 'index'])->middleware('can:maintenance.view')->name('maintenance.index');
    Route::post('/maintenance',                           [MaintenanceController::class, 'store'])->middleware('can:maintenance.create')->name('maintenance.store');
    Route::get('/maintenance/{maintenanceRecord}',        [MaintenanceController::class, 'show'])->middleware('can:maintenance.view')->name('maintenance.show');
    Route::get('/maintenance/{maintenanceRecord}/edit',   [MaintenanceController::class, 'edit'])->middleware('can:maintenance.update')->name('maintenance.edit');
    Route::put('/maintenance/{maintenanceRecord}',        [MaintenanceController::class, 'update'])->middleware('can:maintenance.update')->name('maintenance.update');
    Route::delete('/maintenance/{maintenanceRecord}',     [MaintenanceController::class, 'destroy'])->middleware('can:maintenance.delete')->name('maintenance.destroy');

    // --- Budget ----------------------------------------------------------------
    Route::get('/budget',               [BudgetController::class, 'index'])->middleware('can:budget.view')->name('budget.index');
    Route::get('/budget/create',        [BudgetController::class, 'create'])->middleware('can:budget.create')->name('budget.create');
    Route::post('/budget',              [BudgetController::class, 'store'])->middleware('can:budget.create')->name('budget.store');
    Route::get('/budget/{budget}',      [BudgetController::class, 'show'])->middleware('can:budget.view')->name('budget.show');
    Route::get('/budget/{budget}/edit', [BudgetController::class, 'edit'])->middleware('can:budget.update')->name('budget.edit');
    Route::put('/budget/{budget}',      [BudgetController::class, 'update'])->middleware('can:budget.update')->name('budget.update');
    Route::delete('/budget/{budget}',   [BudgetController::class, 'destroy'])->middleware('can:budget.delete')->name('budget.destroy');

    // --- Comptabilité analytique -----------------------------------------------
    Route::get('/cost-accounting',                       [CostAccountingController::class, 'index'])->middleware('can:cost_accounting.view')->name('cost_accounting.index');
    Route::post('/cost-accounting',                      [CostAccountingController::class, 'store'])->middleware('can:cost_accounting.create')->name('cost_accounting.store');
    Route::get('/cost-accounting/{costEntry}/edit',      [CostAccountingController::class, 'edit'])->middleware('can:cost_accounting.update')->name('cost_accounting.edit');
    Route::put('/cost-accounting/{costEntry}',           [CostAccountingController::class, 'update'])->middleware('can:cost_accounting.update')->name('cost_accounting.update');

    // --- Comptabilité générale (journal SYSCOHADA) -----------------------------
    Route::get('/accounting',                            [AccountingController::class, 'index'])->middleware('can:accounting.view')->name('accounting.index');
    Route::get('/accounting/accounts',                   [AccountingController::class, 'accounts'])->middleware('can:accounting.view')->name('accounting.accounts');
    Route::post('/accounting/accounts',                  [AccountingController::class, 'storeAccount'])->middleware('can:accounting.create')->name('accounting.accounts.store');
    Route::post('/accounting',                           [AccountingController::class, 'store'])->middleware('can:accounting.create')->name('accounting.store');
    Route::get('/accounting/{journalEntry}/edit',        [AccountingController::class, 'edit'])->middleware('can:accounting.update')->name('accounting.edit');
    Route::put('/accounting/{journalEntry}',             [AccountingController::class, 'update'])->middleware('can:accounting.update')->name('accounting.update');
    Route::delete('/accounting/{entry}',                 [AccountingController::class, 'destroy'])->middleware('can:accounting.delete')->name('accounting.destroy');

    // --- Encaissements ---------------------------------------------------------
    Route::get('/incoming-payments',                        [IncomingPaymentController::class, 'index'])->middleware('can:incoming_payments.view')->name('incoming-payments.index');
    Route::get('/incoming-payments/create',                 [IncomingPaymentController::class, 'create'])->middleware('can:incoming_payments.create')->name('incoming-payments.create');
    Route::post('/incoming-payments',                       [IncomingPaymentController::class, 'store'])->middleware('can:incoming_payments.create')->name('incoming-payments.store');
    Route::get('/incoming-payments/{incomingPayment}',      [IncomingPaymentController::class, 'show'])->middleware('can:incoming_payments.view')->name('incoming-payments.show');
    Route::get('/incoming-payments/{incomingPayment}/edit', [IncomingPaymentController::class, 'edit'])->middleware('can:incoming_payments.update')->name('incoming-payments.edit');
    Route::put('/incoming-payments/{incomingPayment}',      [IncomingPaymentController::class, 'update'])->middleware('can:incoming_payments.update')->name('incoming-payments.update');
    Route::delete('/incoming-payments/{incomingPayment}',   [IncomingPaymentController::class, 'destroy'])->middleware('can:incoming_payments.delete')->name('incoming-payments.destroy');

    // --- Décaissements ---------------------------------------------------------
    Route::get('/outgoing-payments',                        [OutgoingPaymentController::class, 'index'])->middleware('can:outgoing_payments.view')->name('outgoing-payments.index');
    Route::get('/outgoing-payments/create',                 [OutgoingPaymentController::class, 'create'])->middleware('can:outgoing_payments.create')->name('outgoing-payments.create');
    Route::post('/outgoing-payments',                       [OutgoingPaymentController::class, 'store'])->middleware('can:outgoing_payments.create')->name('outgoing-payments.store');
    Route::get('/outgoing-payments/{outgoingPayment}',      [OutgoingPaymentController::class, 'show'])->middleware('can:outgoing_payments.view')->name('outgoing-payments.show');
    Route::get('/outgoing-payments/{outgoingPayment}/edit', [OutgoingPaymentController::class, 'edit'])->middleware('can:outgoing_payments.update')->name('outgoing-payments.edit');
    Route::put('/outgoing-payments/{outgoingPayment}',      [OutgoingPaymentController::class, 'update'])->middleware('can:outgoing_payments.update')->name('outgoing-payments.update');
    Route::delete('/outgoing-payments/{outgoingPayment}',   [OutgoingPaymentController::class, 'destroy'])->middleware('can:outgoing_payments.delete')->name('outgoing-payments.destroy');

    // --- Laboratoire (module:laboratory) --------------------------------------
    Route::middleware('module:laboratory')->group(function () {
        Route::get('/laboratory',                   [LaboratoryController::class, 'index'])->middleware('can:laboratory.view')->name('laboratory.index');
        Route::get('/laboratory/create',            [LaboratoryController::class, 'create'])->middleware('can:laboratory.create')->name('laboratory.create');
        Route::post('/laboratory',                  [LaboratoryController::class, 'store'])->middleware('can:laboratory.create')->name('laboratory.store');
        Route::get('/laboratory/{laboratory}',      [LaboratoryController::class, 'show'])->middleware('can:laboratory.view')->name('laboratory.show');
        Route::get('/laboratory/{laboratory}/edit', [LaboratoryController::class, 'edit'])->middleware('can:laboratory.update')->name('laboratory.edit');
        Route::put('/laboratory/{laboratory}',      [LaboratoryController::class, 'update'])->middleware('can:laboratory.update')->name('laboratory.update');
        Route::delete('/laboratory/{laboratory}',   [LaboratoryController::class, 'destroy'])->middleware('can:laboratory.delete')->name('laboratory.destroy');
    });

    // --- GED (documents) -------------------------------------------------------
    Route::get('/documents',                [DocumentController::class, 'index'])->middleware('can:documents.view')->name('documents.index');
    Route::get('/documents/create',         [DocumentController::class, 'create'])->middleware('can:documents.create')->name('documents.create');
    Route::post('/documents',               [DocumentController::class, 'store'])->middleware('can:documents.create')->name('documents.store');
    Route::get('/documents/{document}',     [DocumentController::class, 'show'])->middleware('can:documents.view')->name('documents.show');
    Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])->middleware('can:documents.update')->name('documents.edit');
    Route::put('/documents/{document}',     [DocumentController::class, 'update'])->middleware('can:documents.update')->name('documents.update');
    Route::delete('/documents/{document}',  [DocumentController::class, 'destroy'])->middleware('can:documents.delete')->name('documents.destroy');

    // --- Signature électronique (module:e_signature) --------------------------
    // /sign reste accessible aux signataires externes (sans module check)
    Route::post('/sign/{model}/{id}', [SignatureController::class, 'sign'])->middleware('can:e_signature.create')->name('signature.sign');
    Route::middleware('module:e_signature')->group(function () {
        Route::get('/e-signature',                            [SignatureController::class, 'index'])->middleware('can:e_signature.view')->name('e_signature.index');
        Route::post('/e-signature',                           [SignatureController::class, 'store'])->middleware('can:e_signature.create')->name('e_signature.store');
        Route::post('/e-signature/{signatureRequest}/status', [SignatureController::class, 'updateStatus'])->middleware('can:e_signature.update')->name('e_signature.status');
    });

    // --- BI & Rapports (module:bi) ---------------------------------------------
    Route::middleware('module:bi')->group(function () {
        Route::get('/bi',      [BiController::class, 'index'])->middleware('can:bi.view')->name('bi.index');
        Route::get('/bi/pdf',  [BiController::class, 'pdf'])->middleware('can:reports.view')->name('bi.pdf');
        Route::get('/reports', [ReportController::class, 'index'])->middleware('can:reports.view')->name('reports.index');
    });

    // --- Assistant IA (module:ai) ----------------------------------------------
    Route::middleware('module:ai')->group(function () {
        Route::get('/ai',      [AiAssistantController::class, 'index'])->middleware('can:ai.view')->name('ai.index');
        Route::post('/ai/ask', [AiAssistantController::class, 'ask'])->middleware('can:ai.view')->name('ai.ask');
    });

    // --- Exports PDF (documents professionnels) --------------------------------
    Route::get('/quotes/{quote}/pdf',         [PdfController::class, 'quote'])->middleware('can:quotes.view')->name('quotes.pdf');
    Route::get('/invoices/{invoice}/pdf',     [PdfController::class, 'invoice'])->middleware('can:invoicing.view')->name('invoices.pdf');
    Route::get('/purchases/{purchase}/pdf',   [PdfController::class, 'purchase'])->middleware('can:purchases.view')->name('purchases.pdf');
    Route::get('/payroll/{payslip}/pdf',      [DocumentPdfController::class, 'payslip'])->middleware('can:payroll.view')->name('payroll.pdf');
    Route::get('/boq/{boq}/pdf',             [DocumentPdfController::class, 'boq'])->middleware('can:boq.view')->name('boq.pdf');
    Route::get('/projects/{project}/pdf',    [PdfController::class, 'project'])->middleware('can:projects.view')->name('projects.pdf');
    Route::get('/clients/{client}/pdf',      [PdfController::class, 'client'])->middleware('can:clients.view')->name('clients.pdf');
    Route::get('/hr/{employee}/pdf',         [PdfController::class, 'employee'])->middleware('can:hr.view')->name('hr.pdf');
    Route::get('/contracts/{contract}/pdf',  [PdfController::class, 'contract'])->middleware('can:contracts.view')->name('contracts.pdf');

    // --- Exports PDF (listes modules) — moteur adaptatif ----------------------
    Route::get('/pdf/projects',   [PdfListController::class, 'projects'])->middleware('can:projects.view')->name('pdf.list.projects');
    Route::get('/pdf/clients',    [PdfListController::class, 'clients'])->middleware('can:clients.view')->name('pdf.list.clients');
    Route::get('/pdf/quotes',     [PdfListController::class, 'quotes'])->middleware('can:quotes.view')->name('pdf.list.quotes');
    Route::get('/pdf/invoices',   [PdfListController::class, 'invoices'])->middleware('can:invoicing.view')->name('pdf.list.invoices');
    Route::get('/pdf/employees',  [PdfListController::class, 'employees'])->middleware('can:hr.view')->name('pdf.list.employees');
    Route::get('/pdf/contracts',  [PdfListController::class, 'contracts'])->middleware('can:contracts.view')->name('pdf.list.contracts');
    Route::get('/pdf/stocks',         [PdfListController::class, 'stocks'])->middleware('can:stocks.view')->name('pdf.list.stocks');
    Route::get('/pdf/suppliers',      [PdfListController::class, 'suppliers'])->middleware('can:suppliers.view')->name('pdf.list.suppliers');
    Route::get('/pdf/subcontractors', [PdfListController::class, 'subcontractors'])->middleware('can:subcontractors.view')->name('pdf.list.subcontractors');
    Route::get('/pdf/equipment',      [PdfListController::class, 'equipment'])->middleware('can:equipment.view')->name('pdf.list.equipment');
    Route::get('/pdf/purchases',      [PdfListController::class, 'purchases'])->middleware('can:purchases.view')->name('pdf.list.purchases');
    Route::get('/pdf/budgets',        [PdfListController::class, 'budgets'])->middleware('can:budget.view')->name('pdf.list.budgets');
    Route::get('/pdf/treasury',       [PdfListController::class, 'treasury'])->middleware('can:treasury.view')->name('pdf.list.treasury');
    Route::get('/pdf/payslips',       [PdfListController::class, 'payslips'])->middleware('can:payroll.view')->name('pdf.list.payslips');

    // --- Chantiers (vue transversale) ------------------------------------------
    Route::get('/sites',        [SiteIndexController::class, 'index'])->middleware('can:sites.view')->name('sites.index');
    Route::get('/sites/{site}', [SiteIndexController::class, 'show'])->middleware('can:sites.view')->name('sites.overview.show');

    // --- Exports Excel (.xlsx) --------------------------------------------------
    Route::get('/export/projects',   [ExportController::class, 'projects'])->middleware('can:projects.export')->name('export.projects');
    Route::get('/export/invoices',   [ExportController::class, 'invoices'])->middleware('can:invoicing.export')->name('export.invoices');
    Route::get('/export/quotes',     [ExportController::class, 'quotes'])->middleware('can:quotes.view')->name('export.quotes');
    Route::get('/export/clients',    [ExportController::class, 'clients'])->middleware('can:clients.export')->name('export.clients');
    Route::get('/export/employees',  [ExportController::class, 'employees'])->middleware('can:hr.export')->name('export.employees');
    Route::get('/export/contracts',  [ExportController::class, 'contracts'])->middleware('can:contracts.view')->name('export.contracts');
    Route::get('/export/stocks',          [ExportController::class, 'stocks'])->middleware('can:stocks.export')->name('export.stocks');
    Route::get('/export/suppliers',       [ExportController::class, 'suppliers'])->middleware('can:suppliers.view')->name('export.suppliers');
    Route::get('/export/subcontractors',  [ExportController::class, 'subcontractors'])->middleware('can:subcontractors.view')->name('export.subcontractors');
    Route::get('/export/equipment',       [ExportController::class, 'equipment'])->middleware('can:equipment.view')->name('export.equipment');
    Route::get('/export/purchases',       [ExportController::class, 'purchases'])->middleware('can:purchases.view')->name('export.purchases');
    Route::get('/export/budgets',         [ExportController::class, 'budgets'])->middleware('can:budget.view')->name('export.budgets');
    Route::get('/export/treasury',        [ExportController::class, 'treasury'])->middleware('can:treasury.view')->name('export.treasury');
    Route::get('/export/payslips',        [ExportController::class, 'payslips'])->middleware('can:hr.export')->name('export.payslips');

    // --- GED : téléchargement de fichier ---------------------------------------
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->middleware('can:documents.view')->name('documents.download');

    // Portail unique : accès générique aux modules non encore développés.
    Route::get('/app/{module}', [ModuleController::class, 'show'])->name('module.show');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Changement de langue — GET et POST acceptés (GET = sans CSRF pour window.location.href).
Route::match(['GET', 'POST'], '/locale/{locale}', [LocaleController::class, 'update'])->name('locale.update');

// --- Webhooks Mobile Money (publics — hors CSRF et auth) -------------------
Route::post('/webhooks/mobile-money/{operator}', [MobileMoneyController::class, 'webhook'])
    ->name('mobile-money.webhook')
    ->withoutMiddleware(['App\Http\Middleware\VerifyCsrfToken']);

// --- Webhooks paiement (publics, CSRF exempt via bootstrap/app.php) --------
Route::prefix('webhooks')->name('webhooks.')->group(function () {
    Route::post('/cinetpay', [WebhookPaymentController::class, 'cinetpay'])->name('cinetpay');
});

require __DIR__.'/auth.php';
