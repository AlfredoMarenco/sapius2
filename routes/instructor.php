<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Instructor\DashboardController;
use App\Http\Controllers\Instructor\CourseController;
use App\Http\Controllers\Instructor\SupportController;
use App\Http\Controllers\Admin\CourseBuilderController;

Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cursos (Listado y vista de progreso, los instructores solo ven los que tienen asignados)
    Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');
    Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');

    // Módulos y Lecciones (Permisos de edición de contenido)
    Route::get('/cursos/{course}/builder', [CourseBuilderController::class, 'show'])->name('courses.builder');
    Route::post('/courses/{course}/modules', [CourseBuilderController::class, 'storeModule'])->name('courses.modules.store');
    Route::patch('/modules/{module}', [CourseBuilderController::class, 'updateModule'])->name('courses.modules.update');
    Route::post('/modules/{module}/lessons', [CourseBuilderController::class, 'storeLesson'])->name('modules.lessons.store');
    Route::patch('/lessons/{lesson}', [CourseBuilderController::class, 'updateLesson'])->name('lessons.update');
    Route::post('/lessons/{lesson}/media', [CourseBuilderController::class, 'storeMedia'])->name('lessons.media.store');
    Route::delete('/media/{media}', [CourseBuilderController::class, 'destroyMedia'])->name('media.destroy');
    Route::post('/lessons/{lesson}/quiz', [CourseBuilderController::class, 'storeQuiz'])->name('lessons.quiz.store');
    Route::post('/quizzes/{quiz}/questions', [CourseBuilderController::class, 'storeQuestion'])->name('quizzes.questions.store');
    Route::patch('/questions/{question}', [CourseBuilderController::class, 'updateQuestion'])->name('questions.update');
    
    // Soporte
    Route::get('/soporte', [SupportController::class, 'index'])->name('soporte');
    Route::post('/soporte', [SupportController::class, 'send'])->name('soporte.send');
});
