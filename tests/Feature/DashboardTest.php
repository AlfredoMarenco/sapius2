<?php

use App\Models\User;
use Tests\Concerns\CreatesLegacySchema;

uses(CreatesLegacySchema::class);

beforeEach(function () {
    $this->setUpLegacySchema();
    $this->seedLegacyRoles();
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated admins are redirected to admin dashboard', function () {
    $user = $this->assignLegacyRole(User::factory()->create(), 'admin');

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertRedirect(route('admin.dashboard'));
});

test('authenticated students are redirected to student home', function () {
    $user = $this->assignLegacyRole(User::factory()->create(), 'alumno');

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertRedirect(route('alumno.home'));
});

test('users without assigned roles receive 403 on dashboard', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertForbidden();
});
