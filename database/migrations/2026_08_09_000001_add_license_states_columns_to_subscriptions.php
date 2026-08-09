<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cahier IBIG Licence v1.1 — fondations du modèle à 6 états.
 *
 * Additive et non destructive : on conserve les valeurs de statut existantes
 * (trial/active/grace/expired/cancelled) et l'on rend simplement le modèle
 * capable de porter les états DEMO et FREE (Découverte) :
 *   - plan_id nullable (DEMO et FREE n'ont pas de formule)
 *   - purge_at : date de purge J+90 pour les espaces EXPIRED
 *   - trial_extended_at / extension_reason : prolongation d'essai unique (15 j)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->change();
            $table->timestamp('purge_at')->nullable()->after('grace_ends_at');
            $table->timestamp('trial_extended_at')->nullable()->after('purge_at');
            $table->string('extension_reason')->nullable()->after('trial_extended_at');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['purge_at', 'trial_extended_at', 'extension_reason']);
            // plan_id repasse en non-nullable
            $table->foreignId('plan_id')->nullable(false)->change();
        });
    }
};
