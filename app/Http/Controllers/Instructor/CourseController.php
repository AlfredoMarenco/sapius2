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
        return Inertia::render('Instructor/Courses/Show', [
            'course' => $course
        ]);
    }
}
