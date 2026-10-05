<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ScheduledCourse;
use App\Models\Enrollment;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class CheckoutController extends Controller
{
    /**
     * Display checkout page for a specific scheduled course.
     */
    public function createCheckout($curso_id = null)
    {
        $cursoId = $curso_id ?: request('curso_id');

        if (!$cursoId) {
            return redirect()->route('cursos.disponibles')->with('error', 'Selecciona un curso para comprar.');
        }

        $scheduled = ScheduledCourse::with(['course.category', 'instructor'])->find($cursoId);

        if (!$scheduled) {
            return redirect()->route('cursos.disponibles')->with('error', 'Curso no disponible.');
        }

        $user = Auth::user();

        // Check if already enrolled
        $alreadyEnrolled = Enrollment::where('curso_programado_id', $scheduled->id)
            ->where('user_id', $user->id)
            ->where('aceptado', 'si')
            ->exists();

        if ($alreadyEnrolled) {
            return redirect()->route('alumno.home')->with('info', 'Ya estás inscrito en este curso.');
        }

        $originalPrice = (float)$scheduled->precio;
        $finalPrice = $originalPrice;
        $activeCoupon = null;

        // Apply coupon from session if exists and valid
        if (session()->has('cupon_code') && session()->has('cupon_discount')) {
            $discountValue = (float)session('cupon_discount');
            $activeCoupon = [
                'code' => session('cupon_code'),
                'discount' => $discountValue
            ];
            
            $finalPrice = max(0, $originalPrice - $discountValue);
        }

        return Inertia::render('User/Checkout/Index', [
            'course' => [
                'id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'title' => $scheduled->course->title,
                'description' => $scheduled->course->description,
                'category' => $scheduled->course->category ? $scheduled->course->category->name : 'General',
                'originalPrice' => $originalPrice,
                'price' => $finalPrice,
                'image' => $scheduled->course->image,
            ],
            'coupon' => $activeCoupon,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->telefono ?? '',
            ],
            'openpay' => [
                'merchantId' => config('services.openpay.merchant_id', env('OPENPAY_MERCHANT_ID', '')),
                'publicKey' => config('services.openpay.public_key', env('OPENPAY_PUBLIC_KEY', '')),
                'sandbox' => config('services.openpay.sandbox', env('OPENPAY_SANDBOX', true)),
            ],
        ]);
    }

    /**
     * Check if a coupon is valid
     */
    public function checkCoupon(Request $request)
    {
        $request->validate([
            'clave' => 'required|string',
            'curso_id' => 'required|integer'
        ]);

        $clave = strtoupper(trim($request->clave));

        $descuento = Discount::where('clave', $clave)
            ->where('curso_programado_id', $request->curso_id)
            ->where('activo', 'si')
            ->first();

        if (!$descuento) {
            return redirect()->back()->with('error', 'El cupón no existe o está inactivo.');
        }

        if ($descuento->limite < 1) {
            return redirect()->back()->with('error', 'El cupón se ha agotado.');
        }

        session([
            'cupon_code' => $descuento->clave,
            'cupon_discount' => (float)$descuento->descuento
        ]);

        return redirect()->back()->with('success', 'Cupón aplicado correctamente.');
    }

    /**
     * Remove applied coupon
     */
    public function removeCoupon()
    {
        session()->forget(['cupon_code', 'cupon_discount']);
        return redirect()->back()->with('success', 'Cupón removido.');
    }

    /**
     * Process payment.
     */
    public function processPay(Request $request)
    {
        $request->validate([
            'curso_id' => 'required|integer',
            'token_id' => 'nullable|string',
            'device_session_id' => 'nullable|string',
        ]);

        $user = Auth::user();
        $cursoId = $request->curso_id;
        $scheduled = ScheduledCourse::with('course')->findOrFail($cursoId);

        $originalPrice = (float)$scheduled->precio;
        $finalPrice = $originalPrice;
        
        $cuponCode = null;

        if (session()->has('cupon_code') && session()->has('cupon_discount')) {
            $discountValue = (float)session('cupon_discount');
            $finalPrice = max(0, $originalPrice - $discountValue);
            $cuponCode = session('cupon_code');
        }

        // Si el precio es 0, hacer bypass de OpenPay y crear inscripción gratuita
        if ($finalPrice <= 0) {
            $enrollment = Enrollment::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'curso_programado_id' => $scheduled->id,
                ],
                [
                    'aceptado' => 'si',
                    'tipo_pago' => 'cupon',
                    'referencia' => 'Cupon de descuento',
                    'clave' => $cuponCode
                ]
            );

            // Descontar limite del cupón
            if ($cuponCode) {
                $descuentoModel = Discount::where('clave', $cuponCode)->first();
                if ($descuentoModel && $descuentoModel->limite > 0) {
                    $descuentoModel->decrement('limite');
                }
            }

            session()->forget(['cupon_code', 'cupon_discount']);
            
            // Enviar correo de confirmación de acceso
            \Illuminate\Support\Facades\Mail::to($user->email)
                ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                ->send(new \App\Mail\AutoAceptacionEmail($enrollment));

            return redirect()->route('checkout.payout.approved', ['id' => $enrollment->id]);
        }

        // Si no es gratuito, procesar con OpenPay Smart Checkout (Payment Link)
        try {
            $merchantId = config('services.openpay.merchant_id', env('OPENPAY_MERCHANT_ID', ''));
            $privateKey = config('services.openpay.private_key', env('OPENPAY_PRIVATE_KEY', ''));
            $sandbox = config('services.openpay.sandbox', env('OPENPAY_SANDBOX', true));

            $customer = [
                'name' => $request->user_name,
                'email' => $request->user_email,
            ];
            if ($request->user_phone) {
                $customer['phone_number'] = $request->user_phone;
            }

            // Limpiar la descripción de caracteres especiales y acentos para evitar errores 422 de OpenPay
            $cleanTitle = preg_replace('/[^a-zA-Z0-9\s-]/', '', \Illuminate\Support\Str::ascii($scheduled->course->title));
            // No usar dos puntos (:) ni símbolos raros porque OpenPay los rechaza en Checkouts
            $description = substr("Inscripcion a " . $cleanTitle, 0, 240);

            $checkoutData = [
                'amount' => (float) $finalPrice,
                'currency' => 'MXN',
                'description' => $description,
                'order_id' => 'checkout-' . $user->id . '-' . time(),
                'redirect_url' => url('/alumno/checkout/callback'),
                'customer' => $customer,
                'send_email' => false,
            ];

            $baseUrl = $sandbox 
                ? "https://sandbox-api.openpay.mx/v1/{$merchantId}/checkouts" 
                : "https://api.openpay.mx/v1/{$merchantId}/checkouts";

            $response = \Illuminate\Support\Facades\Http::withBasicAuth($privateKey, '')
                ->post($baseUrl, $checkoutData);

            if ($response->successful()) {
                $checkout = $response->json();
                
                // Guardar datos temporales en sesión para usarlos en el callback
                session([
                    'checkout_id' => $checkout['id'], // ID of the checkout to verify later
                    'pending_enrollment' => [
                        'user_id' => $user->id,
                        'curso_programado_id' => $scheduled->id,
                        'cuponCode' => $cuponCode,
                        'finalPrice' => $finalPrice,
                        'identificador' => $scheduled->identificador,
                        'title' => $scheduled->course->title,
                    ]
                ]);

                // Redirigir al Hosted Checkout de OpenPay
                return \Inertia\Inertia::location($checkout['checkout_link']);
            } else {
                \Illuminate\Support\Facades\Log::error('OpenPay Checkout API Error: ' . $response->body());
                return redirect()->back()->with('error', 'Error en el servicio de pago. Por favor intenta más tarde.');
            }
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OpenPay Exception: ' . $e->getMessage() . ' - ' . $e->getTraceAsString());
            return redirect()->back()->with('error', 'Error en la conexión con el procesador de pagos: ' . $e->getMessage());
        }
    }

    public function callback(Request $request)
    {
        $checkoutId = session('checkout_id');
        
        if (!$checkoutId) {
            // Failsafe: if session expired but OpenPay sent ?id=ck_xxx
            $checkoutId = $request->input('id');
        }
        
        if (!$checkoutId) {
            return redirect()->route('checkout.index')->with('error', 'No se recibió la confirmación del pago.');
        }

        $pending = session('pending_enrollment');
        if (!$pending) {
            return redirect()->route('alumno.dashboard')->with('error', 'Tu pago fue procesado pero la sesión expiró. Si tienes dudas, contáctanos.');
        }

        try {
            $merchantId = config('services.openpay.merchant_id', env('OPENPAY_MERCHANT_ID', ''));
            $privateKey = config('services.openpay.private_key', env('OPENPAY_PRIVATE_KEY', ''));
            $sandbox = config('services.openpay.sandbox', env('OPENPAY_SANDBOX', true));

            $baseUrl = $sandbox 
                ? "https://sandbox-api.openpay.mx/v1/{$merchantId}/checkouts/{$checkoutId}" 
                : "https://api.openpay.mx/v1/{$merchantId}/checkouts/{$checkoutId}";

            $response = \Illuminate\Support\Facades\Http::withBasicAuth($privateKey, '')->get($baseUrl);

            if (!$response->successful()) {
                return redirect()->route('checkout.index')->with('error', 'No se pudo verificar el estado del pago.');
            }

            $checkout = $response->json();

            // Status can be 'completed', 'paid', or 'expired'/'cancelled'
            if (!in_array(strtolower($checkout['status']), ['completed', 'paid', 'success'])) {
                return redirect()->route('checkout.index')->with('error', 'El pago fue rechazado o no fue completado.');
            }

            // We can use the checkout ID as reference
            $chargeId = $checkout['id'];

            // Crear la inscripción
            $enrollment = Enrollment::firstOrCreate(
                [
                    'user_id' => $pending['user_id'],
                    'curso_programado_id' => $pending['curso_programado_id'],
                ],
                [
                    'aceptado' => 'si',
                    'tipo_pago' => 'tarjeta',
                    'referencia' => $chargeId,
                    'clave' => $pending['cuponCode']
                ]
            );

            // Descontar cupón
            if ($pending['cuponCode']) {
                $descuentoModel = Discount::where('clave', $pending['cuponCode'])->first();
                if ($descuentoModel && $descuentoModel->limite > 0) {
                    $descuentoModel->decrement('limite');
                }
            }
            
            // Enviar Correos
            $user = User::find($pending['user_id']);
            $datosTarjeta = [
                'name_alumno' => $user->nombre_completo ?? $user->name,
                'identificador' => $pending['identificador'],
                'precio' => $pending['finalPrice'],
                'id_carge' => $chargeId,
            ];
            
            \Illuminate\Support\Facades\Mail::to($user->email)
                ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                ->send(new \App\Mail\TarjetaEmail($datosTarjeta));

            \Illuminate\Support\Facades\Mail::to($user->email)
                ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                ->send(new \App\Mail\AutoAceptacionEmail($enrollment));

            session()->forget(['cupon_code', 'cupon_discount', 'pending_enrollment']);
            return redirect()->route('checkout.payout.approved', ['id' => $enrollment->id]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OpenPay Callback Error: ' . $e->getMessage() . ' - ' . $e->getTraceAsString());
            return redirect()->route('checkout.index')->with('error', 'Hubo un error al verificar tu pago: ' . $e->getMessage());
        }
    }

    /**
     * Payment approved view.
     */
    public function chargeApproved($id)
    {
        $enrollment = Enrollment::with('scheduledCourse.course')->findOrFail($id);

        return Inertia::render('User/Checkout/Approved', [
            'enrollment' => [
                'id' => $enrollment->id,
                'course_title' => $enrollment->scheduledCourse->course->title,
                'reference' => $enrollment->referencia,
                'date' => $enrollment->created_at->format('d/m/Y H:i'),
            ]
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
        ]);
    }

    /**
     * 100% coupon or legacy direct pago.
     */
    public function pago(Request $request, $curso_id)
    {
        return $this->processPay(new Request(['curso_id' => $curso_id]));
    }
}
