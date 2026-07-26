<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_features', function (Blueprint $table) {
            $table->id();
            $table->string('module_key', 50);   // ex: 'projets', 'facturation', 'rh', 'stocks'
            $table->string('feature_key', 100); // ex: 'projets.create', 'factures.export_pdf'
            $table->string('label_fr');
            $table->string('label_en')->nullable();
            $table->json('available_in_plans');  // ['starter', 'pro', 'enterprise'] — source de vérité
            $table->boolean('is_active')->default(true);
            $table->string('last_changed_by')->nullable(); // email admin qui a changé
            $table->timestamp('last_changed_at')->nullable();
            $table->timestamps();

            $table->unique(['module_key', 'feature_key']);
            $table->index('module_key');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_features');
    }
};
