<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\User;

class CourseController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Courses/Index', [
            'courses' => Course::with('category')->withCount(['modules', 'scheduledCourses'])->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Courses/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $course = new Course();
        $course->user_id = auth()->id();
        $course->category_id = $validated['category_id'];
        $course->title = $validated['title'];
        $course->slug = Str::slug($validated['title']) . '-' . time();
        $course->description = $validated['description'];
        
        if ($request->hasFile('image')) {
            $course->image = $request->file('image')->store('courses', 'public');
        }

        $course->save();

        return redirect()->route('admin.courses.index')->with('success', 'Curso creado con éxito');
    }


    public function show(Course $course)
    {
        $course->load(['category', 'modules.lessons', 'scheduledCourses.instructor']);
        
        // Get all instructors for selection
        $instructors = User::role('instructor')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'instructors' => $instructors,
        ]);
    }

    public function edit(Course $course)
    {
        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $course->update($validated);

        if ($request->hasFile('image')) {
            $course->image = $request->file('image')->store('courses', 'public');
            $course->save();
        }

        return redirect()->route('admin.courses.index')->with('success', 'Curso actualizado con éxito');
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return redirect()->route('admin.courses.index')->with('success', 'Curso eliminado');
    }

    public function toggle(Course $course)
    {
        $course->is_active = !$course->is_active;
        $course->save();

        return redirect()->back()->with('success', $course->is_active ? 'Curso activado Maestro' : 'Curso desactivado');
    }
}
