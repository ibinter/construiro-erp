<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\DemoRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProspectController extends Controller
{
    public function index(Request $request): Response
    {
        $query = DemoRequest::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $prospects = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('SuperAdmin/Prospects/Index', [
            'prospects' => $prospects->through(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'company' => $p->company,
                'email' => $p->email,
                'phone' => $p->phone,
                'sector' => $p->sector,
                'status' => $p->status,
                'notes' => $p->notes,
                'created_at' => $p->created_at->format('d/m/Y'),
            ]),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function updateStatus(Request $request, DemoRequest $prospect): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,demo_scheduled,converted,lost',
            'notes' => 'nullable|string|max:1000',
        ]);

        $prospect->update($validated);

        return back()->with('success', 'Statut prospect mis à jour.');
    }
}
