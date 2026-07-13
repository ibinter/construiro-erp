<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration additive : ajoute client_id (FK nullable vers clients) sur la table
 * quotes. La colonne client_name existante est conservée pour compatibilité.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('quotes', 'client_id')) {
            Schema::table('quotes', function (Blueprint $table) {
                $table->foreignId('client_id')
                    ->nullable()
                    ->constrained('clients')
                    ->nullOnDelete()
                    ->after('client_name');
            });
        }
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn('client_id');
        });
    }
};
