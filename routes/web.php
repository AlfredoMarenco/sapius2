<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

use App\Http\Controllers\Public\LandingController;
use App\Http\Controllers\User\CheckoutController;

// Public Landing Pages (Identical to ../Sapius)
Route::get('/', [LandingController::class, 'index'])->name('home');

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
    Route::get('/' . $courseSlug, function () use ($courseSlug) {
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

// Public / Guest Checkout
Route::get('/checkout/{curso_id?}', [CheckoutController::class, 'createCheckout'])->name('checkout');
Route::post('/payout', [CheckoutController::class, 'processPay'])->name('public.checkout.processPayout');

// Global media streaming fallback (for images and videos)
Route::get('/media/stream/{filename}', [\App\Http\Controllers\User\CourseLearningController::class, 'streamMedia'])
    ->where('filename', '.*')
    ->name('public.media.stream');

// Role-based dashboard redirect
Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::get('dashboard', function () {
            if (auth()->user()->hasRole('admin')) {
                return redirect()->route('admin.dashboard');
            }
            if (auth()->user()->hasRole('instructor')) {
                return redirect()->route('instructor.dashboard');
            }
            return redirect()->route('alumno.home');
        })->name('dashboard');
    });

require __DIR__.'/settings.php';
