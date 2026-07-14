<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('type', 50);     // payment | ai | email | whatsapp | api | webhook
            $table->string('provider', 50); // orange_money, mtn_momo, wave, groq, smtp, etc.
            $table->boolean('is_enabled')->default(false);
            $table->json('config')->nullable();
            $table->string('webhook_url', 500)->nullable();
            $table->string('webhook_secret', 200)->nullable();
            $table->timestamp('last_tested_at')->nullable();
            $table->boolean('last_test_ok')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'type', 'provider']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};
