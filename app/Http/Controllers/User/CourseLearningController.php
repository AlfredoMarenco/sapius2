<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class CourseLearningController extends Controller
{
    /**
     * Display detailed course information with modules and schedule for enrolled students.
     */
    public function cursoDetallado(Request $request, $id = null)
    {
        $cursoProgramadoId = $id ?: $request->curso_programado_id;

        if (!$cursoProgramadoId) {
            return redirect()->route('alumno.home')->with('error', 'Curso no especificado.');
        }

        $user = Auth::user();

        // Check enrollment
        $inscripcion = Enrollment::where('curso_programado_id', $cursoProgramadoId)
            ->where('user_id', $user->id)
            ->first();

        if (!$inscripcion) {
            return redirect()->route('alumno.home')->with('error', 'No estás inscrito en este curso.');
        }

        $scheduled = ScheduledCourse::with([
            'category',
            'course.modules' => function ($q) {
                $q->where('activo', 'si')
                  ->with(['lessons' => function ($c) {
                      $c->where('activo', 'si');
                  }]);
            },
            'instructor'
        ])->find($cursoProgramadoId);

        if (!$scheduled || !$scheduled->course) {
            return redirect()->route('alumno.home')->with('error', 'Curso no encontrado.');
        }

        $course = $scheduled->course;

        // Fetch completed lessons
        $completedLessonIds = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $cursoProgramadoId)
            ->pluck('leccion_id')
            ->toArray();

        // Calculate progress
        $totalClases = 0;
        $modulesData = [];

        foreach ($course->modules as $modulo) {
            $clasesCount = $modulo->lessons ? $modulo->lessons->count() : 0;
            $totalClases += $clasesCount;

            $modCompletedCount = 0;
            if ($modulo->lessons) {
                foreach ($modulo->lessons as $clase) {
                    if (in_array($clase->id, $completedLessonIds)) {
                        $modCompletedCount++;
                    }
                }
            }

            $modProgress = $clasesCount > 0 ? round(($modCompletedCount / $clasesCount) * 100) : 0;

            $modulesData[] = [
                'id' => $modulo->id,
                'title' => $modulo->title,
                'description' => $modulo->description,
                'total_lessons' => $clasesCount,
                'completed_lessons' => $modCompletedCount,
                'progress' => $modProgress,
                'is_available' => true,
                'lessons' => $modulo->lessons ? $modulo->lessons->map(function ($l) use ($completedLessonIds) {
                    return [
                        'id' => $l->id,
                        'title' => $l->title,
                        'is_completed' => in_array($l->id, $completedLessonIds),
                    ];
                }) : [],
            ];
        }

        $globalProgress = $totalClases > 0 ? round((count($completedLessonIds) / $totalClases) * 100) : 0;

        return Inertia::render('User/Courses/Detail', [
            'scheduled' => [
                'id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'title' => $course->title,
                'description' => $course->description,
                'category' => $scheduled->category ? $scheduled->category->name : 'General',
                'image' => $course->image,
                'instructor' => $scheduled->instructor ? $scheduled->instructor->name : 'Sapius Team',
                'start_date' => $scheduled->fecha_inicio,
                'end_date' => $scheduled->fecha_fin,
            ],
            'enrollment' => [
                'id' => $inscripcion->id,
                'status' => $inscripcion->aceptado,
            ],
            'modules' => $modulesData,
            'completedLessonIds' => $completedLessonIds,
            'globalProgress' => $globalProgress,
        ]);
    }

    /**
     * Display a specific lesson/module details with medias, interactive materials, and tests.
     */
    public function leccionDetallada(Request $request, $leccionId = null, $cursoId = null)
    {
        $leccion_id = $leccionId ?: $request->leccion_id;
        $curso_programado_id = $cursoId ?: $request->curso_programado_id;

        if (!$leccion_id || !$curso_programado_id) {
            return redirect()->route('alumno.home')->with('error', 'Parámetros incompletos.');
        }

        $user = Auth::user();

        // Verify enrollment
        $inscripcion = Enrollment::where('curso_programado_id', $curso_programado_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$inscripcion) {
            return redirect()->route('alumno.home')->with('error', 'No estás inscrito en este curso.');
        }

        // Fetch lesson with media, quiz, materials
        $leccion = Lesson::with([
            'quizzes' => function ($q) {
                $q->where('activo', 'si')->with('questions.answers');
            },
            'media' => function ($q) {
                $q->where('activo', 'si');
            },
            'homeworks' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            },
            'interactivePdfs'
        ])->find($leccion_id);

        if (!$leccion) {
            return redirect()->back()->with('error', 'Lección no encontrada.');
        }

        $scheduled = ScheduledCourse::with(['course.modules.lessons', 'category'])->find($curso_programado_id);

        $completedLessonIds = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $curso_programado_id)
            ->pluck('leccion_id')
            ->toArray();

        $isCompleted = in_array($leccion->id, $completedLessonIds);

        return Inertia::render('User/Courses/Lesson', [
            'lesson' => [
                'id' => $leccion->id,
                'parent_id' => $leccion->leccion_id,
                'title' => $leccion->title,
                'description' => $leccion->content,
                'summary' => $leccion->summary,
                'is_completed' => $isCompleted,
                'media' => $leccion->media,
                'quizzes' => $leccion->quizzes,
                'homework' => $leccion->homeworks ? $leccion->homeworks->first() : null,
                'interactive_pdfs' => $leccion->interactivePdfs,
                'has_homework_feature' => ($scheduled->category && $scheduled->category->name !== 'Guias'),
            ],
            'scheduled' => [
                'id' => $scheduled->id,
                'title' => $scheduled->course->title,
            ],
            'modules' => $scheduled->course->modules->map(function ($m) use ($completedLessonIds) {
                return [
                    'id' => $m->id,
                    'title' => $m->title,
                    'lessons' => $m->lessons ? $m->lessons->map(function ($l) use ($completedLessonIds) {
                        return [
                            'id' => $l->id,
                            'title' => $l->title,
                            'is_completed' => in_array($l->id, $completedLessonIds),
                        ];
                    }) : [],
                ];
            }),
        ]);
    }

    /**
     * Toggle lesson completion for the authenticated student.
     */
    public function toggleLessonCompletion(Request $request)
    {
        $request->validate([
            'leccion_id' => 'required|integer',
            'curso_programado_id' => 'required|integer',
        ]);

        $user = Auth::user();
        $leccionId = $request->leccion_id;
        $cursoProgramadoId = $request->curso_programado_id;

        $existing = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('leccion_id', $leccionId)
            ->where('curso_programado_id', $cursoProgramadoId)
            ->first();

        if ($existing) {
            DB::table('leccion_user')
                ->where('id', $existing->id)
                ->delete();
            $completed = false;
        } else {
            DB::table('leccion_user')->insert([
                'user_id' => $user->id,
                'leccion_id' => $leccionId,
                'curso_programado_id' => $cursoProgramadoId,
                'completed_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            $completed = true;
        }

        return response()->json([
            'success' => true,
            'completed' => $completed,
        ]);
    }

    /**
     * Stream media with fallback to production server if not found locally.
     */
    public function streamMedia($filename)
    {
        $videosDir = storage_path('app/uploads/');
        $filePath = $videosDir . "/" . $filename;

        // Fallback 1: Directorio public local
        if (!file_exists($filePath)) {
            $videosDir = storage_path('app/public/');
            $filePath = $videosDir . "/" . $filename;
        }

        // Fallback 2: Si no existe en el disco local, redirigir al de producción
        if (!file_exists($filePath)) {
            return redirect("https://sapius.com.mx/storage/" . $filename);
        }

        if (file_exists($filePath)) {
            // Liberar la sesión antes de redireccionar o servir el archivo
            if (session_id()) {
                session_write_close();
            }
            if (function_exists('session') && session()->isStarted()) {
                session()->save();
            }
            
            $realPath = realpath($filePath);
            $mimeType = mime_content_type($realPath) ?: 'application/octet-stream';

            return response()->file($realPath, [
                'Content-Type' => $mimeType
            ]);
        }

        return response("File doesn't exists", 404);
    }
}
