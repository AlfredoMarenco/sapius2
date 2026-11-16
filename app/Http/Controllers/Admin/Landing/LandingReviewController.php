<?php

namespace App\Http\Controllers\Admin\Landing;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with(['user', 'scheduledCourse.course'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Review $r) {
                $course = $r->scheduledCourse?->course;
                return [
                    'id' => $r->id,
                    'user_name' => $r->name ?: ($r->user?->name ?? 'Alumno Sapius'),
                    'content' => $r->comment,
                    'rating' => (int) ($r->rating ?? 5),
                    'visible' => (bool) $r->visible,
                    'course_id' => $course?->id,
                    'course' => $course ? [
                        'id' => $course->id,
                        'title' => $course->title,
                    ] : null,
                    'created_at' => $r->created_at ? $r->created_at->format('d/m/Y') : null,
                ];
            });

        $courses = Course::select('id', 'titulo')->get()->map(fn ($c) => [
            'id' => $c->id,
            'title' => $c->title,
        ]);

        return Inertia::render('Admin/Landing/Reviews/Index', [
            'reviews' => $reviews,
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'visible' => 'nullable|boolean',
            'course_id' => 'nullable',
        ]);

        Review::create([
            'user_id' => auth()->id() ?? 1,
            'name' => strip_tags($validated['user_name']),
            'comment' => strip_tags($validated['content']),
            'rating' => $validated['rating'],
            'visible' => $request->has('visible') ? (bool) $request->boolean('visible') : true,
        ]);

        return redirect()->back()->with('success', 'Reseña creada correctamente');
    }

    public function update(Request $request, $reviewId)
    {
        $review = Review::findOrFail($reviewId);

        $validated = $request->validate([
            'user_name' => 'required|string|max:255',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'visible' => 'nullable|boolean',
            'course_id' => 'nullable',
        ]);

        $review->update([
            'name' => strip_tags($validated['user_name']),
            'comment' => strip_tags($validated['content']),
            'rating' => $validated['rating'],
            'visible' => $request->has('visible') ? (bool) $request->boolean('visible') : $review->visible,
        ]);

        return redirect()->back()->with('success', 'Reseña actualizada correctamente');
    }

    public function destroy($reviewId)
    {
        $review = Review::findOrFail($reviewId);
        $review->delete();

        return redirect()->back()->with('success', 'Reseña eliminada correctamente');
    }
}
