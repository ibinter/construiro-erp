<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name_fr');
            $table->string('name_en');
            $table->string('icon', 50)->nullable();   // emoji ou nom d'icône
            $table->string('color', 20)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('training_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('training_categories')->cascadeOnDelete();
            $table->string('type')->default('video');       // video, document, quiz
            $table->string('title_fr');
            $table->string('title_en')->nullable();
            $table->text('description_fr')->nullable();
            $table->text('description_en')->nullable();
            $table->string('url')->nullable();              // URL vidéo YouTube/Vimeo ou chemin fichier
            $table->string('thumbnail')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->string('level')->default('beginner');   // beginner, intermediate, advanced
            $table->string('role_restriction')->nullable(); // null = tous les rôles
            $table->boolean('is_published')->default(false);
            $table->integer('sort_order')->default(0);
            $table->integer('view_count')->default(0);
            $table->timestamps();
        });

        Schema::create('training_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('resource_id')->constrained('training_resources')->cascadeOnDelete();
            $table->boolean('completed')->default(false);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'resource_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_progress');
        Schema::dropIfExists('training_resources');
        Schema::dropIfExists('training_categories');
    }
};
