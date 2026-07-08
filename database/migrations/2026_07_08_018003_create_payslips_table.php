<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bulletins de paie — un bulletin par employé et par période (mois).
 * Le salaire net est calculé automatiquement (brut - retenues).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();

            $table->char('period', 7);                          // Période au format 'YYYY-MM'
            $table->decimal('gross_salary', 18, 2)->default(0); // Salaire brut
            $table->decimal('deductions', 18, 2)->default(0);   // Retenues (cotisations, avances…)
            $table->decimal('net_salary', 18, 2)->default(0);   // Salaire net (calculé)
            $table->char('currency', 3)->default('XOF');
            $table->string('status')->default('draft');         // draft, validated, paid
            $table->string('notes')->nullable();

            $table->timestamps();

            $table->unique(['employee_id', 'period']);
            $table->index('period');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};
