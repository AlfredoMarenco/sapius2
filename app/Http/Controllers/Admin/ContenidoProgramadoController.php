<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\ScheduledCourse;
use App\Models\ContenidoProgramado;
use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContenidoProgramadoController extends Controller
{
    /**
     * Display course content scheduling interface for a cohort
     * Legacy URL: POST|GET /admin/registro/contenido
     */
    public function index(Request $request)
    {
        $cpId = $request->input('cp_id') ?? $request->input('curso_programado_id');
        
        $scheduledCourse = ScheduledCourse::with(['course.category', 'instructor'])->findOrFail($cpId);
        $course = $scheduledCourse->course;

        // Fetch modules (level 0: leccion_id == 0 or null) with their child classes
        $modules = Module::with(['lessons' => function ($q) {
                $q->orderBy('posicion', 'asc');
            }])
            ->where('curso_id', $scheduledCourse->curso_id)
            ->orderBy('posicion', 'asc')
            ->get();

        // Fetch existing scheduling data
        $contenidoRecord = ContenidoProgramado::where('curso_programado_id', $scheduledCourse->id)->first();
        $savedContent = collect($contenidoRecord ? $contenidoRecord->contenido : []);

        // Helper to convert d/m/Y to Y-m-d for HTML date input
        $toYmd = function ($dateStr) {
            if (!$dateStr) return null;
            if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', trim($dateStr), $m)) {
                return sprintf('%04d-%02d-%02d', $m[3], $m[2], $m[1]);
            }
            return $dateStr;
        };

        // Build structured data with existing dates/times if already scheduled
        $formattedModules = $modules->map(function ($mod) use ($savedContent, $toYmd) {
            $modSaved = $savedContent->firstWhere('id', $mod->id) ?? [];
            
            $lessons = $mod->lessons->map(function ($lesson) use ($savedContent, $toYmd) {
                $lessonSaved = $savedContent->firstWhere('id', $lesson->id) ?? [];
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'position' => $lessonSaved['orden'] ?? $lesson->posicion ?? 1,
                    'fecha_inicial' => $toYmd($lessonSaved['fecha_inicial'] ?? null),
                    'fecha_final' => $toYmd($lessonSaved['fecha_final'] ?? null),
                    'hora_inicial' => substr($lessonSaved['hora_inicial'] ?? '00:00', 0, 5),
                    'hora_final' => substr($lessonSaved['hora_final'] ?? '23:59', 0, 5),
                ];
            });

            // Sort lessons according to saved order
            $lessons = $lessons->sortBy('position')->values();

            return [
                'id' => $mod->id,
                'title' => $mod->title,
                'position' => $modSaved['orden'] ?? $mod->posicion ?? 1,
                'fecha_inicial' => $toYmd($modSaved['fecha_inicial'] ?? null),
                'fecha_final' => $toYmd($modSaved['fecha_final'] ?? null),
                'hora_inicial' => substr($modSaved['hora_inicial'] ?? '00:00', 0, 5),
                'hora_final' => substr($modSaved['hora_final'] ?? '23:59', 0, 5),
                'lessons' => $lessons,
            ];
        });

        // Sort modules by position
        $formattedModules = $formattedModules->sortBy('position')->values();

        return Inertia::render('Admin/Schedules/Content', [
            'cohort' => [
                'id' => $scheduledCourse->id,
                'course_id' => $scheduledCourse->curso_id,
                'course_title' => $course ? $course->title : 'Curso',
                'internal_id' => $scheduledCourse->identificador ?? "Cohorte #{$scheduledCourse->id}",
                'instructor_name' => $scheduledCourse->instructor ? $scheduledCourse->instructor->name : 'No asignado',
                'start_date' => $scheduledCourse->fecha_inicio ? $scheduledCourse->fecha_inicio->format('d/m/Y') : null,
                'end_date' => $scheduledCourse->fecha_fin ? $scheduledCourse->fecha_fin->format('d/m/Y') : null,
            ],
            'modules' => $formattedModules,
        ]);
    }

    /**
     * Store content schedule for a cohort
     * Legacy URL: POST /admin/registro/contenido/store
     */
    public function store(Request $request)
    {
        $cpId = $request->input('curso_programado_id') ?? $request->input('cp_id');
        $scheduledCourse = ScheduledCourse::findOrFail($cpId);

        // Helper to convert Y-m-d back to d/m/Y for storage
        $toDmy = function ($dateStr) {
            if (!$dateStr) return null;
            if (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', trim($dateStr), $m)) {
                return sprintf('%02d/%02d/%04d', $m[3], $m[2], $m[1]);
            }
            return $dateStr;
        };

        $items = [];

        // Support both modern JSON payload ('items') and legacy form fields
        if ($request->has('items') && is_array($request->input('items'))) {
            foreach ($request->input('items') as $raw) {
                $items[] = [
                    'id' => (int)($raw['id'] ?? 0),
                    'orden' => (int)($raw['orden'] ?? 0),
                    'fecha_inicial' => $toDmy($raw['fecha_inicial'] ?? null),
                    'fecha_final' => $toDmy($raw['fecha_final'] ?? null),
                    'hora_inicial' => substr($raw['hora_inicial'] ?? '00:00', 0, 5),
                    'hora_final' => substr($raw['hora_final'] ?? '23:59', 0, 5),
                ];
            }
        } else {
            // Process legacy inputs
            $course = Course::with('modules.lessons')->find($scheduledCourse->curso_id);
            if ($course) {
                foreach ($course->modules as $mod) {
                    $items[] = [
                        'id' => (int)($request->input('leccion_id_' . $mod->id) ?? $mod->id),
                        'orden' => (int)($request->input('orden_' . $mod->id) ?? 0),
                        'fecha_inicial' => $toDmy($request->input('fecha_inicial_' . $mod->id)),
                        'fecha_final' => $toDmy($request->input('fecha_final_' . $mod->id)),
                        'hora_inicial' => substr($request->input('hora_inicial_' . $mod->id) ?? '00:00', 0, 5),
                        'hora_final' => substr($request->input('hora_final_' . $mod->id) ?? '23:59', 0, 5),
                    ];

                    foreach ($mod->lessons as $lesson) {
                        $items[] = [
                            'id' => (int)($request->input('leccion_id_' . $lesson->id) ?? $lesson->id),
                            'orden' => (int)($request->input('orden_' . $lesson->id) ?? 0),
                            'fecha_inicial' => $toDmy($request->input('fecha_inicial_' . $lesson->id)),
                            'fecha_final' => $toDmy($request->input('fecha_final_' . $lesson->id)),
                            'hora_inicial' => substr($request->input('hora_inicial_' . $lesson->id) ?? '00:00', 0, 5),
                            'hora_final' => substr($request->input('hora_final_' . $lesson->id) ?? '23:59', 0, 5),
                        ];
                    }
                }
            }
        }

        ContenidoProgramado::updateOrCreate(
            ['curso_programado_id' => $scheduledCourse->id],
            ['contenido' => $items]
        );

        return redirect()->back()->with('success', 'Programación de contenido guardada con éxito.');
    }
}
