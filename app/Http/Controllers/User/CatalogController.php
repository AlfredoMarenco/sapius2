<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get IDs of courses the user is already enrolled in
        $enrolledCourseIds = $user->enrollments()
            ->with('scheduledCourse')
            ->get()
            ->pluck('scheduledCourse.course_id')
            ->unique()
            ->toArray();

        // Fetch courses (ScheduledCourse) that are active and NOT enrolled
        // Eager load lessons to get accurate counts
        $availableCourses = ScheduledCourse::with(['course.category', 'course.modules.lessons', 'instructor'])
            ->where('is_active', true)
            ->whereHas('course', function($query) use ($enrolledCourseIds) {
                $query->whereNotIn('id', $enrolledCourseIds)
                      ->where('is_active', true);
            })
            ->get()
            ->map(function($scheduled) {
                return [
                    'id' => $scheduled->id,
                    'course_id' => $scheduled->course_id,
                    'title' => $scheduled->course->title,
                    'category' => $scheduled->course->category->name,
                    'instructor' => $scheduled->instructor->name,
                    'price' => $scheduled->price,
                    'image' => $scheduled->course->image,
                    'description' => $scheduled->course->description,
                    'modules_count' => $scheduled->course->modules->count(),
                    'lessons_count' => $scheduled->course->modules->sum(function($m) { return $m->lessons->count(); }),
                    'start_date' => $scheduled->start_date ? $scheduled->start_date->format('d M, Y') : null,
                ];
            });

        return Inertia::render('User/Catalog/Index', [
            'courses' => $availableCourses,
            'categories' => Category::all(),
        ]);
    }

    public function show(ScheduledCourse $scheduled)
    {
        $scheduled->load(['course.category', 'course.modules.lessons', 'instructor']);
        
        return Inertia::render('User/Catalog/Show', [
            'course' => [
                'id' => $scheduled->id,
                'title' => $scheduled->course->title,
                'category' => $scheduled->course->category->name,
                'instructor' => $scheduled->instructor->name,
                'price' => $scheduled->price,
                'image' => $scheduled->course->image,
                'description' => $scheduled->course->description,
                'modules' => $scheduled->course->modules->map(function($m) {
                    return [
                        'id' => $m->id,
                        'title' => $m->title,
                        'description' => $m->description,
                        'lessons' => $m->lessons->map(function($l) {
                            return [
                                'id' => $l->id,
                                'title' => $l->title,
                            ];
                        }),
                    ];
                }),
            ],
        ]);
    }

    public function enroll(Request $request, ScheduledCourse $scheduled)
    {
        $user = $request->user();

        // Check if already enrolled (double-check prevention)
        $existing = Enrollment::where('user_id', $user->id)
            ->where('scheduled_course_id', $scheduled->id)
            ->first();

        if ($existing) {
            return redirect()->route('user.courses.index')->with('error', 'Ya estás inscrito en este curso.');
        }

        // Create enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'scheduled_course_id' => $scheduled->id,
            'status' => 'active',
            'enrolled_at' => Carbon::now(),
        ]);

        return redirect()->route('user.courses.index')->with('success', '¡Enhorabuena! Te has inscrito correctamente.');
    }
}
