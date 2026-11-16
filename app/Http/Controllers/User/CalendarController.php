<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\ProgrammingCalendar;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $inscripciones = Enrollment::with([
            'scheduledCourse.category',
            'scheduledCourse.instructor',
            'scheduledCourse.course.modules' => function ($q) {
                $q->where('activo', 'si')->with(['lessons' => function ($l) {
                    $l->where('activo', 'si');
                }]);
            },
        ])
            ->where('user_id', $user->id)
            ->get();

        $events = [];
        $coursesSummary = [];
        $courseIds = [];

        foreach ($inscripciones as $inscripcion) {
            $scheduled = $inscripcion->scheduledCourse;
            if (! $scheduled || ! $scheduled->course) {
                continue;
            }

            $course = $scheduled->course;
            $courseIds[] = $course->id;

            $completedLessonIds = DB::table('leccion_user')
                ->where('user_id', $user->id)
                ->where('curso_programado_id', $scheduled->id)
                ->pluck('leccion_id')
                ->toArray();

            $courseStartCarbon = $scheduled->fecha_inicio ? Carbon::parse($scheduled->fecha_inicio) : null;
            $courseEndCarbon = $scheduled->fecha_fin ? Carbon::parse($scheduled->fecha_fin) : null;

            $courseStartIso = $courseStartCarbon ? $courseStartCarbon->format('Y-m-d') : now()->format('Y-m-d');
            $courseEndIso = $courseEndCarbon ? $courseEndCarbon->format('Y-m-d') : $courseStartIso;
            $courseStartFormatted = $courseStartCarbon ? $courseStartCarbon->format('d/m/Y') : 'Sin fecha';
            $courseEndFormatted = $courseEndCarbon ? $courseEndCarbon->format('d/m/Y') : 'Sin fecha';

            $contenidoCollection = collect([]);
            try {
                if (Schema::hasTable('contenidos_programados')) {
                    $contenido = DB::table('contenidos_programados')
                        ->where('curso_programado_id', $scheduled->id)
                        ->first();

                    if ($contenido && ! empty($contenido->contenido)) {
                        $contenidoArray = is_string($contenido->contenido)
                            ? json_decode($contenido->contenido, true)
                            : (array) $contenido->contenido;
                        $contenidoCollection = collect($contenidoArray);
                    }
                }
            } catch (\Throwable $e) {
                //
            }

            $modulesPayload = [];
            $totalCourseLessons = 0;

            foreach ($course->modules ?? [] as $modulo) {
                $item = $contenidoCollection->firstWhere('id', $modulo->id);

                $modStartCarbon = $courseStartCarbon;
                $modEndCarbon = $courseEndCarbon;

                if ($item && ! empty($item['fecha_inicial'])) {
                    try {
                        $rawInit = str_replace('/', '-', $item['fecha_inicial']);
                        $modStartCarbon = Carbon::parse($rawInit);
                    } catch (\Throwable $e) {
                        $modStartCarbon = $courseStartCarbon;
                    }
                }

                if ($item && ! empty($item['fecha_final'])) {
                    try {
                        $rawEnd = str_replace('/', '-', $item['fecha_final']);
                        $modEndCarbon = Carbon::parse($rawEnd);
                    } catch (\Throwable $e) {
                        $modEndCarbon = $modStartCarbon;
                    }
                }

                $startIso = $modStartCarbon ? $modStartCarbon->format('Y-m-d') : $courseStartIso;
                $endIso = $modEndCarbon ? $modEndCarbon->format('Y-m-d') : $courseEndIso;
                $startFormatted = $modStartCarbon ? $modStartCarbon->format('d/m/Y') : $courseStartFormatted;
                $endFormatted = $modEndCarbon ? $modEndCarbon->format('d/m/Y') : $courseEndFormatted;

                $lessonsList = [];
                $completedInMod = 0;

                foreach ($modulo->lessons ?? [] as $lesson) {
                    $isDone = in_array($lesson->id, $completedLessonIds);
                    if ($isDone) {
                        $completedInMod++;
                    }
                    $totalCourseLessons++;
                    $lessonsList[] = [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'is_completed' => $isDone,
                        'url' => "/alumno/modulo/{$lesson->id}/{$scheduled->id}",
                    ];
                }

                $modTotal = count($lessonsList);
                $modProgress = $modTotal > 0 ? round(($completedInMod / $modTotal) * 100) : 0;

                $moduleEvent = [
                    'id' => "sc-{$scheduled->id}-mod-{$modulo->id}",
                    'scheduled_id' => $scheduled->id,
                    'course_id' => $course->id,
                    'course_title' => $course->title,
                    'identifier' => $scheduled->identificador,
                    'module_id' => $modulo->id,
                    'module_title' => $modulo->title,
                    'title' => $course->title.': '.$modulo->title,
                    'start' => $startFormatted,
                    'end' => $endFormatted,
                    'start_iso' => $startIso,
                    'end_iso' => $endIso,
                    'allDay' => true,
                    'total_lessons' => $modTotal,
                    'completed_lessons' => $completedInMod,
                    'progress' => $modProgress,
                    'lessons' => $lessonsList,
                    'course_url' => "/alumno/curso/{$scheduled->id}",
                ];

                $events[] = $moduleEvent;
                $modulesPayload[] = $moduleEvent;
            }

            // Si el curso no tiene módulos aún, agregar un evento general del curso para que aparezca siempre en el calendario
            if (empty($modulesPayload)) {
                $fallbackEvent = [
                    'id' => "sc-{$scheduled->id}-course",
                    'scheduled_id' => $scheduled->id,
                    'course_id' => $course->id,
                    'course_title' => $course->title,
                    'identifier' => $scheduled->identificador,
                    'module_id' => 0,
                    'module_title' => 'Inicio y Vigencia del Curso',
                    'title' => $course->title,
                    'start' => $courseStartFormatted,
                    'end' => $courseEndFormatted,
                    'start_iso' => $courseStartIso,
                    'end_iso' => $courseEndIso,
                    'allDay' => true,
                    'total_lessons' => 0,
                    'completed_lessons' => 0,
                    'progress' => 0,
                    'lessons' => [],
                    'course_url' => "/alumno/curso/{$scheduled->id}",
                ];
                $events[] = $fallbackEvent;
                $modulesPayload[] = $fallbackEvent;
            }

            $courseProgress = $totalCourseLessons > 0
                ? round((count($completedLessonIds) / $totalCourseLessons) * 100)
                : 0;

            $coursesSummary[] = [
                'scheduled_id' => $scheduled->id,
                'course_id' => $course->id,
                'title' => $course->title,
                'identifier' => $scheduled->identificador,
                'instructor' => $scheduled->instructor ? $scheduled->instructor->name : 'Sapius Team',
                'start_date' => $courseStartFormatted,
                'end_date' => $courseEndFormatted,
                'start_iso' => $courseStartIso,
                'end_iso' => $courseEndIso,
                'progress' => $courseProgress,
                'total_lessons' => $totalCourseLessons,
                'completed_lessons' => count($completedLessonIds),
                'course_url' => "/alumno/curso/{$scheduled->id}",
            ];
        }

        $weeklyCalendars = [];
        try {
            if (! empty($courseIds) && Schema::hasTable('programming_calendars')) {
                $today = Carbon::today();

                $weeklyCalendars = ProgrammingCalendar::whereIn('curso_id', array_unique($courseIds))
                    ->where(function ($q) use ($today) {
                        $q->whereNull('start_date')
                            ->orWhereDate('start_date', '<=', $today);
                    })
                    ->where(function ($q) use ($today) {
                        $q->whereNull('end_date')
                            ->orWhereDate('end_date', '>=', $today);
                    })
                    ->orderBy('position', 'asc')
                    ->get()
                    ->map(fn ($cal) => [
                        'id' => $cal->id,
                        'course_id' => $cal->curso_id,
                        'group_name' => $cal->group_name,
                        'image_url' => '/media/stream/'.ltrim($cal->image_path, '/'),
                        'start_date' => $cal->start_date ? Carbon::parse($cal->start_date)->format('d/m/Y') : null,
                        'end_date' => $cal->end_date ? Carbon::parse($cal->end_date)->format('d/m/Y') : null,
                    ])
                    ->values()
                    ->toArray();
            }
        } catch (\Throwable $e) {
            //
        }

        return Inertia::render('User/Calendar/Index', [
            'events' => $events,
            'courses' => $coursesSummary,
            'weeklyCalendars' => $weeklyCalendars,
        ]);
    }
}
