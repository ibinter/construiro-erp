<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q   = trim($request->input('q', ''));
        $cid = $request->user()->company_id;

        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $results = [];

        // Projets
        Project::where('company_id', $cid)
            ->where(fn($s) => $s->where('name', 'like', "%{$q}%")->orWhere('code', 'like', "%{$q}%"))
            ->limit(5)->get()
            ->each(fn($m) => $results[] = [
                'type'  => 'project',
                'label' => $m->name,
                'sub'   => $m->code,
                'url'   => route('projects.show', $m->id),
            ]);

        // Clients
        Client::where('company_id', $cid)
            ->where(fn($s) => $s->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%"))
            ->limit(5)->get()
            ->each(fn($m) => $results[] = [
                'type'  => 'client',
                'label' => $m->name,
                'sub'   => $m->email ?? '',
                'url'   => route('clients.show', $m->id),
            ]);

        // Factures
        Invoice::where('company_id', $cid)
            ->where(fn($s) => $s->where('code', 'like', "%{$q}%"))
            ->limit(5)->get()
            ->each(fn($m) => $results[] = [
                'type'  => 'invoice',
                'label' => $m->code,
                'sub'   => number_format($m->total_ttc, 0, ',', ' ') . ' XOF',
                'url'   => route('invoices.show', $m->id),
            ]);

        // Devis
        Quote::where('company_id', $cid)
            ->where(fn($s) => $s->where('code', 'like', "%{$q}%")->orWhere('title', 'like', "%{$q}%"))
            ->limit(3)->get()
            ->each(fn($m) => $results[] = [
                'type'  => 'quote',
                'label' => $m->title ?? $m->code,
                'sub'   => $m->code,
                'url'   => route('quotes.show', $m->id),
            ]);

        // Employés
        Employee::where('company_id', $cid)
            ->where(fn($s) => $s->where('first_name', 'like', "%{$q}%")
                ->orWhere('last_name', 'like', "%{$q}%")
                ->orWhere('employee_id', 'like', "%{$q}%"))
            ->limit(3)->get()
            ->each(fn($m) => $results[] = [
                'type'  => 'employee',
                'label' => trim($m->first_name . ' ' . $m->last_name),
                'sub'   => $m->position ?? '',
                'url'   => route('employees.show', $m->id),
            ]);

        // Contrats
        Contract::where('company_id', $cid)
            ->where(fn($s) => $s->where('reference', 'like', "%{$q}%")->orWhere('title', 'like', "%{$q}%"))
            ->limit(3)->get()
            ->each(fn($m) => $results[] = [
                'type'  => 'contract',
                'label' => $m->title ?? $m->reference,
                'sub'   => $m->reference,
                'url'   => route('contracts.show', $m->id),
            ]);

        return response()->json(['results' => array_slice($results, 0, 20)]);
    }
}
