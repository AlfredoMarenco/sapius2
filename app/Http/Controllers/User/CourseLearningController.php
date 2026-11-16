<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Cursos\Leccion;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\FileGuia;
use App\Models\Homework;
use App\Models\InteractivePdf;
use App\Models\Lesson;
use App\Models\LessonUnlock;
use App\Models\Media;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\ScheduledCourse;
use App\Services\CourseCategoryService;
use App\Services\EnrollmentAccessService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CourseLearningController extends Controller
{
    public function __construct(
        protected EnrollmentAccessService $accessService
    ) {}

    /**
     * Display detailed course information with modules and schedule for enrolled students.
     */
    public function cursoDetallado(Request $request, $id = null)
    {
        $cursoProgramadoId = $id ?: $request->curso_programado_id;

        if (! $cursoProgramadoId) {
            return redirect()->route('alumno.home')->with('error', 'Curso no especificado.');
        }

        $user = Auth::user();
        $inscripcion = $this->accessService->requireActiveEnrollment($user, (int) $cursoProgramadoId);

        $scheduled = ScheduledCourse::with([
            'category',
            'course.modules' => function ($q) {
                $q->where('activo', 'si')
                    ->with([
                        'lessons' => fn ($c) => $c->where('activo', 'si')->orderBy('posicion', 'asc')->orderBy('id', 'asc'),
                        'quizzes' => fn ($qz) => $qz->where('activo', 'si'),
                        'media' => fn ($m) => $m->where('activo', 'si'),
                    ]);
            },
            'instructor',
        ])->find($cursoProgramadoId);

        if (! $scheduled || ! $scheduled->course) {
            return redirect()->route('alumno.home')->with('error', 'Curso no encontrado.');
        }

        $course = $scheduled->course;
        $categoryName = $scheduled->category?->name
            ?? CourseCategoryService::getCategoryForCourse($course->id)?->name
            ?? 'General';
        $isGuia = $this->isGuiaCategory($categoryName);

        $fileGuia = null;
        if ($isGuia) {
            $fileGuia = FileGuia::where('curso_programado_id', $scheduled->id)->first();
        }

        $completedLessonIds = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $cursoProgramadoId)
            ->pluck('leccion_id')
            ->toArray();

        $moduleIds = $course->modules->pluck('id')->all();
        $moduleIdsWithPdfs = ! empty($moduleIds)
            ? InteractivePdf::whereIn('leccion_id', $moduleIds)->pluck('leccion_id')->flip()
            : collect();

        $totalClases = 0;
        $modulesUnsorted = [];

        foreach ($course->modules as $modulo) {
            $childLessons = $modulo->lessons ?? collect();
            $childLessonIds = $childLessons->pluck('id');

            $modSchedule = $this->accessService->evaluateSchedule(
                (int) $scheduled->id,
                (int) $user->id,
                (int) $modulo->id,
                null,
                $childLessonIds
            );

            $lessonsUnsorted = [];
            $modCompletedCount = 0;

            foreach ($childLessons as $clase) {
                $lessonSchedule = $this->accessService->evaluateSchedule(
                    (int) $scheduled->id,
                    (int) $user->id,
                    (int) $clase->id,
                    (int) $modulo->id
                );

                $isCompleted = in_array($clase->id, $completedLessonIds);
                if ($isCompleted) {
                    $modCompletedCount++;
                }

                $lessonsUnsorted[] = [
                    'id' => $clase->id,
                    'title' => $clase->title,
                    'is_completed' => $isCompleted,
                    'is_available' => (bool) ($lessonSchedule['is_available'] ?? true),
                    'is_late' => (bool) ($lessonSchedule['is_late'] ?? false),
                    'opens_at' => $lessonSchedule['opens_at']?->format('d/m/Y H:i'),
                    'closes_at' => $lessonSchedule['closes_at']?->format('d/m/Y H:i'),
                    'order' => $lessonSchedule['order'] ?? (int) ($clase->posicion ?? $clase->id),
                    '_fallback_pos' => (int) ($clase->posicion ?? $clase->id),
                ];
            }

            usort($lessonsUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
            $lessonsList = array_map(function ($item) {
                unset($item['_fallback_pos']);

                return $item;
            }, $lessonsUnsorted);

            $hasDirectContent = ($modulo->quizzes && $modulo->quizzes->isNotEmpty())
                || ($modulo->media && $modulo->media->isNotEmpty())
                || $moduleIdsWithPdfs->has($modulo->id)
                || ! empty(trim((string) ($modulo->contenido ?? '')));

            $clasesCount = count($lessonsList);
            if ($clasesCount > 0) {
                $totalClases += $clasesCount;
                $modProgress = (int) round(($modCompletedCount / $clasesCount) * 100);
            } elseif ($hasDirectContent) {
                $totalClases += 1;
                $isModDone = in_array($modulo->id, $completedLessonIds);
                $modCompletedCount = $isModDone ? 1 : 0;
                $modProgress = $isModDone ? 100 : 0;
            } else {
                $modProgress = 0;
            }

            $modulesUnsorted[] = [
                'id' => $modulo->id,
                'title' => $modulo->title,
                'description' => $modulo->description,
                'total_lessons' => $clasesCount,
                'completed_lessons' => $modCompletedCount,
                'progress' => $modProgress,
                'is_available' => (bool) ($modSchedule['is_available'] ?? true),
                'opens_at' => $modSchedule['opens_at']?->format('d/m/Y H:i'),
                'closes_at' => $modSchedule['closes_at']?->format('d/m/Y H:i'),
                'has_direct_content' => $hasDirectContent,
                'is_completed' => in_array($modulo->id, $completedLessonIds),
                'order' => $modSchedule['order'] ?? (int) ($modulo->posicion ?? $modulo->id),
                '_fallback_pos' => (int) ($modulo->posicion ?? $modulo->id),
                'lessons' => $lessonsList,
            ];
        }

        usort($modulesUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
        $modulesData = array_map(function ($item) {
            unset($item['_fallback_pos']);

            return $item;
        }, $modulesUnsorted);

        $globalProgress = $totalClases > 0 ? min(100, (int) round((count($completedLessonIds) / $totalClases) * 100)) : 0;

        return Inertia::render('User/Courses/Detail', [
            'scheduled' => [
                'id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'title' => $course->title,
                'description' => $course->description,
                'category' => $categoryName,
                'image' => $course->image,
                'instructor' => $scheduled->instructor ? $scheduled->instructor->name : 'Sapius Team',
                'start_date' => $scheduled->fecha_inicio ? Carbon::parse($scheduled->fecha_inicio)->format('d/m/Y') : null,
                'end_date' => $scheduled->fecha_fin ? Carbon::parse($scheduled->fecha_fin)->format('d/m/Y') : null,
            ],
            'enrollment' => [
                'id' => $inscripcion->id,
                'status' => $inscripcion->aceptado,
            ],
            'is_guia' => $isGuia,
            'guia' => $fileGuia ? [
                'id' => $fileGuia->id,
                'url' => $fileGuia->url,
                'viewer_url' => "/alumno/curso/{$scheduled->id}/guia",
            ] : null,
            'modules' => $modulesData,
            'completedLessonIds' => $completedLessonIds,
            'globalProgress' => $globalProgress,
        ]);
    }

    /**
     * Display a specific lesson/module details with medias, interactive materials, and quiz metadata.
     */
    public function leccionDetallada(Request $request, $leccionId = null, $cursoId = null)
    {
        $leccion_id = $leccionId ?: $request->leccion_id;
        $curso_programado_id = $cursoId ?: $request->curso_programado_id;

        if (! $leccion_id || ! $curso_programado_id) {
            return redirect()->route('alumno.home')->with('error', 'Parámetros incompletos.');
        }

        $user = Auth::user();
        $access = $this->accessService->requireLessonInCohort($user, (int) $leccion_id, (int) $curso_programado_id);

        $inscripcion = $access['enrollment'];
        $scheduled = $access['scheduled'];
        $leccion = $access['lesson'];

        $isModule = empty($leccion->leccion_id) || (int) $leccion->leccion_id === 0;
        $childIds = $isModule
            ? Lesson::where('leccion_id', $leccion->id)->where('activo', 'si')->pluck('id')
            : null;

        $lessonSchedule = $this->accessService->evaluateSchedule(
            (int) $scheduled->id,
            (int) $user->id,
            (int) $leccion->id,
            $isModule ? null : (int) $leccion->leccion_id,
            $childIds
        );

        if (! ($lessonSchedule['is_available'] ?? true)) {
            abort(403, 'Esta lección no se encuentra disponible según el calendario programado.');
        }

        // Cargar SOLO metadatos de quizzes + questions_count (sin preguntas ni respuestas)
        $leccion->load([
            'quizzes' => function ($q) {
                $q->where('activo', 'si')
                    ->withCount(['questions' => fn ($qq) => $qq->where('activo', 'si')]);
            },
            'media' => function ($q) {
                $q->where('activo', 'si')
                    ->orderBy('posicion', 'asc')
                    ->orderBy('id', 'asc');
            },
            'homeworks' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            },
            'interactivePdfs',
        ]);

        $scheduled->load([
            'category',
            'course.modules' => function ($q) {
                $q->where('activo', 'si')
                    ->with([
                        'lessons' => fn ($c) => $c->where('activo', 'si')->orderBy('posicion', 'asc')->orderBy('id', 'asc'),
                        'quizzes' => fn ($qz) => $qz->where('activo', 'si'),
                        'media' => fn ($m) => $m->where('activo', 'si'),
                    ]);
            },
        ]);

        $categoryName = $scheduled->category?->name
            ?? CourseCategoryService::getCategoryForCourse($scheduled->curso_id)?->name
            ?? 'General';
        $isGuia = $this->isGuiaCategory($categoryName);

        $completedLessonIds = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $curso_programado_id)
            ->pluck('leccion_id')
            ->toArray();

        $isCompleted = in_array($leccion->id, $completedLessonIds);

        $safeQuizzes = $leccion->quizzes->map(function (Quiz $quiz) {
            return [
                'id' => $quiz->id,
                'title' => $quiz->titulo ?? $quiz->title,
                'description' => $quiz->descripcion ?? $quiz->description,
                'type' => $quiz->tipo ?? $quiz->type,
                'time_limit' => $quiz->tiempo ?? $quiz->time_limit,
                'attempts_allowed' => (int) ($quiz->oportunidades ?? $quiz->attempts_allowed ?? 1),
                'questions_count' => (int) ($quiz->questions_count ?? 0),
            ];
        })->values();

        $moduleIds = $scheduled->course->modules->pluck('id')->all();
        $moduleIdsWithPdfs = ! empty($moduleIds)
            ? InteractivePdf::whereIn('leccion_id', $moduleIds)->pluck('leccion_id')->flip()
            : collect();

        $modulesUnsorted = [];
        foreach ($scheduled->course->modules as $m) {
            $mChildIds = ($m->lessons ?? collect())->pluck('id');
            $mSchedule = $this->accessService->evaluateSchedule(
                (int) $scheduled->id,
                (int) $user->id,
                (int) $m->id,
                null,
                $mChildIds
            );

            $mLessonsUnsorted = [];
            foreach ($m->lessons ?? [] as $l) {
                $lSchedule = $this->accessService->evaluateSchedule(
                    (int) $scheduled->id,
                    (int) $user->id,
                    (int) $l->id,
                    (int) $m->id
                );

                $mLessonsUnsorted[] = [
                    'id' => $l->id,
                    'title' => $l->title,
                    'is_completed' => in_array($l->id, $completedLessonIds),
                    'is_available' => (bool) ($lSchedule['is_available'] ?? true),
                    'order' => $lSchedule['order'] ?? (int) ($l->posicion ?? $l->id),
                    '_fallback_pos' => (int) ($l->posicion ?? $l->id),
                ];
            }

            usort($mLessonsUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
            $mLessons = array_map(function ($item) {
                unset($item['_fallback_pos']);

                return $item;
            }, $mLessonsUnsorted);

            $hasDirectContent = ($m->quizzes && $m->quizzes->isNotEmpty())
                || ($m->media && $m->media->isNotEmpty())
                || $moduleIdsWithPdfs->has($m->id)
                || ! empty(trim((string) ($m->contenido ?? '')));

            $modulesUnsorted[] = [
                'id' => $m->id,
                'title' => $m->title,
                'is_available' => (bool) ($mSchedule['is_available'] ?? true),
                'has_direct_content' => $hasDirectContent,
                'is_completed' => in_array($m->id, $completedLessonIds),
                'order' => $mSchedule['order'] ?? (int) ($m->posicion ?? $m->id),
                '_fallback_pos' => (int) ($m->posicion ?? $m->id),
                'lessons' => $mLessons,
            ];
        }

        usort($modulesUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
        $modules = array_map(function ($item) {
            unset($item['_fallback_pos']);

            return $item;
        }, $modulesUnsorted);

        return Inertia::render('User/Courses/Lesson', [
            'lesson' => [
                'id' => $leccion->id,
                'parent_id' => $leccion->leccion_id,
                'title' => $leccion->title,
                'description' => $leccion->content,
                'summary' => $leccion->summary,
                'archivo_pdf' => $leccion->archivo_pdf ?? null,
                'is_completed' => $isCompleted,
                'is_late' => (bool) ($lessonSchedule['is_late'] ?? false),
                'closes_at' => $lessonSchedule['closes_at']?->format('d/m/Y H:i'),
                'media' => $leccion->media,
                'quizzes' => $safeQuizzes,
                'homework' => $leccion->homeworks ? $leccion->homeworks->first() : null,
                'interactive_pdfs' => $leccion->interactivePdfs,
                'has_homework_feature' => ! $isGuia,
            ],
            'scheduled' => [
                'id' => $scheduled->id,
                'title' => $scheduled->course->title,
                'category' => $categoryName,
            ],
            'enrollment_id' => $inscripcion->id,
            'modules' => $modules,
        ]);
    }

    /**
     * Visor protegido de Guía (categoría Guias / FileGuia).
     */
    public function viewGuia(Request $request, $curso_programado_id)
    {
        $user = Auth::user();
        $inscripcion = $this->accessService->requireActiveEnrollment($user, (int) $curso_programado_id);
        $scheduled = $inscripcion->scheduledCourse;

        $fileGuia = FileGuia::where('curso_programado_id', $curso_programado_id)->first();

        if ($request->boolean('stream')) {
            if (! $fileGuia || ! $fileGuia->url) {
                abort(404, 'Guía no encontrada.');
            }

            $cleanUrl = ltrim(str_replace('\\', '/', (string) $fileGuia->url), '/');
            if ($cleanUrl === '' || str_contains($cleanUrl, '..') || str_contains($cleanUrl, "\0")) {
                abort(404);
            }
            $basename = basename($cleanUrl);

            $allowedRoots = [
                storage_path('app/files/medias'),
                storage_path('app/public/files/medias'),
                storage_path('app/public'),
                storage_path('app/uploads'),
            ];

            $candidates = [
                storage_path('app/files/medias/'.$cleanUrl),
                storage_path('app/files/medias/'.$basename),
                storage_path('app/public/files/medias/'.$cleanUrl),
                storage_path('app/public/files/medias/'.$basename),
                storage_path('app/public/'.$cleanUrl),
                storage_path('app/uploads/'.$cleanUrl),
                storage_path('app/uploads/'.$basename),
            ];

            foreach ($this->getReadOnlyProductionBasePaths() as $prodBase) {
                $allowedRoots[] = $prodBase.'/storage/app/files/medias';
                $allowedRoots[] = $prodBase.'/storage/app/public/files/medias';
                $allowedRoots[] = $prodBase.'/storage/app/public';
                $allowedRoots[] = $prodBase.'/storage/app/uploads';

                $candidates[] = $prodBase.'/storage/app/files/medias/'.$cleanUrl;
                $candidates[] = $prodBase.'/storage/app/files/medias/'.$basename;
                $candidates[] = $prodBase.'/storage/app/public/files/medias/'.$cleanUrl;
                $candidates[] = $prodBase.'/storage/app/public/files/medias/'.$basename;
                $candidates[] = $prodBase.'/storage/app/public/'.$cleanUrl;
                $candidates[] = $prodBase.'/storage/app/uploads/'.$cleanUrl;
                $candidates[] = $prodBase.'/storage/app/uploads/'.$basename;
            }

            $resolved = $this->resolveSafeFile($candidates, $allowedRoots);
            if (! $resolved) {
                abort(404, 'El archivo físico de la guía no fue encontrado.');
            }

            $this->closeSessionForStream();

            return response()->file($resolved, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="guia-sapius.pdf"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
            ]);
        }

        return Inertia::render('User/Courses/GuiaViewer', [
            'scheduled' => [
                'id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'title' => $scheduled->course?->title ?? 'Guía de Estudio',
            ],
            'guia' => $fileGuia ? [
                'id' => $fileGuia->id,
                'url' => $fileGuia->url,
                'stream_url' => "/alumno/curso/{$scheduled->id}/guia?stream=1",
            ] : null,
        ]);
    }

    /**
     * Autoseguimiento de tareas del alumno para una cohorte.
     */
    public function homeworkTracking($curso_programado_id)
    {
        $user = Auth::user();
        $inscripcion = $this->accessService->requireActiveEnrollment($user, (int) $curso_programado_id);

        $scheduled = ScheduledCourse::with(['course.modules' => function ($q) {
            $q->where('activo', 'si')
                ->with(['lessons' => fn ($l) => $l->where('activo', 'si')->orderBy('posicion', 'asc')->orderBy('id', 'asc')]);
        }])->findOrFail($curso_programado_id);

        $homeworks = Homework::where('user_id', $user->id)
            ->get()
            ->keyBy('leccion_id');

        $unlocks = LessonUnlock::where('user_id', $user->id)
            ->where('curso_programado_id', $curso_programado_id)
            ->get()
            ->keyBy('leccion_id');

        $modulesUnsorted = [];
        foreach ($scheduled->course?->modules ?? [] as $mod) {
            $modSchedule = $this->accessService->evaluateSchedule(
                (int) $scheduled->id,
                (int) $user->id,
                (int) $mod->id,
                null,
                ($mod->lessons ?? collect())->pluck('id')
            );

            $lessonsUnsorted = [];
            foreach ($mod->lessons ?? [] as $lesson) {
                $lessonSchedule = $this->accessService->evaluateSchedule(
                    (int) $scheduled->id,
                    (int) $user->id,
                    (int) $lesson->id,
                    (int) $mod->id
                );

                $hw = $homeworks->get($lesson->id);
                $unlock = $unlocks->get($lesson->id);

                $lessonsUnsorted[] = [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'is_available' => (bool) ($lessonSchedule['is_available'] ?? true),
                    'closes_at' => $lessonSchedule['closes_at']?->format('d/m/Y H:i'),
                    'homework' => $hw ? [
                        'id' => $hw->id,
                        'is_late' => (bool) $hw->is_late,
                        'submitted_at' => $hw->created_at?->format('d/m/Y H:i'),
                    ] : null,
                    'is_unlocked' => (bool) $unlock,
                    'unlock_until' => $unlock?->until_date?->format('d/m/Y H:i'),
                    'order' => $lessonSchedule['order'] ?? (int) ($lesson->posicion ?? $lesson->id),
                    '_fallback_pos' => (int) ($lesson->posicion ?? $lesson->id),
                ];
            }

            usort($lessonsUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
            $lessons = array_map(function ($item) {
                unset($item['_fallback_pos']);

                return $item;
            }, $lessonsUnsorted);

            $modulesUnsorted[] = [
                'id' => $mod->id,
                'title' => $mod->title,
                'order' => $modSchedule['order'] ?? (int) ($mod->posicion ?? $mod->id),
                '_fallback_pos' => (int) ($mod->posicion ?? $mod->id),
                'lessons' => $lessons,
            ];
        }

        usort($modulesUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
        $modules = array_map(function ($item) {
            unset($item['_fallback_pos']);

            return $item;
        }, $modulesUnsorted);

        return Inertia::render('User/Courses/HomeworkTracking', [
            'scheduled' => [
                'id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'title' => $scheduled->course?->title ?? 'Curso',
            ],
            'enrollment_id' => $inscripcion->id,
            'modules' => $modules,
        ]);
    }

    /**
     * Autoseguimiento de progreso académico del alumno.
     */
    public function progress($curso_programado_id)
    {
        $user = Auth::user();
        $inscripcion = $this->accessService->requireActiveEnrollment($user, (int) $curso_programado_id);

        $scheduled = ScheduledCourse::with(['course.modules' => function ($q) {
            $q->where('activo', 'si')
                ->with([
                    'quizzes' => fn ($qz) => $qz->where('activo', 'si'),
                    'lessons' => fn ($l) => $l->where('activo', 'si')
                        ->with(['quizzes' => fn ($qz) => $qz->where('activo', 'si')])
                        ->orderBy('posicion', 'asc')
                        ->orderBy('id', 'asc'),
                ]);
        }])->findOrFail($curso_programado_id);

        $completedLessonIds = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $curso_programado_id)
            ->pluck('leccion_id')
            ->toArray();

        $examsByQuiz = Exam::where('inscripcion_id', $inscripcion->id)
            ->orderByDesc('score_total')
            ->orderByDesc('id')
            ->get()
            ->groupBy('prueba_id')
            ->map(function ($group) {
                $bestFinished = $group->where('finalizado', 'si')->sortByDesc(fn ($e) => (float) ($e->score_total ?? 0))->first();
                $target = $bestFinished ?? $group->first();

                return [
                    'id' => $target->id,
                    'score' => (float) ($target->score_total ?? 0),
                    'total_correctas' => (int) ($target->total_correctas ?? 0),
                    'total_preguntas' => (int) ($target->total_preguntas ?? 0),
                    'finalizado' => $target->finalizado ?? 'no',
                ];
            });

        $unlocks = LessonUnlock::where('user_id', $user->id)
            ->where('curso_programado_id', $curso_programado_id)
            ->get()
            ->keyBy('leccion_id');

        $modulesUnsorted = [];
        foreach ($scheduled->course?->modules ?? [] as $mod) {
            $modSchedule = $this->accessService->evaluateSchedule(
                (int) $scheduled->id,
                (int) $user->id,
                (int) $mod->id,
                null,
                ($mod->lessons ?? collect())->pluck('id')
            );

            $lessonsUnsorted = [];
            foreach ($mod->lessons ?? [] as $lesson) {
                $lessonSchedule = $this->accessService->evaluateSchedule(
                    (int) $scheduled->id,
                    (int) $user->id,
                    (int) $lesson->id,
                    (int) $mod->id
                );

                $lessonsUnsorted[] = [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'is_completed' => in_array($lesson->id, $completedLessonIds),
                    'is_available' => (bool) ($lessonSchedule['is_available'] ?? true),
                    'is_unlocked' => $unlocks->has($lesson->id),
                    'quizzes' => ($lesson->quizzes ?? collect())->map(function ($qz) use ($examsByQuiz) {
                        return [
                            'id' => $qz->id,
                            'title' => $qz->titulo ?? $qz->title,
                            'type' => $qz->tipo ?? $qz->type,
                            'exam' => $examsByQuiz->get($qz->id),
                        ];
                    })->values()->all(),
                    'order' => $lessonSchedule['order'] ?? (int) ($lesson->posicion ?? $lesson->id),
                    '_fallback_pos' => (int) ($lesson->posicion ?? $lesson->id),
                ];
            }

            usort($lessonsUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
            $lessons = array_map(function ($item) {
                unset($item['_fallback_pos']);

                return $item;
            }, $lessonsUnsorted);

            $modulesUnsorted[] = [
                'id' => $mod->id,
                'title' => $mod->title,
                'is_available' => (bool) ($modSchedule['is_available'] ?? true),
                'quizzes' => ($mod->quizzes ?? collect())->map(function ($qz) use ($examsByQuiz) {
                    return [
                        'id' => $qz->id,
                        'title' => $qz->titulo ?? $qz->title,
                        'type' => $qz->tipo ?? $qz->type,
                        'exam' => $examsByQuiz->get($qz->id),
                    ];
                })->values()->all(),
                'lessons' => $lessons,
                'order' => $modSchedule['order'] ?? (int) ($mod->posicion ?? $mod->id),
                '_fallback_pos' => (int) ($mod->posicion ?? $mod->id),
            ];
        }

        usort($modulesUnsorted, fn ($a, $b) => [$a['order'], $a['_fallback_pos'], $a['id']] <=> [$b['order'], $b['_fallback_pos'], $b['id']]);
        $modules = array_map(function ($item) {
            unset($item['_fallback_pos']);

            return $item;
        }, $modulesUnsorted);

        return Inertia::render('User/Courses/Progress', [
            'scheduled' => [
                'id' => $scheduled->id,
                'identifier' => $scheduled->identificador,
                'title' => $scheduled->course?->title ?? 'Curso',
            ],
            'enrollment_id' => $inscripcion->id,
            'modules' => $modules,
            'completedLessons' => $completedLessonIds,
        ]);
    }

    /**
     * Resultados de evaluaciones para el alumno autenticado.
     */
    public function resultadosEvaluaciones($inscripcion_id)
    {
        $user = Auth::user();
        $inscripcion = Enrollment::with(['scheduledCourse.course'])->findOrFail($inscripcion_id);

        if ((int) $inscripcion->user_id !== (int) $user->id || $inscripcion->aceptado !== 'si') {
            abort(403, 'No tienes autorización para consultar estos resultados.');
        }

        $cohort = $inscripcion->scheduledCourse;
        $course = $cohort?->course;

        $exams = Exam::with('quiz')
            ->where('inscripcion_id', $inscripcion->id)
            ->orderByDesc('id')
            ->get();

        $activeQuizzes = $course
            ? Quiz::where('curso_id', $course->id)->where('activo', 'si')->orderBy('id', 'asc')->get()
            : collect();

        $presentedQuizIds = $exams->pluck('prueba_id')->unique()->flip();

        $mappedExams = $exams->map(function (Exam $ex) {
            $quizType = strtoupper((string) ($ex->quiz?->tipo ?? $ex->quiz?->type ?? 'EXANI'));
            $isEnarm = str_contains($quizType, 'ENARM');
            $minScore = $isEnarm
                ? (float) ($ex->quiz?->min_score ?? 60)
                : (($ex->quiz && isset($ex->quiz->min_score) && (float) $ex->quiz->min_score >= 700) ? (float) $ex->quiz->min_score : 1000.0);
            $maxScore = $isEnarm
                ? (float) ($ex->quiz?->score ?? 100)
                : (($ex->quiz && isset($ex->quiz->score) && (float) $ex->quiz->score >= 700) ? (float) $ex->quiz->score : 1300.0);

            $feedbackAvailable = $ex->finalizado === 'si' && $ex->retro_visualizado !== 'si';
            if ($feedbackAvailable && $ex->quiz) {
                $caducidadRaw = $ex->quiz->tiempo_caducidad ?? $ex->quiz->tiempo_vigencia;
                if ($caducidadRaw) {
                    $caducidadStr = trim((string) $caducidadRaw);
                    if (preg_match('/^\d{4}-\d{2}-\d{2}/', $caducidadStr)) {
                        try {
                            if (now()->gt(Carbon::parse($caducidadStr))) {
                                $feedbackAvailable = false;
                            }
                        } catch (\Throwable $e) {
                            //
                        }
                    } elseif (str_contains($caducidadStr, ':')) {
                        $parts = explode(':', $caducidadStr);
                        $secs = count($parts) === 3
                            ? (((int) $parts[0] * 3600) + ((int) $parts[1] * 60) + (int) $parts[2])
                            : (((int) $parts[0] * 3600) + ((int) $parts[1] * 60));
                        if ($secs > 0 && Carbon::parse($ex->updated_at ?? $ex->created_at)->addSeconds($secs)->lt(now())) {
                            $feedbackAvailable = false;
                        }
                    } elseif (is_numeric($caducidadStr) && (int) $caducidadStr > 0) {
                        $secs = (int) $caducidadStr * 60;
                        if (Carbon::parse($ex->updated_at ?? $ex->created_at)->addSeconds($secs)->lt(now())) {
                            $feedbackAvailable = false;
                        }
                    }
                }
            }

            return [
                'id' => $ex->id,
                'quiz_id' => $ex->prueba_id,
                'quiz_title' => $ex->quiz?->titulo ?? $ex->quiz?->title ?? 'Evaluación',
                'quiz_type' => $quizType,
                'score' => (float) ($ex->score_total ?? 0),
                'min_score' => $minScore,
                'max_score' => $maxScore,
                'total_correctas' => (int) ($ex->total_correctas ?? 0),
                'total_preguntas' => (int) ($ex->total_preguntas ?? 0),
                'finalizado' => $ex->finalizado ?? 'no',
                'retro_visualizado' => $ex->retro_visualizado ?? 'no',
                'feedback_available' => $feedbackAvailable,
                'is_late' => (bool) ($ex->is_late ?? false),
                'created_at' => $ex->created_at?->format('d/m/Y H:i'),
                'updated_at' => $ex->updated_at?->format('d/m/Y H:i'),
            ];
        })->values();

        $pendingQuizzes = $activeQuizzes
            ->filter(fn (Quiz $qz) => ! $presentedQuizIds->has($qz->id))
            ->map(fn (Quiz $qz) => [
                'id' => $qz->id,
                'title' => $qz->titulo ?? $qz->title,
                'type' => $qz->tipo ?? $qz->type,
            ])
            ->values();

        return Inertia::render('User/Courses/Results', [
            'enrollment' => [
                'id' => $inscripcion->id,
                'cohort_id' => $cohort?->id,
                'cohort_identifier' => $cohort?->identificador ?? '',
                'course_title' => $course?->title ?? 'Curso',
            ],
            'exams' => $mappedExams,
            'pendingQuizzes' => $pendingQuizzes,
        ]);
    }

    /**
     * Descarga el reporte oficial PDF de calificaciones del alumno autenticado.
     */
    public function exportCalificaciones($inscripcion_id)
    {
        $user = Auth::user();
        $inscripcion = Enrollment::with(['user', 'scheduledCourse.course', 'exams.quiz'])->findOrFail($inscripcion_id);

        if ((int) $inscripcion->user_id !== (int) $user->id || $inscripcion->aceptado !== 'si') {
            abort(403, 'No tienes autorización para descargar este reporte.');
        }

        $cohort = $inscripcion->scheduledCourse;

        $lecciones = Leccion::with(['pruebas' => fn ($q) => $q->where('activo', 'si')])
            ->where('curso_id', $cohort ? $cohort->curso_id : 0)
            ->where('activo', 'si')
            ->get();

        $exams = $inscripcion->exams ?? collect();

        $studentName = $user->nombre_completo ?: ($user->name ?? $user->email ?? 'Alumno');
        $cleanName = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $studentName);

        $pdf = Pdf::loadView('alumno.exportresultados', [
            'examenes' => $exams,
            'lecciones' => $lecciones,
            'inscripcion' => $inscripcion,
        ]);

        return $pdf->download("Calificaciones_{$cleanName}_{$inscripcion_id}.pdf");
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
        $leccionId = (int) $request->leccion_id;
        $cursoProgramadoId = (int) $request->curso_programado_id;

        $this->accessService->requireLessonInCohort($user, $leccionId, $cursoProgramadoId);

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
     * Rutas base del sitio de producción en el mismo servidor (solo lectura).
     *
     * @return array<int, string>
     */
    protected function getReadOnlyProductionBasePaths(): array
    {
        $candidates = [
            '/home/wwsapi/public_html',
            '/home/wwsapi/sapius',
            base_path('../Sapius'),
            base_path('../public_html'),
        ];

        return array_values(array_filter($candidates, fn (string $dir) => is_dir($dir)));
    }

    /**
     * Stream público restringido EXCLUSIVAMENTE a imágenes de catálogo/landing permitidas.
     */
    public function publicMediaStream($filename)
    {
        $cleanFilename = ltrim(str_replace('\\', '/', (string) $filename), '/');
        if ($cleanFilename === '' || str_contains($cleanFilename, '..') || str_contains($cleanFilename, "\0")) {
            abort(404);
        }

        $strippedFilename = ltrim((string) preg_replace('#^(?:public/)?storage/+#i', '', $cleanFilename), '/');
        if ($strippedFilename === '') {
            $strippedFilename = $cleanFilename;
        }

        $ext = strtolower(pathinfo($strippedFilename, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (! in_array($ext, $allowedExtensions, true)) {
            abort(403, 'Archivo no permitido en ruta pública.');
        }

        $basename = basename($strippedFilename);

        $allowedRoots = [
            storage_path('app/public'),
            storage_path('app/public/courses'),
            storage_path('app/public/slider-index'),
            storage_path('app/public/prides'),
            storage_path('app/public/teachers'),
            storage_path('app/public/simuladores'),
            storage_path('app/public/guias'),
            storage_path('app/public/calendars'),
            storage_path('app/images'),
            storage_path('app/images/cursos'),
            storage_path('app/images/slides'),
            storage_path('app/images/prides'),
            storage_path('app/images/teachers'),
        ];

        $candidatePaths = [
            storage_path('app/public/'.$cleanFilename),
            storage_path('app/public/'.$strippedFilename),
            storage_path('app/images/'.$cleanFilename),
            storage_path('app/images/'.$strippedFilename),
        ];

        foreach ($this->getReadOnlyProductionBasePaths() as $prodBase) {
            $prodRoots = [
                $prodBase.'/storage/app/public',
                $prodBase.'/storage/app/public/courses',
                $prodBase.'/storage/app/public/slider-index',
                $prodBase.'/storage/app/public/prides',
                $prodBase.'/storage/app/public/teachers',
                $prodBase.'/storage/app/public/simuladores',
                $prodBase.'/storage/app/public/guias',
                $prodBase.'/storage/app/public/calendars',
                $prodBase.'/storage/app/images',
                $prodBase.'/storage/app/images/cursos',
                $prodBase.'/storage/app/images/slides',
                $prodBase.'/storage/app/images/prides',
                $prodBase.'/storage/app/images/teachers',
                $prodBase.'/public/storage',
                $prodBase.'/storage',
            ];

            foreach ($prodRoots as $prodRoot) {
                $allowedRoots[] = $prodRoot;
            }

            $candidatePaths[] = $prodBase.'/storage/app/public/'.$strippedFilename;
            $candidatePaths[] = $prodBase.'/storage/app/images/'.$strippedFilename;
            $candidatePaths[] = $prodBase.'/public/storage/'.$strippedFilename;
            $candidatePaths[] = $prodBase.'/storage/'.$strippedFilename;
        }

        foreach ($allowedRoots as $dir) {
            $candidatePaths[] = $dir.DIRECTORY_SEPARATOR.$basename;
        }

        $resolved = $this->resolveSafeFile($candidatePaths, $allowedRoots);
        if ($resolved) {
            $resolvedExt = strtolower(pathinfo($resolved, PATHINFO_EXTENSION));
            if (! in_array($resolvedExt, $allowedExtensions, true)) {
                abort(403, 'Tipo de archivo no permitido.');
            }

            $this->closeSessionForStream();

            return response()->file($resolved, [
                'Content-Type' => mime_content_type($resolved) ?: 'image/png',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        // Respaldo remoto de solo lectura hacia producción (sin modificar nada en producción)
        if (preg_match('/^[a-zA-Z0-9_\-\/\.]+\.(jpg|jpeg|png|webp|gif)$/i', $strippedFilename)) {
            $remoteUrls = [
                'https://sapius.com.mx/storage/'.$strippedFilename,
                'https://sapius.com.mx/cursos/image/'.$basename,
            ];

            foreach ($remoteUrls as $remoteUrl) {
                try {
                    $resp = Http::timeout(5)->get($remoteUrl);
                    $contentType = strtolower((string) $resp->header('Content-Type'));
                    $body = $resp->body();

                    if ($resp->successful() && str_starts_with($contentType, 'image/') && strlen($body) > 100) {
                        $cachePath = storage_path('app/public/'.$strippedFilename);
                        $cacheDir = dirname($cachePath);

                        if (! is_dir($cacheDir)) {
                            @mkdir($cacheDir, 0775, true);
                        }

                        if (@file_put_contents($cachePath, $body) !== false && is_file($cachePath)) {
                            $this->closeSessionForStream();

                            return response()->file($cachePath, [
                                'Content-Type' => mime_content_type($cachePath) ?: $contentType,
                                'Cache-Control' => 'public, max-age=86400',
                            ]);
                        }

                        $this->closeSessionForStream();

                        return response($body, 200, [
                            'Content-Type' => $contentType,
                            'Cache-Control' => 'public, max-age=86400',
                        ]);
                    }
                } catch (\Throwable $e) {
                    // Continuar al siguiente origen o fallback
                }
            }
        }

        $fallbackImage = public_path('img/brand2026/card-simuladores.png');
        if (! is_file($fallbackImage)) {
            $fallbackImage = public_path('img/egel-plus.png');
        }
        if (is_file($fallbackImage)) {
            return response()->file($fallbackImage, [
                'Content-Type' => mime_content_type($fallbackImage) ?: 'image/png',
                'Cache-Control' => 'public, max-age=3600',
            ]);
        }

        abort(404);
    }

    /**
     * Stream de medios académicos protegido por auth.media e inscripción aceptada.
     */
    public function streamMedia($filename)
    {
        $user = Auth::user();
        if (! $user) {
            abort(401);
        }

        $cleanFilename = ltrim(str_replace('\\', '/', (string) $filename), '/');
        if ($cleanFilename === '' || str_contains($cleanFilename, '..') || str_contains($cleanFilename, "\0")) {
            abort(404);
        }

        $basename = basename($cleanFilename);

        if ($user->hasRole('alumno') && ! $user->hasRole('admin') && ! $user->hasRole('instructor')) {
            $acceptedEnrollments = Enrollment::with('scheduledCourse:id,curso_id')
                ->where('user_id', $user->id)
                ->where('aceptado', 'si')
                ->get();

            $enrolledCourseIds = $acceptedEnrollments
                ->pluck('scheduledCourse.curso_id')
                ->filter()
                ->unique()
                ->values();

            $enrolledCohortIds = $acceptedEnrollments
                ->pluck('curso_programado_id')
                ->filter()
                ->unique()
                ->values();

            if ($enrolledCourseIds->isEmpty()) {
                abort(403, 'No cuentas con una inscripción activa aprobada.');
            }

            // Si el archivo corresponde a un registro Media en BD, exigir pertenencia a un curso inscrito
            $matchingMedias = Media::with('lesson:id,curso_id')
                ->where(function ($q) use ($cleanFilename, $basename) {
                    $q->where('ruta', $cleanFilename)
                        ->orWhere('ruta', $basename);
                })
                ->get();

            if ($matchingMedias->isNotEmpty()) {
                $belongsToEnrolledCourse = $matchingMedias->contains(function (Media $media) use ($enrolledCourseIds) {
                    $lesson = $media->lesson ?? Lesson::withoutGlobalScopes()->find($media->leccion_id);

                    return $lesson && $enrolledCourseIds->contains($lesson->curso_id);
                });

                if (! $belongsToEnrolledCourse) {
                    abort(403, 'No tienes autorización para acceder a este recurso multimedia.');
                }
            } else {
                $matchingGuias = FileGuia::where(function ($q) use ($cleanFilename, $basename) {
                    $q->where('url', $cleanFilename)
                        ->orWhere('url', $basename);
                })->get();

                if ($matchingGuias->isNotEmpty()) {
                    $belongsToCohort = $matchingGuias->contains(
                        fn (FileGuia $g) => $enrolledCohortIds->contains($g->curso_programado_id)
                    );
                    if (! $belongsToCohort) {
                        abort(403, 'No tienes autorización para acceder a esta guía.');
                    }
                }
            }
        }

        $allowedRoots = [
            storage_path('app/uploads'),
            storage_path('app/files/medias'),
            storage_path('app/images/medias'),
            storage_path('app/public'),
        ];

        $candidatePaths = [
            storage_path('app/uploads/'.$cleanFilename),
            storage_path('app/uploads/'.$basename),
            storage_path('app/files/medias/'.$cleanFilename),
            storage_path('app/files/medias/'.$basename),
            storage_path('app/images/medias/'.$cleanFilename),
            storage_path('app/images/medias/'.$basename),
            storage_path('app/public/'.$cleanFilename),
            storage_path('app/public/courses/'.$basename),
        ];

        foreach ($this->getReadOnlyProductionBasePaths() as $prodBase) {
            $allowedRoots[] = $prodBase.'/storage/app/uploads';
            $allowedRoots[] = $prodBase.'/storage/app/files/medias';
            $allowedRoots[] = $prodBase.'/storage/app/images/medias';
            $allowedRoots[] = $prodBase.'/storage/app/public';

            $candidatePaths[] = $prodBase.'/storage/app/uploads/'.$cleanFilename;
            $candidatePaths[] = $prodBase.'/storage/app/uploads/'.$basename;
            $candidatePaths[] = $prodBase.'/storage/app/files/medias/'.$cleanFilename;
            $candidatePaths[] = $prodBase.'/storage/app/files/medias/'.$basename;
            $candidatePaths[] = $prodBase.'/storage/app/images/medias/'.$cleanFilename;
            $candidatePaths[] = $prodBase.'/storage/app/images/medias/'.$basename;
            $candidatePaths[] = $prodBase.'/storage/app/public/'.$cleanFilename;
            $candidatePaths[] = $prodBase.'/storage/app/public/courses/'.$basename;
        }

        $resolved = $this->resolveSafeFile($candidatePaths, $allowedRoots);
        if ($resolved) {
            $this->closeSessionForStream();
            $mimeType = mime_content_type($resolved) ?: 'application/octet-stream';

            return response()->file($resolved, [
                'Content-Type' => $mimeType,
            ]);
        }

        abort(404);
    }

    /**
     * Sirve imágenes privadas de preguntas desde storage/app/images/preguntas/.
     */
    public function preguntaImagen($filename)
    {
        $user = Auth::user();
        if (! $user) {
            abort(401);
        }

        if ($user->hasRole('alumno') && ! $user->hasRole('admin') && ! $user->hasRole('instructor')) {
            $hasActiveEnrollment = Enrollment::where('user_id', $user->id)
                ->where('aceptado', 'si')
                ->exists();

            if (! $hasActiveEnrollment) {
                abort(403, 'No cuentas con una inscripción activa.');
            }
        }

        $cleanName = basename(str_replace('\\', '/', (string) $filename));
        if ($cleanName === '' || $cleanName === '.' || $cleanName === '..' || str_contains((string) $filename, "\0")) {
            abort(404);
        }

        $allowedRoots = [storage_path('app/images/preguntas')];
        $candidates = [storage_path('app/images/preguntas/'.$cleanName)];

        foreach ($this->getReadOnlyProductionBasePaths() as $prodBase) {
            $allowedRoots[] = $prodBase.'/storage/app/images/preguntas';
            $candidates[] = $prodBase.'/storage/app/images/preguntas/'.$cleanName;
        }

        $resolved = $this->resolveSafeFile($candidates, $allowedRoots);
        if (! $resolved) {
            abort(404);
        }

        $this->closeSessionForStream();
        $mimeType = mime_content_type($resolved) ?: 'application/octet-stream';

        return response()->file($resolved, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    protected function resolveSafeFile(array $candidatePaths, array $allowedRoots): ?string
    {
        $realRoots = [];
        foreach ($allowedRoots as $root) {
            $realRoot = realpath($root);
            if ($realRoot !== false) {
                $realRoots[] = rtrim($realRoot, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
            }
        }

        if (empty($realRoots)) {
            return null;
        }

        foreach ($candidatePaths as $path) {
            $realPath = realpath($path);
            if ($realPath === false || ! is_file($realPath)) {
                continue;
            }

            foreach ($realRoots as $rootPrefix) {
                if (str_starts_with($realPath, $rootPrefix)) {
                    return $realPath;
                }
            }
        }

        return null;
    }

    protected function closeSessionForStream(): void
    {
        if (session_id()) {
            @session_write_close();
        }
        if (function_exists('session') && session()->isStarted()) {
            session()->save();
        }
    }

    protected function isGuiaCategory(?string $categoryName): bool
    {
        $normalized = mb_strtolower(trim((string) $categoryName));

        return in_array($normalized, ['guias', 'guías'], true);
    }
}
