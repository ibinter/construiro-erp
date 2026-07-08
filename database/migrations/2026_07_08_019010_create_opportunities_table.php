<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Opportunités (CRM) — pipeline de prospection commerciale rattaché à une
 * entreprise (multi-tenant). Une opportunité peut être liée à un client
 * existant et affectée à un commercial (utilisateur).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete(); // Commercial affecté

            $table->string('code');                          // Code interne (unique par entreprise)
            $table->string('title');
            $table->string('client_name')->nullable();       // Prospect libre (si non rattaché à un client)

            $table->decimal('estimated_amount', 18, 2)->default(0);
            $table->char('currency', 3)->default('XOF');

            // prospect, qualifie, proposition, negociation, gagne, perdu
            $table->string('stage')->default('prospect');
            $table->unsignedTinyInteger('probability')->default(0); // 0-100 %

            $table->date('expected_close_date')->nullable();
            $table->string('source')->nullable();            // Origine du prospect (recommandation, appel d'offres, salon...)
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('stage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
