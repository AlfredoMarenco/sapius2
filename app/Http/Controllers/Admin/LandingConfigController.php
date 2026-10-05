<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use App\Models\Pride;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Traits\OptimizesImages;

class LandingConfigController extends Controller
{
    use OptimizesImages;
    public function index()
    {
        $slides = Slide::where('section', 'LIKE', 'slider-index')->orWhereNull('section')->orderBy('position', 'asc')->get();
        $prides = Pride::orderBy('position', 'asc')->get();
        $teachers = Teacher::orderBy('position', 'asc')->get();

        return Inertia::render('Admin/Landing/Index', [
            'slides' => $slides,
            'prides' => $prides,
            'teachers' => $teachers,
        ]);
    }

    public function uploadSlide(Request $request)
    {
        $request->validate(['image' => 'required|image|max:4096']);
        $url = $this->optimizeAndStoreImage($request->file('image'), 'slider-index');

        Slide::create([
            'img' => $url,
            'section' => 'slider-index',
            'position' => (Slide::max('position') ?? 0) + 1,
        ]);

        return redirect()->back()->with('success', 'Slide subido con éxito.');
    }

    public function deleteSlide(Slide $slide)
    {
        $slide->delete();
        return redirect()->back()->with('success', 'Slide eliminado.');
    }

    public function uploadPride(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'text' => 'required|string',
            'text2' => 'required|string',
            'image' => 'required|image|max:4096',
        ]);

        $url = $this->optimizeAndStoreImage($request->file('image'), 'prides');

        Pride::create([
            'img' => $url,
            'name' => $request->name,
            'text' => $request->text,
            'text2' => $request->text2,
            'position' => (Pride::max('position') ?? 0) + 1,
        ]);

        return redirect()->back()->with('success', 'Orgullo Sapius agregado.');
    }

    public function updatePride(Request $request, Pride $pride)
    {
        $request->validate([
            'name' => 'required|string',
            'text' => 'required|string',
            'text2' => 'required|string',
            'image' => 'nullable|image|max:4096',
        ]);

        $data = [
            'name' => $request->name,
            'text' => $request->text,
            'text2' => $request->text2,
        ];

        if ($request->hasFile('image')) {
            $data['img'] = $this->optimizeAndStoreImage($request->file('image'), 'prides');
        }

        $pride->update($data);

        return redirect()->back()->with('success', 'Orgullo Sapius actualizado.');
    }

    public function deletePride(Pride $pride)
    {
        $pride->delete();
        return redirect()->back()->with('success', 'Orgullo Sapius eliminado.');
    }

    public function uploadTeacher(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'image' => 'required|image|max:4096',
        ]);

        $url = $this->optimizeAndStoreImage($request->file('image'), 'teachers');

        Teacher::create([
            'img' => $url,
            'name' => $request->name,
            'description' => $request->description,
            'position' => (Teacher::max('position') ?? 0) + 1,
        ]);

        return redirect()->back()->with('success', 'Profesor agregado.');
    }

    public function updateTeacher(Request $request, Teacher $teacher)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'image' => 'nullable|image|max:4096',
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
        ];

        if ($request->hasFile('image')) {
            $data['img'] = $this->optimizeAndStoreImage($request->file('image'), 'teachers');
        }

        $teacher->update($data);

        return redirect()->back()->with('success', 'Profesor actualizado.');
    }

    public function deleteTeacher(Teacher $teacher)
    {
        $teacher->delete();
        return redirect()->back()->with('success', 'Profesor eliminado.');
    }
}
