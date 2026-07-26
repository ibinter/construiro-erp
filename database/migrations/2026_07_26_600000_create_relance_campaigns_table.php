<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relance_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 30); // trial_expiring, demo_no_response, offer_pending, inactive_users, custom
            $table->text('subject');
            $table->longText('body_html');
            $table->enum('status', ['draft', 'scheduled', 'running', 'completed', 'paused'])->default('draft');
            $table->integer('target_count')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('opened_count')->default(0);
            $table->integer('clicked_count')->default(0);
            $table->integer('unsubscribed_count')->default(0);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('filters')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('relance_campaign_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('relance_campaigns')->cascadeOnDelete();
            $table->string('email');
            $table->string('name')->nullable();
            $table->string('company_name')->nullable();
            $table->enum('status', ['pending', 'sent', 'opened', 'clicked', 'unsubscribed', 'bounced'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->string('tracking_token', 40)->nullable()->unique();
            $table->timestamps();
            $table->index(['campaign_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relance_campaign_recipients');
        Schema::dropIfExists('relance_campaigns');
    }
};
