<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Fortify\Features;
use Tests\Concerns\CreatesLegacySchema;

uses(CreatesLegacySchema::class);

beforeEach(function () {
    $this->setUpLegacySchema();
    $this->seedLegacyRoles();
});

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('admins can authenticate using the login screen with email as username', function () {
    $user = $this->assignLegacyRole(User::factory()->create(), 'admin');

    $response = $this->post(route('login.store'), [
        'username' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard'));
});

test('students can authenticate using username and incomplete profiles redirect to profile completion', function () {
    $user = $this->assignLegacyRole(User::factory()->create([
        'username' => 'mi_alumno_test',
    ]), 'alumno');

    $response = $this->post(route('login.store'), [
        'username' => 'mi_alumno_test',
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('alumno.complete', ['role' => 'alumno']));
});

test('two factor authentication is disabled under legacy schema freeze', function () {
    expect(Features::canManageTwoFactorAuthentication())->toBeFalse();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'username' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('inactive users cannot authenticate even with valid password', function () {
    $user = User::factory()->create();
    $user->activo = 'no';
    $user->save();

    $this->post(route('login.store'), [
        'username' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    $throttleKey = Str::transliterate(Str::lower($user->email).'|127.0.0.1');
    RateLimiter::increment(md5('login'.$throttleKey), amount: 5);

    $response = $this->post(route('login.store'), [
        'username' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});
