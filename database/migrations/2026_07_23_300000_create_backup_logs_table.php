<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_logs', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('type')->default('full'); // full, database, files
            $table->string('status')->default('pending'); // pending, running, completed, failed
            $table->bigInteger('size_bytes')->nullable();
            $table->string('path')->nullable(); // storage path (private)
            $table->string('checksum')->nullable(); // SHA-256
            $table->text('error_message')->nullable();
            $table->string('initiated_by')->default('scheduler'); // scheduler, admin
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_logs');
    }
};
