<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('zoom_classes')) {
            Schema::create('zoom_classes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_programado_id')->index();
                $table->unsignedBigInteger('curso_id')->index();
                $table->unsignedBigInteger('module_id')->nullable()->index();
                $table->unsignedBigInteger('leccion_id')->nullable()->index();
                $table->unsignedBigInteger('instructor_id')->nullable()->index();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('creation_mode', 20)->default('manual');
                $table->string('meeting_number', 50);
                $table->string('passcode', 100)->nullable();
                $table->text('join_url')->nullable();
                $table->text('start_url')->nullable();
                $table->dateTime('scheduled_at')->index();
                $table->unsignedInteger('duration_minutes')->default(60);
                $table->string('status', 20)->default('scheduled');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('zoom_classes');
    }
};
