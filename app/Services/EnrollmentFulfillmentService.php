<?php

namespace App\Services;

use App\Mail\TarjetaEmail;
use App\Models\Discount;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class EnrollmentFulfillmentService
{
    /**
     * Fulfill an enrollment idempotently inside a pessimistic DB transaction.
     *
     * Enrollments created via OpenPay card, 100% coupon, or OpenPay webhook
     * must remain pending (aceptado = 'no') until manual admin approval or the
     * 2-hour auto-approval cron, sending only TarjetaEmail.
     */
    public function fulfill(
        User $user,
        ScheduledCourse $scheduledCourse,
        string $referencia,
        string $tipoPago,
        float $amountPaid,
        ?string $cuponCode = null
    ): Enrollment {
        $normalizedCoupon = ($cuponCode !== null && trim($cuponCode) !== '')
            ? strtoupper(trim($cuponCode))
            : null;

        return DB::transaction(function () use (
            $user,
            $scheduledCourse,
            $referencia,
            $tipoPago,
            $amountPaid,
            $normalizedCoupon
        ): Enrollment {
            if ($referencia !== 'Cupon de descuento') {
                $existingByReference = Enrollment::where('referencia', $referencia)
                    ->lockForUpdate()
                    ->first();

                if ($existingByReference && (
                    (int) $existingByReference->user_id !== (int) $user->id ||
                    (int) $existingByReference->curso_programado_id !== (int) $scheduledCourse->id
                )) {
                    throw new RuntimeException("La referencia de pago {$referencia} ya pertenece a otra inscripción.");
                }
            }

            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('curso_programado_id', $scheduledCourse->id)
                ->lockForUpdate()
                ->first();

            // Idempotency: this reference was already registered for this student/cohort.
            if ($enrollment && $enrollment->referencia === $referencia) {
                return $enrollment;
            }

            // Never downgrade an already accepted enrollment back to 'no'.
            if ($enrollment && $enrollment->aceptado === 'si') {
                return $enrollment;
            }

            $discount = null;
            if ($normalizedCoupon !== null) {
                $discount = Discount::where('clave', $normalizedCoupon)
                    ->where('curso_programado_id', $scheduledCourse->id)
                    ->lockForUpdate()
                    ->first();
            }

            if ($tipoPago === 'cupon') {
                if (! $discount || $discount->activo !== 'si' || (int) $discount->limite < 1 || (float) $discount->descuento < 100) {
                    throw new DomainException('El cupón del 100% ya no es válido o se ha agotado.');
                }
            }

            if (! $enrollment) {
                $enrollment = new Enrollment;
                $enrollment->user_id = $user->id;
                $enrollment->curso_programado_id = $scheduledCourse->id;
            }

            $enrollment->aceptado = 'no';
            $enrollment->referencia = $referencia;
            $enrollment->tipo_pago = $tipoPago;

            if ($normalizedCoupon !== null) {
                $enrollment->clave = $normalizedCoupon;
            }

            $enrollment->save();

            if ($discount && (int) $discount->limite > 0) {
                $discount->decrement('limite');
            }

            $scheduledCourse->loadMissing('course');
            $datosTarjeta = [
                'name_alumno' => $user->nombre_completo ?: $user->name ?: $user->email,
                'identificador' => $scheduledCourse->identificador ?? $scheduledCourse->course?->title ?? 'Curso',
                'precio' => $amountPaid,
                'id_carge' => $referencia,
            ];

            DB::afterCommit(function () use ($user, $datosTarjeta, $enrollment): void {
                try {
                    Mail::to($user->email)
                        ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                        ->send(new TarjetaEmail($datosTarjeta));
                } catch (\Throwable $e) {
                    Log::error("Error al enviar TarjetaEmail para inscripción {$enrollment->id}: ".$e->getMessage());
                }
            });

            return $enrollment;
        });
    }
}
