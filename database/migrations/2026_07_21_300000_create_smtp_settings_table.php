<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('smtp_settings')) {
            return;
        }
        Schema::create('smtp_settings', function (Blueprint $table) {
            $table->id();
            $table->string('host')->default('smtp.mailgun.org');
            $table->integer('port')->default(587);
            $table->string('username')->nullable();
            $table->string('password')->nullable(); // stocké chiffré via cast 'encrypted'
            $table->string('encryption')->default('tls'); // tls, ssl, null
            $table->string('from_address')->default('noreply@construiro.com');
            $table->string('from_name')->default('CONSTRUIRO ERP');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('smtp_settings');
    }
};
