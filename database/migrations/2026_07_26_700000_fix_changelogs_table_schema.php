<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajoute les colonnes manquantes à la table changelogs pour aligner
     * la DB sur le modèle Changelog (body, type, published_at, is_published).
     * Les données existantes ne sont pas supprimées.
     * Idempotent : chaque ajout est wrappé dans un try/catch.
     */
    public function up(): void
    {
        Schema::table('changelogs', function (Blueprint $table) {
            try {
                if (! Schema::hasColumn('changelogs', 'body')) {
                    $table->text('body')->nullable()->after('title');
                }
            } catch (\Throwable) {
                // Colonne déjà présente, on ignore.
            }

            try {
                if (! Schema::hasColumn('changelogs', 'type')) {
                    $table->string('type')->default('feature')->after('body');
                }
            } catch (\Throwable) {
                //
            }

            try {
                if (! Schema::hasColumn('changelogs', 'published_at')) {
                    $table->timestamp('published_at')->nullable()->after('type');
                }
            } catch (\Throwable) {
                //
            }

            try {
                if (! Schema::hasColumn('changelogs', 'is_published')) {
                    $table->boolean('is_published')->default(false)->after('published_at');
                }
            } catch (\Throwable) {
                //
            }
        });
    }

    public function down(): void
    {
        Schema::table('changelogs', function (Blueprint $table) {
            $cols = ['body', 'type', 'published_at', 'is_published'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('changelogs', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
