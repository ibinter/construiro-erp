<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module Laboratoire — essais et prélèvements.
 * Enregistre les essais de matériaux (béton, sol, granulat...) avec un
 * résultat (conforme / non conforme / en attente). Isolé par entreprise
 * (multi-tenant). Rattachement optionnel à un projet et à un chantier.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Rattachement optionnel à un projet / chantier.
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();

            $table->string('code');                              // Code interne (unique par entreprise)
            $table->string('sample_type')->default('beton');     // beton, sol, granulat, acier, bitume, autre
            $table->string('test_name');                         // Intitulé de l'essai
            $table->date('sample_date')->nullable();             // Date de prélèvement
            $table->date('test_date')->nullable();               // Date de l'essai
            $table->decimal('result_value', 12, 3)->nullable();  // Valeur mesurée
            $table->string('unit')->nullable();                  // Unité (MPa, %, kg/m3...)
            $table->decimal('threshold', 12, 3)->nullable();     // Seuil / valeur requise
            $table->string('result')->default('en_attente');     // conforme, non_conforme, en_attente
            $table->string('technician')->nullable();            // Technicien / laboratoire
            $table->text('observations')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('result');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_tests');
    }
};
