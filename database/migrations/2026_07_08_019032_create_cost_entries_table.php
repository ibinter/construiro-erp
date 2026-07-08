<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Écriture analytique (comptabilité analytique) — enregistre une charge ou un
 * produit ventilé selon un axe analytique (chantier, matériel, main d'œuvre,
 * sous-traitance, frais généraux), optionnellement rattaché à un projet.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cost_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->date('date');
            $table->string('axis')->default('chantier');  // chantier, materiel, main_oeuvre, sous_traitance, frais_generaux
            $table->string('label');
            $table->string('type');                        // charge | produit
            $table->decimal('amount', 18, 2);
            $table->string('reference')->nullable();

            $table->timestamps();

            $table->index('project_id');
            $table->index('axis');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_entries');
    }
};
