<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module QHSE — incidents et accidents.
 * Déclaration et suivi des évènements de sécurité, santé, environnement.
 * Isolé par entreprise (multi-tenant). Rattachement optionnel à un projet
 * et à un chantier.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hse_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Rattachement optionnel à un projet / chantier.
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();

            $table->string('code');                                 // Code interne (unique par entreprise)
            $table->string('type')->default('accident');            // accident, presque_accident, environnement, incendie, autre
            $table->string('severity')->default('mineur');          // mineur, modere, majeur, critique
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('incident_date');
            $table->string('location')->nullable();                 // Lieu précis de l'incident
            $table->string('status')->default('ouvert');            // ouvert, en_cours, cloture
            $table->text('corrective_action')->nullable();          // Action corrective
            $table->string('reported_by')->nullable();              // Déclarant

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
            $table->index('severity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hse_incidents');
    }
};
