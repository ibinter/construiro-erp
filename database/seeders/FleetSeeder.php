<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Equipment;
use App\Models\FuelLog;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration du parc roulant : quelques pleins de carburant
 * réalistes sur les équipements existants (EQ-001..). Les équipements et
 * enregistrements de maintenance sont créés par EquipmentSeeder (non recréés ici).
 * Idempotent.
 */
class FleetSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        // Utilisateur pour tracer l'auteur des pleins (facultatif).
        $user = User::where('company_id', $company->id)->orderBy('id')->first();

        // Pleins par code équipement : [date, quantité (L), prix/L, compteur, station].
        $fuelByCode = [
            'EQ-001' => [
                ['2026-05-12', 320.0, 755, 1420.5, 'Total Zone 4'],
                ['2026-06-08', 290.5, 760, 1680.0, 'Total Zone 4'],
            ],
            'EQ-002' => [
                ['2026-05-20', 180.0, 755, 5240.0, 'Shell Marcory'],
                ['2026-06-15', 210.0, 762, 5510.0, 'Shell Marcory'],
                ['2026-07-01', 195.5, 765, 5780.0, 'Shell Marcory'],
            ],
            'EQ-003' => [
                ['2026-05-30', 260.0, 755, 84520.0, 'Total Yopougon'],
                ['2026-06-22', 240.0, 761, 85900.0, 'Total Yopougon'],
            ],
            'EQ-005' => [
                ['2026-06-05', 150.0, 758, null, 'Petro Ivoire'],
            ],
        ];

        foreach ($fuelByCode as $code => $entries) {
            $equipment = Equipment::where('company_id', $company->id)->where('code', $code)->first();
            if (! $equipment) {
                continue;
            }

            // Repart d'un journal propre pour rester idempotent.
            FuelLog::where('company_id', $company->id)
                ->where('equipment_id', $equipment->id)
                ->delete();

            foreach ($entries as [$date, $quantity, $unitPrice, $odometer, $station]) {
                FuelLog::create([
                    'company_id'   => $company->id,
                    'equipment_id' => $equipment->id,
                    'user_id'      => $user?->id,
                    'date'         => $date,
                    'quantity'     => $quantity,
                    'unit_price'   => $unitPrice,
                    'odometer'     => $odometer,
                    'station'      => $station,
                    // total_cost calculé automatiquement par le modèle.
                ]);
            }
        }
    }
}
