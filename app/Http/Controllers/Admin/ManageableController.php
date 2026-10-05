<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManageableGuiaMedicine;
use App\Models\ManageableGuiaNutrition;
use App\Models\ManageableSimulatorMedicine;
use App\Models\ManageableSimulatorNutrition;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManageableController extends Controller
{
    /**
     * Display manageable cards for Simulators and Study Guides
     * Legacy URL: GET /admin/manageable
     */
    public function index()
    {
        $simulatorsMedicine = ManageableSimulatorMedicine::orderBy('position', 'asc')->orderBy('id', 'desc')->get();
        $simulatorsNutrition = ManageableSimulatorNutrition::orderBy('position', 'asc')->orderBy('id', 'desc')->get();
        $guiasMedicine = ManageableGuiaMedicine::orderBy('position', 'asc')->orderBy('id', 'desc')->get();
        $guiasNutrition = ManageableGuiaNutrition::orderBy('position', 'asc')->orderBy('id', 'desc')->get();

        return Inertia::render('Admin/Manageable/Index', [
            'simulatorsMedicine' => $simulatorsMedicine,
            'simulatorsNutrition' => $simulatorsNutrition,
            'guiasMedicine' => $guiasMedicine,
            'guiasNutrition' => $guiasNutrition,
        ]);
    }

    /**
     * Store a new manageable card
     * Legacy URL: POST /admin/manageable/store
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'type' => 'required|string|in:simuladores,guias',
            'category' => 'required|string|in:medicina,nutricion',
        ]);

        $data = [
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'type' => $request->type,
            'category' => $request->category,
            'position' => $request->position ?? 0,
        ];

        if ($request->type === 'simuladores') {
            if ($request->category === 'medicina') {
                ManageableSimulatorMedicine::create($data);
            } else {
                ManageableSimulatorNutrition::create($data);
            }
        } else {
            if ($request->category === 'medicina') {
                ManageableGuiaMedicine::create($data);
            } else {
                ManageableGuiaNutrition::create($data);
            }
        }

        return redirect()->back()->with('success', 'Elemento creado exitosamente.');
    }

    /**
     * Update an existing manageable card
     * Legacy URL: PUT /admin/manageable/update
     */
    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'type' => 'required|string|in:simuladores,guias',
            'category' => 'required|string|in:medicina,nutricion',
        ]);

        $data = [
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
        ];

        if ($request->type === 'simuladores') {
            if ($request->category === 'medicina') {
                $item = ManageableSimulatorMedicine::findOrFail($request->id);
            } else {
                $item = ManageableSimulatorNutrition::findOrFail($request->id);
            }
        } else {
            if ($request->category === 'medicina') {
                $item = ManageableGuiaMedicine::findOrFail($request->id);
            } else {
                $item = ManageableGuiaNutrition::findOrFail($request->id);
            }
        }

        $item->update($data);

        return redirect()->back()->with('success', 'Elemento actualizado exitosamente.');
    }

    public function deleteManageablesimulatormedicine($id)
    {
        $item = ManageableSimulatorMedicine::findOrFail($id);
        $item->delete();
        return redirect()->back()->with('success', 'Simulador eliminado.');
    }

    public function deleteManageablesimulatornutrition($id)
    {
        $item = ManageableSimulatorNutrition::findOrFail($id);
        $item->delete();
        return redirect()->back()->with('success', 'Simulador eliminado.');
    }

    public function deleteManageableguiamedicine($id)
    {
        $item = ManageableGuiaMedicine::findOrFail($id);
        $item->delete();
        return redirect()->back()->with('success', 'Guía eliminada.');
    }

    public function deleteManageableguianutrition($id)
    {
        $item = ManageableGuiaNutrition::findOrFail($id);
        $item->delete();
        return redirect()->back()->with('success', 'Guía eliminada.');
    }
}
