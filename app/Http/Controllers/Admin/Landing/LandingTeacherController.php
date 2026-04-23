<?php

namespace App\Http\Controllers\Admin\Landing;

use App\Http\Controllers\Controller;
use App\Models\LandingTeacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class LandingTeacherController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Landing/Teachers/Index', [
            'teachers' => LandingTeacher::orderBy('position')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'img' => 'required|image|max:2048',
            'position' => 'required|integer',
            'active' => 'boolean'
        ]);

        if ($request->hasFile('img')) {
            $path = $request->file('img')->store('img/teachers', 'public');
            $validated['img'] = $path;
        }

        LandingTeacher::create($validated);

        return redirect()->back()->with('success', 'Docente añadido correctamente');
    }

    public function update(Request $request, LandingTeacher $teacher)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'img' => 'nullable|image|max:2048',
            'position' => 'required|integer',
            'active' => 'boolean'
        ]);

        if ($request->hasFile('img')) {
            if ($teacher->img) {
                Storage::disk('public')->delete($teacher->img);
            }
            $path = $request->file('img')->store('img/teachers', 'public');
            $validated['img'] = $path;
        }

        $teacher->update($validated);

        return redirect()->back()->with('success', 'Docente actualizado correctamente');
    }

    public function destroy(LandingTeacher $teacher)
    {
        if ($teacher->img) {
            Storage::disk('public')->delete($teacher->img);
        }
        $teacher->delete();

        return redirect()->back()->with('success', 'Docente eliminado correctamente');
    }
}
