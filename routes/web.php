<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SiteController;
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
