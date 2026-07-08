<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table des devises (multi-devises).
 * Référentiel des monnaies utilisables : FCFA, USD, EUR, etc.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();          // XOF, USD, EUR
            $table->string('name');                        // Franc CFA BCEAO
            $table->string('symbol', 10);                  // FCFA, $, €
            $table->unsignedTinyInteger('decimal_places')->default(0);
            $table->decimal('exchange_rate', 18, 6)->default(1); // Taux vs devise de référence
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
