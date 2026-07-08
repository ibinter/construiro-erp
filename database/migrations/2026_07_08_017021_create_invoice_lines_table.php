<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lignes de facture — chaque prestation/article chiffré d'une facture.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('position')->default(0); // Ordre d'affichage
            $table->string('designation');
            $table->string('unit')->nullable();              // u, m2, m3, ml, forfait, kg…
            $table->decimal('quantity', 15, 3)->default(1);
            $table->decimal('unit_price', 18, 2)->default(0);
            $table->decimal('line_total', 18, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_lines');
    }
};
