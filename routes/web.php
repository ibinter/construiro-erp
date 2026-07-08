<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
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

    // Portail unique : accès générique aux modules non encore développés.
    Route::get('/app/{module}', [ModuleController::class, 'show'])->name('module.show');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
