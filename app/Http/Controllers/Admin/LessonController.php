<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    public function store(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'nullable|string',
        ]);

        $lesson = new Lesson();
        $lesson->module_id = $module->id;
        $lesson->title = $validated['title'];
        $lesson->slug = Str::slug($validated['title']) . '-' . time();
        $lesson->summary = $validated['summary'];
        $lesson->content = $validated['content'];
        $lesson->position = $module->lessons()->count() + 1;
        $lesson->save();

        return back()->with('success', 'Lección creada con éxito');
    }

    public function update(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'nullable|string',
            'position' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $lesson->update($validated);

        if ($request->hasFile('image')) {
            $lesson->image = $request->file('image')->store('lessons', 'public');
            $lesson->save();
        }

        return back()->with('success', 'Lección actualizada');
    }

    public function destroy(Lesson $lesson)
    {
        $lesson->delete();
        return back()->with('success', 'Lección eliminada');
    }
}
