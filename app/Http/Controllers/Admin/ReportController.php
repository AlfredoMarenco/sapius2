<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Openpay\Data\Openpay;

class ReportController extends Controller
{
    public function index()
    {
        $totalInscriptions = Enrollment::count();
        $acceptedInscriptions = Enrollment::where('aceptado', 'si')->count();
        $pendingInscriptions = Enrollment::where('aceptado', 'no')->count();

        return Inertia::render('Admin/Reports/Index', [
            'stats' => [
                'total' => $totalInscriptions,
                'accepted' => $acceptedInscriptions,
                'pending' => $pendingInscriptions,
            ]
        ]);
    }

    public function inscriptions()
    {
        $inscriptions = Enrollment::with(['user', 'scheduledCourse.course'])
            ->whereNotNull('referencia')
            ->where('referencia', '!=', '')
            ->where('referencia', '!=', 'null')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->through(function ($ins) {
                return [
                    'id' => $ins->id,
                    'user_name' => $ins->user ? $ins->user->name : 'Usuario Desconocido',
                    'user_email' => $ins->user ? $ins->user->email : '',
                    'course_title' => $ins->scheduledCourse && $ins->scheduledCourse->course ? $ins->scheduledCourse->course->title : 'Curso',
                    'reference' => $ins->referencia,
                    'status' => $ins->aceptado,
                    'payment_type' => $ins->tipo_pago,
                    'created_at' => $ins->created_at ? $ins->created_at->format('d/m/Y H:i') : null,
                ];
            });

        return Inertia::render('Admin/Reports/Enrollments', [
            'inscriptions' => $inscriptions,
        ]);
    }

    public function showInscription($id)
    {
        $enrollment = Enrollment::with(['user', 'scheduledCourse.course'])->findOrFail($id);
        
        $discount = null;
        if ($enrollment->clave) {
            $discount = Discount::where('clave', $enrollment->clave)->first();
        }

        $charge = null;
        $openpayError = null;

        if ($enrollment->referencia === "Cupon de descuento") {
            $charge = [
                'status' => 'completed',
                'description' => 'Pago cubierto al 100% por cupón de descuento',
                'method' => 'coupon',
                'amount' => 0.00
            ];
        } else {
            try {
                if (!config('openpay.sandbox')) {
                    Openpay::setProductionMode(true);
                }

                $merchantId = config('openpay.merchant_id');
                $privateKey = config('openpay.private_key');
                $currency = config('openpay.currency') ?: 'MXN';
                $ip = config('openpay.ip') ?: '127.0.0.1';

                if ($merchantId && $privateKey) {
                    $openpay = Openpay::getInstance($merchantId, $privateKey, $currency, $ip);
                    $openpayCharge = $openpay->charges->get($enrollment->referencia);
                    
                    $charge = [
                        'id' => $openpayCharge->id,
                        'status' => $openpayCharge->status,
                        'description' => $openpayCharge->description,
                        'method' => $openpayCharge->method,
                        'amount' => $openpayCharge->amount,
                        'currency' => $openpayCharge->currency,
                        'created_at' => clone $openpayCharge->creation_date,
                        'card' => clone $openpayCharge->card,
                        'customer' => clone $openpayCharge->customer,
                        'error_message' => $openpayCharge->error_message ?? null,
                    ];
                } else {
                    $openpayError = "Credenciales de OpenPay no configuradas (merchant_id o private_key). Configura el .env local.";
                }
            } catch (\Exception $e) {
                $openpayError = "Error al conectar con OpenPay: " . $e->getMessage();
            }
        }

        return Inertia::render('Admin/Reports/ShowEnrollment', [
            'enrollment' => $enrollment,
            'discount' => $discount,
            'charge' => $charge,
            'openpayError' => $openpayError
        ]);
    }
}
