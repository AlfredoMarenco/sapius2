<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class TrackingExamController extends Controller
{
    /**
     * Elimina el examen para reiniciar el progreso
     */
    public function reset(Exam $exam)
    {
        $exam->delete();

        return back()->with('success', 'El examen ha sido reiniciado. El alumno puede volver a presentarlo.');
    }

    /**
     * Alterna la opción de mostrar retroalimentación
     */
    public function toggleFeedback(Exam $exam)
    {
        $exam->feedback_enabled = ($exam->feedback_enabled === 'si') ? 'no' : 'si';
        $exam->save();

        return back()->with('success', 'Retroalimentación ' . ($exam->feedback_enabled === 'si' ? 'activada' : 'desactivada') . ' para este examen.');
    }

    /**
     * Descarga el reporte PDF de los exámenes de un alumno
     */
    public function downloadReport(Enrollment $enrollment)
    {
        // Obtener el curso activo y sus lecciones
        $cohort = ScheduledCourse::with('course.modules.lessons')->find($enrollment->curso_programado_id);
        
        $lecciones = collect();
        if ($cohort && $cohort->course) {
            foreach ($cohort->course->modules as $module) {
                if ($module->lessons) {
                    $lecciones = $lecciones->merge($module->lessons->where('activo', 'si'));
                }
            }
        }

        // Obtener los exámenes realizados en esta inscripción
        $examenes = Exam::with('quiz')
            ->where('inscripcion_id', $enrollment->id)
            ->get();
            
        // El legacy usa relations con nombre 'Prueba' y modelo 'CursosCurso' (Course)
        // Por compatibilidad de vista enviaremos la variable renombrada pero con la misma estructura.
        
        $pdf = Pdf::loadView('alumno.exportresultados', [
            'examenes' => $examenes,
            'lecciones' => $lecciones,
            'inscripcion' => $enrollment
        ]);

        $userName = $enrollment->user ? ($enrollment->user->name ?? $enrollment->user->email) : 'Alumno';
        
        return $pdf->download($userName . ' - Reporte de Resultados - ' . date('Y-m-d H:i:s') . '.pdf');
    }
}
