<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sous-traitants — un sous-traitant rattaché à une entreprise.
 * Isolé par entreprise (multi-tenant). Spécialités : gros œuvre, électricité,
 * plomberie, peinture, étanchéité, menuiserie, VRD, autre.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subcontractors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->string('code');                                // Code interne (unique par entreprise)
            $table->string('name');
            $table->string('specialty')->default('gros_oeuvre');   // gros_oeuvre, electricite, plomberie, peinture, etancheite, menuiserie, vrd, autre
            $table->string('contact_name')->nullable();            // Personne à contacter
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->char('country', 2)->default('CI');
            $table->string('tax_id')->nullable();                  // NIF / IFU
            $table->unsignedTinyInteger('rating')->nullable();     // Note de 1 à 5
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('specialty');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subcontractors');
    }
};
