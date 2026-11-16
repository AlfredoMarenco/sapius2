<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\ScheduledCourse;
use App\Models\User;

class CoursePolicy
{
    /**
     * Determine whether the user can manage the given course.
     */
    public function manageCourse(User $user, int|Course $courseId): bool
    {
        if (
            (method_exists($user, 'hasRole') && $user->hasRole('admin'))
            || (isset($user->role) && $user->role === 'admin')
        ) {
            return true;
        }

        $resolvedCourseId = $courseId instanceof Course ? (int) $courseId->id : (int) $courseId;

        return ScheduledCourse::where('curso_id', $resolvedCourseId)
            ->where('user_id', $user->id)
            ->exists();
    }
}
