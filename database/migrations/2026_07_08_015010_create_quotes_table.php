<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Devis (Bureau d'études) — un devis chiffré rattaché à une entreprise,
 * optionnellement lié à un projet. Regroupe des lignes de prestation.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->string('code');                        // Code du devis (unique par entreprise)
            $table->string('title');
            $table->string('client_name')->nullable();     // Maître d'ouvrage / client

            $table->string('status')->default('draft');    // draft, sent, accepted, rejected, expired

            $table->char('currency', 3)->default('XOF');
            $table->decimal('tax_rate', 5, 2)->default(18); // Taux de TVA en %

            $table->decimal('subtotal', 18, 2)->default(0);   // Sous-total HT
            $table->decimal('tax_amount', 18, 2)->default(0); // Montant TVA
            $table->decimal('total', 18, 2)->default(0);      // Total TTC

            $table->date('date')->nullable();
            $table->date('valid_until')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
