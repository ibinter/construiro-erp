<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Contrats — un contrat rattaché à une entreprise (multi-tenant).
 * Peut être rattaché (optionnellement) à un projet existant. La contrepartie
 * est un texte libre (party_name) ; les relations dures viendront plus tard.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->string('code');                        // Code interne (unique par entreprise)
            $table->string('title');
            $table->string('type')->default('client');     // client, sous_traitance, fournisseur, autre
            $table->string('party_name')->nullable();      // Nom de la contrepartie

            $table->decimal('amount', 18, 2)->default(0);
            $table->char('currency', 3)->default('XOF');
            $table->string('status')->default('draft');    // draft, active, suspended, closed, cancelled

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('signed_date')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
