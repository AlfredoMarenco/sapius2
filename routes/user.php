<?php

use App\Http\Controllers\User\CalendarController;
use App\Http\Controllers\User\CatalogController;
use App\Http\Controllers\User\CertificateController;
use App\Http\Controllers\User\CheckoutController;
use App\Http\Controllers\User\CourseLearningController;
use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\ExamController;
use App\Http\Controllers\User\HomeworkController;
use App\Http\Controllers\User\InteractivePdfController;
use App\Http\Controllers\User\NotificationController;
use App\Http\Controllers\User\OpinionController;
use App\Http\Controllers\User\ProfileCompletionController;
use App\Http\Controllers\User\SupportController;
use App\Http\Middleware\CheckStrikes;
use Illuminate\Support\Facades\Route;

// Streaming protegido híbrido (Sesión Web o Bearer api_token de Electron)
Route::middleware(['auth.media', 'restrict.mobile'])->prefix('alumno')->group(function () {
    Route::get('/medias/stream/{filename}', [CourseLearningController::class, 'streamMedia'])
        ->where('filename', '.*')
        ->name('alumno.medias.stream');
    Route::get('/preguntas/imagen/{filename}', [CourseLearningController::class, 'preguntaImagen'])
        ->where('filename', '.*')
        ->name('alumno.preguntas.imagen');
});

