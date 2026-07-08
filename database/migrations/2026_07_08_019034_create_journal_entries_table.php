<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Écriture de journal (comptabilité générale). Une écriture regroupe plusieurs
 * lignes équilibrées (Σ débit = Σ crédit). Isolation multi-tenant.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            $table->date('date');
            $table->string('piece_number')->nullable();    // N° de pièce comptable
            $table->string('label');

            $table->timestamps();

            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
