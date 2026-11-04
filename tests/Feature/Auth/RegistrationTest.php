<?php
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));
    $response->assertOk();
});

test('new users can register', function () {
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test_feature_reg@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'test_feature_reg@example.com')->first();
    expect($user)->not->toBeNull();
    $user?->delete();
});
