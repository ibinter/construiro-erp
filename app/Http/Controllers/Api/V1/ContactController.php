<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * API V1 — Contacts (Clients / Maîtres d'ouvrage)
 * Scoped to the authenticated user's company (multi-tenant isolation).
 */
class ContactController extends Controller
{
    /**
     * GET /api/v1/contacts
     * List contacts for the authenticated user's company (paginated, 20/page).
     */
    public function index(Request $request): JsonResponse
    {
        $contacts = Client::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->paginate(20);

        return response()->json($contacts);
    }

    /**
     * GET /api/v1/contacts/{id}
     * Show a single contact (must belong to the same company).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $contact = Client::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        return response()->json($contact);
    }

    /**
     * POST /api/v1/contacts
     * Create a new contact scoped to the authenticated user's company.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'code'         => ['nullable', 'string', 'max:50'],
            'type'         => ['nullable', Rule::in(Client::TYPES)],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:30'],
            'email'        => ['nullable', 'email', 'max:255'],
            'address'      => ['nullable', 'string', 'max:255'],
            'city'         => ['nullable', 'string', 'max:100'],
            'country'      => ['nullable', 'string', 'max:100'],
            'tax_id'       => ['nullable', 'string', 'max:100'],
            'notes'        => ['nullable', 'string'],
            'is_active'    => ['nullable', 'boolean'],
        ]);

        $data['company_id'] = $request->user()->company_id;
        $data['is_active']  = $data['is_active'] ?? true;

        $contact = Client::create($data);

        return response()->json($contact, 201);
    }

    /**
     * PUT /api/v1/contacts/{id}
     * Update a contact (must belong to the same company).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $contact = Client::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $data = $request->validate([
            'name'         => ['sometimes', 'required', 'string', 'max:255'],
            'code'         => ['nullable', 'string', 'max:50'],
            'type'         => ['nullable', Rule::in(Client::TYPES)],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:30'],
            'email'        => ['nullable', 'email', 'max:255'],
            'address'      => ['nullable', 'string', 'max:255'],
            'city'         => ['nullable', 'string', 'max:100'],
            'country'      => ['nullable', 'string', 'max:100'],
            'tax_id'       => ['nullable', 'string', 'max:100'],
            'notes'        => ['nullable', 'string'],
            'is_active'    => ['nullable', 'boolean'],
        ]);

        $contact->update($data);

        return response()->json($contact);
    }

    /**
     * DELETE /api/v1/contacts/{id}
     * Soft-delete a contact (must belong to the same company).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $contact = Client::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $contact->delete();

        return response()->json(['message' => 'Contact deleted.']);
    }
}
