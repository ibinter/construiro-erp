<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Véhicules du parc roulant : vue filtrée du parc matériel (category = 'vehicule').
 * Aucune table dédiée — réutilise le modèle Equipment en lecture.
 * Isolation multi-tenant + permissions « vehicles.* » via le middleware de route.
 * La création/édition passe par le module Parc matériel (equipment).
 */
class VehicleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $vehicles = Equipment::forUser($user)
            ->where('category', 'vehicule')
            ->with('currentSite:id,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('registration', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Vehicles/Index', [
            'vehicles' => $vehicles,
            'filters'  => $request->only('search', 'status'),
            'statuses' => Equipment::STATUSES,
            'can'      => [
                // La création d'un véhicule se fait via le module Parc matériel.
                'create' => $user->can('equipment.create'),
            ],
        ]);
    }

    public function show(Request $request, Equipment $equipment): Response
    {
        $this->authorizeVehicle($request->user(), $equipment);

        $equipment->load([
            'currentSite:id,name',
            'maintenanceRecords' => fn ($q) => $q->latest('performed_at')->latest('id')->limit(10),
        ]);

        return Inertia::render('Vehicles/Show', [
            'equipment' => $equipment,
        ]);
    }

    /** Empêche l'accès à un équipement d'une autre entreprise ou qui n'est pas un véhicule. */
    private function authorizeVehicle(User $user, Equipment $equipment): void
    {
        abort_unless(
            $equipment->company_id === $user->company_id && $equipment->category === 'vehicule',
            403
        );
    }
}
