<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table des entreprises (multi-entreprise).
 * Racine du modèle multi-tenant : chaque donnée métier appartient à une entreprise.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');                             // Nom commercial
            $table->string('legal_name')->nullable();           // Raison sociale
            $table->string('slug')->unique();
            $table->string('registration_number')->nullable();  // RCCM
            $table->string('tax_id')->nullable();               // NIF / IFU
            $table->string('country', 2)->default('CI');        // Code ISO pays
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('base_currency', 3)->default('XOF');  // FCFA par défaut
            $table->string('locale', 5)->default('fr');
            $table->string('timezone')->default('Africa/Abidjan');
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();               // Paramètres personnalisés
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
