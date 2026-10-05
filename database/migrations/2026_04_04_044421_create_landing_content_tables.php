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
        if (!Schema::hasTable('slides')) {
            Schema::create('slides', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('image');
            $table->string('link')->nullable();
            $table->integer('position')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        }

        if (!Schema::hasTable('prides')) {
            Schema::create('prides', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('icon')->nullable();
            $table->integer('position')->default(1);
            $table->timestamps();
        });
        }

        if (!Schema::hasTable('teachers')) {
            Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('specialty')->nullable();
            $table->string('photo')->nullable();
            $table->text('bio')->nullable();
            $table->integer('position')->default(1);
            $table->timestamps();
        });
        }

        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('author_name')->nullable(); // For guest reviews
            $table->integer('rating')->default(5);
            $table->text('comment');
            $table->boolean('is_visible')->default(false);
            $table->timestamps();
        });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_content_tables');
    }
};
