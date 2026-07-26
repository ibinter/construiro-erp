<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('demo_sessions')) {
            return;
        }
        Schema::create('demo_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demo_request_id')->nullable()->constrained('demo_requests')->nullOnDelete();
            $table->string('prospect_name');
            $table->string('prospect_email');
            $table->string('prospect_company')->nullable();
            $table->string('assigned_to')->nullable(); // email IBIG responsable
            $table->dateTime('scheduled_at')->nullable();
            $table->integer('duration_minutes')->default(45);
            $table->enum('status', ['to_schedule', 'scheduled', 'done', 'cancelled', 'no_show'])->default('to_schedule');
            $table->string('meeting_url')->nullable(); // lien Zoom/Meet
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_sessions');
    }
};
