<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Journal des pleins de carburant du parc roulant.
 * Chaque plein est rattaché à un équipement (engin ou véhicule) et à
 * l'entreprise (isolation multi-tenant). Le coût total est calculé
 * automatiquement (quantité × prix unitaire) côté modèle.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->date('date');
            $table->decimal('quantity', 10, 2);                 // Litres
            $table->decimal('unit_price', 10, 2)->default(0);   // Prix au litre
            $table->decimal('total_cost', 18, 2)->default(0);   // quantity × unit_price
            $table->decimal('odometer', 12, 1)->nullable();     // Compteur (km ou heures)
            $table->string('station')->nullable();              // Station-service
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('equipment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_logs');
    }
};
