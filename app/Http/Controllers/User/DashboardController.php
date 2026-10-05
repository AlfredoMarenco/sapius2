<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the student dashboard showing enrolled active courses.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $enrollments = Enrollment::with([
            'scheduledCourse.category',
            'scheduledCourse.course.modules.lessons',
            'scheduledCourse.instructor',
        ])
        ->where('user_id', $user->id)
        ->get();

        $now = Carbon::now();

        $enrolledCourses = $enrollments->map(function ($enrollment) use ($user, $now) {
            $scheduled = $enrollment->scheduledCourse;
            if (!$scheduled || !$scheduled->course) {
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

            // Calculate next lesson for smart resume
            $nextLessonId = null;
            if ($course->modules) {
                foreach ($course->modules as $mod) {
                    if ($mod->lessons) {
                        foreach ($mod->lessons as $lesson) {
                            if (!in_array($lesson->id, $completedLessonIds)) {
                                $nextLessonId = $lesson->id;
                                break 2; // Exit both loops
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

            return [
                'enrollment_id' => $enrollment->id,
                'status' => $enrollment->aceptado, // 'si' or 'no'
                'scheduled_id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'course_id' => $course->id,
                'title' => $course->title,
                'category' => $scheduled->category ? $scheduled->category->name : 'General',
                'category_slug' => $scheduled->category ? strtolower($scheduled->category->name) : 'general',
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
     * Register a strike for suspicious activity (anti-cheat).
     */
    public function registerStrike(Request $request)
    {
        $user = $request->user();
        
        $reason = $request->input('reason', 'Actividad sospechosa');
        
        // Increment strike count
        $currentStrikes = (int)($user->strikes ?? 0);
        $newStrikes = $currentStrikes + 1;
        
        $user->strikes = $newStrikes;
        
        if ($newStrikes >= 3) {
            $user->is_blocked = 1;
        }
        
        $user->save();

        // Save history
        \App\Models\UserStrikeHistory::create([
            'user_id' => $user->id,
            'action' => 'Infracción Anti-Cheat',
            'details' => $reason
        ]);
        
        // Log the strike
        \Illuminate\Support\Facades\Log::warning("Strike registrado para usuario {$user->id} ({$user->email}). Total: {$newStrikes}. Motivo: {$reason}");

        if ($user->is_blocked === 1 || $user->is_blocked === true || $user->is_blocked === 'si') {
            return response()->json([
                'success' => true, 
                'blocked' => true,
                'strikes' => $newStrikes,
                'redirect' => route('alumno.blocked'),
                'message' => 'Cuenta bloqueada por exceder límite de strikes.'
            ]);
        }

        return response()->json([
            'success' => true,
            'blocked' => false,
            'strikes' => $newStrikes
        ]);
    }

    public function blocked()
    {
        $user = Auth::user();
        if ($user->is_blocked !== 1 && $user->is_blocked !== true && $user->is_blocked !== 'si') {
            return redirect()->route('alumno.dashboard');
        }

        $strikesHistory = \App\Models\UserStrikeHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('User/Blocked', [
            'strikesHistory' => $strikesHistory
        ]);
    }

    public function checkStatus()
    {
        $user = Auth::user();
        return response()->json([
            'is_blocked' => $user->is_blocked === 1 || $user->is_blocked === true || $user->is_blocked === 'si',
            'strikes' => (int)($user->strikes ?? 0)
        ]);
    }
}
