<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_faqs', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50); // demarrage, projets, facturation, stocks, rh, securite, rapports, administration, modules, sara_ia, support
            $table->string('question');
            $table->text('answer');
            $table->string('keywords')->nullable();
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['category', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_faqs');
    }
};
