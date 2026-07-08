<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SubcontractorController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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
    Route::put('/admin/company',            [CompanyController::class, 'update'])->middleware('can:administration.update')->name('admin.company.update');

    // Portail unique : accès générique aux modules non encore développés.
    Route::get('/app/{module}', [ModuleController::class, 'show'])->name('module.show');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
