<?php

namespace App\Http\Controllers\Admin\Landing;

use App\Http\Controllers\Controller;
use App\Models\LandingReview;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingReviewController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Landing/Reviews/Index', [
            'reviews' => LandingReview::with('course')->get(),
            'courses' => Course::select('id', 'title')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'course_id' => 'nullable|exists:courses,id'
        ]);

        LandingReview::create($validated);

        return redirect()->back()->with('success', 'Reseña creada correctamente');
    }

    public function update(Request $request, LandingReview $review)
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'course_id' => 'nullable|exists:courses,id'
        ]);

        $review->update($validated);

        return redirect()->back()->with('success', 'Reseña actualizada correctamente');
    }

    public function destroy(LandingReview $review)
    {
        $review->delete();

        return redirect()->back()->with('success', 'Reseña eliminada correctamente');
    }
}