Route::middleware(['auth', 'verified', 'role:alumno'])->prefix('alumno')->group(function () {
    // Rutas permitidas incluso bloqueado o durante cierre de emergencia por strike
    Route::get('/cuenta-bloqueada', [DashboardController::class, 'blocked'])->name('alumno.blocked');
    Route::post('/strike', [DashboardController::class, 'registerStrike'])->name('alumno.strike');
    Route::post('/register-strike', [DashboardController::class, 'registerStrike'])->name('alumno.register-strike');
    Route::get('/check-status', [DashboardController::class, 'checkStatus'])->name('alumno.check-status');
    Route::post('/exams/{exam_id}/finish-imprevisto', [ExamController::class, 'finalizarImprevisto'])->name('alumno.exam.finish-imprevisto');

    // Rutas protegidas por strikes
    Route::middleware([CheckStrikes::class])->group(function () {
        // Notificaciones
        Route::get('/notifications', [NotificationController::class, 'getNotifications'])->name('alumno.notifications.get');
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('alumno.notifications.read');
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('alumno.notifications.readAll');
        Route::delete('/notifications/delete/{id}', [NotificationController::class, 'deleteNotification'])->name('alumno.notifications.delete');
        Route::delete('/notifications/delete-all', [NotificationController::class, 'deleteAllNotifications'])->name('alumno.notifications.deleteAll');

        // Alumno Home / Dashboard (showing enrolled courses)
        Route::get('/', [DashboardController::class, 'index'])->name('alumno.home');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('alumno.dashboard');

        // Available Courses / Catalogs
        Route::get('/cursos', [CatalogController::class, 'cursos'])->name('cursos.disponibles');
        Route::get('/guias', [CatalogController::class, 'guias'])->name('guias.disponibles');
        Route::get('/simuladores', [CatalogController::class, 'simuladores'])->name('simuladores.disponibles');
        Route::get('/catalog', [CatalogController::class, 'index'])->name('alumno.catalog');
        Route::get('/inscripcion/{curso_id}', [CatalogController::class, 'inscripcion'])->name('inscripcion.form');

        // Checkout & Payment
        Route::get('/checkout/{curso_id?}', [CheckoutController::class, 'createCheckout'])->name('alumno.checkout');
        Route::post('/payout', [CheckoutController::class, 'processPay'])
            ->middleware('throttle:10,1')
            ->name('checkout.processPayout');
        Route::get('/checkout/callback', [CheckoutController::class, 'callback'])->name('checkout.payout.callback');
        Route::get('/payout/approved/{id}', [CheckoutController::class, 'chargeApproved'])->name('checkout.payout.approved');
        Route::get('/errorPayment', [CheckoutController::class, 'errorPayment'])->name('errors.payment');
        Route::post('/inscribir/{curso_id}', [CheckoutController::class, 'processPay'])
            ->middleware('throttle:10,1')
            ->name('inscripcion.pago');
        Route::post('/checkout/check-coupon', [CheckoutController::class, 'checkCoupon'])
            ->middleware('throttle:10,1')
            ->name('alumno.checkout.check-coupon');
        Route::post('/checkout/remove-coupon', [CheckoutController::class, 'removeCoupon'])->name('alumno.checkout.remove-coupon');

        // Calendar
        Route::get('/calendario', [CalendarController::class, 'index'])->name('alumno.calendario');

        // Certificates
        Route::get('/certificados', [CertificateController::class, 'index'])->name('alumno.certificados');
        Route::get('/certificados/{id}/descargar', [CertificateController::class, 'download'])->name('alumno.certificados.download');

        // Support
        Route::get('/soporte', [SupportController::class, 'index'])->name('alumno.soporte');
        Route::post('/soporte', [SupportController::class, 'send'])->name('alumno.soporte-enviar');

        // Student Opinion / Reviews
        Route::get('/tu-opinion', [OpinionController::class, 'index'])->name('tu.opinion');
        Route::post('/tu-opinion/store', [OpinionController::class, 'store'])->name('alumno.opinion.store');

        // Profile Completion & Private Student Files
        Route::get('/users/{role}/complete', [ProfileCompletionController::class, 'index'])->name('alumno.complete');
        Route::put('/users/{id}/updateComplete', [ProfileCompletionController::class, 'update'])->name('alumno.updateComplete');
        Route::get('/users/image/{file}', [ProfileCompletionController::class, 'userPicture'])->name('alumno.image');
        Route::get('/users/documento/{file}', [ProfileCompletionController::class, 'documento'])->name('alumno.documento');
        Route::get('/users/pase/{file}', [ProfileCompletionController::class, 'pase'])->name('alumno.pase');

        // Rutas académicas restringidas en móviles/tablets (RestrictMobileAccess)
        Route::middleware(['restrict.mobile'])->group(function () {
            // Course Learning
            Route::match(['get', 'post'], '/curso/{id?}', [CourseLearningController::class, 'cursoDetallado'])->name('cursos.detallado');
            Route::match(['get', 'post'], '/modulo/{leccion_id?}/{curso_id?}', [CourseLearningController::class, 'leccionDetallada'])->name('leccion.detallada');
            Route::post('/lecciones/toggle-completion', [CourseLearningController::class, 'toggleLessonCompletion'])->name('leccion.toggleCompletion');
            Route::get('/curso/{curso_programado_id}/guia', [CourseLearningController::class, 'viewGuia'])->name('alumno.curso.guia');
            Route::get('/curso/homework-tracking/{curso_programado_id}', [CourseLearningController::class, 'homeworkTracking'])->name('alumno.curso.homework-tracking');
            Route::get('/curso/progress/{curso_programado_id}', [CourseLearningController::class, 'progress'])->name('alumno.curso.progress');
            Route::get('/evaluaciones/resultados/{inscripcion_id}', [CourseLearningController::class, 'resultadosEvaluaciones'])->name('alumno.evaluaciones.resultados');
            Route::get('/exportCalificaciones/{inscripcion_id}', [CourseLearningController::class, 'exportCalificaciones'])->name('alumno.exportCalificaciones');

            // Materiales PDF Interactivos (Alumno)
            Route::get('/material-pdfs/{id}/resolver', [InteractivePdfController::class, 'show'])->name('alumno.material-pdfs.show');
            Route::post('/material-pdfs/{id}/save-answers', [InteractivePdfController::class, 'saveAnswers'])->name('alumno.material-pdfs.save-answers');
            Route::get('/material-pdfs/{id}/stream', [InteractivePdfController::class, 'stream'])->name('alumno.material-pdfs.stream');

            // Exams
            Route::get('/exams/{quiz_id}/preview', [ExamController::class, 'preview'])->name('alumno.exam.preview');
            Route::get('/exams/{quiz_id}/take/{enrollment_id}', [ExamController::class, 'take'])->name('alumno.exam.take');
            Route::post('/exams/{exam_id}/save-answer', [ExamController::class, 'saveAnswer'])->name('alumno.exam.save-answer');
            Route::post('/exams/{exam_id}/events', [ExamController::class, 'registrarEvento'])->name('alumno.exam.events');
            Route::post('/exams/{exam_id}/finish', [ExamController::class, 'finish'])->name('alumno.exam.finish');
            Route::get('/exams/{exam_id}/feedback', [ExamController::class, 'feedback'])->name('alumno.exam.feedback');

            // Tareas
            Route::post('/homework/{assignment_id}/submit', [HomeworkController::class, 'submit'])->name('alumno.homework.submit');
        });
    });
});
