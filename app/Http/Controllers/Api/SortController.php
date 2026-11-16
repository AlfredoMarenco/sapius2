<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Landing\Pride;
use App\Models\Landing\Slide;
use App\Models\Landing\Teacher;
use App\Models\ManageableGuiaMedicine;
use App\Models\ManageableGuiaNutrition;
use App\Models\ManageableSimulatorMedicine;
use App\Models\ManageableSimulatorNutrition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SortController extends Controller
{
    public function teachers(Request $request): JsonResponse
    {
        return $this->reorderModel($request, 'teachers', Teacher::class);
    }

    public function prides(Request $request): JsonResponse
    {
        return $this->reorderModel($request, 'prides', Pride::class);
    }

    public function slides(Request $request): JsonResponse
    {
        return $this->reorderModel($request, 'slides', Slide::class);
    }

    public function manageableSimulatorMedicine(Request $request): JsonResponse
    {
        return $this->reorderModel($request, 'simulatormedicines', ManageableSimulatorMedicine::class);
    }

    public function manageableSimulatorNutrition(Request $request): JsonResponse
    {
        return $this->reorderModel($request, 'simulatornutritions', ManageableSimulatorNutrition::class);
    }

    public function manageableGuiasMedicine(Request $request): JsonResponse
    {
        return $this->reorderModel($request, 'guiamedicines', ManageableGuiaMedicine::class);
    }

    public function manageableGuiasNutrition(Request $request): JsonResponse
    {
        return $this->reorderModel($request, 'guianutritions', ManageableGuiaNutrition::class);
    }

    protected function reorderModel(Request $request, string $inputKey, string $modelClass): JsonResponse
    {
        $validated = $request->validate([
            $inputKey => ['required', 'array', 'min:1'],
            "{$inputKey}.*" => ['integer', 'min:1'],
        ]);

        $position = 1;
        foreach ($validated[$inputKey] as $id) {
            $item = $modelClass::find($id);
            if ($item) {
                $item->position = $position;
                $item->save();
                $position++;
            }
        }

        return response()->json(['success' => true]);
    }
}
