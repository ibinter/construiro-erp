<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fournisseurs — un fournisseur rattaché à une entreprise.
 * Isolé par entreprise (multi-tenant). Catégories : matériaux, services,
 * location de matériel, sous-traitance, autre.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('code');                            // Code interne (unique par entreprise)
            $table->string('category')->default('materiaux');  // materiaux, services, location, sous_traitance, autre
            $table->string('name');
            $table->string('contact_name')->nullable();        // Personne à contacter
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->char('country', 2)->default('CI');
            $table->string('tax_id')->nullable();              // NIF / IFU
            $table->string('payment_terms')->nullable();       // Conditions de paiement (ex. "30 jours")
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
