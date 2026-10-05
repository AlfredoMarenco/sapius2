<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class CalendarController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $inscripciones = Enrollment::with([
            'scheduledCourse.course.modules'
        ])
        ->where('user_id', $user->id)
        ->where('aceptado', 'si')
        ->get();

        $events = [];

        foreach ($inscripciones as $inscripcion) {
            $scheduled = $inscripcion->scheduledCourse;
            if (!$scheduled || !$scheduled->course) {
                continue;
            }

            $contenido = DB::table('contenidos_programados')
                ->where('curso_programado_id', $scheduled->id)
                ->first();

            if ($contenido && !empty($contenido->contenido)) {
                $contenidoArray = is_string($contenido->contenido) ? json_decode($contenido->contenido, true) : (array)$contenido->contenido;
                $contenidoCollection = collect($contenidoArray);

                if ($scheduled->course->modules) {
                    foreach ($scheduled->course->modules as $modulo) {
                        $item = $contenidoCollection->firstWhere('id', $modulo->id);
                        if ($item && !empty($item['fecha_inicial'])) {
                            $fechaInicial = str_replace('/', '-', $item['fecha_inicial']);
                            $fechaFinal = !empty($item['fecha_final']) ? str_replace('/', '-', $item['fecha_final']) : $fechaInicial;

                            $events[] = [
                                'id' => 'mod-' . $modulo->id,
                                'title' => $scheduled->course->title . ': ' . $modulo->title,
                                'start' => date('Y-m-d', strtotime($fechaInicial)),
                                'end' => date('Y-m-d', strtotime($fechaFinal)),
                                'allDay' => true,
                                'course_title' => $scheduled->course->title,
                                'module_title' => $modulo->title,
                            ];
                        }
                    }
                }
            }
        }

        return Inertia::render('User/Calendar/Index', [
            'events' => $events,
        ]);
    }
}
