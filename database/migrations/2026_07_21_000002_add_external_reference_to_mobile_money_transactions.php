<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mobile_money_transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('mobile_money_transactions', 'external_reference')) {
                $table->string('external_reference', 255)->nullable()->after('reference');
            }
            if (! Schema::hasColumn('mobile_money_transactions', 'provider_status')) {
                $table->string('provider_status', 64)->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('mobile_money_transactions', function (Blueprint $table) {
            $table->dropColumn(['external_reference', 'provider_status']);
        });
    }
};
