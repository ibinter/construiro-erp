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
        Schema::create('changelogs', function (Blueprint $table) {
            $table->id();
            $table->string('version', 20);        // e.g. "1.3.0"
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('changes');              // [{type:'feat'|'fix'|'security', text:''}, ...]
            $table->date('released_at');
            $table->boolean('is_major')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('changelogs');
    }
};
