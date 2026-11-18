<?php

use App\Http\Controllers\Admin\InteractivePdfController;
use App\Http\Controllers\Admin\QuizImportController;
use App\Http\Controllers\Instructor\CourseBuilderController;
use App\Http\Controllers\Instructor\CourseController;
use App\Http\Controllers\Instructor\DashboardController;
use App\Http\Controllers\Instructor\SupportController;
use App\Http\Controllers\User\CourseLearningController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:instructor', 'restrict.mobile'])->prefix('instructor')->name('instructor.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cursos (Listado y vista de progreso, los instructores solo ven los que tienen asignados)
    Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');
    Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');
    Route::get('/evaluacion/resultados/{inscripcion_id}', [CourseController::class, 'resultados'])->name('curso.lista-resultados');

    // Módulos y Lecciones (Permisos de edición de contenido estrictamente autorizados vía CoursePolicy)
    Route::get('/cursos/{course}/builder', [CourseBuilderController::class, 'show'])->name('courses.builder');
    Route::get('/courses/{course}/builder', [CourseBuilderController::class, 'show']);
    Route::post('/courses/{course}/modules', [CourseBuilderController::class, 'storeModule'])->name('courses.modules.store');
    Route::post('/courses/{course}/modules/reorder', [CourseBuilderController::class, 'reorderModules'])->name('courses.modules.reorder');
    Route::patch('/modules/{module}', [CourseBuilderController::class, 'updateModule'])->name('courses.modules.update');
    Route::delete('/modules/{module}', [CourseBuilderController::class, 'destroyModule'])->name('courses.modules.destroy');
    Route::post('/modules/{module}/lessons', [CourseBuilderController::class, 'storeLesson'])->name('modules.lessons.store');
    Route::post('/modules/{module}/lessons/reorder', [CourseBuilderController::class, 'reorderLessons'])->name('modules.lessons.reorder');
    Route::patch('/lessons/{lesson}', [CourseBuilderController::class, 'updateLesson'])->name('lessons.update');
    Route::delete('/lessons/{lesson}', [CourseBuilderController::class, 'destroyLesson'])->name('lessons.destroy');
    Route::post('/lessons/{lesson}/media', [CourseBuilderController::class, 'storeMedia'])->name('lessons.media.store');
    Route::post('/media/upload-chunk', [CourseBuilderController::class, 'uploadChunk'])->name('media.upload-chunk');
    Route::delete('/media/{media}', [CourseBuilderController::class, 'destroyMedia'])->name('media.destroy');
    Route::match(['post', 'patch'], '/lessons/{lesson}/quiz', [CourseBuilderController::class, 'storeQuiz'])->name('lessons.quiz.store');
    Route::delete('/quizzes/{quiz}', [CourseBuilderController::class, 'destroyQuiz'])->name('quizzes.destroy');
    Route::post('/quizzes/{quiz}/duplicate', [CourseBuilderController::class, 'duplicateQuiz'])->name('quizzes.duplicate');
    Route::post('/quizzes/{quiz}/questions', [CourseBuilderController::class, 'storeQuestion'])->name('quizzes.questions.store');
    Route::patch('/questions/{question}', [CourseBuilderController::class, 'updateQuestion'])->name('questions.update');
    Route::delete('/questions/{question}', [CourseBuilderController::class, 'destroyQuestion'])->name('questions.destroy');
    Route::post('/quizzes/{quiz}/import-questions', [QuizImportController::class, 'import'])->name('quizzes.questions.import');
    Route::get('/quizzes/{quiz}/export-questions', [QuizImportController::class, 'export'])->name('quizzes.questions.export');
    Route::post('/lessons/{lesson}/homework', [CourseBuilderController::class, 'storeHomework'])->name('lessons.homework.store');
    Route::post('/editor/upload-image', [CourseBuilderController::class, 'uploadEditorImage'])->name('editor.upload-image');

    // Material PDFs e imágenes de preguntas para Instructor
    Route::get('/lessons/{leccion_id}/material-pdfs', [InteractivePdfController::class, 'index'])->name('material-pdfs.index');
    Route::get('/material-pdfs/{id}/stream', [InteractivePdfController::class, 'stream'])->name('material-pdfs.stream');
    Route::get('/material-pdfs/{id}/review/{user_id}', [InteractivePdfController::class, 'review'])->name('material-pdfs.review');
    Route::get('/preguntas/imagen/{filename}', [CourseLearningController::class, 'preguntaImagen'])
        ->where('filename', '.*')
        ->name('preguntas.imagen');

    // Soporte
    Route::get('/soporte', [SupportController::class, 'index'])->name('soporte');
    Route::post('/soporte', [SupportController::class, 'send'])->name('soporte.send');
});
