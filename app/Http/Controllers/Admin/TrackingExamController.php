<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cursos\Leccion;
use App\Models\Enrollment;
use App\Models\Exam;
use Barryvdh\DomPDF\Facade\Pdf;

class TrackingExamController extends Controller
{
    /**
     * Elimina el examen para reiniciar el progreso.
     */
    public function reset(Exam $exam)
    {
        $exam->delete();

        return back()->with('success', 'El examen ha sido reiniciado. El alumno puede volver a presentarlo.');
    }

    /**
     * Alterna el bloqueo de retroalimentación (retro_visualizado: 'no' = Habilitada, 'si' = Consumida).
     */
    public function toggleFeedback(Exam $exam)
    {
        $newValue = ($exam->retro_visualizado === 'si') ? 'no' : 'si';
        $exam->retro_visualizado = $newValue;
        $exam->save();

        return back()->with(
            'success',
            $newValue === 'no'
                ? 'Retroalimentación habilitada para este examen.'
                : 'Retroalimentación marcada como consumida/bloqueada.'
        );
    }

    /**
     * Descarga el reporte PDF de los exámenes de un alumno (incluyendo quizzes directos de módulo).
     */
    public function downloadReport(Enrollment $enrollment)
    {
        $enrollment->load(['user', 'scheduledCourse.course']);
        $cohort = $enrollment->scheduledCourse;

        $lecciones = collect();
        if ($cohort) {
            // Incluye tanto módulos (leccion_id = 0) con quizzes directos como lecciones hijas (leccion_id > 0)
            $lecciones = Leccion::with(['pruebas' => function ($q) {
                $q->where('activo', 'si');
            }])
                ->where('curso_id', $cohort->curso_id)
                ->where('activo', 'si')
                ->orderBy('leccion_id', 'asc')
                ->orderBy('posicion', 'asc')
                ->get();
        }

        $examenes = Exam::with('quiz')
            ->where('inscripcion_id', $enrollment->id)
            ->orderBy('id', 'asc')
            ->get();

        $pdf = Pdf::loadView('alumno.exportresultados', [
            'examenes' => $examenes,
            'lecciones' => $lecciones,
            'inscripcion' => $enrollment,
        ]);

        $userName = $enrollment->user
            ? ($enrollment->user->nombre_completo ?: ($enrollment->user->name ?? $enrollment->user->email))
            : 'Alumno';
        $cleanName = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $userName);

        return $pdf->download($cleanName.' - Reporte de Resultados - '.date('Y-m-d_H-i-s').'.pdf');
    }
}
