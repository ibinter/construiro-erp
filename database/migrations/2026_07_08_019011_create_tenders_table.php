<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Appels d'offres (tenders) — suivi des marchés BTP auxquels l'entreprise
 * répond. Rattaché à une entreprise (multi-tenant), éventuellement lié à un
 * projet une fois le marché remporté.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();

            $table->string('code');                          // Code interne (unique par entreprise)
            $table->string('title');
            $table->string('client_name')->nullable();       // Maître d'ouvrage

            $table->string('type')->default('public');       // public, prive, gre_a_gre

            $table->decimal('estimated_amount', 18, 2)->default(0);
            $table->char('currency', 3)->default('XOF');

            // identifie, en_preparation, soumis, gagne, perdu, annule
            $table->string('status')->default('identifie');

            $table->date('submission_deadline')->nullable(); // Date limite de dépôt
            $table->date('submitted_at')->nullable();        // Date effective de soumission
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenders');
    }
};
