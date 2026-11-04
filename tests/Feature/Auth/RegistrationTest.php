<?php
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));
    $response->assertOk();
});

test('new users can register with explicit username, first_name and last_name', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);

    $response = $this->post(route('register.store'), [
        'first_name' => 'Carlos',
        'last_name' => 'Santana Gomez',
        'username' => 'csantana_test',
        'email' => 'csantana_test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'csantana_test@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->username)->toBe('csantana_test');
    expect($user->nombre)->toBe('Carlos');
    expect($user->apellido)->toBe('Santana Gomez');
    $user?->delete();
});

test('new users can also register with name field fallback', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);

    $response = $this->post(route('register.store'), [
        'name' => 'Laura Martinez',
        'email' => 'lmartinez_test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'lmartinez_test@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->username)->not->toBeEmpty();
    expect($user->nombre)->toBe('Laura');
    $user?->delete();
});
