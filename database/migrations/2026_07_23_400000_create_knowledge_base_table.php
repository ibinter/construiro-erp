<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_base', function (Blueprint $table) {
            $table->id();
            $table->string('category')->default('general'); // general, pricing, modules, support, faq
            $table->string('title_fr');
            $table->string('title_en')->nullable();
            $table->text('content_fr');
            $table->text('content_en')->nullable();
            $table->json('keywords')->nullable(); // mots-clés supplémentaires pour le matching
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // 0=normal, 10=important, 20=critique
            $table->timestamps();
        });

        // Index FULLTEXT pour la recherche plein-texte
        DB::statement('ALTER TABLE knowledge_base ADD FULLTEXT ft_kb_fr (title_fr, content_fr)');
        DB::statement('ALTER TABLE knowledge_base ADD FULLTEXT ft_kb_en (title_en, content_en)');
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_base');
    }
};
