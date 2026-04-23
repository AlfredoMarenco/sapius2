<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Instructor Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->group(function () {
    Route::get('/dashboard', function () {
        return inertia('instructor/dashboard');
    })->name('instructor.dashboard');
});
