<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ModuleController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer|min:0',
            'posicion' => 'nullable|integer|min:0',
        ]);

        $module = new Module;
        $module->course_id = $course->id;
        $module->title = strip_tags($validated['title']);
        $module->slug = Str::slug($validated['title']).'-'.time();
        $module->description = $validated['description'] ?? null;
        $module->posicion = $validated['posicion'] ?? $validated['position'] ?? ($course->modules()->count() + 1);
        $module->save();

        return back()->with('success', 'Módulo creado con éxito');
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer|min:0',
            'posicion' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $data = [
            'title' => strip_tags($validated['title']),
            'description' => $validated['description'] ?? null,
        ];

        $position = $validated['posicion'] ?? $validated['position'] ?? null;
        if ($position !== null) {
            $data['posicion'] = $position;
        }

        if (array_key_exists('is_active', $validated)) {
            $data['is_active'] = $validated['is_active'];
        }

        $module->update($data);

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
            'modules.*.id' => ['required', Rule::exists(Module::class, 'id')],
            'modules.*.position' => 'required_without:modules.*.posicion|integer|min:0',
            'modules.*.posicion' => 'required_without:modules.*.position|integer|min:0',
        ]);

        DB::transaction(function () use ($course, $validated) {
            foreach ($validated['modules'] as $moduleData) {
                $pos = $moduleData['posicion'] ?? $moduleData['position'];
                $course->modules()->where('id', $moduleData['id'])->update(['posicion' => $pos]);
            }
        });

        return back()->with('success', 'Orden actualizado');
    }
}
