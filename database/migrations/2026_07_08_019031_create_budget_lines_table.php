<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lignes de budget — chaque poste budgétaire d'un budget, avec son montant
 * planifié et son montant réalisé (suivi de l'écart budgétaire).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('position')->default(0); // Ordre d'affichage
            $table->string('category')->nullable();          // Regroupement du poste
            $table->string('label');

            $table->decimal('planned_amount', 18, 2)->default(0); // Montant planifié
            $table->decimal('actual_amount', 18, 2)->default(0);  // Montant réalisé

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_lines');
    }
};
