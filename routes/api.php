<?php

use App\Http\Controllers\Api\ApiTokenController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\StockItemController;
use App\Http\Controllers\SaraController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — CONSTRUIRO ERP
|--------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------
// SARA — assistant IA public (pas d'auth requise, rate-limited)
// -----------------------------------------------------------------------
Route::post('/sara/chat', [SaraController::class, 'chat'])
    ->middleware('throttle:30,1')
    ->name('api.sara.chat');

// -----------------------------------------------------------------------
// API V1 — authentification Sanctum (Bearer token)
// Tous les endpoints sont scoped à l'entreprise du token (multi-tenant).
// -----------------------------------------------------------------------
Route::middleware('auth:sanctum')->prefix('v1')->name('api.v1.')->group(function () {

    // Projects — CRUD complet
    Route::apiResource('projects', ProjectController::class);

    // Contacts (clients / maîtres d'ouvrage) — CRUD complet
    Route::apiResource('contacts', ContactController::class);

    // Invoices — lecture seule (données financières sensibles)
    Route::apiResource('invoices', InvoiceController::class)->only(['index', 'show']);

    // Stock items (catalogue matériaux) — lecture seule
    Route::apiResource('stock-items', StockItemController::class)->only(['index', 'show']);

    // Gestion des tokens API (self-service)
    Route::get('tokens', [ApiTokenController::class, 'index'])->name('tokens.index');
    Route::post('tokens', [ApiTokenController::class, 'store'])->name('tokens.store');
    Route::delete('tokens/{id}', [ApiTokenController::class, 'destroy'])->name('tokens.destroy');
});
