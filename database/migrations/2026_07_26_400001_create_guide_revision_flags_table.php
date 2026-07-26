<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guide_revision_flags', function (Blueprint $table) {
            $table->id();
            $table->string('module_key', 50)->unique();
            $table->boolean('needs_revision')->default(true);
            $table->text('reason')->nullable();
            $table->timestamp('flagged_at')->nullable();
            $table->string('flagged_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_revision_flags');
    }
};
