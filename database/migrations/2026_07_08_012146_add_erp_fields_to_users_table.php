<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Rattache chaque utilisateur à une entreprise / agence et ajoute les
 * champs ERP (préférences, statut, sécurité).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')
                ->constrained()->nullOnDelete();
            $table->foreignId('agency_id')->nullable()->after('company_id')
                ->constrained()->nullOnDelete();
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_path')->nullable()->after('phone');
            $table->string('locale', 5)->default('fr')->after('avatar_path');
            $table->string('job_title')->nullable()->after('locale'); // Fonction
            $table->boolean('is_active')->default(true)->after('job_title');
            $table->boolean('must_change_password')->default(false)->after('is_active');
            $table->timestamp('last_login_at')->nullable()->after('must_change_password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
            $table->dropConstrainedForeignId('agency_id');
            $table->dropColumn([
                'phone', 'avatar_path', 'locale', 'job_title',
                'is_active', 'must_change_password', 'last_login_at',
            ]);
        });
    }
};
