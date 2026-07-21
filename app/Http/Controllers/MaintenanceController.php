<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\MaintenanceRecord;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Maintenance (interface dédiée transversale du parc roulant).
 * Liste tous les entretiens de l'entreprise (maintenance_records) et permet
 * d'en créer un pour n'importe quel équipement. Réutilise le modèle existant
 * MaintenanceRecord (non modifié). Isolation multi-tenant + permissions
 * « maintenance.* » via le middleware de route.
 */
class MaintenanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $records = MaintenanceRecord::where('company_id', $user->company_id)
            ->with('equipment:id,name,code,category,currency')
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->latest('performed_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        // Total des coûts d'entretien (filtre type pris en compte).
        $totalCost = MaintenanceRecord::where('company_id', $user->company_id)
            ->when($request->string('type')->toString(), fn ($q, $type) => $q->where('type', $type))
            ->sum('cost');

        return Inertia::render('Maintenance/Index', [
            'records'    => $records,
            'filters'    => $request->only('type'),
            'types'      => MaintenanceRecord::TYPES,
            'equipments' => $this->equipments($user),
            'totalCost'  => (float) $totalCost,
            'can'        => [
                'create' => $user->can('maintenance.create'),
                'update' => $user->can('maintenance.update'),
                'delete' => $user->can('maintenance.delete'),
            ],
        ]);
    }

    /**
     * Enregistre un entretien lié à un équipement de l'entreprise.
     * Route POST /maintenance (can:maintenance.create).
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'equipment_id' => [
                'required', 'integer',
                Rule::exists('equipment', 'id')->where('company_id', $user->company_id),
            ],
            'type'         => ['required', Rule::in(MaintenanceRecord::TYPES)],
            'description'  => ['required', 'string', 'max:255'],
            'cost'         => ['required', 'numeric', 'min:0'],
            'performed_at' => ['required', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        $data['company_id'] = $user->company_id;

        MaintenanceRecord::create($data);

        return redirect()->route('maintenance.index')
            ->with('success', 'Entretien enregistré.');
    }

    /**
     * Affiche le détail d'un entretien.
     * Route GET /maintenance/{record} (can:maintenance.view).
     */
    public function show(Request $request, MaintenanceRecord $maintenanceRecord): Response
    {
        $user = $request->user();
        abort_unless($maintenanceRecord->company_id === $user->company_id, 403);

        return Inertia::render('Maintenance/Show', [
            'record' => $maintenanceRecord->load('equipment:id,name,code,category,currency'),
            'can'    => [
                'update' => $user->can('maintenance.update'),
                'delete' => $user->can('maintenance.delete'),
            ],
        ]);
    }

    /**
     * Formulaire de modification d'un entretien.
     * Route GET /maintenance/{record}/edit (can:maintenance.update).
     */
    public function edit(Request $request, MaintenanceRecord $maintenanceRecord): Response
    {
        $user = $request->user();
        abort_unless($maintenanceRecord->company_id === $user->company_id, 403);

        return Inertia::render('Maintenance/Edit', [
            'record'     => $maintenanceRecord->load('equipment:id,name,code,category'),
            'equipments' => $this->equipments($user),
            'types'      => MaintenanceRecord::TYPES,
        ]);
    }

    /**
     * Met à jour un entretien.
     * Route PUT /maintenance/{record} (can:maintenance.update).
     */
    public function update(Request $request, MaintenanceRecord $maintenanceRecord): RedirectResponse
    {
        $user = $request->user();
        abort_unless($maintenanceRecord->company_id === $user->company_id, 403);

        $data = $request->validate([
            'equipment_id' => [
                'required', 'integer',
                Rule::exists('equipment', 'id')->where('company_id', $user->company_id),
            ],
            'type'         => ['required', Rule::in(MaintenanceRecord::TYPES)],
            'description'  => ['required', 'string', 'max:255'],
            'cost'         => ['required', 'numeric', 'min:0'],
            'performed_at' => ['required', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        $maintenanceRecord->update($data);

        return redirect()->route('maintenance.show', $maintenanceRecord)
            ->with('success', 'Entretien mis à jour.');
    }

    /**
     * Supprime un entretien.
     * Route DELETE /maintenance/{record} (can:maintenance.delete).
     */
    public function destroy(Request $request, MaintenanceRecord $maintenanceRecord): RedirectResponse
    {
        $user = $request->user();
        abort_unless($maintenanceRecord->company_id === $user->company_id, 403);

        $maintenanceRecord->delete();

        return redirect()->route('maintenance.index')
            ->with('success', 'Entretien supprimé.');
    }

    /** Équipements de l'entreprise pour le sélecteur du formulaire. */
    private function equipments(User $user)
    {
        return Equipment::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'category']);
    }
}
