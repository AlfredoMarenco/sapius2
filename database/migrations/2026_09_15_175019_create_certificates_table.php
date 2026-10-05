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
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('curso_programado_id')->constrained('cursos_programados')->onDelete('cascade');
            $table->string('codigo_validacion')->unique();
            $table->date('fecha_emision');
            $table->timestamps();

            // Un usuario solo puede tener un certificado por curso_programado
            $table->unique(['user_id', 'curso_programado_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
