<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Admin\CourseBuilderController as BaseCourseBuilderController;
use App\Models\Course;
use App\Models\ScheduledCourse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseBuilderController extends BaseCourseBuilderController
{
    /**
     * Display the course builder interface for instructor with authorization check.
     *
     * @param  \App\Models\Course|int|string  $id
     * @return \Inertia\Response
     */
    public function show($id)
    {
        $user = auth()->user();
        $isAdmin = ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) || ($user && isset($user->role) && $user->role === 'admin');

        $course = $id instanceof Course ? $id : Course::findOrFail($id);

        if (!$isAdmin) {
            $isAssigned = $user && $course->scheduledCourses()->where('user_id', $user->id)->exists();
            if (!$isAssigned) {
                abort(403, 'No tienes autorización para acceder a este curso.');
            }
        }

        return Inertia::render('Admin/Courses/Builder', [
            'course' => $course->load([
                'category',
                'modules.lessons.media',
                'modules.lessons.quizzes.questions.answers',
                'modules.lessons.homeworkAssignments',
            ]),
        ]);
    }
}
