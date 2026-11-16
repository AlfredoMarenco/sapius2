<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cursos\Leccion;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Quiz;
use App\Models\ScheduledCourse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

        $rawExams = Exam::with('quiz')
            ->where('inscripcion_id', $inscripcion_id)
            ->orderBy('id', 'asc')
            ->get();

        // Identificar el mejor intento finalizado por cada prueba_id
        $bestAttemptIds = $rawExams
            ->groupBy('prueba_id')
            ->map(function (Collection $group) {
                $finished = $group->where('finalizado', 'si');
                $best = $finished->isNotEmpty()
                    ? $finished->sortByDesc(fn ($e) => (float) ($e->score_total ?? $e->score ?? 0))->first()
                    : $group->sortByDesc('id')->first();

                return $best?->id;
            })
            ->filter()
            ->flip();

        $examenes = $rawExams->map(function (Exam $ex) use ($bestAttemptIds) {
            $quiz = $ex->quiz;
            $quizType = strtoupper((string) ($quiz?->tipo ?? $quiz?->type ?? 'EXANI'));
            [$minScore, $maxScore] = $this->resolveScaleThresholds($quiz);

            $rawEvents = $ex->eventos;
            if (is_string($rawEvents)) {
                $decoded = json_decode($rawEvents, true);
                $events = is_array($decoded) ? $decoded : [];
            } elseif (is_array($rawEvents)) {
                $events = $rawEvents;
            } else {
                $events = [];
            }

            $retro = $ex->retro_visualizado ?? 'no';

            return [
                'id' => $ex->id,
                'quiz_id' => $ex->prueba_id,
                'quiz_title' => $quiz ? ($quiz->titulo ?? $quiz->title) : 'Evaluación',
                'quiz_description' => $quiz ? ($quiz->descripcion ?? $quiz->description ?? '') : '',
                'quiz_type' => $quizType,
                'min_score' => $minScore,
                'max_score' => $maxScore,
                'duration' => $quiz ? ($quiz->tiempo ?? $quiz->duration ?? 0) : 0,
                'score' => (float) ($ex->score_total ?? $ex->score ?? $ex->calificacion ?? 0),
                'correct_answers' => (int) ($ex->total_correctas ?? $ex->aciertos ?? 0),
                'total_questions' => (int) ($ex->total_preguntas ?? 0),
                'finished' => $ex->finalizado ?? 'no',
                'feedback_viewed' => $retro,
                'feedback_status' => $retro === 'si' ? 'Consumida' : 'Habilitada',
                'is_best_attempt' => $bestAttemptIds->has($ex->id),
                'is_late' => (bool) ($ex->is_late ?? false),
                'eventos' => array_values($events),
                'created_at' => $ex->created_at ? $ex->created_at->format('d/m/Y H:i') : null,
                'updated_at' => $ex->updated_at ? $ex->updated_at->format('d/m/Y H:i') : null,
            ];
        })->values();

        // Pruebas activas del curso aún no presentadas
        $presentedQuizIds = $rawExams->pluck('prueba_id')->unique()->flip();
        $notPresentedQuizzes = $course
            ? Quiz::where('curso_id', $course->id)
                ->where('activo', 'si')
                ->orderBy('id', 'asc')
                ->get()
                ->filter(fn (Quiz $q) => ! $presentedQuizIds->has($q->id))
                ->map(function (Quiz $q) {
                    [$minScore, $maxScore] = $this->resolveScaleThresholds($q);

                    return [
                        'id' => $q->id,
                        'title' => $q->titulo ?? $q->title,
                        'type' => strtoupper((string) ($q->tipo ?? $q->type ?? 'EXANI')),
                        'min_score' => $minScore,
                        'max_score' => $maxScore,
                    ];
                })
                ->values()
            : collect();

        return Inertia::render('Admin/Exams/Results', [
            'enrollment' => [
                'id' => $inscripcion->id,
                'user_id' => $inscripcion->user_id,
                'student_name' => $user ? ($user->nombre_completo ?: ($user->name ?? $user->email)) : 'Alumno',
                'student_email' => $user ? $user->email : '',
                'accepted' => $inscripcion->aceptado,
                'cohort_id' => $cohort ? $cohort->id : 0,
                'cohort_internal_id' => $cohort ? $cohort->identificador : '',
                'course_title' => $course ? $course->title : 'Curso',
            ],
            'exams' => $examenes,
            'notPresentedQuizzes' => $notPresentedQuizzes,
        ]);
    }

    /**
     * Toggle finished status for an exam attempt.
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
     * Toggle feedback visualization lock (retro_visualizado: 'no' = Habilitada, 'si' = Consumida).
     * Legacy URL: POST /admin/examen/retro
     */
    public function cambiarEstadoRetro(Request $request)
    {
        $examen = Exam::findOrFail($request->id);
        $examen->retro_visualizado = ($examen->retro_visualizado === 'si') ? 'no' : 'si';
        $examen->save();

        $statusLabel = $examen->retro_visualizado === 'si' ? 'Consumida' : 'Habilitada';
        $message = $examen->retro_visualizado === 'no'
            ? 'Retroalimentación habilitada nuevamente para el alumno.'
            : 'Retroalimentación marcada como consumida/bloqueada.';

        if ($request->wantsJson()) {
            return response()->json([
                'message' => $message,
                'nuevo_estado' => $examen->retro_visualizado,
                'estado_etiqueta' => $statusLabel,
            ]);
        }

        return back()->with('success', $message);
    }

    /**
     * Reset / delete an exam attempt so the student can re-take it.
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
     * Export individual student exam results report (Official PDF format).
     * Legacy URL: GET /admin/exportCalificaciones/{inscripcion_id}
     */
    public function exportReport($inscripcion_id)
    {
        $inscripcion = Enrollment::with(['user', 'scheduledCourse.course', 'exams.quiz'])->findOrFail($inscripcion_id);
        $user = $inscripcion->user;
        $cohort = $inscripcion->scheduledCourse;

        $lecciones = Leccion::with(['pruebas' => function ($q) {
            $q->where('activo', 'si');
        }])
            ->where('curso_id', $cohort ? $cohort->curso_id : 0)
            ->where('activo', 'si')
            ->get();

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
     * Export all student results for a cohort (Excel matrix or ZIP of PDFs).
     * Legacy URL: GET /admin/exportAllResults/{curso_id}
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

    protected function exportCohortExcel(ScheduledCourse $cohort)
    {
        $course = $cohort->course;

        $quizzes = Quiz::where('curso_id', $cohort->curso_id)
            ->where('activo', 'si')
            ->orderBy('id', 'asc')
            ->get();

        $enrollments = Enrollment::with(['user', 'exams.quiz'])
            ->where('curso_programado_id', $cohort->id)
            ->where('aceptado', 'si')
            ->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Calificaciones');

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

        $headers = ['#', 'ID Inscripción', 'Folio', 'Alumno', 'Correo', 'Universidad'];
        $colIndex = 1;
        foreach ($headers as $h) {
            $coord = Coordinate::stringFromColumnIndex($colIndex).'4';
            $sheet->setCellValue($coord, $h);
            $colIndex++;
        }

        $quizColMap = [];
        foreach ($quizzes as $quiz) {
            $coord = Coordinate::stringFromColumnIndex($colIndex).'4';
            $quizTitle = $quiz->titulo ?? $quiz->title ?? ('Evaluación #'.$quiz->id);
            $sheet->setCellValue($coord, $quizTitle);
            $quizColMap[$quiz->id] = $colIndex;
            $colIndex++;
        }

        $presentedCol = $colIndex;
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($presentedCol).'4', 'Exámenes Presentados');
        $colIndex++;

        $avgCol = $colIndex;
        $sheet->setCellValue(Coordinate::stringFromColumnIndex($avgCol).'4', 'Promedio General');

        $lastColLetter = Coordinate::stringFromColumnIndex($colIndex);
        $sheet->getStyle("A4:{$lastColLetter}4")->getFont()->setBold(true)->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle("A4:{$lastColLetter}4")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF002146');
        $sheet->getStyle("A4:{$lastColLetter}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

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
                $exam = $this->resolveBestExam($studentExams, (int) $quizId);
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

        $lastRowIndex = $rowIndex - 1;
        if ($lastRowIndex >= 5) {
            $sheet->getStyle("A4:{$lastColLetter}{$lastRowIndex}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFCCCCCC');
        }

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
        }])
            ->where('curso_id', $cohort->curso_id)
            ->where('activo', 'si')
            ->get();

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

    /**
     * @return array{0: float, 1: float} [minScore, maxScore]
     */
    protected function resolveScaleThresholds(?Quiz $quiz): array
    {
        $quizType = strtoupper((string) ($quiz?->tipo ?? $quiz?->type ?? 'EXANI'));
        if (str_contains($quizType, 'ENARM')) {
            $minScore = (float) ($quiz?->min_score ?? 60);
            $maxScore = (float) ($quiz?->score ?? 100);

            return [$minScore, $maxScore];
        }

        // Escala CENEVAL 700-1300: nivel satisfactorio >= 1000
        $minScore = ($quiz && isset($quiz->min_score) && (float) $quiz->min_score >= 700)
            ? (float) $quiz->min_score
            : 1000.0;
        $maxScore = ($quiz && isset($quiz->score) && (float) $quiz->score >= 700)
            ? (float) $quiz->score
            : 1300.0;

        return [$minScore, $maxScore];
    }

    protected function resolveBestExam(Collection $exams, int $quizId): ?Exam
    {
        $forQuiz = $exams->where('prueba_id', $quizId);
        if ($forQuiz->isEmpty()) {
            return null;
        }

        $finished = $forQuiz->where('finalizado', 'si');
        if ($finished->isNotEmpty()) {
            return $finished->sortByDesc(fn ($e) => (float) ($e->score_total ?? $e->score ?? 0))->first();
        }

        return $forQuiz->sortByDesc('id')->first();
    }
}
