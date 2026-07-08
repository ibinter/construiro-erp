<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Material;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration du module Inventaire : matériaux BTP réalistes,
 * deux magasins et une série de mouvements donnant des niveaux de stock
 * crédibles (certains sous le seuil d'alerte). Idempotent.
 */
class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $magasinier = User::where('email', 'magasinier@construiro.com')->first()
            ?? User::where('company_id', $company->id)->first();

        // --- Magasins ------------------------------------------------------
        $warehouses = [
            'MAG-01' => ['name' => 'Magasin Central Abidjan', 'city' => 'Abidjan', 'manager_name' => 'Kouassi N\'Guessan'],
            'MAG-02' => ['name' => 'Dépôt Chantier Bouaké',   'city' => 'Bouaké',  'manager_name' => 'Awa Traoré'],
        ];

        $warehouseIds = [];
        foreach ($warehouses as $code => $data) {
            $warehouse = Warehouse::updateOrCreate(
                ['company_id' => $company->id, 'code' => $code],
                array_merge($data, ['company_id' => $company->id, 'is_active' => true])
            );
            $warehouseIds[$code] = $warehouse->id;
        }

        // --- Matériaux -----------------------------------------------------
        $materials = [
            'MAT-001' => ['name' => 'Ciment CPA 42.5',        'category' => 'gros_oeuvre',   'unit' => 'sac',   'unit_price' => 4500,   'min_stock' => 200],
            'MAT-002' => ['name' => 'Fer à béton HA12',       'category' => 'gros_oeuvre',   'unit' => 'kg',    'unit_price' => 850,    'min_stock' => 1500],
            'MAT-003' => ['name' => 'Sable de rivière',       'category' => 'gros_oeuvre',   'unit' => 'm3',    'unit_price' => 12000,  'min_stock' => 30],
            'MAT-004' => ['name' => 'Gravier concassé 5/15',  'category' => 'gros_oeuvre',   'unit' => 'm3',    'unit_price' => 18000,  'min_stock' => 25],
            'MAT-005' => ['name' => 'Parpaing creux 15',      'category' => 'gros_oeuvre',   'unit' => 'u',     'unit_price' => 350,    'min_stock' => 1000],
            'MAT-006' => ['name' => 'Carrelage grès 60x60',   'category' => 'second_oeuvre', 'unit' => 'm2',    'unit_price' => 8500,   'min_stock' => 150],
            'MAT-007' => ['name' => 'Peinture acrylique',     'category' => 'second_oeuvre', 'unit' => 'kg',    'unit_price' => 2200,   'min_stock' => 100],
            'MAT-008' => ['name' => 'Câble électrique 2.5mm', 'category' => 'electricite',   'unit' => 'ml',    'unit_price' => 650,    'min_stock' => 500],
        ];

        $materialIds = [];
        foreach ($materials as $code => $data) {
            $material = Material::updateOrCreate(
                ['company_id' => $company->id, 'code' => $code],
                array_merge($data, ['company_id' => $company->id, 'is_active' => true])
            );
            $materialIds[$code] = $material->id;
        }

        // --- Mouvements ----------------------------------------------------
        // Rend le seeder idempotent : on repart d'un historique propre.
        StockMovement::where('company_id', $company->id)->delete();

        // Entrées puis sorties. Certains matériaux resteront sous le seuil.
        $movements = [
            // Ciment : entrée 800 sacs, sortie 650 → 150 (< 200, alerte)
            ['MAT-001', 'MAG-01', 'in',  800, 4500, 'BL-2026-101', '2026-05-02'],
            ['MAT-001', 'MAG-01', 'out', 650, 4500, 'BS-2026-201', '2026-06-15'],
            // Fer à béton : 5000 − 2000 = 3000 (OK)
            ['MAT-002', 'MAG-01', 'in',  5000, 850, 'BL-2026-102', '2026-05-03'],
            ['MAT-002', 'MAG-01', 'out', 2000, 850, 'BS-2026-202', '2026-06-10'],
            // Sable : 60 − 45 = 15 (< 30, alerte)
            ['MAT-003', 'MAG-02', 'in',  60, 12000, 'BL-2026-103', '2026-05-05'],
            ['MAT-003', 'MAG-02', 'out', 45, 12000, 'BS-2026-203', '2026-06-20'],
            // Gravier : 80 − 20 = 60 (OK)
            ['MAT-004', 'MAG-02', 'in',  80, 18000, 'BL-2026-104', '2026-05-06'],
            ['MAT-004', 'MAG-02', 'out', 20, 18000, 'BS-2026-204', '2026-06-22'],
            // Parpaing : 4000 − 3200 = 800 (< 1000, alerte)
            ['MAT-005', 'MAG-01', 'in',  4000, 350, 'BL-2026-105', '2026-05-08'],
            ['MAT-005', 'MAG-01', 'out', 3200, 350, 'BS-2026-205', '2026-06-25'],
            // Carrelage : 400 − 120 = 280 (OK)
            ['MAT-006', 'MAG-01', 'in',  400, 8500, 'BL-2026-106', '2026-05-10'],
            ['MAT-006', 'MAG-01', 'out', 120, 8500, 'BS-2026-206', '2026-06-28'],
            // Peinture : 150 + ajustement -10 = 140 (OK)
            ['MAT-007', 'MAG-02', 'in',  150, 2200, 'BL-2026-107', '2026-05-12'],
            ['MAT-007', 'MAG-02', 'adjustment', -10, 2200, 'INV-2026-01', '2026-06-30'],
            // Câble : 600 − 350 = 250 (< 500, alerte)
            ['MAT-008', 'MAG-01', 'in',  600, 650, 'BL-2026-108', '2026-05-14'],
            ['MAT-008', 'MAG-01', 'out', 350, 650, 'BS-2026-207', '2026-07-01'],
        ];

        foreach ($movements as [$matCode, $whCode, $type, $qty, $price, $ref, $date]) {
            StockMovement::create([
                'company_id'   => $company->id,
                'warehouse_id' => $warehouseIds[$whCode],
                'material_id'  => $materialIds[$matCode],
                'user_id'      => $magasinier?->id,
                'type'         => $type,
                'quantity'     => $qty,
                'unit_price'   => $price,
                'reference'    => $ref,
                'moved_at'     => $date,
            ]);
        }
    }
}
