<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\InteractivePdf;
use App\Models\InteractivePdfAnswer;
use App\Models\Lesson;
use App\Services\EnrollmentAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InteractivePdfController extends Controller
{
    public function __construct(
        protected EnrollmentAccessService $accessService
    ) {}

    /**
     * Show the Interactive PDF for the student to solve.
     */
    public function show(Request $request, $id)
    {
        $material = InteractivePdf::findOrFail($id);
        [$lesson, $enrollment] = $this->authorizeStudentAccess($request, $material);

        $material->setRelation('lesson', $lesson);
        $material->setAttribute('file_url', "/alumno/material-pdfs/{$material->id}/stream?viewer=1&curso_programado_id={$enrollment->curso_programado_id}");

        $answer = InteractivePdfAnswer::where('material_pdf_id', $material->id)
            ->where('user_id', Auth::id())
            ->first();

        return Inertia::render('Student/InteractivePdf/Solve', [
            'material' => $material,
            'curso_programado_id' => $enrollment->curso_programado_id,
            'existingAnswers' => $answer ? $answer->respuestas : new \stdClass,
        ]);
    }

    /**
     * Save answers submitted by the student.
     */
    public function saveAnswers(Request $request, $id)
    {
        $material = InteractivePdf::findOrFail($id);
        $this->authorizeStudentAccess($request, $material);

        $validated = $request->validate([
            'answers' => 'present|array',
        ]);

        $userId = Auth::id();
        $answer = InteractivePdfAnswer::firstOrNew([
            'material_pdf_id' => $material->id,
            'user_id' => $userId,
        ]);

        $answer->respuestas = $validated['answers'];
        $answer->save();

        return redirect()->back()->with('success', 'Respuestas guardadas correctamente.');
    }

    /**
     * Stream authenticated PDF for student viewer, blocking direct downloads when !allow_download.
     */
    public function stream(Request $request, $id)
    {
        $material = InteractivePdf::findOrFail($id);
        $this->authorizeStudentAccess($request, $material);

        $wantsDownload = $request->boolean('download');

        if (! $material->allow_download) {
            $isViewerRequest = $request->query('viewer') === '1'
                || $request->header('X-Pdf-Viewer') === 'sapius';
            $isDirectNavigation = $request->header('Sec-Fetch-Dest') === 'document';

            if ($wantsDownload || $isDirectNavigation || ! $isViewerRequest) {
                abort(403, 'La descarga directa de este material PDF no está permitida.');
            }
        }

        $filename = basename((string) $material->file_path);
        if ($filename === '' || str_contains((string) $material->file_path, '..')) {
            abort(404);
        }

        $resolved = $this->resolvePdfPath($filename);
        if (! $resolved) {
            abort(404, 'El archivo físico del PDF no existe.');
        }

        $safeDownloadName = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', (string) $material->titulo) ?: 'material';
        $disposition = ($wantsDownload && $material->allow_download)
            ? "attachment; filename=\"{$safeDownloadName}.pdf\""
            : 'inline; filename="sapius_material.pdf"';

        return response()->file($resolved, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition,
            'Cache-Control' => 'private, no-store, no-cache, must-revalidate',
            'Pragma' => 'no-cache',
        ]);
    }

    /**
     * @return array{0: Lesson, 1: Enrollment}
     */
    protected function authorizeStudentAccess(Request $request, InteractivePdf $material): array
    {
        $user = Auth::user();
        $lesson = Lesson::withoutGlobalScopes()
            ->with('course')
            ->where('activo', 'si')
            ->findOrFail($material->leccion_id);

        $preferredCohortId = $request->integer('curso_programado_id') ?: null;
        $enrollment = $this->accessService->requireCourseEnrollment($user, (int) $lesson->curso_id, $preferredCohortId);

        $isModule = empty($lesson->leccion_id) || (int) $lesson->leccion_id === 0;
        $schedule = $this->accessService->evaluateSchedule(
            (int) $enrollment->curso_programado_id,
            (int) $user->id,
            (int) $lesson->id,
            $isModule ? null : (int) $lesson->leccion_id
        );

        if (! ($schedule['is_available'] ?? true)) {
            abort(403, 'Este material aún no está disponible o su periodo de acceso ha concluido.');
        }

        return [$lesson, $enrollment];
    }

    protected function resolvePdfPath(string $filename): ?string
    {
        $roots = [
            storage_path('app/files/interactive_pdfs'),
            storage_path('app/public/files/interactive_pdfs'),
        ];

        foreach ($roots as $root) {
            $realRoot = realpath($root);
            if ($realRoot === false) {
                continue;
            }
            $realFile = realpath($realRoot.DIRECTORY_SEPARATOR.$filename);
            if ($realFile !== false && is_file($realFile) && str_starts_with($realFile, rtrim($realRoot, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR)) {
                return $realFile;
            }
        }

        return null;
    }
}
