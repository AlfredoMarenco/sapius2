<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Controllers\Api\OpenPayWebhookController;
use Illuminate\Http\Request;

class OpenPayWebhookTest extends TestCase
{
    public function test_webhook_verification(): void
    {
        $controller = new OpenPayWebhookController();
        $request = Request::create('/api/webhooks/openpay', 'POST', [
            'type' => 'verification',
            'verification_code' => 'VERIF_TEST_CODE',
        ]);

        $response = $controller->handleWebhook($request);

        $this->assertEquals(200, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('success', $data['status']);
        $this->assertEquals('VERIF_TEST_CODE', $data['verification_code']);
    }

    public function test_webhook_order_id_parser(): void
    {
        $controller = new OpenPayWebhookController();
        $reflection = new \ReflectionClass($controller);
        $method = $reflection->getMethod('parseOrderId');
        $method->setAccessible(true);

        // Modern 4-segment format
        $res1 = $method->invoke($controller, 'checkout-10-25-1698765432');
        $this->assertEquals(10, $res1['user_id']);
        $this->assertEquals(25, $res1['curso_programado_id']);

        // Legacy 3-segment format
        $res2 = $method->invoke($controller, '35-12-789');
        $this->assertEquals(12, $res2['user_id']);
        $this->assertEquals(35, $res2['curso_programado_id']);

        // Interim format
        $res3 = $method->invoke($controller, 'checkout-50-1698765432');
        $this->assertEquals(50, $res3['user_id']);
        $this->assertNull($res3['curso_programado_id']);
    }
}
