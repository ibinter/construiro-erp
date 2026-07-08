<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module Qualité — contrôles et inspections.
 * Suivi des contrôles qualité avec un résultat (conforme / non conforme).
 * Isolé par entreprise (multi-tenant). Rattachement optionnel à un projet
 * et à un chantier.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quality_controls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Rattachement optionnel à un projet / chantier.
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();

            $table->string('code');                                 // Code interne (unique par entreprise)
            $table->string('control_type')->default('reception');   // reception, en_cours, essai, final
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('control_date');
            $table->string('inspector')->nullable();                // Inspecteur / contrôleur
            $table->string('result')->default('en_attente');        // conforme, non_conforme, en_attente
            $table->text('observations')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('result');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_controls');
    }
};
