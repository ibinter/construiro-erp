<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Métré — feuille de métré rattachée à une entreprise, optionnellement liée
 * à un projet. Regroupe des lignes de quantités calculées. Isolé multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('takeoffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete(); // Rattachement optionnel

            $table->string('code');                          // Code du métré (unique par entreprise)
            $table->string('title');
            $table->string('status')->default('draft');      // draft, validated
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('takeoffs');
    }
};
