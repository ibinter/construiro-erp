<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Magasins / dépôts — lieux de stockage des matériaux.
 * Isolé par entreprise (multi-tenant).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('code');                       // Code magasin (unique par entreprise)
            $table->string('name');
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('manager_name')->nullable();   // Magasinier responsable
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
