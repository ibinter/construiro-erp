<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module Signature électronique.
 * Modélise le WORKFLOW de signature (statut) sans signature cryptographique
 * réelle. Isolé par entreprise (multi-tenant). Rattachement optionnel à un
 * document de la GED.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signature_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // Rattachement optionnel à un document de la GED.
            $table->foreignId('document_id')->nullable()->constrained('documents')->nullOnDelete();

            $table->string('title');
            $table->string('signer_name');                 // Signataire
            $table->string('signer_email')->nullable();
            $table->string('status')->default('pending');  // pending, signed, refused, expired
            $table->date('sent_at')->nullable();           // Date d'envoi de la demande
            $table->date('signed_at')->nullable();         // Date de signature / refus
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signature_requests');
    }
};
