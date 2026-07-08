<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lignes de métré — chaque poste mesuré. La quantité découle des dimensions
 * (nombre × longueur × largeur × hauteur) lorsqu'elles sont renseignées,
 * sinon elle est saisie directement. Calcul assuré par le modèle TakeoffLine.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('takeoff_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('takeoff_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('position')->default(0); // Ordre d'affichage
            $table->string('designation');
            $table->string('unit')->nullable();              // u, m2, m3, ml, kg, forfait

            $table->decimal('length', 15, 3)->nullable();    // Longueur
            $table->decimal('width', 15, 3)->nullable();     // Largeur
            $table->decimal('height', 15, 3)->nullable();    // Hauteur
            $table->decimal('count', 15, 3)->default(1);     // Nombre d'occurrences
            $table->decimal('quantity', 18, 3)->default(0);  // Quantité résultante

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('takeoff_lines');
    }
};
