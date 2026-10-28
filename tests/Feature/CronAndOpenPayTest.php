<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Schema;

class CronAndOpenPayTest extends TestCase
{
    public function test_artisan_commands_are_registered(): void
    {
        $commands = \Illuminate\Support\Facades\Artisan::all();

        $this->assertArrayHasKey('inscripciones:auto-aprobar', $commands);
        $this->assertArrayHasKey('reminders:overdue-lessons', $commands);
        $this->assertArrayHasKey('usuarios:verificar', $commands);
    }

    public function test_openpay_webhook_verification_handshake(): void
    {
        $response = $this->postJson('/api/webhooks/openpay', [
            'type' => 'verification',
            'event_date' => now()->toIso8601String(),
            'verification_code' => 'TEST_VERIF_12345',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'verification_code' => 'TEST_VERIF_12345',
            ]);
    }

    public function test_openpay_webhook_unhandled_event_returns_200(): void
    {
        $response = $this->postJson('/api/webhooks/openpay', [
            'type' => 'charge.pending',
            'event_date' => now()->toIso8601String(),
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ignored',
            ]);
    }
}
