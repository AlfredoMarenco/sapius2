<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\ProgrammingCalendar;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CourseCalendarController extends Controller
{
    /**
     * Mostrar la vista de los calendarios gráficos del curso
     */
    public function index(Course $course)
    {
        $calendars = ProgrammingCalendar::where('curso_id', $course->id)
            ->orderBy('position', 'asc')
            ->orderBy('start_date', 'asc')
            ->get();

        return Inertia::render('Admin/Courses/Calendars', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
            ],
            'calendars' => $calendars->map(function ($c) {
                return [
                    'id' => $c->id,
                    'image_url' => asset('storage/' . $c->image_path),
                    'start_date' => $c->start_date ? $c->start_date->format('Y-m-d') : null,
                    'end_date' => $c->end_date ? $c->end_date->format('Y-m-d') : null,
                    'group_name' => $c->group_name,
                    'position' => $c->position,
                ];
            })
        ]);
    }

    /**
     * Subir nuevos calendarios
     */
    public function store(Request $request, Course $course)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'file|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'group_name' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('images')) {
            $lastPosition = ProgrammingCalendar::where('curso_id', $course->id)->max('position') ?? 0;

            foreach ($request->file('images') as $image) {
                $lastPosition++;
                $path = $image->store('calendars', 'public');
                ProgrammingCalendar::create([
                    'curso_id' => $course->id,
                    'image_path' => $path,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'group_name' => $request->group_name,
                    'position' => $lastPosition,
                ]);
            }
        }

        return redirect()->route('admin.courses.calendars.index', $course->id)
            ->with('success', 'Calendarios subidos y guardados correctamente.');
    }

    /**
     * Reordenar posiciones
     */
    public function reorder(Request $request, Course $course)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|exists:programming_calendars,id',
            'order.*.position' => 'required|integer',
        ]);

        foreach ($request->order as $item) {
            ProgrammingCalendar::where('curso_id', $course->id)
                ->where('id', $item['id'])
                ->update(['position' => $item['position']]);
        }

        return redirect()->back()->with('success', 'Orden actualizado correctamente.');
    }

    /**
     * Eliminar un calendario específico
     */
    public function destroy(ProgrammingCalendar $calendar)
    {
        // Delete file from storage
        Storage::disk('public')->delete($calendar->image_path);
        
        $calendar->delete();

        return redirect()->back()->with('success', 'Calendario eliminado correctamente.');
    }
}
