<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bureau d'études — registre des études (plans, notes de calcul, études de sol…).
 * Rattaché à une entreprise, optionnellement lié à un projet. Isolé multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->string('code');                          // Code de l'étude (unique par entreprise)
            $table->string('title');
            $table->string('type')->default('autre');        // plan, note_calcul, etude_sol, autre
            $table->string('status')->default('en_cours');   // en_cours, valide, rejete
            $table->string('author')->nullable();            // Auteur / responsable de l'étude
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studies');
    }
};
