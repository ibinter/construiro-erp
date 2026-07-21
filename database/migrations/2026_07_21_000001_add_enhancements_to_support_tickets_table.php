<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Colonne status : la colonne est varchar — on la convertit en ENUM
        //    avec tous les anciens statuts + les nouveaux.
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN status ENUM(
            'new','open','pending','resolved','closed',
            'assigned','in_progress','waiting_client','waiting_tech','escalated','reopened'
        ) NOT NULL DEFAULT 'new'");

        // 2. Pièces jointes (JSON) + champs SLA sur les tickets
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->json('attachments')->nullable()->after('resolved_at');
            $table->timestamp('first_response_target_at')->nullable()->after('attachments');
            $table->timestamp('resolved_target_at')->nullable()->after('first_response_target_at');
            $table->boolean('sla_breached')->default(false)->after('resolved_target_at');
        });

        // 3. Pièces jointes sur les messages
        Schema::table('support_messages', function (Blueprint $table) {
            $table->json('attachments')->nullable()->after('body');
        });
    }

    public function down(): void
    {
        Schema::table('support_messages', function (Blueprint $table) {
            $table->dropColumn('attachments');
        });

        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropColumn(['attachments', 'first_response_target_at', 'resolved_target_at', 'sla_breached']);
        });

        // Revient au varchar simple
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'new'");
    }
};
