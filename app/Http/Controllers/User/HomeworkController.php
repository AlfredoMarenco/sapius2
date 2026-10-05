<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Homework;
use App\Models\Lesson;
use Illuminate\Support\Facades\Storage;

class HomeworkController extends Controller
{
    public function submit(Request $request, $leccion_id)
    {
        $request->validate([
            'documento' => 'required|file|mimes:pdf,doc,docx|max:10240', // 10MB max
            'curso_programado_id' => 'required|integer'
        ]);

        $leccion = Lesson::findOrFail($leccion_id);
        $curso_programado = \App\Models\ScheduledCourse::findOrFail($request->curso_programado_id);
        $instructor = \App\Models\User::find($curso_programado->user_id);
        
        $user = auth()->user();

        // Check if already submitted
        $existing = Homework::where('leccion_id', $leccion_id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return back()->with('error', 'Ya has enviado esta tarea.');
        }

        $file = $request->file('documento');
        $path = Storage::put('tareas', $file);

        $datos = [
            'nombre' => $user->name ?? $user->nombre_completo ?? 'Alumno Sapius',
            'leccion' => $leccion->title,
            'tarea' => $request->tarea ?? 'Entregado vía Plataforma Web'
        ];

        try {
            $copia = $user->email;
            if ($instructor) {
                \Illuminate\Support\Facades\Mail::to($instructor->email)->cc([$copia, 'tareas@sapius.com.mx'])->send(new \App\Mail\TareaEmail($datos));
            }
        } catch (\Exception $e) {
            // Log warning but continue process as mail service might fail
        }

        $isLate = false;
        $contenidoProgramado = \App\Models\Registro\ContenidoProgramado::where('curso_programado_id', $request->curso_programado_id)->first();
        if ($contenidoProgramado && $contenidoProgramado->contenido) {
            $schedule = collect($contenidoProgramado->contenido);
            $scheduleItem = $schedule->firstWhere('id', $leccion->id);
            if (!$scheduleItem) {
                $scheduleItem = $schedule->firstWhere('id', $leccion->parent_id); // parent_id maps to leccion_id in old logic
            }
            if ($scheduleItem && isset($scheduleItem['fecha_final'])) {
                try {
                    $endFormat = 'd/m/Y';
                    $endStr = $scheduleItem['fecha_final'];
                    if (isset($scheduleItem['hora_final'])) {
                        $endFormat .= ' H:i';
                        $endStr .= ' ' . $scheduleItem['hora_final'];
                    }
                    $fechaFinal = \Carbon\Carbon::createFromFormat($endFormat, $endStr);
                    if (!isset($scheduleItem['hora_final'])) {
                        $fechaFinal->setTime(23, 59, 59);
                    }
                    if (\Carbon\Carbon::now()->gt($fechaFinal)) {
                        $isLate = true;
                    }
                } catch (\Exception $e) {}
            }
        }

        $homework = new Homework();
        $homework->leccion_id = $leccion->id;
        $homework->user_id = $user->id;
        $homework->is_late = $isLate ? 1 : 0;
        $homework->save();

        return back()->with('success', 'Tarea enviada exitosamente.');
    }
}
