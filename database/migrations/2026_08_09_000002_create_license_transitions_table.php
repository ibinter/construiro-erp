<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Journal des transitions d'état de licence (cahier §9.3, §12.6).
 * Append-only : consultable, jamais modifiable (pas de updated_at).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('subscription_id')->nullable();
            $table->string('from_state', 20)->nullable();
            $table->string('to_state', 20);
            $table->string('cause', 20);          // systeme | superadmin | paiement
            $table->string('actor')->nullable();  // 'systeme' ou email/nom de l'acteur
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['company_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_transitions');
    }
};
