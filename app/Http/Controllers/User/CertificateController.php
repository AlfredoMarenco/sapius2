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
                    'issue_date' => $cert->fecha_emision ? $this->formatSpanishDate($cert->fecha_emision) : null,
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
            'issue_date' => $this->formatSpanishDate($certificate->fecha_emision),
            'validation_code' => $certificate->codigo_validacion,
            'logo_base64' => $this->getLogoBase64(),
        ];

        // Se usa view de pdf/certificate
        $pdf = Pdf::loadView('pdf.certificate', $data)
            ->setPaper('letter', 'landscape'); // Formato horizontal

        $filename = 'Certificado_' . str_replace(' ', '_', $data['course_name']) . '_' . $data['validation_code'] . '.pdf';
        
        return $pdf->stream($filename);
    }
}
