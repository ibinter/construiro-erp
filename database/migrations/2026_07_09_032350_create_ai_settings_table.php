<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Configuration IA par entreprise. Chaque entreprise choisit son fournisseur
 * (Grok, Claude, OpenAI…) et fournit SA PROPRE clé API (stockée chiffrée).
 * Aucune clé n'est embarquée dans le logiciel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('provider')->default('none'); // none, grok, anthropic, openai
            $table->text('api_key')->nullable();          // chiffré via cast 'encrypted'
            $table->string('model')->nullable();
            $table->string('base_url')->nullable();
            $table->boolean('enabled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_settings');
    }
};
