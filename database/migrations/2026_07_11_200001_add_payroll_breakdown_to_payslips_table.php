<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            // Présence
            $table->unsignedSmallInteger('working_days')->default(26)->after('period');
            $table->decimal('days_worked', 5, 2)->default(0)->after('working_days');
            $table->decimal('overtime_hours', 5, 2)->default(0)->after('days_worked');

            // Éléments de rémunération
            $table->decimal('base_salary', 18, 2)->default(0)->after('overtime_hours');
            $table->decimal('overtime_amount', 18, 2)->default(0)->after('base_salary');
            $table->decimal('transport_allowance', 18, 2)->default(0)->after('overtime_amount');
            $table->decimal('housing_allowance', 18, 2)->default(0)->after('transport_allowance');
            $table->decimal('other_allowances', 18, 2)->default(0)->after('housing_allowance');

            // Cotisations salariales
            $table->decimal('cnps_employee', 18, 2)->default(0)->after('other_allowances');
            $table->decimal('its_amount', 18, 2)->default(0)->after('cnps_employee');
            $table->decimal('advance_deductions', 18, 2)->default(0)->after('its_amount');

            // Informations employeur (non visibles sur bulletin mais stockées)
            $table->decimal('cnps_employer', 18, 2)->default(0)->after('advance_deductions');

            // Pays / régime utilisé pour le calcul
            $table->char('country_code', 2)->default('CI')->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn([
                'working_days', 'days_worked', 'overtime_hours',
                'base_salary', 'overtime_amount',
                'transport_allowance', 'housing_allowance', 'other_allowances',
                'cnps_employee', 'its_amount', 'advance_deductions', 'cnps_employer',
                'country_code',
            ]);
        });
    }
};
