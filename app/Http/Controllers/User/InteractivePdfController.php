<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\InteractivePdf;
use App\Models\InteractivePdfAnswer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class InteractivePdfController extends Controller
{
    /**
     * Show the Interactive PDF for the student to solve
     */
    public function show($id)
    {
        $material = InteractivePdf::with('lesson.course')->findOrFail($id);
        $material->file_url = asset('storage/files/interactive_pdfs/' . $material->file_path);
        
        $user_id = Auth::id();
        $answer = InteractivePdfAnswer::where('material_pdf_id', $id)
                                      ->where('user_id', $user_id)
                                      ->first();

        return Inertia::render('Student/InteractivePdf/Solve', [
            'material' => $material,
            'existingAnswers' => $answer ? $answer->respuestas : new \stdClass()
        ]);
    }

    /**
     * Save answers submitted by the student
     */
    public function saveAnswers(Request $request, $id)
    {
        $material = InteractivePdf::findOrFail($id);
        $user_id = Auth::id();
        
        $answer = InteractivePdfAnswer::firstOrNew([
            'material_pdf_id' => $id,
            'user_id' => $user_id
        ]);
        
        $answer->respuestas = $request->input('answers', []);
        $answer->save();

        return redirect()->back()->with('success', 'Respuestas guardadas correctamente.');
    }
}
