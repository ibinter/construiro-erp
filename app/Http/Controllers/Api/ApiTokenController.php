<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Token management — allows authenticated users to create and revoke
 * their own Sanctum personal access tokens programmatically.
 */
class ApiTokenController extends Controller
{
    /**
     * GET /api/v1/tokens
     * List the current user's active API tokens (without the raw token value).
     */
    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()
            ->tokens()
            ->select(['id', 'name', 'last_used_at', 'created_at', 'expires_at'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($tokens);
    }

    /**
     * POST /api/v1/tokens
     * Create a new personal access token.
     * Returns the raw token ONCE — it cannot be retrieved afterwards.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $token = $request->user()->createToken($request->name);

        return response()->json([
            'id'           => $token->accessToken->id,
            'name'         => $token->accessToken->name,
            'token'        => $token->plainTextToken,
            'created_at'   => $token->accessToken->created_at,
            'note'         => 'Store this token securely — it will not be shown again.',
        ], 201);
    }

    /**
     * DELETE /api/v1/tokens/{id}
     * Revoke (delete) one of the current user's tokens.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $request->user()
            ->tokens()
            ->where('id', $id)
            ->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Token not found or already revoked.'], 404);
        }

        return response()->json(['message' => 'Token revoked.']);
    }
}
