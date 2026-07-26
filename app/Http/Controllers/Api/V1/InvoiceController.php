<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API V1 — Invoices (read-only)
 * Invoices are financial data — write operations are intentionally excluded.
 * Scoped to the authenticated user's company (multi-tenant isolation).
 */
class InvoiceController extends Controller
{
    /**
     * GET /api/v1/invoices
     * List invoices for the authenticated user's company (paginated, 20/page).
     * Supports optional ?status= and ?project_id= filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::where('company_id', $request->user()->company_id)
            ->with(['client:id,name', 'project:id,name,code'])
            ->orderByDesc('issue_date');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', (int) $request->project_id);
        }

        return response()->json($query->paginate(20));
    }

    /**
     * GET /api/v1/invoices/{id}
     * Show a single invoice with its lines (must belong to the same company).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::where('company_id', $request->user()->company_id)
            ->with(['client:id,name,email,phone', 'project:id,name,code', 'lines'])
            ->findOrFail($id);

        return response()->json($invoice);
    }
}
