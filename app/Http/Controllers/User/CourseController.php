<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $enrollments = Enrollment::with(['scheduledCourse.course.category', 'scheduledCourse.instructor'])
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get()
            ->map(function($enrollment) {
                $scheduled = $enrollment->scheduledCourse;
                return [
                    'id' => $enrollment->id,
                    'scheduled_id' => $scheduled->id,
                    'title' => $scheduled->course->title,
                    'category' => $scheduled->course->category->name,
                    'instructor' => $scheduled->instructor->name,
                    'image' => $scheduled->course->image,
                    'progress' => rand(0, 100), // Mock progress for now
                    'last_accessed' => $enrollment->updated_at->format('d M, Y'),
                ];
            });

        return Inertia::render('User/Courses/Index', [
            'enrollments' => $enrollments,
        ]);
    }

    public function show(Request $request, Enrollment $enrollment)
    {
        // Ensure user owns this enrollment
        if ($enrollment->user_id !== $request->user()->id) {
            abort(403);
        }

        $enrollment->load(['scheduledCourse.course.modules.lessons', 'scheduledCourse.instructor']);
        $scheduled = $enrollment->scheduledCourse;

        return Inertia::render('User/Courses/Show', [
            'enrollment_id' => $enrollment->id,
            'course' => [
                'id' => $scheduled->id,
                'title' => $scheduled->course->title,
                'description' => $scheduled->course->description,
                'instructor' => $scheduled->instructor->name,
                'modules' => $scheduled->course->modules->map(function($m) {
                    $now = Carbon::now();
                    $isLocked = $m->is_scheduled && ($m->available_at > $now || ($m->expires_at && $m->expires_at < $now));
                    
                    return [
                        'id' => $m->id,
                        'title' => $m->title,
                        'is_locked' => $isLocked,
                        'available_at' => $m->available_at ? $m->available_at->format('d M, Y H:i') : null,
                        'expires_at' => $m->expires_at ? $m->expires_at->format('d M, Y H:i') : null,
                        'lessons' => $m->lessons->map(function($l) use ($now, $isLocked) {
                            $lessonLocked = $isLocked || ($l->is_scheduled && ($l->available_at > $now || ($l->expires_at && $l->expires_at < $now)));
                            return [
                                'id' => $l->id,
                                'title' => $l->title,
                                'is_locked' => $lessonLocked,
                                'available_at' => $l->available_at ? $l->available_at->format('d M, Y H:i') : null,
                                'is_completed' => false, // Mock
                            ];
                        }),
                    ];
                }),
            ],
        ]);
    }
}
