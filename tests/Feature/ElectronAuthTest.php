<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\CreatesLegacySchema;
use Tests\TestCase;

class ElectronAuthTest extends TestCase
{
    use CreatesLegacySchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpAcademicSchema();
        $this->seedLegacyRoles();
    }

    public function test_mac_validation(): void
    {
        $user = User::create([
            'first_name' => 'Alumno',
            'last_name' => 'Electron',
            'username' => 'electron_student',
            'email' => 'electron@sapius.test',
            'password' => Hash::make('password'),
            'activo' => 'si',
        ]);
        $this->assignLegacyRole($user, 'alumno');

        $user->api_token = 'test-api-token-123';
        $user->mac_address = '11:22:33:44:55:66';
        $user->save();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer test-api-token-123',
            'X-Sapius-MAC' => '11:22:33:44:55:66',
        ])->getJson('/api/electron/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.nombre_completo', 'Alumno Electron');

        $payload = $response->json('data.user');
        $this->assertArrayNotHasKey('api_token', $payload);
        $this->assertArrayNotHasKey('password', $payload);
        $this->assertArrayNotHasKey('session_id', $payload);
        $this->assertArrayNotHasKey('documento_identificacion', $payload);
        $this->assertArrayNotHasKey('pase_ingreso', $payload);
    }
}
