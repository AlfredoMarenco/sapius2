<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduledCourseController extends Controller
{
    /**
     * Display listing of scheduled cohorts
     * Legacy URL: /admin/registro/programacion
     */
    public function index(Request $request)
    {
        $cursoId = $request->input('curso_id');
        $query = ScheduledCourse::with(['course', 'instructor'])->withCount('enrollments');

        if ($cursoId) {
            $query->where('curso_id', $cursoId);
        }

        $schedules = $query->orderBy('id', 'desc')->paginate(15)->withQueryString()->through(function ($s) {
            return [
                'id' => $s->id,
                'course_id' => $s->curso_id,
                'course_title' => $s->course ? $s->course->title : 'Sin curso asignado',
                'course_image' => $s->course ? $s->course->image : null,
                'internal_id' => $s->identificador,
                'instructor_name' => $s->instructor ? $s->instructor->name : 'No asignado',
                'start_date' => $s->fecha_inicio ? $s->fecha_inicio->format('d/m/Y') : null,
                'end_date' => $s->fecha_fin ? $s->fecha_fin->format('d/m/Y') : null,
                'price' => $s->precio,
                'students_count' => $s->enrollments_count,
                'is_active' => $s->activo === 'si',
            ];
        });

        $courses = Course::where('activo', 'si')->select('id', 'titulo')->get()->map(fn($c) => [
            'id' => $c->id,
            'title' => $c->titulo,
        ]);

        $instructors = User::whereHas('roles', function ($q) {
            $q->whereIn('slug', ['admin', 'instructor']);
        })->get()->map(fn($u) => [
            'id' => $u->id,
            'name' => $u->name,
        ]);

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $schedules,
            'courses' => $courses,
            'instructors' => $instructors,
            'selectedCourseId' => $cursoId ? (int)$cursoId : null,
        ]);
    }

    public function store(Request $request, Course $course = null)
    {
        $courseId = $course ? $course->id : $request->input('course_id');

        $validated = $request->validate([
            'course_id' => $course ? 'nullable' : 'required|exists:cursos,id',
            'instructor_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'internal_id' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        ScheduledCourse::create([
            'curso_id' => $courseId,
            'user_id' => $validated['instructor_id'],
            'fecha_inicio' => $validated['start_date'],
            'fecha_fin' => $validated['end_date'],
            'precio' => $validated['price'],
            'identificador' => $validated['internal_id'],
            'activo' => ($request->input('is_active', true)) ? 'si' : 'no',
        ]);

        return redirect()->back()->with('success', 'Programación de cohorte creada correctamente.');
    }

    public function update(Request $request, ScheduledCourse $schedule)
    {
        $validated = $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'internal_id' => 'nullable|string|max:50',
        ]);

        $schedule->update([
            'user_id' => $validated['instructor_id'],
            'fecha_inicio' => $validated['start_date'],
            'fecha_fin' => $validated['end_date'],
            'precio' => $validated['price'],
            'identificador' => $validated['internal_id'],
        ]);

        return redirect()->back()->with('success', 'Programación actualizada exitosamente.');
    }

    public function destroy(ScheduledCourse $schedule)
    {
        $schedule->delete();
        return redirect()->back()->with('success', 'Programación eliminada.');
    }

    public function toggle(ScheduledCourse $schedule)
    {
        $schedule->activo = ($schedule->activo === 'si') ? 'no' : 'si';
        $schedule->save();

        $status = ($schedule->activo === 'si') ? 'activada' : 'desactivada';
        return redirect()->back()->with('success', "Cohorte {$status} correctamente.");
    }
}
