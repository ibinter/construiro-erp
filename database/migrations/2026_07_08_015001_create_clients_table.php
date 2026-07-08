<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Clients — un client (maître d'ouvrage) rattaché à une entreprise.
 * Isolé par entreprise (multi-tenant). Types : particulier, entreprise,
 * secteur public, promoteur immobilier.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('code');                          // Code interne (unique par entreprise)
            $table->string('type')->default('entreprise');   // particulier, entreprise, public, promoteur
            $table->string('name');
            $table->string('contact_name')->nullable();      // Personne à contacter
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->char('country', 2)->default('CI');
            $table->string('tax_id')->nullable();            // NIF / IFU
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
