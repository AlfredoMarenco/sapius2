<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
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
            'issue_date' => $certificate->fecha_emision ? $certificate->fecha_emision->translatedFormat('d \d\e F \d\e Y') : date('d/m/Y'),
            'validation_code' => $certificate->codigo_validacion,
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

        $query = Enrollment::where('curso_programado_id', $cohortId)
            ->where('aceptado', 'si');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $enrollments = $query->get();
        $emitted = 0;

        foreach ($enrollments as $enrollment) {
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

        return redirect()->back()->with('success', "Se emitieron {$emitted} certificados correctamente.");
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
