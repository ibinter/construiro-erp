<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeysController extends Controller
{
    public function index(): Response
    {
        // Stats globales
        $totalTokens    = \Laravel\Sanctum\PersonalAccessToken::count();
        $activeCompanies = \Laravel\Sanctum\PersonalAccessToken::distinct('tokenable_id')->count();

        // Tokens regroupés par entreprise (via user)
        $tokens = \Laravel\Sanctum\PersonalAccessToken::with('tokenable.company')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn ($token) => [
                'id'           => $token->id,
                'name'         => $token->name,
                'last_used_at' => $token->last_used_at?->diffForHumans(),
                'created_at'   => $token->created_at->format('d/m/Y'),
                'user_name'    => $token->tokenable?->name ?? 'N/A',
                'company_name' => $token->tokenable?->company?->name ?? 'N/A',
            ]);

        return Inertia::render('SuperAdmin/ApiKeys/Index', [
            'totalTokens'     => $totalTokens,
            'activeCompanies' => $activeCompanies,
            'tokens'          => $tokens,
        ]);
    }
}
