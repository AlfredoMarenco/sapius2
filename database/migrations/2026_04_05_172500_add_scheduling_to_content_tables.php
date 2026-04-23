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
        Schema::table('modules', function (Blueprint $table) {
            $table->boolean('is_scheduled')->default(false)->after('is_active');
            $table->dateTime('available_at')->nullable()->after('is_scheduled');
            $table->dateTime('expires_at')->nullable()->after('available_at');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->boolean('is_scheduled')->default(false)->after('is_active');
            $table->dateTime('available_at')->nullable()->after('is_scheduled');
            $table->dateTime('expires_at')->nullable()->after('available_at');
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->boolean('is_scheduled')->default(false)->after('passing_score');
            $table->dateTime('available_at')->nullable()->after('is_scheduled');
            $table->dateTime('expires_at')->nullable()->after('available_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn(['is_scheduled', 'available_at', 'expires_at']);
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['is_scheduled', 'available_at', 'expires_at']);
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['is_scheduled', 'available_at', 'expires_at']);
        });
    }
};
