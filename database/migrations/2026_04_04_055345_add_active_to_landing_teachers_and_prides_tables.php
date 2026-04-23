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
        Schema::table('landing_teachers', function (Blueprint $table) {
            $table->boolean('active')->default(true)->after('position');
        });

        Schema::table('landing_prides', function (Blueprint $table) {
            $table->boolean('active')->default(true)->after('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_teachers', function (Blueprint $table) {
            $table->dropColumn('active');
        });

        Schema::table('landing_prides', function (Blueprint $table) {
            $table->dropColumn('active');
        });
    }
};
