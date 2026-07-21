<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('changelogs')) {
            return;
        }
        Schema::create('changelogs', function (Blueprint $table) {
            $table->id();
            $table->string('version', 20);  // ex: v2.4.1
            $table->string('title');
            $table->text('body');           // Markdown
            $table->string('type')->default('feature'); // feature, fix, improvement, security
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('changelogs');
    }
};
