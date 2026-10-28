<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Cursos\Leccion;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Quiz;
use App\Models\ScheduledCourse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use ZipArchive;

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
     * Export individual student exam results report (Official PDF format)
     * Legacy URL: GET /admin/exportCalificaciones/{inscripcion_id}
     */
    public function exportReport($inscripcion_id)
    {
        $inscripcion = Enrollment::with(['user', 'scheduledCourse.course', 'exams.quiz'])->findOrFail($inscripcion_id);
        $user = $inscripcion->user;
        $cohort = $inscripcion->scheduledCourse;

        $lecciones = Leccion::with(['pruebas' => function ($q) {
            $q->where('activo', 'si');
        }])->where('curso_id', $cohort ? $cohort->course_id : 0)->get();

        $exams = $inscripcion->exams ?? collect();

        $studentName = $user ? trim(($user->first_name ?? $user->name ?? '').' '.($user->last_name ?? $user->apellido ?? '')) : 'Alumno';
        if (empty($studentName)) {
            $studentName = $user->name ?? $user->email ?? 'Alumno';
        }
        $cleanName = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $studentName);

        $pdf = Pdf::loadView('alumno.exportresultados', [
            'examenes' => $exams,
            'lecciones' => $lecciones,
            'inscripcion' => $inscripcion,
        ]);

        $fileName = "Calificaciones_{$cleanName}_{$inscripcion_id}.pdf";

        return $pdf->download($fileName);
    }

    /**
     * Export all student results for a cohort (Excel matrix or ZIP of PDFs)
     * Legacy URL: GET /admin/exportAllResults/{curso_id}
     * Query param: ?format=excel (default) or ?format=zip
     */
    public function exportAllStudentResults(Request $request, $curso_id)
    {
        $cohort = ScheduledCourse::with(['course'])->findOrFail($curso_id);
        $format = strtolower($request->query('format', 'excel'));

        if ($format === 'zip' || $format === 'pdf') {
            return $this->exportCohortZip($cohort);
        }

        return $this->exportCohortExcel($cohort);
    }

    /**
     * Generate full grade matrix in Excel (.xlsx) format
     */
    protected function exportCohortExcel(ScheduledCourse $cohort)
    {
        $course = $cohort->course;

        // Quizzes of the course
        $quizzes = Quiz::where('curso_id', $cohort->course_id)
            ->where('activo', 'si')
            ->orderBy('id', 'asc')
            ->get();

        // Accepted enrolled students
        $enrollments = Enrollment::with(['user', 'exams.quiz'])
            ->where('curso_programado_id', $cohort->id)
            ->where('aceptado', 'si')
            ->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Calificaciones');

        // Title & Info Header
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'SAPIUS - ACTA DE CALIFICACIONES');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF002146');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        $courseTitle = $course ? $course->title : 'Curso';
        $cohortIdentifier = $cohort->identificador ?? ('Cohorte #'.$cohort->id);
        $infoText = "Curso: {$courseTitle} | Cohorte: {$cohortIdentifier} | Fecha: ".date('d/m/Y H:i');
        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', $infoText);
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setARGB('FF333333');

        // Table Column Headers (Row 4)
        $headers = ['#', 'ID Inscripción', 'Folio', 'Alumno', 'Correo', 'Universidad'];
        $colIndex = 1;
        foreach ($headers as $h) {
            $coord = Coordinate::stringFromColumnIndex($colIndex).'4';
            $sheet->setCellValue($coord, $h);
            $colIndex++;
        }

        // Dynamic quiz headers
        $quizColMap = [];
        foreach ($quizzes as $quiz) {
            $coord = Coordinate::stringFromColumnIndex($colIndex).'4';
            $quizTitle = $quiz->title ?? ('Evaluación #'.$quiz->id);
            $sheet->setCellValue($coord, $quizTitle);
            $quizColMap[$quiz->id] = $colIndex;
            $colIndex++;
        }

        // Metric headers
        $presentedCol = $colIndex;
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($presentedCol).'4', 'Exámenes Presentados');
        $colIndex++;

        $avgCol = $colIndex;
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($avgCol).'4', 'Promedio General');

        // Style Header Row 4
        $lastColLetter = Coordinate::stringFromColumnIndex($colIndex);
        $sheet->getStyle("A4:{$lastColLetter}4")->getFont()->setBold(true)->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle("A4:{$lastColLetter}4")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF002146');
        $sheet->getStyle("A4:{$lastColLetter}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Data rows
        $rowIndex = 5;
        $studentCount = 0;

        foreach ($enrollments as $ins) {
            $studentCount++;
            $user = $ins->user;
            $studentName = $user ? trim(($user->first_name ?? $user->name ?? '').' '.($user->last_name ?? $user->apellido ?? '')) : 'Alumno';
            if (empty($studentName)) {
                $studentName = $user->name ?? $user->email ?? 'Alumno';
            }
            $folio = $user ? ($user->id_folio ?? $user->folio ?? $user->id) : 'N/A';
            $university = $user ? ($user->university ?? $user->universidad_procedencia ?? 'N/A') : 'N/A';

            $sheet->setCellValue("A{$rowIndex}", $studentCount);
            $sheet->setCellValue("B{$rowIndex}", $ins->id);
            $sheet->setCellValue("C{$rowIndex}", $folio);
            $sheet->setCellValue("D{$rowIndex}", $studentName);
            $sheet->setCellValue("E{$rowIndex}", $user ? $user->email : 'N/A');
            $sheet->setCellValue("F{$rowIndex}", $university);

            $studentExams = $ins->exams ?? collect();
            $presentedCount = 0;
            $sumScores = 0;

            foreach ($quizColMap as $quizId => $cIdx) {
                $colLetter = Coordinate::stringFromColumnIndex($cIdx);
                $exam = $studentExams->firstWhere('prueba_id', $quizId);
                if ($exam) {
                    $score = (float) ($exam->score_total ?? $exam->score ?? $exam->calificacion ?? 0);
                    $sheet->setCellValue("{$colLetter}{$rowIndex}", $score);
                    $sheet->getStyle("{$colLetter}{$rowIndex}")->getNumberFormat()->setFormatCode('0.0');
                    $sheet->getStyle("{$colLetter}{$rowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $presentedCount++;
                    $sumScores += $score;
                } else {
                    $sheet->setCellValue("{$colLetter}{$rowIndex}", 'NP');
                    $sheet->getStyle("{$colLetter}{$rowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("{$colLetter}{$rowIndex}")->getFont()->setColor(new Color('FF856404'));
                }
            }

            // Metrics for student
            $presLetter = Coordinate::stringFromColumnIndex($presentedCol);
            $sheet->setCellValue("{$presLetter}{$rowIndex}", $presentedCount);
            $sheet->getStyle("{$presLetter}{$rowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $avgLetter = Coordinate::stringFromColumnIndex($avgCol);
            $avgScore = $presentedCount > 0 ? round($sumScores / $presentedCount, 1) : 0;
            $sheet->setCellValue("{$avgLetter}{$rowIndex}", $avgScore);
            $sheet->getStyle("{$avgLetter}{$rowIndex}")->getNumberFormat()->setFormatCode('0.0');
            $sheet->getStyle("{$avgLetter}{$rowIndex}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $rowIndex++;
        }

        // Border styling for entire table
        $lastRowIndex = $rowIndex - 1;
        if ($lastRowIndex >= 5) {
            $sheet->getStyle("A4:{$lastColLetter}{$lastRowIndex}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFCCCCCC');
        }

        // Auto-size columns
        for ($i = 1; $i <= $colIndex; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $cleanCohortIdent = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $cohort->identificador ?? ('Cohorte_'.$cohort->id));
        $filename = "Acta_Calificaciones_{$cleanCohortIdent}.xlsx";

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Generate ZIP package containing individual student PDF reports
     */
    protected function exportCohortZip(ScheduledCourse $cohort)
    {
        ini_set('max_execution_time', 300);
        ini_set('memory_limit', '512M');

        $enrollments = Enrollment::with(['user', 'exams.quiz'])
            ->where('curso_programado_id', $cohort->id)
            ->where('aceptado', 'si')
            ->get();

        if ($enrollments->isEmpty()) {
            return back()->with('error', 'La cohorte no tiene alumnos aceptados para exportar.');
        }

        $lecciones = Leccion::with(['pruebas' => function ($q) {
            $q->where('activo', 'si');
        }])->where('curso_id', $cohort->course_id)->get();

        $tempFolder = storage_path('app/temp_reports/'.uniqid('cohort_'.$cohort->id.'_', true));
        if (! file_exists($tempFolder)) {
            mkdir($tempFolder, 0777, true);
        }

        $pdfFiles = [];

        try {
            foreach ($enrollments as $ins) {
                $user = $ins->user;
                $studentName = $user ? trim(($user->first_name ?? $user->name ?? '').' '.($user->last_name ?? $user->apellido ?? '')) : 'Alumno';
                if (empty($studentName)) {
                    $studentName = $user->name ?? $user->email ?? 'Alumno';
                }
                $cleanName = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $studentName);

                $examenes = $ins->exams ?? collect();

                $pdf = Pdf::loadView('alumno.exportresultados', [
                    'examenes' => $examenes,
                    'lecciones' => $lecciones,
                    'inscripcion' => $ins,
                ]);

                $fileName = "{$cleanName} - {$ins->id}.pdf";
                $filePath = "{$tempFolder}/{$fileName}";

                $pdf->save($filePath);
                $pdfFiles[] = $filePath;
            }

            $cleanCohortIdent = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $cohort->identificador ?? ('Cohorte_'.$cohort->id));
            $zipFileName = "Resultados_{$cleanCohortIdent}_".date('Ymd_His').'.zip';
            $zipPath = storage_path("app/{$zipFileName}");

            $zip = new ZipArchive;
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                foreach ($pdfFiles as $file) {
                    if (file_exists($file)) {
                        $zip->addFile($file, basename($file));
                    }
                }
                $zip->close();
            }

            return response()->download($zipPath)->deleteFileAfterSend(true);
        } finally {
            // Cleanup temporary PDF files
            foreach ($pdfFiles as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
            if (file_exists($tempFolder)) {
                @rmdir($tempFolder);
            }
        }
    }
}
