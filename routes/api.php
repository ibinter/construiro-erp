<?php

use App\Http\Controllers\SaraController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — CONSTRUIRO ERP
|--------------------------------------------------------------------------
*/

// SARA — assistant IA public (pas d'auth requise, rate-limited)
Route::post('/sara/chat', [SaraController::class, 'chat'])
    ->middleware('throttle:30,1')
    ->name('api.sara.chat');
