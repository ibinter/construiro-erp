<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('email_templates')) {
            return;
        }
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();          // 'welcome', 'trial_expiring_7', etc.
            $table->string('subject_fr');
            $table->string('subject_en')->nullable();
            $table->longText('body_fr');               // HTML éditable
            $table->longText('body_en')->nullable();
            $table->json('variables')->nullable();     // Liste des variables disponibles
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
