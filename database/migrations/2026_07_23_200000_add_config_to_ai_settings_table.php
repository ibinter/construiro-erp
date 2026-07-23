<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Étend la table ai_settings pour :
 *  - Permettre un enregistrement global plateforme (company_id nullable).
 *  - Ajouter les colonnes pour la config avancée SARA multi-fournisseur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_settings', function (Blueprint $table) {
            // Rendre company_id nullable → permet un enregistrement global
            // (company_id = null) pour configurer SARA au niveau plateforme.
            $table->dropForeign(['company_id']);
            $table->dropUnique('ai_settings_company_id_unique');

            $table->unsignedBigInteger('company_id')->nullable()->change();

            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->cascadeOnDelete();

            // Colonnes supplémentaires pour la config multi-fournisseur
            $table->boolean('sara_enabled')->default(true)->after('enabled');
            $table->unsignedSmallInteger('max_tokens')->default(1024)->after('sara_enabled');
            $table->decimal('temperature', 3, 2)->default(0.70)->after('max_tokens');
            $table->json('config')->nullable()->after('temperature');

            // Valeur par défaut 'groq' (remplace 'none')
            $table->string('provider')->default('groq')->change();
        });
    }

    public function down(): void
    {
        Schema::table('ai_settings', function (Blueprint $table) {
            $table->dropColumn(['sara_enabled', 'max_tokens', 'temperature', 'config']);

            $table->dropForeign(['company_id']);
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
            $table->unique('company_id');
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->cascadeOnDelete();

            $table->string('provider')->default('none')->change();
        });
    }
};
