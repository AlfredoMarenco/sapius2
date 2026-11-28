<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ZoomClass;
use App\Services\EnrollmentAccessService;
use App\Services\ZoomService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ZoomRoomController extends Controller
{
    public function __construct(
        protected EnrollmentAccessService $accessService,
        protected ZoomService $zoomService
    ) {}

    protected function authorizeRoomAccess(User $user, ZoomClass $zoomClass): string
    {
        if ($user->hasRole('admin')) {
            return 'admin';
        }

        if ($user->hasRole('instructor')) {
            $schedule = $zoomClass->scheduledCourse;
            if ($schedule && (int) $schedule->user_id === (int) $user->id) {
                return 'instructor';
            }

            abort(403, 'No tienes autorización para acceder a esta sala.');
        }

        if ($user->hasRole('alumno')) {
            $this->accessService->requireActiveEnrollment($user, (int) $zoomClass->curso_programado_id);

            if (! $zoomClass->is_active || $zoomClass->status === 'cancelled') {
                abort(404, 'Esta sesión de clase en vivo no está disponible.');
            }

            return 'alumno';
        }

        abort(403, 'Acceso no autorizado.');
    }

    public function show(Request $request, ZoomClass $zoomClass)
    {
        $zoomClass->load(['scheduledCourse.course', 'scheduledCourse.instructor', 'module', 'lesson']);
        $user = $request->user();
        $viewerRole = $this->authorizeRoomAccess($user, $zoomClass);

        $signatureUrl = match ($viewerRole) {
            'admin' => "/admin/zoom-classes/{$zoomClass->id}/signature",
            'instructor' => "/instructor/zoom-classes/{$zoomClass->id}/signature",
            default => "/alumno/clases-en-vivo/{$zoomClass->id}/signature",
        };

        $backUrl = match ($viewerRole) {
            'admin' => "/admin/schedules/{$zoomClass->curso_programado_id}/zoom-classes",
            'instructor' => "/instructor/schedules/{$zoomClass->curso_programado_id}/zoom-classes",
            default => $zoomClass->leccion_id
                ? "/alumno/modulo/{$zoomClass->leccion_id}/{$zoomClass->curso_programado_id}"
                : "/alumno/curso/{$zoomClass->curso_programado_id}",
        };

        return Inertia::render('User/Zoom/Room', [
            'zoomClass' => [
                'id' => $zoomClass->id,
                'title' => $zoomClass->title,
                'description' => $zoomClass->description,
                'scheduled_at_iso' => $zoomClass->scheduled_at?->toIso8601String(),
                'scheduled_date_formatted' => $zoomClass->scheduled_at?->format('d/m/Y'),
                'scheduled_time_formatted' => $zoomClass->scheduled_at?->format('H:i'),
                'ends_time_formatted' => $zoomClass->endsAt()->format('H:i'),
                'duration_minutes' => (int) $zoomClass->duration_minutes,
                'status' => $zoomClass->computedStatus(),
                'is_joinable' => $zoomClass->isJoinableNow() || in_array($viewerRole, ['admin', 'instructor'], true),
                'course_title' => $zoomClass->scheduledCourse?->course?->title ?? 'Curso Sapius',
                'cohort_identifier' => $zoomClass->scheduledCourse?->identificador ?? "Grupo #{$zoomClass->curso_programado_id}",
                'instructor_name' => $zoomClass->scheduledCourse?->instructor?->name ?? 'Instructor Sapius',
                'module_title' => $zoomClass->module?->title,
                'lesson_title' => $zoomClass->lesson?->title,
                'lesson_id' => $zoomClass->leccion_id,
                'scheduled_id' => $zoomClass->curso_programado_id,
            ],
            'viewerRole' => $viewerRole,
            'sdkConfigured' => $this->zoomService->isSdkConfigured(),
            'signatureUrl' => $signatureUrl,
            'backUrl' => $backUrl,
        ]);
    }

    public function signature(Request $request, ZoomClass $zoomClass)
    {
        $user = $request->user();
        $viewerRole = $this->authorizeRoomAccess($user, $zoomClass);

        if ($viewerRole === 'alumno' && ! $zoomClass->isJoinableNow()) {
            return response()->json([
                'message' => 'La sala de esta clase aún no está abierta. Podrás ingresar desde 15 minutos antes de la hora programada.',
            ], 403);
        }

        if (! $this->zoomService->isSdkConfigured()) {
            return response()->json([
                'message' => 'Las credenciales de Zoom Meeting SDK (ZOOM_SDK_KEY / ZOOM_SDK_SECRET) aún no están configuradas en el servidor.',
            ], 422);
        }

        $signature = $this->zoomService->generateSdkSignature($zoomClass->meeting_number, 0);
        $baseName = trim((string) ($user->nombre_completo ?: $user->name ?: $user->username ?: 'Alumno'));
        $displayName = "{$baseName} (#{$user->id})";

        return response()->json([
            'signature' => $signature,
            'sdkKey' => $this->zoomService->getSdkKey(),
            'meetingNumber' => $zoomClass->meeting_number,
            'password' => (string) ($zoomClass->passcode ?? ''),
            'userName' => $displayName,
            'userEmail' => (string) $user->email,
        ]);
    }
}
