<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Mail\TareaEmail;
use App\Models\Homework;
use App\Models\User;
use App\Services\EnrollmentAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class HomeworkController extends Controller
{
    public function __construct(
        protected EnrollmentAccessService $accessService
    ) {}

    public function submit(Request $request, $leccion_id)
    {
        $request->validate([
            'documento' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'curso_programado_id' => 'required|integer',
        ]);

        $user = $request->user();
        $access = $this->accessService->requireLessonInCohort(
            $user,
            (int) $leccion_id,
            (int) $request->curso_programado_id
        );

        $leccion = $access['lesson'];
        $cursoProgramado = $access['scheduled'];
        $instructor = $cursoProgramado->user_id ? User::find($cursoProgramado->user_id) : null;

        $existing = Homework::where('leccion_id', $leccion->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return back()->with('error', 'Ya has enviado esta tarea.');
        }

        $file = $request->file('documento');
        $relativePath = Storage::disk('local')->putFile('tareas', $file);
        $physicalPath = Storage::disk('local')->path($relativePath);

        $isModule = empty($leccion->leccion_id) || (int) $leccion->leccion_id === 0;
        $schedule = $this->accessService->evaluateSchedule(
            (int) $cursoProgramado->id,
            (int) $user->id,
            (int) $leccion->id,
            $isModule ? null : (int) $leccion->leccion_id
        );
        $isLate = (bool) ($schedule['is_late'] ?? false);

        $homework = new Homework;
        $homework->leccion_id = $leccion->id;
        $homework->user_id = $user->id;
        $homework->is_late = $isLate ? 1 : 0;
        $homework->save();

        $datos = [
            'nombre' => $user->nombre_completo ?: ($user->name ?? 'Alumno Sapius'),
            'leccion' => $leccion->title ?? $leccion->titulo,
            'tarea' => $request->input('tarea', 'Entregado vía Plataforma Web'),
        ];

        try {
            $ccRecipients = array_filter([$user->email, 'tareas@sapius.com.mx']);
            if ($instructor && $instructor->email) {
                Mail::to($instructor->email)
                    ->cc($ccRecipients)
                    ->send(new TareaEmail($datos, $physicalPath));
            } elseif ($user->email) {
                Mail::to('tareas@sapius.com.mx')
                    ->cc([$user->email])
                    ->send(new TareaEmail($datos, $physicalPath));
            }
        } catch (\Throwable $e) {
            Log::warning("Error enviando correo de tarea para lección {$leccion->id}: ".$e->getMessage());
        }

        return back()->with('success', 'Tarea enviada exitosamente.');
    }
}
