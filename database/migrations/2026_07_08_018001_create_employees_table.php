<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Employés — ressource RH rattachée à une entreprise.
 * Un employé est distinct d'un compte utilisateur (User) et peut être
 * affecté à un chantier (site) et à une agence.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete(); // Chantier d'affectation

            $table->string('matricule');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('job_title')->nullable();          // Poste occupé
            $table->string('department')->default('chantier'); // chantier, bureau, direction, logistique, autre
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->date('hire_date')->nullable();             // Date d'embauche
            $table->string('contract_type')->default('cdi');   // cdi, cdd, journalier, stage, prestation
            $table->decimal('base_salary', 18, 2)->default(0); // Salaire de base
            $table->char('currency', 3)->default('XOF');
            $table->string('status')->default('active');       // active, suspended, terminated
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'matricule']);
            $table->index('status');
            $table->index('department');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
