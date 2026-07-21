<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\FuelLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Module Carburant : journal des pleins du parc roulant.
 * Nouvelle table « fuel_logs ». Isolation multi-tenant + permissions
 * « fuel.* » via le middleware de route.
 */
class FuelController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $logs = FuelLog::forUser($user)
            ->with('equipment:id,name,code,category')
            ->when($request->integer('equipment_id'), fn ($q, $id) => $q->where('equipment_id', $id))
            ->latest('date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        // Totaux (filtre équipement pris en compte) pour les cartes de synthèse.
        $totals = FuelLog::forUser($user)
            ->when($request->integer('equipment_id'), fn ($q, $id) => $q->where('equipment_id', $id))
            ->selectRaw('COALESCE(SUM(quantity), 0) as total_quantity, COALESCE(SUM(total_cost), 0) as total_cost')
            ->first();

        return Inertia::render('Fuel/Index', [
            'logs'       => $logs,
            'filters'    => $request->only('equipment_id'),
            'equipments' => $this->equipments($user),
            'totals'     => [
                'quantity' => (float) ($totals->total_quantity ?? 0),
                'cost'     => (float) ($totals->total_cost ?? 0),
            ],
            'can'        => [
                'create' => $user->can('fuel.create'),
                'update' => $user->can('fuel.update'),
                'delete' => $user->can('fuel.delete'),
            ],
        ]);
    }

    /**
     * Enregistre un plein de carburant.
     * Route POST /fuel (can:fuel.create).
     */
    public function storeLog(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'equipment_id' => [
                'required', 'integer',
                Rule::exists('equipment', 'id')->where('company_id', $user->company_id),
            ],
            'date'       => ['required', 'date'],
            'quantity'   => ['required', 'numeric', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'odometer'   => ['nullable', 'numeric', 'min:0'],
            'station'    => ['nullable', 'string', 'max:255'],
            'notes'      => ['nullable', 'string'],
        ]);

        $data['company_id'] = $user->company_id;
        $data['user_id']    = $user->id;

        // total_cost est recalculé automatiquement par le modèle (boot saving).
        FuelLog::create($data);

        return redirect()->route('fuel.index')
            ->with('success', 'Plein de carburant enregistré.');
    }

    /**
     * Formulaire de modification d'un plein.
     * Route GET /fuel/{fuel_log}/edit (can:fuel.update).
     */
    public function edit(Request $request, FuelLog $fuelLog): Response
    {
        $user = $request->user();
        abort_unless($fuelLog->company_id === $user->company_id, 403);

        return Inertia::render('Fuel/Edit', [
            'fuelLog'    => $fuelLog->load('equipment:id,name,code,category'),
            'equipments' => $this->equipments($user),
        ]);
    }

    /**
     * Met à jour un plein de carburant.
     * Route PUT /fuel/{fuel_log} (can:fuel.update).
     */
    public function update(Request $request, FuelLog $fuelLog): RedirectResponse
    {
        $user = $request->user();
        abort_unless($fuelLog->company_id === $user->company_id, 403);

        $data = $request->validate([
            'equipment_id' => [
                'required', 'integer',
                Rule::exists('equipment', 'id')->where('company_id', $user->company_id),
            ],
            'date'       => ['required', 'date'],
            'quantity'   => ['required', 'numeric', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'odometer'   => ['nullable', 'numeric', 'min:0'],
            'station'    => ['nullable', 'string', 'max:255'],
            'notes'      => ['nullable', 'string'],
        ]);

        // total_cost est recalculé automatiquement par le modèle (boot saving).
        $fuelLog->update($data);

        return redirect()->route('fuel.index')
            ->with('success', 'Plein de carburant mis à jour.');
    }

    /**
     * Supprime un plein de carburant.
     * Route DELETE /fuel/{fuel_log} (can:fuel.delete).
     */
    public function destroy(Request $request, FuelLog $fuelLog): RedirectResponse
    {
        $user = $request->user();
        abort_unless($fuelLog->company_id === $user->company_id, 403);

        $fuelLog->delete();

        return redirect()->route('fuel.index')
            ->with('success', 'Plein de carburant supprimé.');
    }

    /** Équipements de l'entreprise (engins + véhicules d'abord) pour le sélecteur. */
    private function equipments(User $user)
    {
        return Equipment::where('company_id', $user->company_id)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'category']);
    }
}
