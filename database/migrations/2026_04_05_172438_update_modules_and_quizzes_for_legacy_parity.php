<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add image to modules
        Schema::table('modules', function (Blueprint $table) {
            if (!Schema::hasColumn('modules', 'image')) {
                $table->string('image')->nullable()->after('slug');
            }
        });

        // Change to string to allow data mapping.
        DB::statement("ALTER TABLE quizzes MODIFY COLUMN type VARCHAR(255)");
        
        // Update existing data to match new enum values if they exist
        DB::table('quizzes')->where('type', 'practice')->update(['type' => 'PRÁCTICA']);
        DB::table('quizzes')->where('type', 'exam')->update(['type' => 'EXAMEN']);

        // Finalize ENUM change.
        DB::statement("ALTER TABLE quizzes MODIFY COLUMN type ENUM('EXANI I', 'EXANI II', 'EGEL', 'ENARM', 'ENQ', 'PRÁCTICA', 'EXAMEN') DEFAULT 'PRÁCTICA'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        DB::statement("ALTER TABLE quizzes MODIFY COLUMN type ENUM('practice', 'exam') DEFAULT 'practice'");
    }
};
