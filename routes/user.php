<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\CatalogController;
use App\Http\Controllers\User\CourseLearningController;
use App\Http\Controllers\User\CheckoutController;
use App\Http\Controllers\User\CalendarController;
use App\Http\Controllers\User\SupportController;
use App\Http\Controllers\User\OpinionController;
use App\Http\Controllers\User\ProfileCompletionController;
use App\Http\Controllers\User\NotificationController;

Route::middleware(['auth', 'verified', 'role:alumno'])->prefix('alumno')->group(function () {
    // Rutas permitidas incluso bloqueado
    Route::get('/cuenta-bloqueada', [DashboardController::class, 'blocked'])->name('alumno.blocked');
    Route::post('/strike', [DashboardController::class, 'registerStrike'])->name('alumno.strike');
    Route::get('/check-status', [DashboardController::class, 'checkStatus'])->name('alumno.check-status');

    // Rutas protegidas por strikes
    Route::middleware([\App\Http\Middleware\CheckStrikes::class])->group(function () {
    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'getNotifications'])->name('alumno.notifications.get');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('alumno.notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('alumno.notifications.readAll');

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
    Route::post('/payout', [CheckoutController::class, 'processPay'])->name('checkout.processPayout');
    Route::get('/checkout/callback', [CheckoutController::class, 'callback'])->name('checkout.payout.callback');
    Route::get('/payout/approved/{id}', [CheckoutController::class, 'chargeApproved'])->name('checkout.payout.approved');
    Route::get('/errorPayment', [CheckoutController::class, 'errorPayment'])->name('errors.payment');
    Route::get('/inscribir/{curso_id}', [CheckoutController::class, 'pago'])->name('inscripcion.pago');
    Route::post('/checkout/check-coupon', [CheckoutController::class, 'checkCoupon'])->name('alumno.checkout.check-coupon');
    Route::post('/checkout/remove-coupon', [CheckoutController::class, 'removeCoupon'])->name('alumno.checkout.remove-coupon');

    // Course Learning (Both GET & POST to support legacy form submission and modern URL routing)
    Route::match(['get', 'post'], '/curso/{id?}', [CourseLearningController::class, 'cursoDetallado'])->name('cursos.detallado');
    Route::match(['get', 'post'], '/modulo/{leccion_id?}/{curso_id?}', [CourseLearningController::class, 'leccionDetallada'])->name('leccion.detallada');
    Route::post('/lecciones/toggle-completion', [CourseLearningController::class, 'toggleLessonCompletion'])->name('leccion.toggleCompletion');
    Route::get('/medias/stream/{filename}', [CourseLearningController::class, 'streamMedia'])
        ->where('filename', '.*')
        ->name('alumno.medias.stream');

    // Materiales PDF Interactivos (Alumno)
    Route::get('/material-pdfs/{id}/resolver', [\App\Http\Controllers\User\InteractivePdfController::class, 'show'])->name('alumno.material-pdfs.show');
    Route::post('/material-pdfs/{id}/save-answers', [\App\Http\Controllers\User\InteractivePdfController::class, 'saveAnswers'])->name('alumno.material-pdfs.save-answers');

    // Calendar
    Route::get('/calendario', [CalendarController::class, 'index'])->name('alumno.calendario');

    // Certificates
    Route::get('/certificados', [\App\Http\Controllers\User\CertificateController::class, 'index'])->name('alumno.certificados');
    Route::get('/certificados/{id}/descargar', [\App\Http\Controllers\User\CertificateController::class, 'download'])->name('alumno.certificados.download');

    // Support
    Route::get('/soporte', [SupportController::class, 'index'])->name('alumno.soporte');
    Route::post('/soporte', [SupportController::class, 'send'])->name('alumno.soporte-enviar');

    // Student Opinion / Reviews
    Route::get('/tu-opinion', [OpinionController::class, 'index'])->name('tu.opinion');
    Route::post('/tu-opinion/store', [OpinionController::class, 'store'])->name('alumno.opinion.store');

    // Profile Completion
    Route::get('/users/{role}/complete', [ProfileCompletionController::class, 'index'])->name('alumno.complete');
    Route::put('/users/{id}/updateComplete', [ProfileCompletionController::class, 'update'])->name('alumno.updateComplete');
    // Exams
    Route::get('/exams/{quiz_id}/preview', [\App\Http\Controllers\User\ExamController::class, 'preview'])->name('alumno.exam.preview');
    Route::get('/exams/{quiz_id}/take/{enrollment_id}', [\App\Http\Controllers\User\ExamController::class, 'take'])->name('alumno.exam.take');
    Route::post('/exams/{exam_id}/save-answer', [\App\Http\Controllers\User\ExamController::class, 'saveAnswer'])->name('alumno.exam.save-answer');
    Route::post('/exams/{exam_id}/events', [\App\Http\Controllers\User\ExamController::class, 'registrarEvento'])->name('alumno.exam.events');
    Route::post('/exams/{exam_id}/finish', [\App\Http\Controllers\User\ExamController::class, 'finish'])->name('alumno.exam.finish');
    Route::post('/exams/{exam_id}/finish-imprevisto', [\App\Http\Controllers\User\ExamController::class, 'finalizarImprevisto'])->name('alumno.exam.finish-imprevisto');
    Route::get('/exams/{exam_id}/feedback', [\App\Http\Controllers\User\ExamController::class, 'feedback'])->name('alumno.exam.feedback');

    // Tareas
    Route::post('/homework/{assignment_id}/submit', [\App\Http\Controllers\User\HomeworkController::class, 'submit'])->name('alumno.homework.submit');
    });
});
