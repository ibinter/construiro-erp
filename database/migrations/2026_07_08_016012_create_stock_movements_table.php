<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mouvements de stock — entrées, sorties et ajustements par matériau et magasin.
 * Le stock courant se déduit de l'agrégation de ces mouvements
 * (entrées − sorties + ajustements). Isolé par entreprise (multi-tenant).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Auteur du mouvement

            $table->string('type');                            // in, out, adjustment
            $table->decimal('quantity', 15, 3);
            $table->decimal('unit_price', 18, 2)->default(0);  // Prix unitaire au moment du mouvement
            $table->string('reference')->nullable();           // Ex. bon de livraison / bon de sortie
            $table->text('notes')->nullable();
            $table->date('moved_at');

            $table->timestamps();

            $table->index(['material_id', 'warehouse_id']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
