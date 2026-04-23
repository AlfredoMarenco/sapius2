<?php

namespace App\Http\Controllers\Admin\Landing;

use App\Http\Controllers\Controller;
use App\Models\LandingSlide;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class LandingSlideController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Landing/Slides/Index', [
            'slides' => LandingSlide::orderBy('position')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'img' => 'required|image|max:2048',
            'section' => 'nullable|string',
            'position' => 'required|integer',
            'active' => 'boolean'
        ]);

        if ($request->hasFile('img')) {
            $path = $request->file('img')->store('img/slides', 'public');
            $validated['img'] = $path;
        }

        LandingSlide::create($validated);

        return redirect()->back()->with('success', 'Slide creado correctamente');
    }

    public function update(Request $request, LandingSlide $slide)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'img' => 'nullable|image|max:2048',
            'section' => 'nullable|string',
            'position' => 'required|integer',
            'active' => 'boolean'
        ]);

        if ($request->hasFile('img')) {
            if ($slide->img) {
                Storage::disk('public')->delete($slide->img);
            }
            $path = $request->file('img')->store('img/slides', 'public');
            $validated['img'] = $path;
        }

        $slide->update($validated);

        return redirect()->back()->with('success', 'Slide actualizado correctamente');
    }

    public function destroy(LandingSlide $slide)
    {
        if ($slide->img) {
            Storage::disk('public')->delete($slide->img);
        }
        $slide->delete();

        return redirect()->back()->with('success', 'Slide eliminado correctamente');
    }
}
