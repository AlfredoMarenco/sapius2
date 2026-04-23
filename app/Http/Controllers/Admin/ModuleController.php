<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ModuleController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $module = new Module();
        $module->course_id = $course->id;
        $module->title = $validated['title'];
        $module->slug = Str::slug($validated['title']) . '-' . time();
        $module->description = $validated['description'];
        $module->position = $course->modules()->count() + 1;
        $module->save();

        return back()->with('success', 'Módulo creado con éxito');
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $module->update($validated);

        return back()->with('success', 'Módulo actualizado');
    }

    public function destroy(Module $module)
    {
        $module->delete();
        return back()->with('success', 'Módulo eliminado');
    }

    public function reorder(Request $request, Course $course)
    {
        $validated = $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|exists:modules,id',
            'modules.*.position' => 'required|integer',
        ]);

        foreach ($validated['modules'] as $moduleData) {
            Module::where('id', $moduleData['id'])->update(['position' => $moduleData['position']]);
        }

        return back()->with('success', 'Orden actualizado');
    }
}
