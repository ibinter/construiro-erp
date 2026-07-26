<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            try {
                if (!Schema::hasIndex('projects', 'projects_company_status_idx')) {
                    $table->index(['company_id', 'status'], 'projects_company_status_idx');
                }
            } catch (\Exception $e) {
                // Index déjà existant, on continue
            }
        });

        Schema::table('invoices', function (Blueprint $table) {
            try {
                if (!Schema::hasIndex('invoices', 'invoices_company_status_idx')) {
                    $table->index(['company_id', 'status'], 'invoices_company_status_idx');
                }
            } catch (\Exception $e) {
                // Index déjà existant, on continue
            }
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            try {
                if (!Schema::hasIndex('audit_logs', 'audit_company_created_idx')) {
                    $table->index(['company_id', 'created_at'], 'audit_company_created_idx');
                }
            } catch (\Exception $e) {
                // Index déjà existant, on continue
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            try {
                $table->dropIndex('projects_company_status_idx');
            } catch (\Exception $e) {
                //
            }
        });

        Schema::table('invoices', function (Blueprint $table) {
            try {
                $table->dropIndex('invoices_company_status_idx');
            } catch (\Exception $e) {
                //
            }
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            try {
                $table->dropIndex('audit_company_created_idx');
            } catch (\Exception $e) {
                //
            }
        });
    }
};
