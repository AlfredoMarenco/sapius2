<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\UserStrikeHistory;
use App\Models\LessonUnlock;
use App\Services\CourseAccessService;
use App\Services\CourseCategoryService;
use App\Services\StrikeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the student dashboard showing enrolled active courses.
     */
    public function index(Request $request, CourseAccessService $accessService)
    {
        $user = $request->user();
        $now = Carbon::now();
        $hasSaleStart = Schema::hasColumn('cursos_programados', 'fecha_inicio_venta');

        $enrollments = Enrollment::with([
            'scheduledCourse.category',
            'scheduledCourse.course.modules.lessons',
            'scheduledCourse.instructor',
        ])
            ->where('user_id', $user->id)
            ->whereHas('scheduledCourse', function ($q) use ($now, $hasSaleStart) {
                $q->where('activo', 'si');

                if ($hasSaleStart) {
                    $q->where(function ($qSale) use ($now) {
                        $qSale->whereNull('fecha_inicio_venta')
                            ->orWhere('fecha_inicio_venta', '<=', $now);
                    });
                }

                $q->where(function ($qEnd) use ($now) {
                    $qEnd->whereNull('fecha_fin')
                        ->orWhere('fecha_fin', '>=', $now);
                });
            })
            ->get();

        $unlocksByCohort = LessonUnlock::where('user_id', $user->id)
            ->get()
            ->groupBy('curso_programado_id')
            ->map(fn ($items) => $items->keyBy('leccion_id'));

        $enrolledCourses = $enrollments->map(function ($enrollment) use ($user, $now, $accessService, $unlocksByCohort) {
            $scheduled = $enrollment->scheduledCourse;
            if (! $scheduled || ! $scheduled->course) {
                return null;
            }

            $course = $scheduled->course;

            // Fetch completed lessons by user in this scheduled course
            $completedLessonIds = DB::table('leccion_user')
                ->where('user_id', $user->id)
                ->where('curso_programado_id', $scheduled->id)
                ->pluck('leccion_id')
                ->toArray();

            // Count total lessons across all modules
            $totalLessons = 0;
            if ($course->modules) {
                foreach ($course->modules as $mod) {
                    $totalLessons += $mod->lessons ? $mod->lessons->count() : 0;
                }
            }

            $progress = $totalLessons > 0 ? round((count($completedLessonIds) / $totalLessons) * 100) : 0;

            // Calculate next available lesson for smart resume
            $nextLessonId = null;
            $cohortUnlocks = $unlocksByCohort->get($scheduled->id, collect());
            if ($course->modules) {
                foreach ($course->modules as $mod) {
                    $modSchedule = $accessService->evaluateSchedule($scheduled->id, $mod->id, $cohortUnlocks->get($mod->id));
                    if (! $modSchedule['is_available']) {
                        continue;
                    }
                    if ($mod->lessons) {
                        foreach ($mod->lessons as $lesson) {
                            $lessonSchedule = $accessService->evaluateSchedule($scheduled->id, $lesson->id, $cohortUnlocks->get($lesson->id));
                            if ($lessonSchedule['is_available'] && ! in_array($lesson->id, $completedLessonIds)) {
                                $nextLessonId = $lesson->id;
                                break 2;
                            }
                        }
                    }
                }
            }

            $startDate = $scheduled->fecha_inicio ? Carbon::parse($scheduled->fecha_inicio) : null;
            $endDate = $scheduled->fecha_fin ? Carbon::parse($scheduled->fecha_fin) : null;
            $isAvailable = true;

            if ($startDate && $now->lt($startDate)) {
                $isAvailable = false;
            }

            $categoryName = $scheduled->category?->name
                ?? CourseCategoryService::getCategoryForCourse($course->id)?->name
                ?? 'General';

            return [
                'enrollment_id' => $enrollment->id,
                'status' => $enrollment->aceptado,
                'scheduled_id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'course_id' => $course->id,
                'title' => $course->title,
                'category' => $categoryName,
                'category_slug' => strtolower($categoryName),
                'description' => $course->description,
                'image' => $course->image,
                'instructor' => $scheduled->instructor ? $scheduled->instructor->name : 'Sapius Team',
                'progress' => $progress,
                'total_lessons' => $totalLessons,
                'completed_lessons' => count($completedLessonIds),
                'next_lesson_id' => $nextLessonId,
                'is_available' => $isAvailable,
                'start_date' => $startDate ? $startDate->format('d/m/Y') : null,
                'end_date' => $endDate ? $endDate->format('d/m/Y') : null,
            ];
        })->filter()->values();

        return Inertia::render('User/Dashboard', [
            'enrolledCourses' => $enrolledCourses,
        ]);
    }

    /**
     * Register a strike for suspicious activity (anti-cheat) delegating to StrikeService (0-100 scale).
     */
    public function registerStrike(Request $request, StrikeService $strikeService)
    {
        $user = $request->user();

        $action = (string) ($request->input('action') ?? $request->input('reason') ?? 'Actividad sospechosa');
        $details = (string) ($request->input('details') ?? $request->input('reason') ?? $action);
        $feedbackMode = $request->boolean('feedback_mode');

        $result = $strikeService->register($user, $action, $details, $feedbackMode);

        if ($result['blocked']) {
            return response()->json([
                'success' => true,
                'status' => $result['status'],
                'blocked' => true,
                'strikes' => $result['strikes'],
                'max_strikes' => $result['max_strikes'],
                'points_added' => $result['points_added'],
                'redirect' => route('alumno.blocked'),
                'message' => 'Cuenta bloqueada por exceder límite de strikes.',
            ]);
        }

        return response()->json([
            'success' => true,
            'status' => $result['status'],
            'blocked' => false,
            'strikes' => $result['strikes'],
            'max_strikes' => $result['max_strikes'],
            'points_added' => $result['points_added'],
        ]);
    }

    public function blocked()
    {
        $user = Auth::user();
        $isBlocked = $user->is_blocked === 1
            || $user->is_blocked === true
            || $user->is_blocked === 'si';

        if (! $isBlocked && ($user->strikes ?? 0) < 100) {
            return redirect()->route('alumno.dashboard');
        }

        $strikesHistory = UserStrikeHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('User/Blocked', [
            'strikesHistory' => $strikesHistory,
        ]);
    }

    public function checkStatus()
    {
        $user = Auth::user();
        $isBlocked = $user->is_blocked === 1
            || $user->is_blocked === true
            || $user->is_blocked === 'si'
            || (int) ($user->strikes ?? 0) >= 100;

        return response()->json([
            'is_blocked' => $isBlocked,
            'strikes' => (int) ($user->strikes ?? 0),
        ]);
    }
}
