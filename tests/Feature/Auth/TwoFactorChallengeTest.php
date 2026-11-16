<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

test('two factor authentication feature is disabled under schema freeze', function () {
    expect(Features::enabled(Features::twoFactorAuthentication()))->toBeFalse();
    expect(Features::canManageTwoFactorAuthentication())->toBeFalse();
    expect(Route::has('two-factor.login'))->toBeFalse();
});

test('two factor challenge endpoint is not exposed', function () {
    $this->get('/two-factor-challenge')->assertNotFound();
});
