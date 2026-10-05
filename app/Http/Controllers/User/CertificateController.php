<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class CertificateController extends Controller
{
    /**
     * Display a listing of the user's certificates.
     */
    public function index()
    {
        $certificates = Certificate::with(['scheduledCourse.course'])
            ->where('user_id', Auth::id())
            ->orderBy('fecha_emision', 'desc')
            ->get()
            ->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'course_title' => $cert->scheduledCourse && $cert->scheduledCourse->course ? $cert->scheduledCourse->course->title : 'Curso no disponible',
                    'cohort_id' => $cert->scheduledCourse ? $cert->scheduledCourse->identificador : 'N/A',
                    'validation_code' => $cert->codigo_validacion,
                    'issue_date' => $cert->fecha_emision ? $cert->fecha_emision->translatedFormat('d \d\e F \d\e Y') : null,
                ];
            });

        return Inertia::render('User/Certificates/Index', [
            'certificates' => $certificates
        ]);
    }

    /**
     * Generate user's specific certificate as PDF stream.
     */
    public function download($id)
    {
        $certificate = Certificate::with(['user', 'scheduledCourse.course', 'scheduledCourse.instructor'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

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

        $filename = 'Certificado_' . str_replace(' ', '_', $data['course_name']) . '_' . $data['validation_code'] . '.pdf';
        
        return $pdf->stream($filename);
    }
}
