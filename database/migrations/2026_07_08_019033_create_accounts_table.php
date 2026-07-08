<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan comptable (comptabilité générale, référentiel SYSCOHADA simplifié).
 * Chaque compte (ex. 601, 411, 521) appartient à une entreprise et porte
 * un type (actif, passif, charge, produit). Isolation multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('code');                        // Numéro de compte SYSCOHADA (ex. 601)
            $table->string('label');
            $table->string('type');                        // actif, passif, charge, produit

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
