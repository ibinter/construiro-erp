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
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboard;
use App\Http\Controllers\SuperAdmin\ClientController as SuperAdminClientController;
use App\Http\Controllers\SuperAdmin\ProspectController as SuperAdminProspectController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\LegalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Pages légales publiques ────────────────────────────────────────────────
Route::get('/legal/{slug}', [LegalController::class, 'show'])->name('legal.show');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
        'auth'        => ['user' => auth()->user()],
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- Abonnement & Facturation -------------------------------------------
    Route::prefix('billing')->middleware('subscription')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('billing.index');
        Route::post('/activate', [BillingController::class, 'activate'])->name('billing.activate');
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
    Route::delete('/purchases/{purchase}',   [PurchaseController::class, 'destroy'])->middleware('can:purchases.delete')->name('purchases.destroy');

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
        Route::get('/prospects',                            [SuperAdminProspectController::class, 'index'])->name('superadmin.prospects.index');
        Route::patch('/prospects/{demoRequest}/status',     [SuperAdminProspectController::class, 'updateStatus'])->name('superadmin.prospects.status');
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
    Route::get('/attendance',  [AttendanceController::class, 'index'])->middleware('can:attendance.view')->name('attendance.index');
    Route::post('/attendance', [AttendanceController::class, 'store'])->middleware('can:attendance.create')->name('attendance.store');

    // --- Module Paie -----------------------------------------------------------
    Route::get('/payroll',                 [PayslipController::class, 'index'])->middleware('can:payroll.view')->name('payroll.index');
    Route::post('/payroll',                [PayslipController::class, 'store'])->middleware('can:payroll.create')->name('payroll.store');
    Route::post('/payroll/generate',         [PayslipController::class, 'generateAll'])->middleware('can:payroll.create')->name('payroll.generate');
    Route::post('/payroll/{payslip}/status', [PayslipController::class, 'updateStatus'])->middleware('can:payroll.update')->name('payroll.status');

    // --- Module Planning & Gantt -----------------------------------------------
    Route::get('/planning',          [PlanningController::class, 'index'])->middleware('can:planning.view')->name('planning.index');
    Route::post('/planning',         [PlanningController::class, 'store'])->middleware('can:planning.create')->name('planning.store');
    Route::put('/planning/{task}',   [PlanningController::class, 'update'])->middleware('can:planning.update')->name('planning.update');
    Route::delete('/planning/{task}', [PlanningController::class, 'destroy'])->middleware('can:planning.delete')->name('planning.destroy');

    // --- Module Trésorerie -----------------------------------------------------
    Route::get('/treasury',                     [TreasuryController::class, 'index'])->middleware('can:treasury.view')->name('treasury.index');
    Route::post('/treasury/accounts',           [TreasuryController::class, 'storeAccount'])->middleware('can:treasury.create')->name('treasury.accounts.store');
    Route::get('/treasury/accounts/{account}',  [TreasuryController::class, 'showAccount'])->middleware('can:treasury.view')->name('treasury.accounts.show');
    Route::post('/treasury/transactions',       [TreasuryController::class, 'storeTransaction'])->middleware('can:treasury.create')->name('treasury.transactions.store');

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

    // --- BPU (bibliothèque de prix unitaires) ----------------------------------
    Route::get('/unit-prices',                  [UnitPriceController::class, 'index'])->middleware('can:unit_prices.view')->name('unit_prices.index');
    Route::get('/unit-prices/create',           [UnitPriceController::class, 'create'])->middleware('can:unit_prices.create')->name('unit_prices.create');
    Route::post('/unit-prices',                 [UnitPriceController::class, 'store'])->middleware('can:unit_prices.create')->name('unit_prices.store');
    Route::get('/unit-prices/{unitPrice}',      [UnitPriceController::class, 'show'])->middleware('can:unit_prices.view')->name('unit_prices.show');
    Route::get('/unit-prices/{unitPrice}/edit', [UnitPriceController::class, 'edit'])->middleware('can:unit_prices.update')->name('unit_prices.edit');
    Route::put('/unit-prices/{unitPrice}',      [UnitPriceController::class, 'update'])->middleware('can:unit_prices.update')->name('unit_prices.update');
    Route::delete('/unit-prices/{unitPrice}',   [UnitPriceController::class, 'destroy'])->middleware('can:unit_prices.delete')->name('unit_prices.destroy');

    // --- Métré -----------------------------------------------------------------
    Route::get('/takeoff',                [TakeoffController::class, 'index'])->middleware('can:takeoff.view')->name('takeoff.index');
    Route::get('/takeoff/create',         [TakeoffController::class, 'create'])->middleware('can:takeoff.create')->name('takeoff.create');
    Route::post('/takeoff',               [TakeoffController::class, 'store'])->middleware('can:takeoff.create')->name('takeoff.store');
    Route::get('/takeoff/{takeoff}',      [TakeoffController::class, 'show'])->middleware('can:takeoff.view')->name('takeoff.show');
    Route::get('/takeoff/{takeoff}/edit', [TakeoffController::class, 'edit'])->middleware('can:takeoff.update')->name('takeoff.edit');
    Route::put('/takeoff/{takeoff}',      [TakeoffController::class, 'update'])->middleware('can:takeoff.update')->name('takeoff.update');
    Route::delete('/takeoff/{takeoff}',   [TakeoffController::class, 'destroy'])->middleware('can:takeoff.delete')->name('takeoff.destroy');

    // --- DQE -------------------------------------------------------------------
    Route::get('/boq',              [BoqController::class, 'index'])->middleware('can:boq.view')->name('boq.index');
    Route::get('/boq/create',       [BoqController::class, 'create'])->middleware('can:boq.create')->name('boq.create');
    Route::post('/boq',             [BoqController::class, 'store'])->middleware('can:boq.create')->name('boq.store');
    Route::get('/boq/{boq}',        [BoqController::class, 'show'])->middleware('can:boq.view')->name('boq.show');
    Route::get('/boq/{boq}/edit',   [BoqController::class, 'edit'])->middleware('can:boq.update')->name('boq.edit');
    Route::put('/boq/{boq}',        [BoqController::class, 'update'])->middleware('can:boq.update')->name('boq.update');
    Route::delete('/boq/{boq}',     [BoqController::class, 'destroy'])->middleware('can:boq.delete')->name('boq.destroy');

    // --- Bureau d'études (registre) ---------------------------------------------
    Route::get('/design-office',              [StudyController::class, 'index'])->middleware('can:design_office.view')->name('studies.index');
    Route::get('/design-office/create',       [StudyController::class, 'create'])->middleware('can:design_office.create')->name('studies.create');
    Route::post('/design-office',             [StudyController::class, 'store'])->middleware('can:design_office.create')->name('studies.store');
    Route::get('/design-office/{study}',      [StudyController::class, 'show'])->middleware('can:design_office.view')->name('studies.show');
    Route::get('/design-office/{study}/edit', [StudyController::class, 'edit'])->middleware('can:design_office.update')->name('studies.edit');
    Route::put('/design-office/{study}',      [StudyController::class, 'update'])->middleware('can:design_office.update')->name('studies.update');
    Route::delete('/design-office/{study}',   [StudyController::class, 'destroy'])->middleware('can:design_office.delete')->name('studies.destroy');

    // --- CRM (opportunités) ----------------------------------------------------
    Route::get('/crm',                    [OpportunityController::class, 'index'])->middleware('can:crm.view')->name('crm.index');
    Route::get('/crm/create',             [OpportunityController::class, 'create'])->middleware('can:crm.create')->name('crm.create');
    Route::post('/crm',                   [OpportunityController::class, 'store'])->middleware('can:crm.create')->name('crm.store');
    Route::get('/crm/{opportunity}',      [OpportunityController::class, 'show'])->middleware('can:crm.view')->name('crm.show');
    Route::get('/crm/{opportunity}/edit', [OpportunityController::class, 'edit'])->middleware('can:crm.update')->name('crm.edit');
    Route::put('/crm/{opportunity}',      [OpportunityController::class, 'update'])->middleware('can:crm.update')->name('crm.update');
    Route::delete('/crm/{opportunity}',   [OpportunityController::class, 'destroy'])->middleware('can:crm.delete')->name('crm.destroy');

    // --- Appels d'offres -------------------------------------------------------
    Route::get('/tenders',               [TenderController::class, 'index'])->middleware('can:tenders.view')->name('tenders.index');
    Route::get('/tenders/create',        [TenderController::class, 'create'])->middleware('can:tenders.create')->name('tenders.create');
    Route::post('/tenders',              [TenderController::class, 'store'])->middleware('can:tenders.create')->name('tenders.store');
    Route::get('/tenders/{tender}',      [TenderController::class, 'show'])->middleware('can:tenders.view')->name('tenders.show');
    Route::get('/tenders/{tender}/edit', [TenderController::class, 'edit'])->middleware('can:tenders.update')->name('tenders.edit');
    Route::put('/tenders/{tender}',      [TenderController::class, 'update'])->middleware('can:tenders.update')->name('tenders.update');
    Route::delete('/tenders/{tender}',   [TenderController::class, 'destroy'])->middleware('can:tenders.delete')->name('tenders.destroy');

    // --- Engins / Véhicules (vues filtrées du parc) ----------------------------
    Route::get('/machinery',             [MachineryController::class, 'index'])->middleware('can:machinery.view')->name('machinery.index');
    Route::get('/machinery/{equipment}', [MachineryController::class, 'show'])->middleware('can:machinery.view')->name('machinery.show');
    Route::get('/vehicles',              [VehicleController::class, 'index'])->middleware('can:vehicles.view')->name('vehicles.index');
    Route::get('/vehicles/{equipment}',  [VehicleController::class, 'show'])->middleware('can:vehicles.view')->name('vehicles.show');

    // --- Carburant / Maintenance -----------------------------------------------
    Route::get('/fuel',         [FuelController::class, 'index'])->middleware('can:fuel.view')->name('fuel.index');
    Route::post('/fuel',        [FuelController::class, 'storeLog'])->middleware('can:fuel.create')->name('fuel.store');
    Route::get('/maintenance',  [MaintenanceController::class, 'index'])->middleware('can:maintenance.view')->name('maintenance.index');
    Route::post('/maintenance', [MaintenanceController::class, 'store'])->middleware('can:maintenance.create')->name('maintenance.store');

    // --- Budget ----------------------------------------------------------------
    Route::get('/budget',               [BudgetController::class, 'index'])->middleware('can:budget.view')->name('budget.index');
    Route::get('/budget/create',        [BudgetController::class, 'create'])->middleware('can:budget.create')->name('budget.create');
    Route::post('/budget',              [BudgetController::class, 'store'])->middleware('can:budget.create')->name('budget.store');
    Route::get('/budget/{budget}',      [BudgetController::class, 'show'])->middleware('can:budget.view')->name('budget.show');
    Route::get('/budget/{budget}/edit', [BudgetController::class, 'edit'])->middleware('can:budget.update')->name('budget.edit');
    Route::put('/budget/{budget}',      [BudgetController::class, 'update'])->middleware('can:budget.update')->name('budget.update');
    Route::delete('/budget/{budget}',   [BudgetController::class, 'destroy'])->middleware('can:budget.delete')->name('budget.destroy');

    // --- Comptabilité analytique -----------------------------------------------
    Route::get('/cost-accounting',  [CostAccountingController::class, 'index'])->middleware('can:cost_accounting.view')->name('cost_accounting.index');
    Route::post('/cost-accounting', [CostAccountingController::class, 'store'])->middleware('can:cost_accounting.create')->name('cost_accounting.store');

    // --- Comptabilité générale (journal SYSCOHADA) -----------------------------
    Route::get('/accounting',           [AccountingController::class, 'index'])->middleware('can:accounting.view')->name('accounting.index');
    Route::get('/accounting/accounts',  [AccountingController::class, 'accounts'])->middleware('can:accounting.view')->name('accounting.accounts');
    Route::post('/accounting/accounts', [AccountingController::class, 'storeAccount'])->middleware('can:accounting.create')->name('accounting.accounts.store');
    Route::post('/accounting',          [AccountingController::class, 'store'])->middleware('can:accounting.create')->name('accounting.store');

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

    // --- Laboratoire -----------------------------------------------------------
    Route::get('/laboratory',                   [LaboratoryController::class, 'index'])->middleware('can:laboratory.view')->name('laboratory.index');
    Route::get('/laboratory/create',            [LaboratoryController::class, 'create'])->middleware('can:laboratory.create')->name('laboratory.create');
    Route::post('/laboratory',                  [LaboratoryController::class, 'store'])->middleware('can:laboratory.create')->name('laboratory.store');
    Route::get('/laboratory/{laboratory}',      [LaboratoryController::class, 'show'])->middleware('can:laboratory.view')->name('laboratory.show');
    Route::get('/laboratory/{laboratory}/edit', [LaboratoryController::class, 'edit'])->middleware('can:laboratory.update')->name('laboratory.edit');
    Route::put('/laboratory/{laboratory}',      [LaboratoryController::class, 'update'])->middleware('can:laboratory.update')->name('laboratory.update');
    Route::delete('/laboratory/{laboratory}',   [LaboratoryController::class, 'destroy'])->middleware('can:laboratory.delete')->name('laboratory.destroy');

    // --- GED (documents) -------------------------------------------------------
    Route::get('/documents',                [DocumentController::class, 'index'])->middleware('can:documents.view')->name('documents.index');
    Route::get('/documents/create',         [DocumentController::class, 'create'])->middleware('can:documents.create')->name('documents.create');
    Route::post('/documents',               [DocumentController::class, 'store'])->middleware('can:documents.create')->name('documents.store');
    Route::get('/documents/{document}',     [DocumentController::class, 'show'])->middleware('can:documents.view')->name('documents.show');
    Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])->middleware('can:documents.update')->name('documents.edit');
    Route::put('/documents/{document}',     [DocumentController::class, 'update'])->middleware('can:documents.update')->name('documents.update');
    Route::delete('/documents/{document}',  [DocumentController::class, 'destroy'])->middleware('can:documents.delete')->name('documents.destroy');

    // --- Signature électronique ------------------------------------------------
    Route::post('/sign/{model}/{id}',                     [SignatureController::class, 'sign'])->name('signature.sign');
    Route::get('/e-signature',                            [SignatureController::class, 'index'])->middleware('can:e_signature.view')->name('e_signature.index');
    Route::post('/e-signature',                           [SignatureController::class, 'store'])->middleware('can:e_signature.create')->name('e_signature.store');
    Route::post('/e-signature/{signatureRequest}/status', [SignatureController::class, 'updateStatus'])->middleware('can:e_signature.update')->name('e_signature.status');

    // --- Tableau de bord BI ----------------------------------------------------
    Route::get('/bi', [BiController::class, 'index'])->middleware('can:bi.view')->name('bi.index');

    // --- Rapports & BI / Assistant IA ------------------------------------------
    Route::get('/reports', [ReportController::class, 'index'])->middleware('can:reports.view')->name('reports.index');
    Route::get('/bi/pdf',  [BiController::class, 'pdf'])->middleware('can:reports.view')->name('bi.pdf');
    Route::get('/ai',      [AiAssistantController::class, 'index'])->middleware('can:ai.view')->name('ai.index');
    Route::post('/ai/ask', [AiAssistantController::class, 'ask'])->middleware('can:ai.view')->name('ai.ask');

    // --- Exports PDF (documents professionnels) --------------------------------
    Route::get('/quotes/{quote}/pdf',      [PdfController::class, 'quote'])->middleware('can:quotes.view')->name('quotes.pdf');
    Route::get('/invoices/{invoice}/pdf',  [PdfController::class, 'invoice'])->middleware('can:invoicing.view')->name('invoices.pdf');
    Route::get('/purchases/{purchase}/pdf', [PdfController::class, 'purchase'])->middleware('can:purchases.view')->name('purchases.pdf');
    Route::get('/payroll/{payslip}/pdf',   [DocumentPdfController::class, 'payslip'])->middleware('can:payroll.view')->name('payroll.pdf');
    Route::get('/boq/{boq}/pdf',           [DocumentPdfController::class, 'boq'])->middleware('can:boq.view')->name('boq.pdf');

    // --- Chantiers (vue transversale) ------------------------------------------
    Route::get('/sites',        [SiteIndexController::class, 'index'])->middleware('can:sites.view')->name('sites.index');
    Route::get('/sites/{site}', [SiteIndexController::class, 'show'])->middleware('can:sites.view')->name('sites.overview.show');

    // --- Exports Excel (.xlsx) --------------------------------------------------
    Route::get('/export/projects',  [ExportController::class, 'projects'])->middleware('can:projects.export')->name('export.projects');
    Route::get('/export/invoices',  [ExportController::class, 'invoices'])->middleware('can:invoicing.export')->name('export.invoices');
    Route::get('/export/clients',   [ExportController::class, 'clients'])->middleware('can:clients.export')->name('export.clients');
    Route::get('/export/employees', [ExportController::class, 'employees'])->middleware('can:hr.export')->name('export.employees');
    Route::get('/export/stocks',    [ExportController::class, 'stocks'])->middleware('can:stocks.export')->name('export.stocks');

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

// Changement de langue (accessible connecté ou non).
Route::post('/locale/{locale}', [LocaleController::class, 'update'])->name('locale.update');

// --- Webhooks Mobile Money (publics — hors CSRF et auth) -------------------
Route::post('/webhooks/mobile-money/{operator}', [MobileMoneyController::class, 'webhook'])
    ->name('mobile-money.webhook')
    ->withoutMiddleware(['App\Http\Middleware\VerifyCsrfToken']);

require __DIR__.'/auth.php';
