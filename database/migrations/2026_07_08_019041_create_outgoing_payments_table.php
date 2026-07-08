<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Décaissements — un paiement effectué par l'entreprise, optionnellement rattaché
 * à un fournisseur, à un bon de commande et/ou à un projet. Suit la trésorerie
 * sortante (montant, catégorie, mode, date). Isolation multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outgoing_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();              // Fournisseur optionnel
            $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();  // Bon de commande réglé (optionnel)
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();                // Projet optionnel

            $table->string('code');                          // Code du décaissement (unique par entreprise)
            $table->string('payee_name')->nullable();        // Nom du bénéficiaire (si pas de fournisseur rattaché)

            $table->decimal('amount', 18, 2);                // Montant décaissé
            $table->char('currency', 3)->default('XOF');
            $table->string('category')->default('fournisseur'); // fournisseur, salaire, sous_traitant, charge, impot, autre
            $table->string('method')->default('virement');   // especes, virement, cheque, mobile_money, autre
            $table->date('date');                            // Date du décaissement

            $table->string('reference')->nullable();         // Réf. virement / n° chèque / transaction
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outgoing_payments');
    }
};
