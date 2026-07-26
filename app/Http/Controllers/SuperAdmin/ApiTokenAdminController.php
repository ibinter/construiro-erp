<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ApiTokenAdminController extends Controller
{
    /**
     * Révoquer n'importe quel token Sanctum (accès SuperAdmin uniquement).
     */
    public function destroy(int $tokenId)
    {
        PersonalAccessToken::findOrFail($tokenId)->delete();

        return back()->with('success', 'Token révoqué.');
    }
}
