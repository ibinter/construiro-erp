<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Notifications temps réel — alertes internes de l'ERP.
 * Isolation multi-tenant par company_id. Destinataire optionnel (null = tous
 * les utilisateurs de l'entreprise voient la notification).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('notifications')) return;
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Type métier : invoice_due, quote_accepted, qhse_incident, budget_alert…
            $table->string('type')->default('info');

            $table->string('title');
            $table->text('body')->nullable();
            $table->string('link')->default('');

            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
