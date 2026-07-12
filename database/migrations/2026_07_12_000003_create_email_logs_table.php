<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email');
            $table->string('type'); // welcome, trial_expiring, payment_confirmed, etc.
            $table->string('subject');
            $table->enum('status', ['sent', 'failed', 'skipped'])->default('sent');
            $table->string('idempotency_key')->unique()->nullable(); // prevents duplicates
            $table->text('error_message')->nullable();
            $table->json('context')->nullable(); // extra data for debugging
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index(['email', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
