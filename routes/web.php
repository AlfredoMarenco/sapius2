<?php

use App\Http\Controllers\Public\LandingController;
use App\Http\Controllers\User\CheckoutController;
use App\Http\Controllers\User\CourseLearningController;
use App\Http\Middleware\CheckStrikes;
use Illuminate\Support\Facades\Route;

// Public Landing Pages (Identical to ../Sapius + 2026 Redesign Hub Routes)
Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/cursos', [LandingController::class, 'coursesHub'])->name('public.courses');
Route::get('/productos', [LandingController::class, 'productsHub'])->name('public.products');
Route::get('/preguntas-frecuentes', [LandingController::class, 'faq'])->name('public.faq');
Route::get('/grupos-y-paquetes', [LandingController::class, 'groupsPackages'])->name('public.groups');
Route::get('/nosotros', [LandingController::class, 'about'])->name('public.about');
Route::get('/orgullo-sapius', [LandingController::class, 'pride'])->name('public.pride');
Route::get('/contacto', [LandingController::class, 'contact'])->name('public.contact');
Route::post('/contacto', [LandingController::class, 'sendContact'])
    ->middleware('throttle:10,1')
    ->name('public.contact.send');
Route::post('/informacion', [LandingController::class, 'sendContact'])
    ->middleware('throttle:10,1')
    ->name('informacion');

Route::get('/terms/conditions', function () {
    return app(LandingController::class)->legal('terms');
})->name('termsandconditions');

Route::get('/privacidad', function () {
    return app(LandingController::class)->legal('privacidad');
})->name('privacidad');

Route::get('/cookies', function () {
    return app(LandingController::class)->legal('cookies');
})->name('cookies');

Route::get('/no-access', function () {
    return app(LandingController::class)->legal('no-access');
})->name('no-access');

// Public Course Marketing Pages
$publicCourses = [
    'exani-1',
    'exani-2',
    'exani-3',
    'egel-plus',
    'egel-plus-nutricion',
    'egel-plus-medicina',
    'cursos-enarm',
    'cursos-presenciales',
];

foreach ($publicCourses as $courseSlug) {
    Route::get('/'.$courseSlug, function () use ($courseSlug) {
        return app(LandingController::class)->coursePage($courseSlug);
    });
}

// Guias and Simuladores
Route::get('/guias-medicina', function () {
    return app(LandingController::class)->guias('medicina');
})->name('guias.medicina');

Route::get('/guias-nutricion', function () {
    return app(LandingController::class)->guias('nutricion');
})->name('guias.nutricion');

Route::get('/simuladores-medicina', function () {
    return app(LandingController::class)->simuladores('medicina');
})->name('simuladores.medicina');

Route::get('/simuladores-nutricion', function () {
    return app(LandingController::class)->simuladores('nutricion');
})->name('simuladores.nutricion');

// Public Checkout Redirect / Auth-Protected Checkout (Paridad ../Sapius: exige login conservando url.intended)
Route::middleware(['auth', 'verified', 'role:alumno', CheckStrikes::class])->group(function () {
    Route::get('/checkout/{curso_id?}', [CheckoutController::class, 'createCheckout'])->name('checkout');
    Route::post('/payout', [CheckoutController::class, 'processPay'])
        ->middleware('throttle:10,1')
        ->name('public.checkout.processPayout');
});

// Public catalog/landing images ONLY (videos/private media moved behind auth.media)
Route::get('/media/stream/{filename}', [CourseLearningController::class, 'publicMediaStream'])
    ->where('filename', '.*')
    ->name('public.media.stream');

Route::get('/cursos/image/{filename}', [CourseLearningController::class, 'publicMediaStream'])
    ->where('filename', '.*')
    ->name('cursos.image');

// Role-based dashboard redirect
Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::get('dashboard', function () {
            $user = auth()->user();

            if ($user->hasRole('admin')) {
                return redirect()->route('admin.dashboard');
            }
            if ($user->hasRole('instructor')) {
                return redirect()->route('instructor.dashboard');
            }
            if ($user->hasRole('alumno')) {
                return redirect()->route('alumno.home');
            }

            abort(403, 'Tu cuenta no tiene un rol asignado.');
        })->name('dashboard');
    });

require __DIR__.'/settings.php';
