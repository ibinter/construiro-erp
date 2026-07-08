<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lignes de DQE — chaque poste chiffré. Le total de ligne est recalculé
 * automatiquement (quantité × prix unitaire) à l'enregistrement.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boq_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boq_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('position')->default(0); // Ordre d'affichage
            $table->string('designation');
            $table->string('unit')->nullable();              // u, m2, m3, ml, kg, forfait
            $table->decimal('quantity', 15, 3)->default(1);
            $table->decimal('unit_price', 18, 2)->default(0);
            $table->decimal('line_total', 18, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boq_lines');
    }
};
