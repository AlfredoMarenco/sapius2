<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Models\ZoomClass;
use App\Services\ZoomService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ZoomClassController extends Controller
{
    public function __construct(
        protected ZoomService $zoomService
    ) {}

    protected function authorizeCohortAccess(ScheduledCourse $schedule): User
    {
        $user = auth()->user();
        if (! $user) {
            abort(401);
        }

        if ($user->hasRole('admin')) {
            return $user;
        }

        if ($user->hasRole('instructor') && (int) $schedule->user_id === (int) $user->id) {
            return $user;
        }

        abort(403, 'No tienes autorización para gestionar las clases en vivo de esta cohorte.');
    }

    public function index(Request $request, ScheduledCourse $schedule)
    {
        $this->authorizeCohortAccess($schedule);

        $schedule->load(['course', 'instructor']);

        $modules = Module::where('curso_id', $schedule->curso_id)
            ->with(['lessons' => fn ($q) => $q->where('activo', 'si')->orderBy('posicion', 'asc')])
            ->where('activo', 'si')
            ->orderBy('posicion', 'asc')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'lessons' => $m->lessons->map(fn ($l) => [
                    'id' => $l->id,
                    'title' => $l->title,
                ])->values(),
            ])->values();

        $zoomClasses = ZoomClass::where('curso_programado_id', $schedule->id)
            ->with(['module', 'lesson', 'instructor'])
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(fn (ZoomClass $zc) => [
                'id' => $zc->id,
                'title' => $zc->title,
                'description' => $zc->description,
                'creation_mode' => $zc->creation_mode,
                'meeting_number' => $zc->meeting_number,
                'passcode' => $zc->passcode,
                'scheduled_at' => $zc->scheduled_at?->format('Y-m-d\TH:i'),
                'scheduled_at_formatted' => $zc->scheduled_at?->format('d/m/Y H:i'),
                'ends_at_formatted' => $zc->endsAt()->format('H:i'),
                'duration_minutes' => (int) $zc->duration_minutes,
                'status' => $zc->status,
                'computed_status' => $zc->computedStatus(),
                'is_active' => (bool) $zc->is_active,
                'module_id' => $zc->module_id,
                'module_title' => $zc->module?->title,
                'leccion_id' => $zc->leccion_id,
                'lesson_title' => $zc->lesson?->title,
                'instructor_name' => $zc->instructor?->name ?? $schedule->instructor?->name,
                'has_start_url' => ! empty($zc->start_url),
            ])->values();

        $routePrefix = $request->routeIs('instructor.*') ? 'instructor' : 'admin';

        return Inertia::render('Admin/Schedules/ZoomClasses', [
            'cohort' => [
                'id' => $schedule->id,
                'course_id' => $schedule->curso_id,
                'course_title' => $schedule->course?->title ?? 'Curso',
                'internal_id' => $schedule->identificador ?? "Cohorte #{$schedule->id}",
                'instructor_name' => $schedule->instructor?->name ?? 'Sin asignar',
            ],
            'modules' => $modules,
            'zoomClasses' => $zoomClasses,
            'routePrefix' => $routePrefix,
            'apiConfigured' => $this->zoomService->isApiConfigured(),
            'sdkConfigured' => $this->zoomService->isSdkConfigured(),
        ]);
    }

    public function store(Request $request, ScheduledCourse $schedule)
    {
        $user = $this->authorizeCohortAccess($schedule);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'creation_mode' => 'required|in:auto,manual',
            'meeting_input' => 'required_if:creation_mode,manual|nullable|string|max:500',
            'passcode' => 'nullable|string|max:100',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'module_id' => 'nullable|integer',
            'leccion_id' => 'nullable|integer',
        ]);

        [$moduleId, $lessonId] = $this->resolveCourseLinks(
            (int) $schedule->curso_id,
            $validated['module_id'] ?? null,
            $validated['leccion_id'] ?? null
        );

        $meetingNumber = '';
        $passcode = null;
        $joinUrl = null;
        $startUrl = null;

        if ($validated['creation_mode'] === 'auto') {
            if (! $this->zoomService->isApiConfigured()) {
                throw ValidationException::withMessages([
                    'creation_mode' => 'Las credenciales de Zoom API (Server-to-Server OAuth) no están configuradas. Usa el modo Manual o configura las variables ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID y ZOOM_CLIENT_SECRET.',
                ]);
            }

            $created = $this->zoomService->createMeeting([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? '',
                'scheduled_at' => $validated['scheduled_at'],
                'duration_minutes' => (int) $validated['duration_minutes'],
            ]);

            $meetingNumber = $created['meeting_number'];
            $passcode = $created['passcode'];
            $joinUrl = $created['join_url'];
            $startUrl = $created['start_url'];
        } else {
            $parsed = $this->zoomService->parseZoomInput(
                (string) ($validated['meeting_input'] ?? ''),
                $validated['passcode'] ?? null
            );

            if (strlen($parsed['meeting_number']) < 9 || strlen($parsed['meeting_number']) > 12) {
                throw ValidationException::withMessages([
                    'meeting_input' => 'Ingresa un Meeting ID válido de Zoom (9 a 12 dígitos) o un enlace de invitación válido.',
                ]);
            }

            $meetingNumber = $parsed['meeting_number'];
            $passcode = $parsed['passcode'];
            $joinUrl = $parsed['join_url'];
        }

        ZoomClass::create([
            'curso_programado_id' => $schedule->id,
            'curso_id' => $schedule->curso_id,
            'module_id' => $moduleId,
            'leccion_id' => $lessonId,
            'instructor_id' => $user->id,
            'title' => strip_tags($validated['title']),
            'description' => $validated['description'] ?? null,
            'creation_mode' => $validated['creation_mode'],
            'meeting_number' => $meetingNumber,
            'passcode' => $passcode,
            'join_url' => $joinUrl,
            'start_url' => $startUrl,
            'scheduled_at' => $validated['scheduled_at'],
            'duration_minutes' => (int) $validated['duration_minutes'],
            'status' => 'scheduled',
            'is_active' => true,
        ]);

        return back()->with('success', 'Clase en vivo programada correctamente.');
    }

    public function update(Request $request, ZoomClass $zoomClass)
    {
        $schedule = $zoomClass->scheduledCourse;
        if (! $schedule) {
            abort(404);
        }

        $this->authorizeCohortAccess($schedule);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'scheduled_at' => 'sometimes|required|date',
            'duration_minutes' => 'sometimes|required|integer|min:15|max:480',
            'module_id' => 'nullable|integer',
            'leccion_id' => 'nullable|integer',
            'status' => 'sometimes|required|in:scheduled,live,ended,cancelled',
            'is_active' => 'sometimes|boolean',
            'meeting_input' => 'nullable|string|max:500',
            'passcode' => 'nullable|string|max:100',
        ]);

        $updateData = [];

        if (array_key_exists('title', $validated)) {
            $updateData['title'] = strip_tags($validated['title']);
        }
        if (array_key_exists('description', $validated)) {
            $updateData['description'] = $validated['description'];
        }
        if (array_key_exists('scheduled_at', $validated)) {
            $updateData['scheduled_at'] = $validated['scheduled_at'];
        }
        if (array_key_exists('duration_minutes', $validated)) {
            $updateData['duration_minutes'] = (int) $validated['duration_minutes'];
        }
        if (array_key_exists('status', $validated)) {
            $updateData['status'] = $validated['status'];
        }
        if (array_key_exists('is_active', $validated)) {
            $updateData['is_active'] = (bool) $validated['is_active'];
        }

        if (array_key_exists('module_id', $validated) || array_key_exists('leccion_id', $validated)) {
            [$moduleId, $lessonId] = $this->resolveCourseLinks(
                (int) $schedule->curso_id,
                $validated['module_id'] ?? null,
                $validated['leccion_id'] ?? null
            );
            $updateData['module_id'] = $moduleId;
            $updateData['leccion_id'] = $lessonId;
        }

        if ($zoomClass->creation_mode === 'manual' && ! empty($validated['meeting_input'])) {
            $parsed = $this->zoomService->parseZoomInput(
                $validated['meeting_input'],
                $validated['passcode'] ?? $zoomClass->passcode
            );
            if (strlen($parsed['meeting_number']) < 9 || strlen($parsed['meeting_number']) > 12) {
                throw ValidationException::withMessages([
                    'meeting_input' => 'Ingresa un Meeting ID válido de Zoom (9 a 12 dígitos).',
                ]);
            }
            $updateData['meeting_number'] = $parsed['meeting_number'];
            $updateData['passcode'] = $parsed['passcode'];
            if ($parsed['join_url']) {
                $updateData['join_url'] = $parsed['join_url'];
            }
        } elseif ($zoomClass->creation_mode === 'manual' && array_key_exists('passcode', $validated)) {
            $updateData['passcode'] = $validated['passcode'];
        }

        $zoomClass->update($updateData);

        if ($zoomClass->creation_mode === 'auto' && $this->zoomService->isApiConfigured()) {
            $this->zoomService->updateMeeting($zoomClass->meeting_number, [
                'title' => $zoomClass->title,
                'description' => $zoomClass->description,
                'scheduled_at' => $zoomClass->scheduled_at,
                'duration_minutes' => $zoomClass->duration_minutes,
            ]);
        }

        return back()->with('success', 'Clase en vivo actualizada.');
    }

    public function destroy(ZoomClass $zoomClass)
    {
        $schedule = $zoomClass->scheduledCourse;
        if (! $schedule) {
            abort(404);
        }

        $this->authorizeCohortAccess($schedule);

        if ($zoomClass->creation_mode === 'auto' && $this->zoomService->isApiConfigured()) {
            $this->zoomService->deleteMeeting($zoomClass->meeting_number);
        }

        $zoomClass->delete();

        return back()->with('success', 'Clase en vivo eliminada.');
    }

    public function hostLaunch(ZoomClass $zoomClass)
    {
        $schedule = $zoomClass->scheduledCourse;
        if (! $schedule) {
            abort(404);
        }

        $this->authorizeCohortAccess($schedule);

        if ($zoomClass->status === 'scheduled') {
            $zoomClass->update(['status' => 'live']);
        }

        $targetUrl = $zoomClass->start_url ?: "https://zoom.us/s/{$zoomClass->meeting_number}";

        return Inertia::location($targetUrl);
    }

    /**
     * @return array{0: ?int, 1: ?int}
     */
    protected function resolveCourseLinks(int $courseId, ?int $moduleId, ?int $lessonId): array
    {
        $resolvedModuleId = null;
        $resolvedLessonId = null;

        if ($lessonId) {
            $lesson = Lesson::withoutGlobalScopes()
                ->where('id', $lessonId)
                ->where('curso_id', $courseId)
                ->first();

            if ($lesson) {
                $resolvedLessonId = (int) $lesson->id;
                $resolvedModuleId = $lesson->leccion_id ? (int) $lesson->leccion_id : $moduleId;
            }
        } elseif ($moduleId) {
            $module = Module::withoutGlobalScopes()
                ->where('id', $moduleId)
                ->where('curso_id', $courseId)
                ->first();

            if ($module) {
                $resolvedModuleId = (int) $module->id;
            }
        }

        return [$resolvedModuleId, $resolvedLessonId];
    }
}
