<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Discount;
use App\Models\ScheduledCourse;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function index($scheduled_course_id)
    {
        $scheduledCourse = ScheduledCourse::with('course')->findOrFail($scheduled_course_id);
        $discounts = Discount::where('curso_programado_id', $scheduled_course_id)
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Admin/Discounts/Index', [
            'scheduledCourse' => $scheduledCourse,
            'discounts' => $discounts,
        ]);
    }

    public function store(Request $request, $scheduled_course_id)
    {
        $request->validate([
            'clave' => 'required|string|max:45',
            'descuento' => 'required|numeric|min:0',
            'limite' => 'required|integer|min:1',
        ]);

        Discount::create([
            'clave' => strtoupper(strip_tags($request->clave)),
            'descuento' => $request->descuento,
            'limite' => $request->limite,
            'curso_programado_id' => $scheduled_course_id,
            'activo' => 'si'
        ]);

        return redirect()->back()->with('success', 'Cupón creado correctamente.');
    }

    public function update(Request $request, $scheduled_course_id, $id)
    {
        $discount = Discount::findOrFail($id);

        $request->validate([
            'clave' => 'required|string|max:45',
            'descuento' => 'required|numeric|min:0',
            'limite' => 'required|integer|min:1',
        ]);

        $discount->update([
            'clave' => strtoupper(strip_tags($request->clave)),
            'descuento' => $request->descuento,
            'limite' => $request->limite,
        ]);

        return redirect()->back()->with('success', 'Cupón actualizado correctamente.');
    }

    public function toggleActive($scheduled_course_id, $id)
    {
        $discount = Discount::findOrFail($id);
        $discount->activo = ($discount->activo == 'si') ? 'no' : 'si';
        $discount->save();

        $status = $discount->activo == 'si' ? 'activado' : 'desactivado';
        return redirect()->back()->with('success', 'Cupón ' . $status . ' correctamente.');
    }
}
