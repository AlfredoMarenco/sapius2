<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InteractivePdf;
use App\Models\InteractivePdfAnswer;
use App\Models\Lesson;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InteractivePdfController extends Controller
{
    /**
     * Display a listing of interactive PDFs for a given lesson or module.
     */
    public function index(Request $request, $leccion_id)
    {
        $lesson = Lesson::withoutGlobalScopes()->with('course')->findOrFail($leccion_id);
        $materials = InteractivePdf::where('leccion_id', $leccion_id)
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Admin/InteractivePdfs/Index', [
            'lesson' => $lesson,
            'materials' => $materials,
        ]);
    }

    /**
     * Store a newly created interactive PDF in private storage (storage/app/files/interactive_pdfs).
     */
    public function store(Request $request)
    {
        $request->validate([
            'leccion_id' => 'required|exists:lecciones,id',
            'titulo' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf|max:20480',
            'allow_download' => 'nullable|boolean',
        ]);

        $file = $request->file('file');
        $path = $file->store('files/interactive_pdfs', 'local');

        InteractivePdf::create([
            'leccion_id' => $request->leccion_id,
            'titulo' => $request->titulo,
            'file_path' => basename($path),
            'allow_download' => $request->boolean('allow_download'),
            'fields_config' => [],
        ]);

        return redirect()->back()->with('success', 'PDF interactivo subido exitosamente.');
    }

    /**
     * Update the metadata.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'allow_download' => 'nullable|boolean',
        ]);

        $material = InteractivePdf::findOrFail($id);
        $material->titulo = $request->titulo;
        $material->allow_download = $request->boolean('allow_download');
        $material->save();

        return redirect()->back()->with('success', 'PDF interactivo actualizado exitosamente.');
    }

    /**
     * Remove the PDF and delete the physical file from disk.
     */
    public function destroy($id)
    {
        $material = InteractivePdf::findOrFail($id);
        $filename = basename((string) $material->file_path);

        if ($filename !== '') {
            Storage::disk('local')->delete('files/interactive_pdfs/'.$filename);
            Storage::disk('public')->delete('files/interactive_pdfs/'.$filename);
        }

        $material->delete();

        return redirect()->back()->with('success', 'PDF eliminado.');
    }

    /**
     * Editor view to add draggable boxes.
     */
    public function edit(Request $request, $id)
    {
        $material = InteractivePdf::findOrFail($id);
        $lesson = Lesson::withoutGlobalScopes()->with('course')->findOrFail($material->leccion_id);
        $material->setRelation('lesson', $lesson);

        $prefix = $request->is('instructor/*') ? '/instructor' : '/admin';
        $material->setAttribute('file_url', "{$prefix}/material-pdfs/{$material->id}/stream");

        return Inertia::render('Admin/InteractivePdfs/Editor', [
            'material' => $material,
        ]);
    }

    /**
     * Save the boxes layout.
     */
    public function saveLayout(Request $request, $id)
    {
        $validated = $request->validate([
            'fields_config' => 'present|array',
        ]);

        $material = InteractivePdf::findOrFail($id);
        $material->fields_config = $validated['fields_config'];
        $material->save();

        return redirect()->back()->with('success', 'Configuración de campos guardada.');
    }

    /**
     * Review student's answers.
     */
    public function review(Request $request, $id, $user_id)
    {
        $material = InteractivePdf::findOrFail($id);
        $lesson = Lesson::withoutGlobalScopes()->with('course')->findOrFail($material->leccion_id);
        $material->setRelation('lesson', $lesson);

        $prefix = $request->is('instructor/*') ? '/instructor' : '/admin';
        $material->setAttribute('file_url', "{$prefix}/material-pdfs/{$material->id}/stream");

        $user = User::findOrFail($user_id);
        $answer = InteractivePdfAnswer::where('material_pdf_id', $id)
            ->where('user_id', $user_id)
            ->first();

        return Inertia::render('Admin/InteractivePdfs/Review', [
            'material' => $material,
            'student' => $user,
            'answers' => $answer ? $answer->respuestas : null,
        ]);
    }

    /**
     * Authenticated stream for Admin / Instructor editor & review.
     */
    public function stream(Request $request, $id)
    {
        $material = InteractivePdf::findOrFail($id);
        $lesson = Lesson::withoutGlobalScopes()->findOrFail($material->leccion_id);

        $user = Auth::user();
        if ($user && $user->hasRole('instructor') && ! $user->hasRole('admin')) {
            $isAssigned = ScheduledCourse::where('curso_id', $lesson->curso_id)
                ->where('user_id', $user->id)
                ->exists();
            if (! $isAssigned) {
                abort(403, 'No tienes autorización para acceder a este material.');
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

        return response()->file($resolved, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.addslashes($filename).'"',
            'Cache-Control' => 'private, no-store, no-cache, must-revalidate',
        ]);
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
