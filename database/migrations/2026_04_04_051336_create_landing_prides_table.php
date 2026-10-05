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
        if (!Schema::hasTable('landing_prides')) {
            Schema::create('landing_prides', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('text')->nullable();
            $table->text('text2')->nullable();
            $table->string('img');
            $table->integer('position')->default(0);
            $table->timestamps();
        });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_prides');
    }
};
