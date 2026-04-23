<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

use App\Http\Controllers\Public\LandingController;

Route::get('/', [LandingController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])
    ->group(function () {
        Route::get('dashboard', function () {
            return auth()->user()->hasRole('admin') 
                ? redirect()->route('admin.dashboard') 
                : redirect()->route('user.dashboard');
        })->name('dashboard');
    });

require __DIR__.'/settings.php';
