<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class OpinionController extends Controller
{
    public function index()
    {
        $reviews = Review::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('User/Opinion/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:50',
        ]);

        $badWords = [
            'puta', 'puto', 'pendejo', 'pendeja', 'mierda', 'chingar', 'chingada', 'chingado',
            'verga', 'cabrón', 'cabrona', 'culero', 'culera', 'imbécil', 'idiota', 'estúpido', 'estúpida',
            'zorra', 'perra', 'maricón', 'marica', 'mamón', 'mamona', 'pinche', 'asco',
            'malo', 'pésimo', 'horrible', 'asqueroso', 'terrible', 'basura', 'fraude', 'falso',
            'estafa', 'engaño', 'mentira', 'timar', 'robo', 'inútil', 'decepción', 'engañoso',
            'aburrido', 'mediocre', 'desastre', 'pobre', 'deficiente', 'inservible', 'vergonzoso',
            'curso malo', 'curso pésimo', 'curso horrible', 'curso basura', 'profesor malo',
            'profesor pésimo', 'no sirve', 'no aprendes', 'malísimo', 'pérdida de tiempo', 'culo', 'pene',
        ];

        $comment = strtolower($request->comment);
        $containsBadWord = false;

        foreach ($badWords as $word) {
            if (strpos($comment, $word) !== false) {
                $containsBadWord = true;
                break;
            }
        }

        if ($containsBadWord) {
            $visible = 0;
            $rating = 0;
        } else {
            $rating = $request->rating;
            $visible = $request->rating >= 4 ? 1 : 0;
        }

        $enrollment = Enrollment::where('user_id', Auth::id())
            ->where('aceptado', 'si')
            ->orderBy('id', 'desc')
            ->first();

        if (! $enrollment) {
            $enrollment = Enrollment::where('user_id', Auth::id())
                ->orderBy('id', 'desc')
                ->first();
        }

        $review = new Review([
            'user_id' => Auth::id(),
            'name' => strip_tags($request->name),
            'rating' => $rating,
            'comment' => strip_tags($request->comment),
            'visible' => $visible,
        ]);

        if (Schema::hasColumn('reviews', 'curso_programado_id')) {
            $review->curso_programado_id = $enrollment?->curso_programado_id;
        } elseif (Schema::hasColumn('reviews', 'course_id')) {
            $review->course_id = $enrollment?->curso_programado_id;
        }

        $review->save();

        return redirect()->back()->with('success', '¡Gracias por tu opinión! Tu comentario ha sido enviado.');
    }
}
