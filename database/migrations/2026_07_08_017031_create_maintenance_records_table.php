<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Historique de maintenance simple d'un équipement du parc matériel.
 * Chaque enregistrement est rattaché à un équipement (« equipment »).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();

            $table->string('type')->default('preventive');   // preventive, curative, revision
            $table->string('description');
            $table->decimal('cost', 18, 2)->default(0);
            $table->date('performed_at');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};
