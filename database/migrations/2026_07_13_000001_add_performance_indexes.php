<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Indexes de performance multi-tenant.
 * Toutes les tables filtrent par company_id — sans index = full scan.
 * Certaines filtrent aussi par status ou created_at.
 */
return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            // table                 => colonnes à indexer
            'projects'              => [['company_id'], ['company_id', 'status']],
            'sites'                 => [['company_id'], ['company_id', 'status']],
            'clients'               => [['company_id']],
            'quotes'                => [['company_id'], ['company_id', 'status']],
            'suppliers'             => [['company_id']],
            'materials'             => [['company_id']],
            'warehouses'            => [['company_id']],
            'stock_movements'       => [['company_id'], ['company_id', 'material_id']],
            'contracts'             => [['company_id'], ['company_id', 'status']],
            'subcontractors'        => [['company_id']],
            'purchase_orders'       => [['company_id'], ['company_id', 'status']],
            'invoices'              => [['company_id'], ['company_id', 'status']],
            'equipment'             => [['company_id']],
            'maintenance_records'   => [['company_id']],
            'employees'             => [['company_id'], ['company_id', 'status']],
            'attendances'           => [['company_id'], ['company_id', 'employee_id']],
            'payslips'              => [['company_id'], ['company_id', 'employee_id']],
            'tasks'                 => [['company_id'], ['company_id', 'project_id'], ['company_id', 'status']],
            'cash_accounts'         => [['company_id']],
            'treasury_transactions' => [['company_id']],
            'hse_incidents'         => [['company_id']],
            'quality_controls'      => [['company_id']],
            'unit_prices'           => [['company_id']],
            'takeoffs'              => [['company_id']],
            'boqs'                  => [['company_id']],
            'studies'               => [['company_id']],
            'opportunities'         => [['company_id']],
            'tenders'               => [['company_id']],
            'fuel_logs'             => [['company_id']],
            'budgets'               => [['company_id']],
            'cost_entries'          => [['company_id']],
            'accounts'              => [['company_id']],
            'journal_entries'       => [['company_id']],
            'incoming_payments'     => [['company_id']],
            'outgoing_payments'     => [['company_id']],
            'lab_tests'             => [['company_id']],
            'documents'             => [['company_id']],
            'signature_requests'    => [['company_id']],
            'ai_conversations'      => [['company_id']],
            'audit_logs'            => [['company_id']],
        ];

        foreach ($tables as $table => $indexGroups) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            Schema::table($table, function (Blueprint $table_bp) use ($table, $indexGroups) {
                foreach ($indexGroups as $columns) {
                    $indexName = $table . '_' . implode('_', $columns) . '_idx';
                    // Éviter les doublons si l'index existe déjà
                    try {
                        $table_bp->index($columns, $indexName);
                    } catch (\Exception $e) {
                        // Index déjà existant — on ignore
                    }
                }
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'projects'              => [['company_id'], ['company_id', 'status']],
            'sites'                 => [['company_id'], ['company_id', 'status']],
            'clients'               => [['company_id']],
            'quotes'                => [['company_id'], ['company_id', 'status']],
            'suppliers'             => [['company_id']],
            'materials'             => [['company_id']],
            'warehouses'            => [['company_id']],
            'stock_movements'       => [['company_id'], ['company_id', 'material_id']],
            'contracts'             => [['company_id'], ['company_id', 'status']],
            'subcontractors'        => [['company_id']],
            'purchase_orders'       => [['company_id'], ['company_id', 'status']],
            'invoices'              => [['company_id'], ['company_id', 'status']],
            'equipment'             => [['company_id']],
            'maintenance_records'   => [['company_id']],
            'employees'             => [['company_id'], ['company_id', 'status']],
            'attendances'           => [['company_id'], ['company_id', 'employee_id']],
            'payslips'              => [['company_id'], ['company_id', 'employee_id']],
            'tasks'                 => [['company_id'], ['company_id', 'project_id'], ['company_id', 'status']],
            'cash_accounts'         => [['company_id']],
            'treasury_transactions' => [['company_id']],
            'hse_incidents'         => [['company_id']],
            'quality_controls'      => [['company_id']],
            'unit_prices'           => [['company_id']],
            'takeoffs'              => [['company_id']],
            'boqs'                  => [['company_id']],
            'studies'               => [['company_id']],
            'opportunities'         => [['company_id']],
            'tenders'               => [['company_id']],
            'fuel_logs'             => [['company_id']],
            'budgets'               => [['company_id']],
            'cost_entries'          => [['company_id']],
            'accounts'              => [['company_id']],
            'journal_entries'       => [['company_id']],
            'incoming_payments'     => [['company_id']],
            'outgoing_payments'     => [['company_id']],
            'lab_tests'             => [['company_id']],
            'documents'             => [['company_id']],
            'signature_requests'    => [['company_id']],
            'ai_conversations'      => [['company_id']],
            'audit_logs'            => [['company_id']],
        ];

        foreach ($tables as $table => $indexGroups) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            Schema::table($table, function (Blueprint $table_bp) use ($table, $indexGroups) {
                foreach ($indexGroups as $columns) {
                    $indexName = $table . '_' . implode('_', $columns) . '_idx';
                    try {
                        $table_bp->dropIndex($indexName);
                    } catch (\Exception $e) {
                        // Index inexistant — on ignore
                    }
                }
            });
        }
    }
};
