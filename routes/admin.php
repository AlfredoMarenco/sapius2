<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CourseBuilderController;
use App\Http\Controllers\Admin\ScheduledCourseController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\ManageableController;
use App\Http\Controllers\Admin\CourseCalendarController;
use App\Http\Controllers\Admin\InteractivePdfController;
use App\Http\Controllers\Admin\LandingConfigController;
use App\Http\Controllers\Admin\Landing\LandingSlideController;
use App\Http\Controllers\Admin\Landing\LandingPrideController;
use App\Http\Controllers\Admin\Landing\LandingTeacherController;
use App\Http\Controllers\Admin\Landing\LandingReviewController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\CohortEnrollmentController;
use App\Http\Controllers\Admin\AcademicTrackingController;
use App\Http\Controllers\Admin\ExamResultController;

use App\Http\Controllers\Admin\ElectronUpdaterController;
use App\Http\Controllers\Admin\ContenidoProgramadoController;
use App\Http\Controllers\Admin\DiscountController;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Certificates
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/certificates/{id}/download', [CertificateController::class, 'download'])->name('certificates.download');
    Route::post('/certificates/emit', [CertificateController::class, 'emit'])->name('certificates.emit');
    Route::delete('/certificates/{id}', [CertificateController::class, 'destroy'])->name('certificates.destroy');

    // Discounts
    Route::get('/scheduled-courses/{id}/discounts', [DiscountController::class, 'index'])->name('discounts.index');
    Route::post('/scheduled-courses/{id}/discounts', [DiscountController::class, 'store'])->name('discounts.store');
    Route::put('/scheduled-courses/{id}/discounts/{discount_id}', [DiscountController::class, 'update'])->name('discounts.update');
    Route::patch('/scheduled-courses/{id}/discounts/{discount_id}/toggle', [DiscountController::class, 'toggleActive'])->name('discounts.toggle');

    // Cursos (Legacy URL: /admin/cursos y alias /admin/courses)
    Route::get('/cursos', [CourseController::class, 'index'])->name('cursos.index');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/cursos/create', [CourseController::class, 'create'])->name('cursos.create');
    Route::get('/courses/create', [CourseController::class, 'create'])->name('courses.create');
    Route::post('/cursos/store', [CourseController::class, 'store'])->name('cursos.store');
    Route::post('/courses/store', [CourseController::class, 'store'])->name('courses.store');

    Route::get('/cursos/{id}', [CourseController::class, 'show']);
    Route::get('/courses/{id}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/cursos/{id}/view', [CourseController::class, 'show'])->name('cursos.show');

    Route::get('/cursos/{id}/edit', [CourseController::class, 'edit'])->name('cursos.edit');
    Route::get('/courses/{id}/edit', [CourseController::class, 'edit'])->name('courses.edit');
    Route::post('/cursos/edit', [CourseController::class, 'edit']);

    Route::match(['put', 'post'], '/cursos/{id}/update', [CourseController::class, 'update'])->name('cursos.update');
    Route::match(['put', 'post'], '/courses/{id}/update', [CourseController::class, 'update'])->name('courses.update');
    Route::post('/cursos/update', function (\Illuminate\Http\Request $r) {
        return app(CourseController::class)->update($r, $r->id);
    });

    Route::match(['patch', 'post'], '/cursos/{id}/toggle', [CourseController::class, 'toggle'])->name('cursos.toggle');
    Route::match(['patch', 'post'], '/courses/{id}/toggle', [CourseController::class, 'toggle'])->name('courses.toggle');

    Route::match(['delete', 'post'], '/cursos/{id}/destroy', [CourseController::class, 'destroy'])->name('cursos.destroy');
    Route::match(['delete', 'post'], '/courses/{id}/destroy', [CourseController::class, 'destroy']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->name('courses.destroy');
    
    // Copiar Cursos (Legacy: /admin/cursos/copy y /admin/curso/copy-details/{curso})
    Route::get('/cursos/copy', [CourseController::class, 'copyIndex'])->name('cursos.copy');
    Route::post('/cursos/copy/create', [CourseController::class, 'copyCreate'])->name('cursos.copy.create');
    Route::get('/curso/copy-details/{curso}', [CourseController::class, 'getAllContentOfCurso'])->name('cursos.details.copy');
    Route::post('/curso/copy-details/coping', [CourseController::class, 'copySelectContentOfCourse'])->name('cursos.content.copy');
    
    // Calendarios
    Route::get('/courses/{course}/calendars', [CourseCalendarController::class, 'index'])->name('courses.calendars');
    Route::post('/courses/{course}/calendars/upload', [CourseCalendarController::class, 'upload'])->name('courses.calendars.upload');
    Route::post('/courses/{course}/calendars/reorder', [CourseCalendarController::class, 'reorder'])->name('courses.calendars.reorder');
    Route::delete('/courses/calendars/{calendar}', [CourseCalendarController::class, 'destroy'])->name('courses.calendars.destroy');

    // Material PDFs Interactivos
    Route::get('/lessons/{leccion_id}/material-pdfs', [InteractivePdfController::class, 'index'])->name('material-pdfs.index');
    Route::post('/material-pdfs', [InteractivePdfController::class, 'store'])->name('material-pdfs.store');
    Route::put('/material-pdfs/{id}', [InteractivePdfController::class, 'update'])->name('material-pdfs.update');
    Route::delete('/material-pdfs/{id}', [InteractivePdfController::class, 'destroy'])->name('material-pdfs.destroy');
    Route::get('/material-pdfs/{id}/edit', [InteractivePdfController::class, 'edit'])->name('material-pdfs.edit');
    Route::post('/material-pdfs/{id}/save-layout', [InteractivePdfController::class, 'saveLayout'])->name('material-pdfs.save-layout');
    Route::get('/material-pdfs/{id}/review/{user_id}', [InteractivePdfController::class, 'review'])->name('material-pdfs.review');

    // Gestión de Alumnos Inscritos en Cohorte (Legacy: /admin/curso)
    Route::match(['get', 'post'], '/curso', [CohortEnrollmentController::class, 'indexPost'])->name('cursos.lista-inscritos');
    Route::get('/curso/{curso_id}/{active?}', [CohortEnrollmentController::class, 'index'])->name('cursos.get-inscritos');
    Route::post('/curso/activate', [CohortEnrollmentController::class, 'activate'])->name('curso.activate');
    Route::post('/curso/destroy', [CohortEnrollmentController::class, 'destroy'])->name('curso.destroy');
    Route::get('/cursos/{id}/inscritos', [CohortEnrollmentController::class, 'getAlumnosByCurso'])->name('cursos.inscritos');
    Route::post('/curso-programado/{id}/agregar-alumnos', [CohortEnrollmentController::class, 'addStudents'])->name('curso_programado.agregarAlumnos');
    Route::post('/curso-programado/{id}/manual-enroll', [CohortEnrollmentController::class, 'manualEnroll'])->name('curso_programado.manualEnroll');

    // Seguimiento Académico y Desbloqueo de Lecciones
    Route::get('/curso/homework-tracking/{curso_programado_id}/{user_id}', [AcademicTrackingController::class, 'homework'])->name('curso.homework.tracking');
    Route::get('/curso/progress/{curso_programado_id}/{user_id}', [AcademicTrackingController::class, 'progress'])->name('curso.progress');
    Route::post('/curso/lesson/unlock', [AcademicTrackingController::class, 'toggleLessonUnlock'])->name('curso.lesson.unlock');
    
    // Tracking Exams functionalities
    Route::delete('/tracking/exams/{exam}/reset', [\App\Http\Controllers\Admin\TrackingExamController::class, 'reset'])->name('tracking.exams.reset');
    Route::patch('/tracking/exams/{exam}/feedback', [\App\Http\Controllers\Admin\TrackingExamController::class, 'toggleFeedback'])->name('tracking.exams.feedback');
    Route::get('/tracking/{enrollment}/exams-report', [\App\Http\Controllers\Admin\TrackingExamController::class, 'downloadReport'])->name('tracking.exams.report');

    // Evaluaciones y Exámenes
    Route::get('/evaluacion/resultados/{inscripcion_id}', [ExamResultController::class, 'listaResultados'])->name('curso.lista-resultados');
    Route::post('/examen/finalizar', [ExamResultController::class, 'cambiarEstadoFinalizado'])->name('examen.cambiarEstadoFinalizado');
    Route::post('/examen/retro', [ExamResultController::class, 'cambiarEstadoRetro'])->name('examen.cambiarEstadoRetro');
    Route::post('/examen/reiniciar', [ExamResultController::class, 'reiniciarExamen'])->name('examen.reiniciar');
    Route::get('/exportCalificaciones/{inscripcion_id}', [ExamResultController::class, 'exportReport'])->name('exportCalificaciones');
    Route::get('/exportAllResults/{curso_id}', [ExamResultController::class, 'exportAllStudentResults'])->name('exportAllResults');

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
    Route::post('/lessons/{lesson}/quiz', [CourseBuilderController::class, 'storeQuiz'])->name('lessons.quiz.store');
    Route::delete('/quizzes/{quiz}', [CourseBuilderController::class, 'destroyQuiz'])->name('quizzes.destroy');
    Route::post('/quizzes/{quiz}/duplicate', [CourseBuilderController::class, 'duplicateQuiz'])->name('quizzes.duplicate');
    Route::post('/quizzes/{quiz}/questions', [CourseBuilderController::class, 'storeQuestion'])->name('quizzes.questions.store');
    Route::patch('/questions/{question}', [CourseBuilderController::class, 'updateQuestion'])->name('questions.update');
    Route::delete('/questions/{question}', [CourseBuilderController::class, 'destroyQuestion'])->name('questions.destroy');
    
    // Importador Masivo
    Route::post('/quizzes/{quiz}/import-questions', [\App\Http\Controllers\Admin\QuizImportController::class, 'import'])->name('quizzes.questions.import');
    Route::post('/lessons/{lesson}/homework', [CourseBuilderController::class, 'storeHomework'])->name('lessons.homework.store');

    // Programación de Cursos (Legacy URL: /admin/registro/programacion)
    Route::match(['get', 'post'], '/registro/programacion', [ScheduledCourseController::class, 'index'])->name('schedule');
    Route::resource('courses.schedules', ScheduledCourseController::class)->shallow();
    Route::patch('/schedules/{schedule}/toggle', [ScheduledCourseController::class, 'toggle'])->name('schedules.toggle');
    Route::resource('categories', CategoryController::class);
    
    // Programación de Contenido por Cohorte (Legacy: /admin/registro/contenido)
    Route::match(['get', 'post'], '/registro/contenido', [ContenidoProgramadoController::class, 'index'])->name('contenido.index');
    Route::post('/registro/contenido/store', [ContenidoProgramadoController::class, 'store'])->name('contenido.store');

    // Configuraciones de Landing (Legacy URL: /admin/configuraciones)
    Route::get('/configuraciones', [LandingConfigController::class, 'index'])->name('configuracion.index');
    Route::post('/configuraciones/upload', [LandingConfigController::class, 'uploadSlide'])->name('configuracion.slide');
    Route::get('/configuraciones/delete/{slide}', [LandingConfigController::class, 'deleteSlide'])->name('configuracion.slide.delete');
    Route::post('/configuraciones/pride/upload', [LandingConfigController::class, 'uploadPride'])->name('configuracion.pride');
    Route::put('/configuraciones/pride/{pride}/update', [LandingConfigController::class, 'updatePride'])->name('configuracion.pride.update');
    Route::get('/configuraciones/pride/{pride}/delete', [LandingConfigController::class, 'deletePride'])->name('configuracion.pride.delete');
    Route::post('/configuraciones/teacher/upload', [LandingConfigController::class, 'uploadTeacher'])->name('configuracion.teacher');
    Route::put('/configuraciones/teacher/{teacher}/update', [LandingConfigController::class, 'updateTeacher'])->name('configuracion.teacher.update');
    Route::get('/configuraciones/teacher/{teacher}/delete', [LandingConfigController::class, 'deleteTeacher'])->name('configuracion.teacher.delete');

    // Reviews (Legacy URL: /admin/reviews)
    Route::resource('reviews', LandingReviewController::class);

    // Users Management & Verification (Legacy URLs)
    Route::get('/users/search', [UserController::class, 'search'])->name('users.search');
    Route::get('/users/{activo?}', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{id}/view', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{id}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::get('/users/{id}/verify', [UserController::class, 'verify'])->name('users.verify');
    Route::post('/users/approve', [UserController::class, 'approve'])->name('users.approve');
    Route::post('/users/unapprove', [UserController::class, 'unapprove'])->name('users.unapprove');
    Route::post('/users/{id}/unlock', [UserController::class, 'unlock'])->name('users.unlock');
    Route::post('/users/{id}/clear-mac', [UserController::class, 'clearMac'])->name('users.clearMac');
    Route::post('/users/{id}/approve-mac', [UserController::class, 'approveMac'])->name('users.approveMac');
    Route::post('/users/{id}/reject-mac', [UserController::class, 'rejectMac'])->name('users.rejectMac');
    Route::get('/users/image/{file}', [UserController::class, 'userPicture'])->name('users.image');
    Route::get('/users/documento/{file}', [UserController::class, 'documento'])->name('users.documento');
    Route::get('/users/pase/{file}', [UserController::class, 'pase'])->name('users.pase');
    Route::match(['put', 'post'], '/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');

    // Reports (Legacy URL: /admin/reports)
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/inscriptions', [ReportController::class, 'inscriptions'])->name('reports.inscriptions');
    Route::get('/reports/inscriptions/{id}', [ReportController::class, 'showInscription'])->name('reports.inscriptions.show');

    // Secciones Administrables (Legacy URLs: /admin/manageable)
    Route::get('/manageable', [ManageableController::class, 'index'])->name('manageable.index');
    Route::post('/manageable/store', [ManageableController::class, 'store'])->name('manageable.store');
    Route::put('/manageable/update', [ManageableController::class, 'update'])->name('manageable.update');
    Route::get('/manageable/simulators/medicine/delete/{id}', [ManageableController::class, 'deleteManageablesimulatormedicine'])->name('manageablesimulatormedicine.delete');
    Route::get('/manageable/simulators/nutrition/delete/{id}', [ManageableController::class, 'deleteManageablesimulatornutrition'])->name('manageablesimulatornutrition.delete');
    Route::get('/manageable/guides/medicine/delete/{id}', [ManageableController::class, 'deleteManageableguiamedicine'])->name('manageableguiamedicine.delete');
    Route::get('/manageable/guides/nutrition/delete/{id}', [ManageableController::class, 'deleteManageableguianutrition'])->name('manageableguianutrition.delete');

    // Electron Auto Updater (Legacy URLs: /admin/electron/updater)
    Route::get('/electron/updater', [ElectronUpdaterController::class, 'index'])->name('electron.updater.index');
    Route::post('/electron/updater/upload', [ElectronUpdaterController::class, 'upload'])->name('electron.updater.upload');
});
