<?php

namespace App\Http\Controllers\Admin\Landing;

use App\Http\Controllers\Controller;
use App\Models\LandingPride;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class LandingPrideController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Landing/Prides/Index', [
            'prides' => LandingPride::orderBy('position')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'text' => 'required|string',
            'text2' => 'required|string',
            'img' => 'required|image|max:2048',
            'position' => 'required|integer',
            'active' => 'boolean'
        ]);

        if ($request->hasFile('img')) {
            $path = $request->file('img')->store('img/prides', 'public');
            $validated['img'] = $path;
        }

        LandingPride::create($validated);

        return redirect()->back()->with('success', 'Orgullo creado correctamente');
    }

    public function update(Request $request, LandingPride $pride)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'text' => 'required|string',
            'text2' => 'required|string',
            'img' => 'nullable|image|max:2048',
            'position' => 'required|integer',
            'active' => 'boolean'
        ]);

        if ($request->hasFile('img')) {
            if ($pride->img) {
                Storage::disk('public')->delete($pride->img);
            }
            $path = $request->file('img')->store('img/prides', 'public');
            $validated['img'] = $path;
        }

        $pride->update($validated);

        return redirect()->back()->with('success', 'Orgullo actualizado correctamente');
    }

    public function destroy(LandingPride $pride)
    {
        if ($pride->img) {
            Storage::disk('public')->delete($pride->img);
        }
        $pride->delete();

        return redirect()->back()->with('success', 'Orgullo eliminado correctamente');
    }
}
