<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ScheduledCourse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    protected function formatSpanishDate($date): string
    {
        if (!$date) {
            $date = now();
        }
        $c = \Carbon\Carbon::parse($date);
        $meses = [
            1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
            5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
            9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
        ];
        $mes = $meses[(int) $c->format('n')] ?? 'enero';
        return $c->format('d') . ' de ' . $mes . ' de ' . $c->format('Y');
    }

    protected function getLogoBase64(): ?string
    {
        $candidates = [
            public_path('img/brand2026/logo-sapius-dark.png'),
            public_path('img/brand/logo.png'),
            public_path('img/logo-sapius.png'),
            public_path('img/logo.png'),
        ];

        foreach ($candidates as $path) {
            if (file_exists($path)) {
                $data = @file_get_contents($path);
                if ($data !== false) {
                    return 'data:image/png;base64,' . base64_encode($data);
                }
            }
        }
        return null;
    }

    protected function hasStudentApprovedCohort(Enrollment $enrollment, ScheduledCourse $cohort): bool
    {
        $course = $cohort->course;
        if (!$course) {
            return false;
        }

        // Collect all active lessons and quizzes for the course
        $lessonIds = [];
        $quizIds = [];
        foreach ($course->modules ?? [] as $module) {
            if ($module->activo !== 'si') continue;
            foreach ($module->lessons ?? [] as $lesson) {
                if ($lesson->activo !== 'si') continue;
                $lessonIds[] = $lesson->id;
                foreach ($lesson->quizzes ?? [] as $quiz) {
                    if ($quiz->activo === 'si') {
                        $quizIds[] = $quiz->id;
                    }
                }
            }
        }

        if (empty($lessonIds) && empty($quizIds)) {
            return false;
        }

        // Check completed lessons
        $completedCount = 0;
        if (!empty($lessonIds)) {
            $completedCount = DB::table('leccion_user')
                ->where('user_id', $enrollment->user_id)
                ->where('curso_programado_id', $cohort->id)
                ->whereIn('leccion_id', $lessonIds)
                ->count();
        }

        // Check completed & approved exams
        $passedExamsCount = 0;
        if (!empty($quizIds)) {
            $exams = Exam::where('inscripcion_id', $enrollment->id)
                ->whereIn('prueba_id', $quizIds)
                ->where('finalizado', 'si')
                ->get();

            foreach ($exams as $exam) {
                $totalQ = (int) ($exam->total_preguntas ?? 0);
                $correctQ = (int) ($exam->total_correctas ?? 0);
                $score = (float) ($exam->score_total ?? 0);
                $ratio = $totalQ > 0 ? ($correctQ / $totalQ) : 0;

                if ($ratio >= 0.6 || $score >= 1000) {
                    $passedExamsCount++;
                }
            }
        }

        // If the course has quizzes, student must have passed at least one quiz (or completed all lessons if no quizzes exist)
        if (!empty($quizIds)) {
            return $passedExamsCount > 0;
        }

        return !empty($lessonIds) && $completedCount >= count($lessonIds);
    }
    /**
     * Display a listing of the certificates.
     */
    public function index(Request $request)
    {
        $query = Certificate::with(['user', 'scheduledCourse.course']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('codigo_validacion', 'like', "%{$search}%");
        }

        $certificates = $query->orderBy('fecha_emision', 'desc')->paginate(20)->through(function ($cert) {
            return [
                'id' => $cert->id,
                'student_name' => $cert->user ? $cert->user->name : 'N/A',
                'student_email' => $cert->user ? $cert->user->email : 'N/A',
                'course_title' => $cert->scheduledCourse && $cert->scheduledCourse->course ? $cert->scheduledCourse->course->title : 'N/A',
                'cohort_id' => $cert->scheduledCourse ? $cert->scheduledCourse->identificador : 'N/A',
                'validation_code' => $cert->codigo_validacion,
                'issue_date' => $cert->fecha_emision ? $cert->fecha_emision->format('d/m/Y') : null,
            ];
        });

        // Obtener cohortes activas para el modal de emisión manual
        $cohorts = ScheduledCourse::with('course')->orderBy('fecha_inicio', 'desc')->get()->map(function($c) {
            return [
                'id' => $c->id,
                'title' => ($c->course ? $c->course->title : 'Curso') . ' - ' . $c->identificador,
            ];
        });

        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates,
            'filters' => $request->only('search'),
            'cohorts' => $cohorts
        ]);
    }

    /**
     * Generate a specific certificate as PDF stream.
     */
    public function download($id)
    {
        $certificate = Certificate::with(['user', 'scheduledCourse.course', 'scheduledCourse.instructor'])->findOrFail($id);

        $data = [
            'student_name' => $certificate->user ? $certificate->user->name : 'N/A',
            'course_name' => $certificate->scheduledCourse && $certificate->scheduledCourse->course ? $certificate->scheduledCourse->course->title : 'N/A',
            'instructor_name' => $certificate->scheduledCourse && $certificate->scheduledCourse->instructor ? $certificate->scheduledCourse->instructor->name : 'Instructor',
            'issue_date' => $this->formatSpanishDate($certificate->fecha_emision),
            'validation_code' => $certificate->codigo_validacion,
            'logo_base64' => $this->getLogoBase64(),
        ];

        // Se usa view de pdf/certificate
        $pdf = Pdf::loadView('pdf.certificate', $data)
            ->setPaper('letter', 'landscape'); // Formato horizontal

        $filename = 'Certificado_' . str_replace(' ', '_', $data['student_name']) . '_' . $data['validation_code'] . '.pdf';
        
        return $pdf->stream($filename);
    }

    /**
     * Emitir certificados masivamente o individualmente a una cohorte.
     */
    public function emit(Request $request)
    {
        $request->validate([
            'curso_programado_id' => 'required|exists:cursos_programados,id',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $cohortId = $request->curso_programado_id;
        $userId = $request->user_id;

        $cohort = ScheduledCourse::with(['course.modules.lessons.quizzes'])->findOrFail($cohortId);

        $query = Enrollment::where('curso_programado_id', $cohortId)
            ->where('aceptado', 'si');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $enrollments = $query->get();
        $emitted = 0;
        $skippedNotApproved = 0;

        foreach ($enrollments as $enrollment) {
            // Si es emisión masiva (sin user_id específico), validar que el alumno haya aprobado / completado el curso
            if (!$userId && !$this->hasStudentApprovedCohort($enrollment, $cohort)) {
                $skippedNotApproved++;
                continue;
            }

            // Verificar que no tenga ya un certificado para esta cohorte
            $exists = Certificate::where('user_id', $enrollment->user_id)
                ->where('curso_programado_id', $cohortId)
                ->exists();

            if (!$exists) {
                Certificate::create([
                    'user_id' => $enrollment->user_id,
                    'curso_programado_id' => $cohortId,
                    'codigo_validacion' => strtoupper(Str::random(10)), // Código único de 10 caracteres
                    'fecha_emision' => now(),
                ]);
                $emitted++;
            }
        }

        if ($emitted === 0 && $skippedNotApproved > 0) {
            return redirect()->back()->with('error', "No se emitieron certificados: ninguno de los {$skippedNotApproved} alumnos inscritos ha completado las lecciones ni aprobado las evaluaciones del curso.");
        }

        return redirect()->back()->with('success', "Se emitieron {$emitted} certificados correctamente." . ($skippedNotApproved > 0 ? " ({$skippedNotApproved} alumnos omitidos por no haber aprobado aún)." : ''));
    }

    /**
     * Revoke / Delete a certificate.
     */
    public function destroy($id)
    {
        $certificate = Certificate::findOrFail($id);
        $certificate->delete();

        return redirect()->back()->with('success', 'Certificado revocado exitosamente.');
    }
}
