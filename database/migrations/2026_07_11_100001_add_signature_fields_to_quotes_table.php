<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ajoute les champs de signature électronique simple (SHA-256 côté serveur) à la table quotes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dateTime('signed_at')->nullable()->after('notes');
            $table->string('signed_by')->nullable()->after('signed_at');
            $table->string('signature_hash')->nullable()->after('signed_by');
            $table->string('signature_ip')->nullable()->after('signature_hash');
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn(['signed_at', 'signed_by', 'signature_hash', 'signature_ip']);
        });
    }
};
