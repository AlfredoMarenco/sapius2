<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\CreatesLegacySchema;

uses(CreatesLegacySchema::class);

beforeEach(function () {
    $this->setUpLegacySchema();
    $this->seedLegacyRoles();
});

test('confirm password screen can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('password.confirm'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/confirm-password'),
    );
});

test('password confirmation requires authentication', function () {
    $response = $this->get(route('password.confirm'));

    $response->assertRedirect(route('login'));
});
