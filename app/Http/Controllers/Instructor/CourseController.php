<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        // El instructor solo debería ver los cursos asignados a él.
        // Asumiendo que hay una relación de instructor en el modelo Course o en ScheduledCourse
        // Por ahora cargamos todos para mantener paridad básica, pero debería filtrarse
        $courses = Course::with('category')->get();
        return Inertia::render('Instructor/Courses/Index', [
            'courses' => $courses
        ]);
    }

    public function show($id)
    {
        $course = Course::with(['category', 'modules.lessons.media', 'modules.lessons.quizzes'])->findOrFail($id);
        
        $scheduledCourses = \App\Models\ScheduledCourse::where('curso_id', $id)
            ->with(['students' => function($q) {
                $q->select('users.id', 'users.name', 'users.last_name', 'users.email', 'users.username', 'users.avatar');
            }])->get();

        $enrolledStudents = collect();
        foreach ($scheduledCourses as $cohort) {
            foreach ($cohort->students as $student) {
                $enrolledStudents->push([
                    'id' => $student->id,
                    'name' => trim($student->name . ' ' . $student->last_name),
                    'email' => $student->email,
                    'avatar' => $student->avatar,
                    'cohort' => $cohort->internal_id ?? ('Grupo ' . $cohort->id),
                    'enrolled_at' => $student->pivot->created_at,
                    'status' => $student->pivot->aceptado,
                ]);
            }
        }

        return Inertia::render('Instructor/Courses/Show', [
            'course' => $course,
            'students' => $enrolledStudents->values(),
            'total_cohorts' => $scheduledCourses->count(),
        ]);
    }
}
