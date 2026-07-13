<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration additive : ajoute client_id (FK nullable vers clients) sur la table
 * boqs. Permet de rattacher un maître d'ouvrage à un DQE.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('boqs', 'client_id')) {
            Schema::table('boqs', function (Blueprint $table) {
                $table->foreignId('client_id')
                    ->nullable()
                    ->constrained('clients')
                    ->nullOnDelete()
                    ->after('project_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('boqs', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn('client_id');
        });
    }
};
