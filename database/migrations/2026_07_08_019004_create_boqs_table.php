<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * DQE — Devis quantitatif estimatif. Document chiffré rattaché à une entreprise,
 * optionnellement lié à un projet. Regroupe des lignes (quantité × prix unitaire).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->string('code');                          // Code du DQE (unique par entreprise)
            $table->string('title');
            $table->string('status')->default('draft');      // draft, validated
            $table->char('currency', 3)->default('XOF');
            $table->decimal('total', 18, 2)->default(0);     // Somme des totaux de ligne
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boqs');
    }
};
