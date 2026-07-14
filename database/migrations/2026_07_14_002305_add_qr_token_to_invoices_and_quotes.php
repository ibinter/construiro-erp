<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Factures
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('verify_token', 64)->nullable()->unique()->after('notes');
            $table->string('document_hash', 64)->nullable()->after('verify_token');
        });

        // Devis
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('verify_token', 64)->nullable()->unique()->after('notes');
            $table->string('document_hash', 64)->nullable()->after('verify_token');
        });

        // Contrats
        Schema::table('contracts', function (Blueprint $table) {
            $table->string('verify_token', 64)->nullable()->unique()->after('notes');
            $table->string('document_hash', 64)->nullable()->after('verify_token');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['verify_token', 'document_hash']);
        });
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn(['verify_token', 'document_hash']);
        });
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['verify_token', 'document_hash']);
        });
    }
};
