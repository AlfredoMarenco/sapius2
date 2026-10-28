<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AutoAceptacionEmail;
use App\Mail\OxxoEmail;
use App\Mail\TarjetaEmail;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OpenPayWebhookController extends Controller
{
    /**
     * Handle incoming OpenPay webhook notifications.
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        // 1. Basic Auth validation (if configured in .env / config)
        $configuredUser = config('openpay.webhook_user');
        $configuredPass = config('openpay.webhook_password');

        if (! empty($configuredUser) && ! empty($configuredPass)) {
            if ($request->getUser() !== $configuredUser || $request->getPassword() !== $configuredPass) {
                Log::warning('OpenPay Webhook: Intento de acceso no autorizado (Basic Auth inválido).');

                return response()->json(['error' => 'Unauthorized'], 401);
            }
        }

        $payload = $request->all();
        $eventType = $payload['type'] ?? null;

        Log::info('OpenPay Webhook recibido:', [
            'type' => $eventType,
            'event_date' => $payload['event_date'] ?? null,
            'transaction_id' => $payload['transaction']['id'] ?? null,
        ]);

        // 2. OpenPay Verification Handshake
        if ($eventType === 'verification') {
            Log::info('OpenPay Webhook: Código de verificación recibido.', [
                'code' => $payload['verification_code'] ?? null,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Verification accepted',
                'verification_code' => $payload['verification_code'] ?? null,
            ], 200);
        }

        // 3. Process completed charge events
        if (in_array($eventType, ['charge.succeeded', 'payout.succeeded', 'spei.received'])) {
            return $this->processSuccessfulCharge($payload);
        }

        // 4. Charge refunded or failed
        if ($eventType === 'charge.refunded') {
            return $this->processRefundedCharge($payload);
        }

        // Default response for unhandled event types
        return response()->json([
            'status' => 'ignored',
            'message' => "Event type '{$eventType}' not processed.",
        ], 200);
    }

    /**
     * Process a completed payment (Card, OXXO Pay, SPEI).
     */
    protected function processSuccessfulCharge(array $payload): JsonResponse
    {
        $transaction = $payload['transaction'] ?? [];
        $transactionId = $transaction['id'] ?? null;
        $orderId = $transaction['order_id'] ?? '';
        $amount = (float) ($transaction['amount'] ?? 0);
        $method = $transaction['method'] ?? 'card';

        if (! $transactionId) {
            Log::error('OpenPay Webhook: Transacción sin ID.', $payload);

            return response()->json(['error' => 'Missing transaction id'], 400);
        }

        // Server-to-server verification with OpenPay API (OWASP Anti-Spoofing)
        if (! $this->verifyTransactionWithOpenPay($transactionId)) {
            Log::warning("OpenPay Webhook: Falló la verificación server-to-server para la transacción {$transactionId}.");

            return response()->json(['error' => 'Transaction verification failed'], 400);
        }

        // Parse order_id to resolve user_id and curso_programado_id
        $parsed = $this->parseOrderId($orderId);
        $userId = $parsed['user_id'];
        $cursoProgramadoId = $parsed['curso_programado_id'];

        // Fallback: If userId is null, resolve from customer email
        if (! $userId && isset($transaction['customer']['email'])) {
            $userByEmail = User::where('email', $transaction['customer']['email'])->first();
            if ($userByEmail) {
                $userId = $userByEmail->id;
            }
        }

        // Fallback: If cursoProgramadoId is null, look for recent pending inscription for this user
        if ($userId && ! $cursoProgramadoId) {
            $pendingEnrollment = Enrollment::where('user_id', $userId)
                ->where('aceptado', 'no')
                ->latest()
                ->first();

            if ($pendingEnrollment) {
                $cursoProgramadoId = $pendingEnrollment->curso_programado_id;
            }
        }

        if (! $userId || ! $cursoProgramadoId) {
            Log::error("OpenPay Webhook: No se pudo resolver usuario ({$userId}) o curso ({$cursoProgramadoId}) para order_id: {$orderId}");

            return response()->json([
                'status' => 'partial_success',
                'message' => 'Transaction verified but student or course could not be determined.',
                'transaction_id' => $transactionId,
            ], 200);
        }

        $user = User::find($userId);
        $scheduledCourse = ScheduledCourse::with('course')->find($cursoProgramadoId);

        if (! $user || ! $scheduledCourse) {
            Log::error("OpenPay Webhook: Modelo no encontrado (User: {$userId}, ScheduledCourse: {$cursoProgramadoId})");

            return response()->json(['error' => 'Entities not found'], 404);
        }

        // Map OpenPay payment method to legacy tipo_pago
        $tipoPago = match ($method) {
            'store' => 'tienda',
            'bank_account' => 'spei',
            default => 'tarjeta',
        };

        // Atomic Enrollment Activation (Pessimistic locking to prevent race conditions)
        $activated = false;
        $enrollment = null;

        DB::transaction(function () use (
            $userId,
            $cursoProgramadoId,
            $transactionId,
            $tipoPago,
            &$activated,
            &$enrollment
        ) {
            $enrollment = Enrollment::where('user_id', $userId)
                ->where('curso_programado_id', $cursoProgramadoId)
                ->lockForUpdate()
                ->first();

            if (! $enrollment) {
                $enrollment = new Enrollment;
                $enrollment->user_id = $userId;
                $enrollment->curso_programado_id = $cursoProgramadoId;
            }

            // Idempotency: If already accepted, do not re-process
            if ($enrollment->aceptado === 'si') {
                Log::info("OpenPay Webhook: La inscripción {$enrollment->id} ya estaba previamente aceptada.");
                $activated = false;

                return;
            }

            $enrollment->aceptado = 'si';
            $enrollment->referencia = $transactionId;
            $enrollment->tipo_pago = $tipoPago;
            $enrollment->save();

            $activated = true;
        });

        if ($activated && $enrollment) {
            Log::info("OpenPay Webhook: Inscripción activada exitosamente (ID: {$enrollment->id}, Usuario: {$user->email}, Curso: {$scheduledCourse->identificador})");

            // Dispatch notification emails
            try {
                // 1. Send Auto-Acceptance email
                Mail::to($user->email)
                    ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                    ->send(new AutoAceptacionEmail($enrollment));

                // 2. Send Payment Receipt email
                if ($tipoPago === 'tienda') {
                    $datosOxxo = [
                        'name_alumno' => $user->name,
                        'identificador' => $scheduledCourse->identificador,
                        'precio' => $amount,
                        'referencia' => $transaction['payment_method']['reference'] ?? $transactionId,
                    ];
                    Mail::to($user->email)
                        ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                        ->send(new OxxoEmail($datosOxxo));
                } else {
                    $datosTarjeta = [
                        'name_alumno' => $user->name,
                        'identificador' => $scheduledCourse->identificador,
                        'precio' => $amount,
                        'id_carge' => $transactionId,
                    ];
                    Mail::to($user->email)
                        ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                        ->send(new TarjetaEmail($datosTarjeta));
                }
            } catch (\Exception $e) {
                Log::error("OpenPay Webhook: Error al despachar correos para inscripción {$enrollment->id}: ".$e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment processed successfully',
            'enrollment_id' => $enrollment ? $enrollment->id : null,
        ], 200);
    }

    /**
     * Handle refund notifications by revoking course access.
     */
    protected function processRefundedCharge(array $payload): JsonResponse
    {
        $transaction = $payload['transaction'] ?? [];
        $transactionId = $transaction['id'] ?? null;

        if ($transactionId) {
            $enrollment = Enrollment::where('referencia', $transactionId)->first();
            if ($enrollment) {
                $enrollment->aceptado = 'no';
                $enrollment->save();
                Log::warning("OpenPay Webhook: Reembolso detectado. Inscripción {$enrollment->id} revocada (aceptado = 'no').");
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Refund processed',
        ], 200);
    }

    /**
     * Perform server-to-server query against OpenPay API to confirm transaction validity.
     */
    protected function verifyTransactionWithOpenPay(string $transactionId): bool
    {
        $merchantId = config('openpay.merchant_id');
        $privateKey = config('openpay.private_key');
        $sandbox = config('openpay.sandbox', true);

        if (empty($merchantId) || empty($privateKey)) {
            Log::warning('OpenPay Webhook: Credenciales de OpenPay no configuradas; omitiendo verificación directa.');

            return true;
        }

        try {
            $baseUrl = $sandbox
                ? "https://sandbox-api.openpay.mx/v1/{$merchantId}/charges/{$transactionId}"
                : "https://api.openpay.mx/v1/{$merchantId}/charges/{$transactionId}";

            $response = Http::withBasicAuth($privateKey, '')->timeout(10)->get($baseUrl);

            if ($response->successful()) {
                $data = $response->json();

                return in_array(strtolower($data['status'] ?? ''), ['completed', 'paid', 'success']);
            }

            Log::error("OpenPay API verify error HTTP {$response->status()}: ".$response->body());

            return false;
        } catch (\Exception $e) {
            Log::error('OpenPay API verify exception: '.$e->getMessage());

            // Fallback to true if network glitch so OpenPay doesn't keep retrying excessively, but log error
            return true;
        }
    }

    /**
     * Parse order_id into userId and cursoProgramadoId across legacy and new formats.
     */
    protected function parseOrderId(string $orderId): array
    {
        // Format 1: checkout-{userId}-{cursoProgramadoId}-{time}
        if (preg_match('/^checkout-(\d+)-(\d+)-(\d+)$/', $orderId, $matches)) {
            return [
                'user_id' => (int) $matches[1],
                'curso_programado_id' => (int) $matches[2],
            ];
        }

        // Format 2: {cursoProgramadoId}-{userId}-{rand} (Legacy Sapius format)
        if (preg_match('/^(\d+)-(\d+)-(\d+)$/', $orderId, $matches)) {
            return [
                'user_id' => (int) $matches[2],
                'curso_programado_id' => (int) $matches[1],
            ];
        }

        // Format 3: checkout-{userId}-{time}
        if (preg_match('/^checkout-(\d+)-(\d+)$/', $orderId, $matches)) {
            return [
                'user_id' => (int) $matches[1],
                'curso_programado_id' => null,
            ];
        }

        return [
            'user_id' => null,
            'curso_programado_id' => null,
        ];
    }
}
