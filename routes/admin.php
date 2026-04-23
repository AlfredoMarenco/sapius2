<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\Landing\LandingSlideController;
use App\Http\Controllers\Admin\Landing\LandingPrideController;
use App\Http\Controllers\Admin\Landing\LandingTeacherController;
use App\Http\Controllers\Admin\Landing\LandingReviewController;
use App\Http\Controllers\Admin\CourseBuilderController;
use App\Http\Controllers\Admin\ScheduledCourseController;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Course Management
    Route::resource('courses', CourseController::class);
    Route::patch('courses/{course}/toggle', [CourseController::class, 'toggle'])->name('courses.toggle');
    Route::resource('courses.schedules', ScheduledCourseController::class)->shallow();
    Route::patch('schedules/{schedule}/toggle', [ScheduledCourseController::class, 'toggle'])->name('schedules.toggle');
    Route::resource('categories', CategoryController::class);
    // Course Builder
    Route::get('courses/{course}/builder', [CourseBuilderController::class, 'show'])->name('courses.builder');
    Route::post('courses/{course}/modules', [CourseBuilderController::class, 'storeModule'])->name('courses.modules.store');
    Route::patch('modules/{module}', [CourseBuilderController::class, 'updateModule'])->name('courses.modules.update');
    Route::delete('modules/{module}', [CourseBuilderController::class, 'destroyModule'])->name('courses.modules.destroy');
    
    Route::post('modules/{module}/lessons', [CourseBuilderController::class, 'storeLesson'])->name('modules.lessons.store');
    Route::patch('lessons/{lesson}', [CourseBuilderController::class, 'updateLesson'])->name('lessons.update');
    Route::delete('lessons/{lesson}', [CourseBuilderController::class, 'destroyLesson'])->name('lessons.destroy');
    
    // Lesson Media
    Route::post('lessons/{lesson}/media', [CourseBuilderController::class, 'storeMedia'])->name('lessons.media.store');
    Route::delete('media/{media}', [CourseBuilderController::class, 'destroyMedia'])->name('media.destroy');
    
    // Quizzes & Questions
    Route::post('lessons/{lesson}/quiz', [CourseBuilderController::class, 'storeQuiz'])->name('lessons.quiz.store');
    Route::post('quizzes/{quiz}/questions', [CourseBuilderController::class, 'storeQuestion'])->name('quizzes.questions.store');
    Route::delete('questions/{question}', [CourseBuilderController::class, 'destroyQuestion'])->name('questions.destroy');
    
    // Homework
    Route::post('lessons/{lesson}/homework', [CourseBuilderController::class, 'storeHomework'])->name('lessons.homework.store');

    // Landing Page Management
    Route::prefix('landing')->name('landing.')->group(function () {
        Route::resource('slides', LandingSlideController::class);
        Route::resource('prides', LandingPrideController::class);
        Route::resource('teachers', LandingTeacherController::class);
        Route::resource('reviews', LandingReviewController::class);
    });

    // User Management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', function () { return Inertia::render('Admin/Users/Index'); })->name('index');
    });
});
