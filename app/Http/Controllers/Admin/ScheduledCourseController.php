<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Http\Request;

class ScheduledCourseController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'internal_id' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $course->scheduledCourses()->create($validated);

        return redirect()->back()->with('success', 'Programación creada correctamente.');
    }

    public function update(Request $request, ScheduledCourse $schedule)
    {
        $validated = $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'internal_id' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $schedule->update($validated);

        return redirect()->back()->with('success', 'Programación actualizada.');
    }

    public function destroy(ScheduledCourse $schedule)
    {
        $schedule->delete();
        return redirect()->back()->with('success', 'Programación eliminada.');
    }

    public function toggle(ScheduledCourse $schedule)
    {
        $schedule->is_active = !$schedule->is_active;
        $schedule->save();

        return redirect()->back()->with('success', $schedule->is_active ? 'Programación activada.' : 'Programación desactivada.');
    }
}
