<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Matériaux — catalogue des articles de construction gérés en stock.
 * Isolé par entreprise (multi-tenant). Le stock courant n'est PAS stocké ici :
 * il se calcule à partir des mouvements (stock_movements).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('code');                              // Code article (unique par entreprise)
            $table->string('name');
            $table->string('category')->default('gros_oeuvre');  // gros_oeuvre, second_oeuvre, electricite, plomberie, quincaillerie, consommable, autre
            $table->string('unit')->default('u');                // u, kg, m, m2, m3, ml, sac, tonne
            $table->decimal('unit_price', 18, 2)->default(0);    // Prix de référence
            $table->decimal('min_stock', 15, 3)->default(0);     // Seuil d'alerte
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
