<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Services\EnrollmentFulfillmentService;
use Carbon\Carbon;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Openpay\Data\Openpay;
use Openpay\Data\OpenpayApiAuthError;
use Openpay\Data\OpenpayApiConnectionError;
use Openpay\Data\OpenpayApiRequestError;
use Openpay\Data\OpenpayApiTransactionError;
use RuntimeException;
use Throwable;

class CheckoutController extends Controller
{
    private EnrollmentFulfillmentService $fulfillmentService;

    public function __construct(?EnrollmentFulfillmentService $fulfillmentService = null)
    {
        $this->fulfillmentService = $fulfillmentService ?? app(EnrollmentFulfillmentService::class);
    }

    /**
     * Display checkout page for a specific scheduled course.
     */
    public function createCheckout($curso_id = null)
    {
        $cursoId = $curso_id ?: request('curso_id');

        if (! $cursoId) {
            return redirect()->route('cursos.disponibles')->with('error', 'Selecciona un curso para comprar.');
        }

        $scheduled = ScheduledCourse::with(['course.category', 'category', 'instructor'])->find($cursoId);

        if ($saleError = $this->validateScheduledCourseForSale($scheduled)) {
            return redirect()->route('cursos.disponibles')->with('error', $saleError);
        }

        $user = Auth::user();

        $alreadyEnrolled = Enrollment::where('curso_programado_id', $scheduled->id)
            ->where('user_id', $user->id)
            ->where('aceptado', 'si')
            ->exists();

        if ($alreadyEnrolled) {
            return redirect()->route('alumno.home')->with('info', 'Ya estás inscrito en este curso.');
        }

        $pricing = $this->resolveCouponPricing($scheduled);

        return Inertia::render('User/Checkout/Index', [
            'course' => [
                'id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'title' => $scheduled->course->title,
                'description' => $scheduled->course->description,
                'category' => $scheduled->category?->name ?? $scheduled->course->category?->name ?? 'General',
                'originalPrice' => $pricing['originalPrice'],
                'price' => $pricing['finalPrice'],
                'image' => $scheduled->course->image,
            ],
            'coupon' => $pricing['activeCoupon'],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->telefono ?? '',
            ],
            'openpay' => [
                'merchantId' => (string) config('openpay.merchant_id', ''),
                'publicKey' => (string) config('openpay.public_key', ''),
                'sandbox' => filter_var(config('openpay.sandbox', true), FILTER_VALIDATE_BOOLEAN),
            ],
        ]);
    }

    /**
     * Check if a coupon is valid for the target scheduled course.
     */
    public function checkCoupon(Request $request)
    {
        $request->validate([
            'clave' => 'required|string|max:45',
            'curso_id' => 'required|integer',
        ]);

        $scheduled = ScheduledCourse::with('course')->find($request->curso_id);

        if ($saleError = $this->validateScheduledCourseForSale($scheduled)) {
            return redirect()->back()->with('error', $saleError);
        }

        $clave = strtoupper(trim($request->clave));

        $descuento = Discount::where('clave', $clave)
            ->where('curso_programado_id', $scheduled->id)
            ->where('activo', 'si')
            ->first();

        if (! $descuento) {
            return redirect()->back()->with('error', 'El cupón no existe o está inactivo.');
        }

        if ((int) $descuento->limite < 1) {
            return redirect()->back()->with('error', 'El cupón se ha agotado.');
        }

        $percent = max(0, min(100, (float) $descuento->descuento));
        if ($percent < 1) {
            return redirect()->back()->with('error', 'El cupón no tiene un porcentaje válido.');
        }

        session()->forget('cupon_discount');
        session([
            'cupon_code' => $descuento->clave,
            'cupon_curso_id' => $scheduled->id,
        ]);

        return redirect()->back()->with('success', 'Cupón aplicado correctamente.');
    }

    /**
     * Remove applied coupon.
     */
    public function removeCoupon()
    {
        session()->forget(['cupon_code', 'cupon_curso_id', 'cupon_discount']);

        return redirect()->back()->with('success', 'Cupón removido.');
    }

    /**
     * Process payment.
     */
    public function processPay(Request $request)
    {
        if (! $request->filled('curso_id') && $request->route('curso_id')) {
            $request->merge(['curso_id' => $request->route('curso_id')]);
        }

        $request->validate([
            'curso_id' => 'required|integer',
            'token_id' => 'nullable|string',
            'device_session_id' => 'nullable|string',
        ]);

        $user = Auth::user();
        $scheduled = ScheduledCourse::with('course')->find($request->curso_id);

        if ($saleError = $this->validateScheduledCourseForSale($scheduled)) {
            return redirect()->route('cursos.disponibles')->with('error', $saleError);
        }

        $alreadyEnrolled = Enrollment::where('curso_programado_id', $scheduled->id)
            ->where('user_id', $user->id)
            ->where('aceptado', 'si')
            ->exists();

        if ($alreadyEnrolled) {
            return redirect()->route('alumno.home')->with('info', 'Ya estás inscrito en este curso.');
        }

        $pricing = $this->resolveCouponPricing($scheduled);
        $finalPrice = $pricing['finalPrice'];
        $cuponCode = $pricing['couponCode'];
        $couponPercent = $pricing['couponPercent'];

        // El flujo gratuito SOLO se permite si existe un cupón válido del 100% en sesión
        if ($finalPrice <= 0) {
            if ($cuponCode === null || $couponPercent < 100.0) {
                return redirect()->route('alumno.checkout', $scheduled->id)
                    ->with('error', 'Se requiere un cupón válido del 100% para completar una inscripción gratuita.');
            }

            try {
                $enrollment = $this->fulfillmentService->fulfill(
                    $user,
                    $scheduled,
                    'Cupon de descuento',
                    'cupon',
                    0.0,
                    $cuponCode
                );
            } catch (DomainException $e) {
                session()->forget(['cupon_code', 'cupon_curso_id', 'cupon_discount']);

                return redirect()->route('alumno.checkout', $scheduled->id)->with('error', $e->getMessage());
            }

            session()->forget(['cupon_code', 'cupon_curso_id', 'cupon_discount']);

            return redirect()->route('checkout.payout.approved', ['id' => $enrollment->id]);
        }

        // Si no es gratuito, procesar con OpenPay Cargo Tokenizado + 3D Secure
        $request->validate([
            'token_id' => 'required|string',
            'device_session_id' => 'required|string',
        ], [
            'token_id.required' => 'No se pudo generar el token de la tarjeta. Verifica los datos e intenta de nuevo.',
            'device_session_id.required' => 'No se pudo inicializar la sesión antifraude de OpenPay. Recarga la página e intenta de nuevo.',
        ]);

        try {
            $openpay = $this->getOpenPayClient($request);

            $customer = [
                'name' => $request->input('user_name') ?: ($user->nombre_completo ?: $user->name ?: 'Estudiante'),
                'email' => $request->input('user_email') ?: $user->email,
            ];
            if ($request->filled('user_phone')) {
                $customer['phone_number'] = (string) $request->input('user_phone');
            }

            $cleanTitle = preg_replace('/[^a-zA-Z0-9\s-]/', '', Str::ascii($scheduled->course->title));
            $description = substr('Inscripcion a '.$cleanTitle, 0, 240);
            $orderId = $scheduled->id.'-'.$user->id.'-'.time().random_int(100, 999);

            $chargeData = [
                'method' => 'card',
                'source_id' => $request->token_id,
                'amount' => (float) $finalPrice,
                'currency' => config('openpay.currency', 'MXN'),
                'description' => $description,
                'device_session_id' => $request->device_session_id,
                'order_id' => $orderId,
                'redirect_url' => route('checkout.payout.callback'),
                'use_3d_secure' => 'true',
                'customer' => $customer,
            ];

            $charge = $openpay->charges->create($chargeData);

            $pending = [
                'user_id' => $user->id,
                'curso_programado_id' => $scheduled->id,
                'order_id' => $orderId,
                'cuponCode' => $cuponCode,
                'finalPrice' => $finalPrice,
                'identificador' => $scheduled->identificador,
                'title' => $scheduled->course->title,
            ];

            if ($cuponCode !== null) {
                Cache::put("openpay_order_coupon:{$orderId}", $cuponCode, now()->addDay());
            }

            if (! empty($charge->payment_method->url)) {
                session([
                    'openpay_charge_id' => $charge->id,
                    'pending_enrollment' => $pending,
                ]);

                return Inertia::location($charge->payment_method->url);
            }

            if (
                $charge->status === 'completed'
                && (string) ($charge->order_id ?? '') === $orderId
                && round((float) ($charge->amount ?? 0), 2) === round((float) $finalPrice, 2)
            ) {
                $enrollment = $this->fulfillmentService->fulfill(
                    $user,
                    $scheduled,
                    $charge->id,
                    'tarjeta',
                    (float) $charge->amount,
                    $cuponCode
                );

                $this->clearCheckoutSession();

                return redirect()->route('checkout.payout.approved', ['id' => $enrollment->id]);
            }

            return redirect()->back()->with('error', 'El pago no pudo ser completado. Intenta con otra tarjeta.');
        } catch (OpenpayApiTransactionError|OpenpayApiRequestError|OpenpayApiAuthError|OpenpayApiConnectionError $e) {
            $safeMessage = $this->sanitizeSensitiveMessage($e->getMessage());
            Log::error('OpenPay Charge Error: '.$safeMessage, [
                'code' => method_exists($e, 'getErrorCode') ? $e->getErrorCode() : null,
            ]);

            $rawDescription = method_exists($e, 'getDescription') ? (string) $e->getDescription() : '';
            $msg = ($rawDescription !== '' && ! $this->containsSensitiveData($rawDescription))
                ? $rawDescription
                : 'Error en el servicio de pago. Por favor intenta más tarde.';

            return redirect()->back()->with('error', $msg);
        } catch (Throwable $e) {
            Log::error('OpenPay Exception: '.$this->sanitizeSensitiveMessage($e->getMessage()));

            return redirect()->back()->with('error', 'Ocurrió un error al conectar con el procesador de pagos. Por favor intenta más tarde.');
        }
    }

    public function callback(Request $request)
    {
        $requestChargeId = $request->input('id');
        $sessionChargeId = session('openpay_charge_id');
        $pending = session('pending_enrollment');
        $checkoutCourseId = $pending['curso_programado_id'] ?? null;

        if (
            ! is_string($requestChargeId)
            || $requestChargeId === ''
            || ! is_string($sessionChargeId)
            || $sessionChargeId === ''
            || ! hash_equals($sessionChargeId, $requestChargeId)
        ) {
            return redirect()->route('alumno.checkout', $checkoutCourseId)
                ->with('error', 'No se recibió una confirmación válida del pago.');
        }

        if (! is_array($pending) || empty($pending['user_id']) || empty($pending['curso_programado_id'])) {
            return redirect()->route('alumno.dashboard')
                ->with('error', 'Tu pago fue procesado pero la sesión expiró. Si tienes dudas, contáctanos.');
        }

        if ((int) $pending['user_id'] !== (int) Auth::id()) {
            return redirect()->route('alumno.checkout', $checkoutCourseId)
                ->with('error', 'La sesión de pago no corresponde al usuario autenticado.');
        }

        try {
            $openpay = $this->getOpenPayClient($request);
            $charge = $openpay->charges->get($sessionChargeId);

            if (($charge->status ?? null) !== 'completed') {
                return redirect()->route('alumno.checkout', $checkoutCourseId)
                    ->with('error', 'El pago fue rechazado o no fue completado.');
            }

            if (empty($pending['order_id']) || (string) ($charge->order_id ?? '') !== (string) $pending['order_id']) {
                return redirect()->route('alumno.checkout', $checkoutCourseId)
                    ->with('error', 'La orden del pago no coincide con la sesión actual.');
            }

            if ((float) round((float) ($charge->amount ?? 0), 2) !== (float) round((float) ($pending['finalPrice'] ?? -1), 2)) {
                return redirect()->route('alumno.checkout', $checkoutCourseId)
                    ->with('error', 'El monto confirmado no coincide con el total de la compra.');
            }

            $existingByReference = Enrollment::where('referencia', $charge->id)->first();
            if ($existingByReference && (
                (int) $existingByReference->user_id !== (int) $pending['user_id'] ||
                (int) $existingByReference->curso_programado_id !== (int) $pending['curso_programado_id']
            )) {
                return redirect()->route('alumno.checkout', $checkoutCourseId)
                    ->with('error', 'Esta referencia de pago ya pertenece a otra inscripción.');
            }

            $user = User::findOrFail($pending['user_id']);
            $scheduled = ScheduledCourse::with('course')->findOrFail($pending['curso_programado_id']);

            $enrollment = $this->fulfillmentService->fulfill(
                $user,
                $scheduled,
                $charge->id,
                'tarjeta',
                (float) $charge->amount,
                $pending['cuponCode'] ?? null
            );

            $this->clearCheckoutSession();

            return redirect()->route('checkout.payout.approved', ['id' => $enrollment->id]);
        } catch (Throwable $e) {
            Log::error('OpenPay Callback Error: '.$this->sanitizeSensitiveMessage($e->getMessage()));

            return redirect()->route('alumno.checkout', $checkoutCourseId)
                ->with('error', 'Hubo un error al verificar tu pago. Por favor intenta nuevamente o contáctanos.');
        }
    }

    /**
     * Payment approved view.
     */
    public function chargeApproved($id)
    {
        $enrollment = Enrollment::with('scheduledCourse.course')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('User/Checkout/Approved', [
            'enrollment' => [
                'id' => $enrollment->id,
                'course_title' => $enrollment->scheduledCourse?->course?->title ?? 'Curso',
                'reference' => $enrollment->referencia,
                'status' => $enrollment->aceptado,
                'date' => $enrollment->created_at ? $enrollment->created_at->format('d/m/Y H:i') : '',
            ],
        ]);
    }

    /**
     * Payment error view.
     */
    public function errorPayment()
    {
        return Inertia::render('User/Checkout/Error', [
            'error' => session('error', 'Ocurrió un error al procesar el pago.'),
            'code' => session('code', ''),
            'course_id' => session('pending_enrollment.curso_programado_id'),
        ]);
    }

    /**
     * 100% coupon or legacy direct pago.
     */
    public function pago(Request $request, $curso_id)
    {
        $request->merge(['curso_id' => $curso_id]);

        return $this->processPay($request);
    }

    /**
     * Validate that a scheduled course and its parent course are active and within the sale window.
     */
    private function validateScheduledCourseForSale(?ScheduledCourse $scheduled): ?string
    {
        if (! $scheduled || $scheduled->activo !== 'si') {
            return 'Curso no disponible.';
        }

        if (! $scheduled->course || $scheduled->course->activo !== 'si') {
            return 'Curso no disponible.';
        }

        $now = Carbon::now();

        if ($scheduled->fecha_inicio_venta && $now->lt(Carbon::parse($scheduled->fecha_inicio_venta))) {
            return 'El periodo de venta para este curso aún no ha iniciado.';
        }

        if ($scheduled->fecha_fin_venta && $now->gt(Carbon::parse($scheduled->fecha_fin_venta))) {
            return 'El periodo de venta para este curso ha finalizado.';
        }

        return null;
    }

    /**
     * Recalculate percentage-based coupon pricing directly from database when bound to this cohort.
     */
    private function resolveCouponPricing(ScheduledCourse $scheduled): array
    {
        $originalPrice = round((float) $scheduled->precio, 2);
        $finalPrice = $originalPrice;
        $activeCoupon = null;
        $couponCode = null;
        $couponPercent = 0.0;

        if (
            session()->has('cupon_code')
            && (int) session('cupon_curso_id') === (int) $scheduled->id
        ) {
            $sessionCode = strtoupper(trim((string) session('cupon_code')));
            $descuento = Discount::where('clave', $sessionCode)
                ->where('curso_programado_id', $scheduled->id)
                ->where('activo', 'si')
                ->where('limite', '>', 0)
                ->first();

            if ($descuento) {
                $percent = max(0, min(100, (float) $descuento->descuento));
                if ($percent > 0) {
                    $discountAmount = round($originalPrice * ($percent / 100), 2);
                    $finalPrice = round(max(0, $originalPrice - $discountAmount), 2);
                    $couponCode = $descuento->clave;
                    $couponPercent = $percent;
                    $activeCoupon = [
                        'code' => $descuento->clave,
                        'percent' => $percent,
                        'discount' => $discountAmount,
                    ];
                }
            } else {
                session()->forget(['cupon_code', 'cupon_curso_id', 'cupon_discount']);
            }
        }

        return [
            'originalPrice' => $originalPrice,
            'finalPrice' => $finalPrice,
            'activeCoupon' => $activeCoupon,
            'couponCode' => $couponCode,
            'couponPercent' => $couponPercent,
        ];
    }

    /**
     * Instantiate OpenPay SDK client using country code from config/openpay.php.
     */
    private function getOpenPayClient(Request $request)
    {
        $merchantId = (string) config('openpay.merchant_id', '');
        $privateKey = (string) config('openpay.private_key', '');

        if ($merchantId === '' || $privateKey === '') {
            throw new RuntimeException('Las credenciales de OpenPay no están configuradas.');
        }

        $sandbox = filter_var(config('openpay.sandbox', true), FILTER_VALIDATE_BOOLEAN);
        $country = (string) (config('openpay.country', 'MX') ?: 'MX');
        $ip = $request->ip() ?: ((string) config('openpay.ip', '') ?: '127.0.0.1');

        Openpay::setProductionMode(! $sandbox);

        return Openpay::getInstance($merchantId, $privateKey, $country, $ip);
    }

    private function clearCheckoutSession(): void
    {
        session()->forget([
            'openpay_charge_id',
            'checkout_id',
            'pending_enrollment',
            'cupon_code',
            'cupon_curso_id',
            'cupon_discount',
        ]);
    }

    private function sanitizeSensitiveMessage(string $message): string
    {
        $privateKey = (string) config('openpay.private_key', '');
        if ($privateKey !== '') {
            $message = str_replace($privateKey, '[REDACTED]', $message);
        }

        return $message;
    }

    private function containsSensitiveData(string $message): bool
    {
        $privateKey = (string) config('openpay.private_key', '');
        if ($privateKey !== '' && str_contains($message, $privateKey)) {
            return true;
        }

        return str_contains(strtolower($message), 'private_key') || str_contains($message, 'sk_');
    }
}
