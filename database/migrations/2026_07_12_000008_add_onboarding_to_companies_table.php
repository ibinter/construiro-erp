<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (!Schema::hasColumn('companies', 'logo_path'))
                $table->string('logo_path')->nullable()->after('country');
            if (!Schema::hasColumn('companies', 'enabled_modules'))
                $table->json('enabled_modules')->nullable()->after('logo_path');
            if (!Schema::hasColumn('companies', 'onboarding_completed_at'))
                $table->timestamp('onboarding_completed_at')->nullable()->after('enabled_modules');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['logo_path', 'enabled_modules', 'onboarding_completed_at']);
        });
    }
};
