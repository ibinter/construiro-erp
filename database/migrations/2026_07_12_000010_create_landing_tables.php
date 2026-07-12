<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_faqs', function (Blueprint $table) {
            $table->id();
            $table->text('question_fr');
            $table->text('question_en')->nullable();
            $table->text('answer_fr');
            $table->text('answer_en')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('landing_temoignages', function (Blueprint $table) {
            $table->id();
            $table->string('initiales', 4);
            $table->string('nom');
            $table->string('poste');
            $table->string('ville');
            $table->text('texte_fr');
            $table->text('texte_en')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->string('label')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_faqs');
        Schema::dropIfExists('landing_temoignages');
        Schema::dropIfExists('settings');
    }
};
