<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module Assistant IA — historique des échanges question / réponse.
 *
 * L'« IA » est un assistant d'analyse fondé sur des règles simples (pas d'appel
 * LLM externe) : il interroge les données de l'entreprise et renvoie des
 * observations. Cette table conserve l'historique des questions posées et des
 * réponses générées. Isolée par entreprise (multi-tenant).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Auteur de la question ; nullable pour conserver l'historique si le
            // compte est supprimé.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->text('question');
            $table->text('answer');

            $table->timestamps();

            $table->index(['company_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};
