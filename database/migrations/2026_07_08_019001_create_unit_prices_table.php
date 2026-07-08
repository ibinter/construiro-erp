<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * BPU — Bibliothèque de prix unitaires. Référentiel de prix par entreprise,
 * réutilisable pour composer les devis quantitatifs (DQE). Isolé multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('code');                          // Code interne (unique par entreprise)
            $table->string('designation');
            $table->string('unit')->default('u');            // u, m2, m3, ml, kg, forfait
            $table->string('category')->default('autre');    // gros_oeuvre, second_oeuvre, vrd, electricite, plomberie, autre
            $table->decimal('unit_price', 18, 2)->default(0);
            $table->char('currency', 3)->default('XOF');
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_prices');
    }
};
