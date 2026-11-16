<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Services\EnrollmentFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class OpenPayWebhookController extends Controller
{
    private const TRANSACTION_ID_PATTERN = '/^[a-zA-Z0-9_-]{6,64}$/';

    private EnrollmentFulfillmentService $fulfillmentService;

    public function __construct(?EnrollmentFulfillmentService $fulfillmentService = null)
    {
        $this->fulfillmentService = $fulfillmentService ?? app(EnrollmentFulfillmentService::class);
    }

    /**
     * Handle incoming OpenPay webhook notifications.
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        // 1. Fail-closed Basic Auth validation
        $configuredUser = (string) config('openpay.webhook_user', '');
        $configuredPass = (string) config('openpay.webhook_password', '');

        if ($configuredUser === '' || $configuredPass === '') {
            if (! app()->environment('testing')) {
                Log::critical('OpenPay Webhook: Credenciales webhook_user / webhook_password no configuradas en entorno no-testing.');

                return response()->json(['error' => 'Webhook authentication not configured'], 500);
            }
        } else {
            $providedUser = (string) ($request->getUser() ?? '');
            $providedPass = (string) ($request->getPassword() ?? '');

            if (! hash_equals($configuredUser, $providedUser) || ! hash_equals($configuredPass, $providedPass)) {
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
        if (in_array($eventType, ['charge.succeeded', 'payout.succeeded', 'spei.received'], true)) {
            return $this->processSuccessfulCharge($payload);
        }

        // 4. Charge refunded or cancelled
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
     * Process a completed payment (Card, OXXO Pay, SPEI) using exclusively S2S-verified OpenPay data.
     */
    protected function processSuccessfulCharge(array $payload): JsonResponse
    {
        $transactionId = $payload['transaction']['id'] ?? null;

        if (! $this->isValidTransactionId($transactionId)) {
            Log::warning('OpenPay Webhook: Transacción sin ID válido.');

            return response()->json(['error' => 'Invalid or missing transaction id'], 400);
        }

        try {
            $verified = $this->verifyTransactionWithOpenPay($transactionId);
        } catch (RuntimeException $e) {
            return response()->json(['error' => 'Payment gateway verification temporarily unavailable'], 503);
        }

        if ($verified === null) {
            if (empty(config('openpay.merchant_id')) || empty(config('openpay.private_key'))) {
                return response()->json(['error' => 'OpenPay verification credentials not configured'], 500);
            }

            Log::warning("OpenPay Webhook: Falló la verificación server-to-server para la transacción {$transactionId}.");

            return response()->json(['error' => 'Transaction verification failed'], 400);
        }

        // Use exclusively S2S-verified attributes from OpenPay API
        $verifiedId = (string) ($verified['id'] ?? '');
        $verifiedStatus = strtolower((string) ($verified['status'] ?? ''));
        $orderId = (string) ($verified['order_id'] ?? '');
        $amount = (float) ($verified['amount'] ?? 0);
        $currency = strtoupper((string) ($verified['currency'] ?? ''));
        $method = strtolower((string) ($verified['method'] ?? 'card'));

        if ($verifiedId !== $transactionId || ! in_array($verifiedStatus, ['completed', 'paid', 'success'], true)) {
            Log::warning("OpenPay Webhook: Estado o ID verificado inválido para {$transactionId}.", [
                'verified_id' => $verifiedId,
                'verified_status' => $verifiedStatus,
            ]);

            return response()->json(['error' => 'Verified transaction status is not completed'], 400);
        }

        $expectedCurrency = strtoupper((string) config('openpay.currency', 'MXN'));
        if ($currency !== $expectedCurrency) {
            Log::warning("OpenPay Webhook: Moneda inválida ({$currency}) para transacción {$transactionId}.");

            return response()->json(['error' => 'Transaction currency mismatch'], 400);
        }

        // Parse order_id to resolve user_id and curso_programado_id
        $parsed = $this->parseOrderId($orderId);
        $userId = $parsed['user_id'];
        $cursoProgramadoId = $parsed['curso_programado_id'];

        // Fallback: If userId is null, resolve from verified customer email
        if (! $userId && ! empty($verified['customer']['email'])) {
            $userByEmail = User::where('email', $verified['customer']['email'])->first();
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

        // Uniqueness check for referencia across other enrollments
        $existingByReference = Enrollment::where('referencia', $transactionId)->first();
        if ($existingByReference && (
            (int) $existingByReference->user_id !== (int) $user->id ||
            (int) $existingByReference->curso_programado_id !== (int) $scheduledCourse->id
        )) {
            Log::warning("OpenPay Webhook: Referencia duplicada {$transactionId} ya asignada a inscripción {$existingByReference->id}.");

            return response()->json(['error' => 'Transaction reference already assigned to another enrollment'], 409);
        }

        // Verify verified amount against ScheduledCourse->precio (accounting for associated coupon if present)
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('curso_programado_id', $scheduledCourse->id)
            ->first();

        $originalPrice = round((float) $scheduledCourse->precio, 2);
        $expectedAmount = $originalPrice;
        $couponCode = null;

        $candidateCoupon = $verified['metadata']['cupon']
            ?? $verified['metadata']['coupon']
            ?? $verified['metadata']['clave']
            ?? $existingEnrollment?->clave
            ?? ($orderId !== '' ? Cache::get("openpay_order_coupon:{$orderId}") : null);

        if (is_string($candidateCoupon) && trim($candidateCoupon) !== '') {
            $normalizedCoupon = strtoupper(trim($candidateCoupon));
            $discount = Discount::where('clave', $normalizedCoupon)
                ->where('curso_programado_id', $scheduledCourse->id)
                ->first();

            $alreadyRegisteredWithSameRef = $existingEnrollment && $existingEnrollment->referencia === $transactionId;

            if ($discount && ($alreadyRegisteredWithSameRef || ($discount->activo === 'si' && (int) $discount->limite > 0))) {
                $percent = max(0, min(100, (float) $discount->descuento));
                $discountAmount = round($originalPrice * ($percent / 100), 2);
                $expectedAmount = round(max(0, $originalPrice - $discountAmount), 2);
                $couponCode = $discount->clave;
            }
        }

        if ($amount <= 0 || round($amount, 2) !== round($expectedAmount, 2)) {
            Log::warning("OpenPay Webhook: Discrepancia de monto para transacción {$transactionId}.", [
                'verified_amount' => $amount,
                'expected_amount' => $expectedAmount,
                'order_id' => $orderId,
            ]);

            return response()->json(['error' => 'Verified amount mismatch'], 400);
        }

        // Map OpenPay payment method to legacy tipo_pago
        $tipoPago = match ($method) {
            'store' => 'tienda',
            'bank_account' => 'spei',
            default => 'tarjeta',
        };

        $enrollment = $this->fulfillmentService->fulfill(
            $user,
            $scheduledCourse,
            $transactionId,
            $tipoPago,
            $amount,
            $couponCode
        );

        Log::info("OpenPay Webhook: Inscripción procesada (ID: {$enrollment->id}, Usuario: {$user->email}, Curso: {$scheduledCourse->identificador}, aceptado: {$enrollment->aceptado})");

        return response()->json([
            'status' => 'success',
            'message' => 'Payment processed successfully',
            'enrollment_id' => $enrollment->id,
        ], 200);
    }

    /**
     * Handle refund notifications by verifying S2S against OpenPay before revoking course access.
     */
    protected function processRefundedCharge(array $payload): JsonResponse
    {
        $transactionId = $payload['transaction']['id'] ?? null;

        if (
            ! $this->isValidTransactionId($transactionId)
            || in_array($transactionId, ['Cupon de descuento', 'Inscripción manual por Administrador', 'Inscripción agregada por administrador'], true)
        ) {
            Log::warning('OpenPay Webhook: Evento de reembolso ignorado por referencia no-transaccional o inválida.');

            return response()->json([
                'status' => 'ignored',
                'message' => 'Non-transaction reference ignored',
            ], 200);
        }

        try {
            $verified = $this->verifyTransactionWithOpenPay($transactionId);
        } catch (RuntimeException $e) {
            return response()->json(['error' => 'Payment gateway verification temporarily unavailable'], 503);
        }

        if ($verified === null) {
            if (empty(config('openpay.merchant_id')) || empty(config('openpay.private_key'))) {
                return response()->json(['error' => 'OpenPay verification credentials not configured'], 500);
            }

            return response()->json(['error' => 'Transaction verification failed'], 400);
        }

        $verifiedStatus = strtolower((string) ($verified['status'] ?? ''));

        if (! in_array($verifiedStatus, ['refunded', 'cancelled', 'canceled'], true)) {
            Log::warning("OpenPay Webhook: Reembolso rechazado porque OpenPay reporta estado '{$verifiedStatus}' para {$transactionId}.");

            return response()->json(['error' => 'Charge is not refunded or cancelled in OpenPay'], 400);
        }

        DB::transaction(function () use ($transactionId): void {
            $enrollment = Enrollment::where('referencia', $transactionId)
                ->lockForUpdate()
                ->first();

            if ($enrollment) {
                $enrollment->aceptado = 'no';
                $enrollment->save();
                Log::warning("OpenPay Webhook: Reembolso verificado. Inscripción {$enrollment->id} revocada (aceptado = 'no').");
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Refund processed',
        ], 200);
    }

    /**
     * Perform server-to-server query against OpenPay API and return the verified charge payload.
     *
     * Returns null when credentials are missing or OpenPay rejects the request (4xx).
     * Throws RuntimeException (code 503) on transient HTTP/5xx failures so OpenPay can retry.
     */
    protected function verifyTransactionWithOpenPay(string $transactionId): ?array
    {
        if (! $this->isValidTransactionId($transactionId)) {
            return null;
        }

        $merchantId = (string) config('openpay.merchant_id', '');
        $privateKey = (string) config('openpay.private_key', '');
        $sandbox = filter_var(config('openpay.sandbox', true), FILTER_VALIDATE_BOOLEAN);

        if ($merchantId === '' || $privateKey === '') {
            Log::error('OpenPay Webhook: Credenciales de OpenPay no configuradas; verificación fail-closed.');

            return null;
        }

        $domain = match (strtoupper((string) config('openpay.country', 'MX'))) {
            'CO' => 'openpay.co',
            'PE' => 'openpay.pe',
            default => 'openpay.mx',
        };

        $baseUrl = $sandbox
            ? "https://sandbox-api.{$domain}/v1/{$merchantId}/charges/{$transactionId}"
            : "https://api.{$domain}/v1/{$merchantId}/charges/{$transactionId}";

        try {
            $response = Http::withBasicAuth($privateKey, '')->timeout(10)->get($baseUrl);

            if ($response->successful()) {
                $data = $response->json();

                if (! is_array($data)) {
                    return null;
                }

                if (isset($data['id']) && (string) $data['id'] !== $transactionId) {
                    return null;
                }

                return $data;
            }

            if ($response->serverError() || $response->status() === 429) {
                Log::error("OpenPay API verify transient HTTP {$response->status()}");
                throw new RuntimeException('OpenPay API transient error', 503);
            }

            Log::error("OpenPay API verify rejected HTTP {$response->status()}");

            return null;
        } catch (RuntimeException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('OpenPay API verify exception: '.str_replace($privateKey, '[REDACTED]', $e->getMessage()));

            throw new RuntimeException('OpenPay API connection error', 503, $e);
        }
    }

    protected function isValidTransactionId(mixed $transactionId): bool
    {
        return is_string($transactionId) && preg_match(self::TRANSACTION_ID_PATTERN, $transactionId) === 1;
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
