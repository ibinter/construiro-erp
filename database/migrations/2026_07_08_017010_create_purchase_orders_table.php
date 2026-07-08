<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bons de commande (Achats) — un bon de commande rattaché à une entreprise
 * et à un fournisseur, optionnellement lié à un projet. Regroupe des lignes
 * d'articles dont découlent les totaux.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->restrictOnDelete(); // Fournisseur obligatoire
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->string('code');                        // Code du bon de commande (unique par entreprise)

            $table->string('status')->default('draft');    // draft, sent, confirmed, received, cancelled

            $table->char('currency', 3)->default('XOF');

            $table->date('order_date')->nullable();        // Date de commande
            $table->date('expected_date')->nullable();     // Date de livraison prévue

            $table->decimal('tax_rate', 5, 2)->default(18); // Taux de TVA en %

            $table->decimal('subtotal', 18, 2)->default(0);   // Sous-total HT
            $table->decimal('tax_amount', 18, 2)->default(0); // Montant TVA
            $table->decimal('total', 18, 2)->default(0);      // Total TTC

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
