<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Projets — un projet de construction (marché / opération) rattaché à une
 * entreprise. Un projet regroupe un ou plusieurs chantiers.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete(); // Directeur de projet

            $table->string('code');                        // Code interne (unique par entreprise)
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('client_name')->nullable();     // Maître d'ouvrage (module Clients à venir)

            $table->string('type')->default('batiment');   // batiment, genie_civil, route, hydraulique, vrd, autre
            $table->string('status')->default('draft');    // draft, in_progress, on_hold, completed, cancelled

            $table->decimal('budget_amount', 18, 2)->default(0);
            $table->string('currency', 3)->default('XOF');
            $table->unsignedTinyInteger('progress')->default(0); // 0-100 %

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->string('country', 2)->default('CI');
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'code']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
