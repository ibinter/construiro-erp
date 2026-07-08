<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Factures — une facture chiffrée rattachée à une entreprise, optionnellement
 * liée à un client et/ou un projet. Regroupe des lignes et suit les paiements
 * (montant payé / reste à payer). Isolation multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();   // Client optionnel
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();  // Projet optionnel

            $table->string('code');                        // Code de la facture (unique par entreprise)

            $table->string('status')->default('draft');    // draft, sent, partial, paid, overdue, cancelled

            $table->char('currency', 3)->default('XOF');
            $table->date('issue_date')->nullable();        // Date d'émission
            $table->date('due_date')->nullable();          // Date d'échéance

            $table->decimal('tax_rate', 5, 2)->default(18); // Taux de TVA en %

            $table->decimal('subtotal', 18, 2)->default(0);    // Sous-total HT
            $table->decimal('tax_amount', 18, 2)->default(0);  // Montant TVA
            $table->decimal('total', 18, 2)->default(0);       // Total TTC
            $table->decimal('amount_paid', 18, 2)->default(0); // Montant déjà encaissé

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
