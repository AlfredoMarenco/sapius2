<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('user')->name('user.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('User/Dashboard');
    })->name('dashboard');

    // Marketplace / Catalog
    Route::get('/catalog', [\App\Http\Controllers\User\CatalogController::class, 'index'])->name('catalog');
    Route::get('/catalog/{scheduled}', [\App\Http\Controllers\User\CatalogController::class, 'show'])->name('catalog.show');
    Route::post('/catalog/{scheduled}/enroll', [\App\Http\Controllers\User\CatalogController::class, 'enroll'])->name('catalog.enroll');

    // My Courses
    Route::prefix('my-courses')->name('courses.')->group(function () {
        Route::get('/', [\App\Http\Controllers\User\CourseController::class, 'index'])->name('index');
        Route::get('/{enrollment}', [\App\Http\Controllers\User\CourseController::class, 'show'])->name('show');
    });

    // Exams & Quizzes
    Route::prefix('exams')->name('exams.')->group(function () {
        Route::get('/', function () { return Inertia::render('User/Exams/Index'); })->name('index');
    });
});
