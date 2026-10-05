<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InteractivePdf;
use App\Models\Lesson;
use App\Models\InteractivePdfAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class InteractivePdfController extends Controller
{
    /**
     * Display a listing of interactive PDFs for a given lesson.
     */
    public function index(Request $request, $leccion_id)
    {
        $lesson = Lesson::with('course')->findOrFail($leccion_id);
        $materials = InteractivePdf::where('leccion_id', $leccion_id)->get();

        return Inertia::render('Admin/InteractivePdfs/Index', [
            'lesson' => $lesson,
            'materials' => $materials
        ]);
    }

    /**
     * Store a newly created interactive PDF in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'leccion_id' => 'required|exists:lecciones,id',
            'titulo' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        $file = $request->file('file');
        // Store on local disk 'public' or directly on 'public/files/interactive_pdfs' depending on old logic
        // Original logic: Storage::put('files/interactive_pdfs', $file); -> local disk, storage/app/files/...
        // We will store it in public disk so it's easily accessible by the frontend
        $path = $file->store('files/interactive_pdfs', 'public');

        $material = InteractivePdf::create([
            'leccion_id' => $request->leccion_id,
            'titulo' => $request->titulo,
            'file_path' => basename($path),
            'fields_config' => [],
            'allow_download' => $request->has('allow_download') && $request->allow_download ? 1 : 0
        ]);

        return redirect()->back()->with('success', 'PDF interactivo subido exitosamente.');
    }

    /**
     * Update the metadata
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
        ]);

        $material = InteractivePdf::findOrFail($id);
        $material->titulo = $request->titulo;
        $material->allow_download = $request->has('allow_download') && $request->allow_download ? 1 : 0;
        $material->save();

        return redirect()->back()->with('success', 'PDF interactivo actualizado exitosamente.');
    }

    /**
     * Remove the PDF
     */
    public function destroy($id)
    {
        $material = InteractivePdf::findOrFail($id);
        // We might want to delete the physical file too: Storage::disk('public')->delete('files/interactive_pdfs/' . $material->file_path);
        $material->delete();

        return redirect()->back()->with('success', 'PDF eliminado.');
    }

    /**
     * Editor view to add draggable boxes
     */
    public function edit($id)
    {
        $material = InteractivePdf::with('lesson.course')->findOrFail($id);
        
        // Ensure full URL for the frontend
        $material->file_url = asset('storage/files/interactive_pdfs/' . $material->file_path);

        return Inertia::render('Admin/InteractivePdfs/Editor', [
            'material' => $material
        ]);
    }

    /**
     * Save the boxes layout
     */
    public function saveLayout(Request $request, $id)
    {
        $material = InteractivePdf::findOrFail($id);
        $material->fields_config = $request->input('fields_config', []);
        $material->save();

        return redirect()->back()->with('success', 'Configuración de campos guardada.');
    }

    /**
     * Review student's answers
     */
    public function review($id, $user_id)
    {
        $material = InteractivePdf::with('lesson.course')->findOrFail($id);
        $material->file_url = asset('storage/files/interactive_pdfs/' . $material->file_path);
        
        $user = User::findOrFail($user_id);
        $answer = InteractivePdfAnswer::where('material_pdf_id', $id)
                                      ->where('user_id', $user_id)
                                      ->first();

        return Inertia::render('Admin/InteractivePdfs/Review', [
            'material' => $material,
            'student' => $user,
            'answers' => $answer ? $answer->respuestas : null
        ]);
    }
}
