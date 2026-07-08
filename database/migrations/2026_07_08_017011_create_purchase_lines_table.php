<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lignes de bon de commande — chaque article/prestation commandé.
 * Le matériau est optionnel (ligne libre possible).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete(); // Article catalogue optionnel

            $table->unsignedInteger('position')->default(0); // Ordre d'affichage
            $table->string('designation');
            $table->string('unit')->nullable();              // u, kg, m2, m3, ml, sac, tonne…
            $table->decimal('quantity', 15, 3)->default(1);
            $table->decimal('unit_price', 18, 2)->default(0);
            $table->decimal('line_total', 18, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_lines');
    }
};
