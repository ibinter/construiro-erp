<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pointages — présence journalière d'un employé, éventuellement sur un chantier.
 * Un seul pointage possible par employé et par date.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();

            $table->date('date');
            $table->string('status')->default('present');            // present, absent, leave, half_day
            $table->decimal('hours_worked', 5, 2)->default(8);       // Heures travaillées
            $table->decimal('overtime_hours', 5, 2)->default(0);     // Heures supplémentaires
            $table->string('notes')->nullable();

            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
