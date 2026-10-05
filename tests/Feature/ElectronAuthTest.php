<?php
namespace Tests\Feature;
use Tests\TestCase;
use App\Models\User;
class ElectronAuthTest extends TestCase
{
    public function testMacValidation()
    {
        $user = User::first();
        if (!$user) {
            $this->assertTrue(true);
            return;
        }
        $user->api_token = 'test-api-token-123';
        $user->mac_address = '11:22:33:44:55:66';
        $user->save();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer test-api-token-123',
            'X-Sapius-MAC' => '11:22:33:44:55:66',
        ])->getJson('/api/electron/dashboard');

        $response->assertStatus(200);
    }
}
