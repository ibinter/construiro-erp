<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Encaissements — un paiement reçu par l'entreprise, optionnellement rattaché
 * à un client, à une facture et/ou à un projet. Suit la trésorerie entrante
 * (montant, mode, date). Isolation multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incoming_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();     // Client optionnel
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();    // Facture réglée (optionnel)
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();    // Projet optionnel

            $table->string('code');                        // Code de l'encaissement (unique par entreprise)
            $table->string('payer_name')->nullable();      // Nom du payeur (si pas de client rattaché)

            $table->decimal('amount', 18, 2);              // Montant encaissé
            $table->char('currency', 3)->default('XOF');
            $table->string('method')->default('especes');  // especes, virement, cheque, mobile_money, autre
            $table->date('date');                          // Date de l'encaissement

            $table->string('reference')->nullable();       // Réf. virement / n° chèque / transaction
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incoming_payments');
    }
};
