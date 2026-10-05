<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ScheduledCourse;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;

class ExamResultController extends Controller
{
    /**
     * Display student exam results for an enrollment.
     * Legacy URL: /admin/evaluacion/resultados/{inscripcion_id}
     */
    public function listaResultados($inscripcion_id)
    {
        $inscripcion = Enrollment::with(['user', 'scheduledCourse.course'])->findOrFail($inscripcion_id);
        $user = $inscripcion->user;
        $cohort = $inscripcion->scheduledCourse;
        $course = $cohort ? $cohort->course : null;

        $examenes = Exam::with('quiz')
            ->where('inscripcion_id', $inscripcion_id)
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($ex) {
                return [
                    'id' => $ex->id,
                    'quiz_id' => $ex->prueba_id,
                    'quiz_title' => $ex->quiz ? $ex->quiz->title : 'Evaluación',
                    'quiz_description' => $ex->quiz ? $ex->quiz->description : '',
                    'min_score' => $ex->quiz ? ($ex->quiz->min_score ?? 60) : 60,
                    'max_score' => $ex->quiz ? ($ex->quiz->score ?? 100) : 100,
                    'duration' => $ex->quiz ? ($ex->quiz->duration ?? 0) : 0,
                    'score' => $ex->score ?? $ex->calificacion ?? 0,
                    'correct_answers' => $ex->aciertos ?? 0,
                    'total_questions' => $ex->total_preguntas ?? 0,
                    'finished' => $ex->finalizado ?? 'no',
                    'feedback_viewed' => $ex->retro_visualizado ?? 'no',
                    'created_at' => $ex->created_at ? $ex->created_at->format('d/m/Y H:i') : null,
                    'updated_at' => $ex->updated_at ? $ex->updated_at->format('d/m/Y H:i') : null,
                ];
            });

        return Inertia::render('Admin/Exams/Results', [
            'enrollment' => [
                'id' => $inscripcion->id,
                'user_id' => $inscripcion->user_id,
                'student_name' => $user ? ($user->name ?? $user->email) : 'Alumno',
                'student_email' => $user ? $user->email : '',
                'accepted' => $inscripcion->aceptado,
                'cohort_id' => $cohort ? $cohort->id : 0,
                'cohort_internal_id' => $cohort ? $cohort->identificador : '',
                'course_title' => $course ? $course->title : 'Curso',
            ],
            'exams' => $examenes,
        ]);
    }

    /**
     * Toggle finished status for an exam attempt
     * Legacy URL: POST /admin/examen/finalizar
     */
    public function cambiarEstadoFinalizado(Request $request)
    {
        $examen = Exam::findOrFail($request->id);
        $examen->finalizado = ($examen->finalizado === 'si') ? 'no' : 'si';
        $examen->save();

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Estado de finalizado actualizado correctamente.',
                'nuevo_estado' => $examen->finalizado,
            ]);
        }

        return back()->with('success', 'Estado de finalizado actualizado.');
    }

    /**
     * Toggle feedback visualization
     * Legacy URL: POST /admin/examen/retro
     */
    public function cambiarEstadoRetro(Request $request)
    {
        $examen = Exam::findOrFail($request->id);
        $examen->retro_visualizado = ($examen->retro_visualizado === 'si') ? 'no' : 'si';
        $examen->save();

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Estado de retroalimentación actualizado.',
                'nuevo_estado' => $examen->retro_visualizado,
            ]);
        }

        return back()->with('success', 'Estado de retroalimentación actualizado.');
    }

    /**
     * Reset / delete an exam attempt so the student can re-take it
     * Legacy URL: POST /admin/examen/reiniciar
     */
    public function reiniciarExamen(Request $request)
    {
        $examen = Exam::findOrFail($request->id);
        $examen->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Examen reiniciado correctamente.',
                'status' => 'success',
            ]);
        }

        return back()->with('success', 'Examen reiniciado exitosamente para el alumno.');
    }

    /**
     * Export individual student exam results report
     * Legacy URL: GET /admin/exportCalificaciones/{inscripcion_id}
     */
    public function exportReport($inscripcion_id)
    {
        $inscripcion = Enrollment::with(['user', 'scheduledCourse.course'])->findOrFail($inscripcion_id);
        $user = $inscripcion->user;
        $exams = Exam::with('quiz')->where('inscripcion_id', $inscripcion_id)->get();

        $filename = "Calificaciones_{$user->name}_{$inscripcion_id}.csv";
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($exams, $user, $inscripcion) {
            $file = fopen('php://output', 'w');
            // BOM UTF-8 for Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['Reporte Individual de Calificaciones']);
            fputcsv($file, ['Alumno', $user ? $user->name : 'N/A']);
            fputcsv($file, ['Correo', $user ? $user->email : 'N/A']);
            fputcsv($file, ['Fecha de Emisión', date('d/m/Y H:i')]);
            fputcsv($file, []);
            fputcsv($file, ['ID', 'Examen / Prueba', 'Aciertos', 'Total Preguntas', 'Calificación', 'Finalizado', 'Fecha']);

            foreach ($exams as $ex) {
                fputcsv($file, [
                    $ex->id,
                    $ex->quiz ? $ex->quiz->title : 'Evaluación #' . $ex->prueba_id,
                    $ex->aciertos ?? 0,
                    $ex->total_preguntas ?? 0,
                    $ex->score ?? $ex->calificacion ?? 0,
                    $ex->finalizado === 'si' ? 'Sí' : 'No',
                    $ex->created_at ? $ex->created_at->format('d/m/Y H:i') : 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export all student results for a cohort
     * Legacy URL: GET /admin/exportAllResults/{curso_id}
     */
    public function exportAllStudentResults($curso_id)
    {
        $cohort = ScheduledCourse::with(['course', 'enrollments.user'])->findOrFail($curso_id);
        $enrollments = $cohort->enrollments;

        $filename = "Acta_Calificaciones_Grupo_{$cohort->id}.csv";
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($cohort, $enrollments) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['Acta de Calificaciones del Grupo']);
            fputcsv($file, ['Curso', $cohort->course ? $cohort->course->title : 'N/A']);
            fputcsv($file, ['Cohorte / Generación', $cohort->identificador]);
            fputcsv($file, ['Fecha de Emisión', date('d/m/Y H:i')]);
            fputcsv($file, ['Total Inscritos', $enrollments->count()]);
            fputcsv($file, []);
            fputcsv($file, ['ID Inscripción', 'Alumno', 'Correo', 'Aceptado', 'Exámenes Presentados', 'Promedio']);

            foreach ($enrollments as $ins) {
                $studentExams = Exam::where('inscripcion_id', $ins->id)->get();
                $avgScore = $studentExams->count() > 0 ? round($studentExams->avg('calificacion'), 2) : 0;

                fputcsv($file, [
                    $ins->id,
                    $ins->user ? $ins->user->name : 'N/A',
                    $ins->user ? $ins->user->email : 'N/A',
                    $ins->aceptado === 'si' ? 'Aceptado' : 'Pendiente',
                    $studentExams->count(),
                    $avgScore,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
