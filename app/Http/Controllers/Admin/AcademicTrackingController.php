<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\LessonUnlock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AcademicTrackingController extends Controller
{
    /**
     * Display student homework submissions for a cohort
     * Legacy URL: GET /admin/curso/homework-tracking/{curso_programado_id}/{user_id}
     */
    public function homework($curso_programado_id, $user_id)
    {
        $cohort = ScheduledCourse::with('course')->findOrFail($curso_programado_id);
        $student = User::findOrFail($user_id);

        $modules = Module::with(['lessons'])
            ->where('curso_id', $cohort->curso_id)
            ->where('activo', 'si')
            ->orderBy('posicion', 'asc')
            ->get()
            ->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'title' => $mod->title,
                    'lessons' => $mod->lessons ? $mod->lessons->where('activo', 'si')->map(function ($l) {
                        return [
                            'id' => $l->id,
                            'title' => $l->title,
                        ];
                    })->values() : [],
                ];
            });

        // Tareas entregadas por el alumno
        $homeworks = DB::table('homework')
            ->where('user_id', $user_id)
            ->get()
            ->keyBy('leccion_id');

        // Desbloqueos manuales
        $unlocks = LessonUnlock::where('user_id', $user_id)
            ->where('curso_programado_id', $curso_programado_id)
            ->get()
            ->keyBy('leccion_id');

        return Inertia::render('Admin/Tracking/HomeworkTracking', [
            'cohort' => [
                'id' => $cohort->id,
                'internal_id' => $cohort->identificador,
                'course_title' => $cohort->course ? $cohort->course->title : 'Curso',
            ],
            'student' => [
                'id' => $student->id,
                'name' => $student->name ?? $student->email,
                'email' => $student->email,
            ],
            'modules' => $modules,
            'homeworks' => $homeworks,
            'unlocks' => $unlocks,
        ]);
    }

    /**
     * Display student course progress and lessons completion
     * Legacy URL: GET /admin/curso/progress/{curso_programado_id}/{user_id}
     */
    public function progress($curso_programado_id, $user_id)
    {
        $cohort = ScheduledCourse::with('course')->findOrFail($curso_programado_id);
        $student = User::findOrFail($user_id);

        $enrollment = Enrollment::where('user_id', $user_id)
            ->where('curso_programado_id', $curso_programado_id)
            ->first();

        // Lecciones completadas por el alumno en esta cohorte
        $completedLessons = DB::table('leccion_user')
            ->where('user_id', $user_id)
            ->where('curso_programado_id', $curso_programado_id)
            ->pluck('leccion_id')
            ->toArray();

        // Exámenes presentados en esta inscripción
        $exams = $enrollment ? Exam::where('inscripcion_id', $enrollment->id)->get()->keyBy('prueba_id')->map(function($e) {
            return [
                'id' => $e->id,
                'calificacion' => $e->score,
                'finalizado' => $e->status,
                'feedback_enabled' => $e->feedback_enabled,
            ];
        }) : collect([]);

        // Tareas entregadas
        $homeworks = DB::table('homework')
            ->where('user_id', $user_id)
            ->get()
            ->keyBy('leccion_id');

        // Desbloqueos de lecciones
        $unlocks = LessonUnlock::where('user_id', $user_id)
            ->where('curso_programado_id', $curso_programado_id)
            ->get()
            ->keyBy('leccion_id')
            ->map(function ($u) {
                return [
                    'until_date' => $u->until_date ? $u->until_date->format('d/m/Y H:i') : null,
                ];
            });

        // Árbol de módulos y lecciones
        $modules = Module::with(['lessons.quizzes', 'quizzes'])
            ->where('curso_id', $cohort->curso_id)
            ->where('activo', 'si')
            ->orderBy('posicion', 'asc')
            ->get()
            ->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'title' => $mod->title,
                    'quizzes' => $mod->quizzes ? $mod->quizzes->map(fn($q) => ['id' => $q->id, 'title' => $q->title]) : [],
                    'lessons' => $mod->lessons ? $mod->lessons->where('activo', 'si')->map(function ($l) {
                        return [
                            'id' => $l->id,
                            'title' => $l->title,
                            'quizzes' => $l->quizzes ? $l->quizzes->map(fn($q) => ['id' => $q->id, 'title' => $q->title]) : [],
                        ];
                    })->values() : [],
                ];
            });

        return Inertia::render('Admin/Tracking/StudentProgress', [
            'cohort' => [
                'id' => $cohort->id,
                'internal_id' => $cohort->identificador,
                'course_title' => $cohort->course ? $cohort->course->title : 'Curso',
            ],
            'student' => [
                'id' => $student->id,
                'name' => $student->name ?? $student->email,
                'email' => $student->email,
            ],
            'enrollmentId' => $enrollment ? $enrollment->id : null,
            'modules' => $modules,
            'completedLessons' => $completedLessons,
            'homeworks' => $homeworks,
            'exams' => $exams,
            'unlocks' => $unlocks,
        ]);
    }

    /**
     * Manually toggle or set deadline for lesson unlock
     * Legacy URL: POST /admin/curso/lesson/unlock
     */
    public function toggleLessonUnlock(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'curso_programado_id' => 'required|exists:cursos_programados,id',
            'leccion_id' => 'required|exists:lecciones,id',
        ]);

        $userId = $request->user_id;
        $cohortId = $request->curso_programado_id;
        $lessonId = $request->leccion_id;
        $untilDate = $request->until_date;

        $unlock = LessonUnlock::where('user_id', $userId)
            ->where('curso_programado_id', $cohortId)
            ->where('leccion_id', $lessonId)
            ->first();

        if ($unlock) {
            if ($request->action === 'lock') {
                $unlock->delete();
                return response()->json(['status' => 'locked']);
            }
            $unlock->until_date = $untilDate ? \Carbon\Carbon::parse(str_replace('/', '-', $untilDate)) : null;
            $unlock->save();
            return response()->json(['status' => 'unlocked', 'deadline' => $unlock->until_date ? $unlock->until_date->format('d/m/Y') : null]);
        } else {
            if ($request->action === 'lock') {
                return response()->json(['status' => 'locked']);
            }
            $unlock = new LessonUnlock();
            $unlock->user_id = $userId;
            $unlock->curso_programado_id = $cohortId;
            $unlock->leccion_id = $lessonId;
            $unlock->until_date = $untilDate ? \Carbon\Carbon::parse(str_replace('/', '-', $untilDate)) : null;
            $unlock->save();
            return response()->json(['status' => 'unlocked', 'deadline' => $unlock->until_date ? $unlock->until_date->format('d/m/Y') : null]);
        }
    }
}
