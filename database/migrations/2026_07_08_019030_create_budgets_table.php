<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Budget (prévisionnel) — enveloppe budgétaire rattachée à une entreprise,
 * optionnellement liée à un projet. Regroupe des lignes budgétaires dont
 * découle le montant total planifié. Isolation multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->string('code');                        // Code du budget (unique par entreprise)
            $table->string('title');
            $table->unsignedSmallInteger('fiscal_year');   // Exercice budgétaire

            $table->string('status')->default('draft');    // draft, validated, closed

            $table->decimal('total_amount', 18, 2)->default(0); // Somme des montants planifiés
            $table->char('currency', 3)->default('XOF');

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
