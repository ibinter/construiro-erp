<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Parc matériel — équipements (engins, véhicules, matériel, outillage).
 * Isolé par entreprise (multi-tenant). Un équipement peut être affecté à
 * un chantier (current_site_id → sites) et suit un statut opérationnel.
 * La table s'appelle « equipment » (invariable).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Chantier d'affectation courant (facultatif).
            $table->foreignId('current_site_id')->nullable()->constrained('sites')->nullOnDelete();

            $table->string('code');                             // Code interne (unique par entreprise)
            $table->string('name');
            $table->string('category')->default('engin');       // engin, vehicule, materiel, outillage
            $table->string('brand')->nullable();                // Marque
            $table->string('model')->nullable();                // Modèle
            $table->string('registration')->nullable();         // Immatriculation / n° de série
            $table->string('status')->default('available');     // available, in_use, maintenance, out_of_service
            $table->date('acquisition_date')->nullable();
            $table->decimal('acquisition_value', 18, 2)->default(0);
            $table->char('currency', 3)->default('XOF');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('category');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
