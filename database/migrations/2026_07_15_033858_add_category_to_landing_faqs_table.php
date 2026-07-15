<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('landing_faqs', function (Blueprint $table) {
            $table->string('category', 50)->default('general')->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('landing_faqs', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
