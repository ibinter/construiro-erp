<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 50); // page_view, demo_request, signup, login, conversion
            $table->string('page', 255)->nullable();
            $table->string('source', 100)->nullable();   // utm_source
            $table->string('medium', 100)->nullable();   // utm_medium
            $table->string('campaign', 100)->nullable(); // utm_campaign
            $table->string('country', 2)->nullable();
            $table->string('device', 20)->nullable();    // mobile, tablet, desktop
            $table->string('referrer', 500)->nullable();
            $table->unsignedBigInteger('company_id')->nullable(); // null = visiteur anonyme
            $table->string('session_id', 40)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->index(['event_type', 'occurred_at']);
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
