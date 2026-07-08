<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Chantiers — un site de travaux physique rattaché à un projet.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('site_manager_id')->nullable()->constrained('users')->nullOnDelete(); // Chef de chantier

            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();

            $table->string('status')->default('preparation'); // preparation, in_progress, suspended, completed
            $table->unsignedTinyInteger('progress')->default(0);

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['project_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};
