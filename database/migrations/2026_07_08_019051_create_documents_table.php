<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module Gestion documentaire (GED).
 * Stocke les métadonnées des documents (nom / chemin / type). Pas d'upload
 * réel : le chemin ou l'URL est saisi manuellement. Isolé par entreprise
 * (multi-tenant). Rattachement optionnel à un projet.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Rattachement optionnel à un projet.
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();

            $table->string('code');                          // Référence documentaire
            $table->string('title');
            $table->string('category')->default('plan');     // plan, contrat, rapport, facture, photo, administratif, autre
            $table->string('file_name')->nullable();         // Nom du fichier (métadonnée)
            $table->string('file_path')->nullable();         // Chemin / URL (saisi manuellement)
            $table->string('mime_type')->nullable();         // Type MIME (métadonnée)
            $table->integer('size_kb')->nullable();          // Taille en Ko (métadonnée)
            $table->string('version')->default('1.0');
            $table->string('uploaded_by')->nullable();       // Auteur / déposant
            $table->text('description')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
