<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScheduledCourse;
use App\Services\MiniTestConfigService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class MiniTestConfigController extends Controller
{
    public function index(MiniTestConfigService $service): Response
    {
        $scheduledCourses = [];

        try {
            if (Schema::hasTable('cursos_programados') && Schema::hasTable('cursos')) {
                $scheduledCourses = ScheduledCourse::with('course')
                    ->where('activo', 'si')
                    ->whereHas('course', fn ($q) => $q->where('activo', 'si'))
                    ->orderByDesc('id')
                    ->get()
                    ->map(fn (ScheduledCourse $scheduled): array => [
                        'id' => $scheduled->id,
                        'identificador' => $scheduled->identificador,
                        'precio' => (float) ($scheduled->precio ?? 0),
                        'course_title' => $scheduled->course?->title ?? 'Programa Sapius',
                        'course_slug' => $scheduled->course?->slug,
                    ])
                    ->values()
                    ->all();
            }
        } catch (QueryException) {
            $scheduledCourses = [];
        }

        return Inertia::render('Admin/Landing/MiniTest', [
            'config' => $service->getConfig(),
            'scheduledCourses' => $scheduledCourses,
        ]);
    }

    public function update(Request $request, MiniTestConfigService $service): RedirectResponse
    {
        $validated = $request->validate([
            'header' => ['required', 'array'],
            'header.badge' => ['required', 'string', 'max:120'],
            'header.title' => ['required', 'string', 'max:160'],
            'header.resultSubtitle' => ['required', 'string', 'max:200'],

            'questions' => ['required', 'array', 'min:1'],
            'questions.*.id' => ['required', 'string', 'max:80'],
            'questions.*.title' => ['required', 'string', 'max:240'],
            'questions.*.active' => ['required', 'boolean'],
            'questions.*.options' => ['required', 'array', 'min:1'],
            'questions.*.options.*.id' => ['required', 'string', 'max:80'],
            'questions.*.options.*.label' => ['required', 'string', 'max:200'],
            'questions.*.options.*.helper' => ['nullable', 'string', 'max:300'],
            'questions.*.options.*.areaFilter' => ['nullable', 'in:nutricion,medicina,otro'],
            'questions.*.options.*.weights' => ['nullable', 'array'],

            'recommendations' => ['required', 'array', 'min:1'],
            'recommendations.*.id' => ['required', 'string', 'max:80'],
            'recommendations.*.area' => ['required', 'in:nutricion,medicina,otro,general'],
            'recommendations.*.priority' => ['required', 'integer', 'min:1', 'max:999'],
            'recommendations.*.active' => ['required', 'boolean'],
            'recommendations.*.badge' => ['required', 'string', 'max:120'],
            'recommendations.*.title' => ['required', 'string', 'max:200'],
            'recommendations.*.price' => ['required', 'string', 'max:80'],
            'recommendations.*.oldPrice' => ['nullable', 'string', 'max:80'],
            'recommendations.*.paymentNote' => ['required', 'string', 'max:100'],
            'recommendations.*.summary' => ['required', 'string', 'max:500'],
            'recommendations.*.includes' => ['nullable', 'array'],
            'recommendations.*.includes.*' => ['nullable', 'string', 'max:240'],
            'recommendations.*.coursePageHref' => ['nullable', 'string', 'max:255'],
            'recommendations.*.keywords' => ['nullable', 'array'],
            'recommendations.*.keywords.*' => ['nullable', 'string', 'max:80'],
            'recommendations.*.purchaseMode' => ['required', 'in:buy,presale,waitlist,whatsapp'],
            'recommendations.*.scheduledCourseId' => ['nullable', 'integer', 'min:1'],
            'recommendations.*.whatsappMessage' => ['required', 'string', 'max:500'],
        ]);

        $hasActiveQuestion = collect($validated['questions'])->contains(
            fn (array $q): bool => (bool) ($q['active'] ?? false) && ! empty($q['options'])
        );

        if (! $hasActiveQuestion) {
            return redirect()->back()->withErrors([
                'questions' => 'Debe haber al menos una pregunta activa con opciones.',
            ]);
        }

        $hasActiveRecommendation = collect($validated['recommendations'])->contains(
            fn (array $r): bool => (bool) ($r['active'] ?? false)
        );

        if (! $hasActiveRecommendation) {
            return redirect()->back()->withErrors([
                'recommendations' => 'Debe haber al menos una tarjeta de recomendación activa.',
            ]);
        }

        $service->saveConfig($validated);

        return redirect()->back()->with('success', 'Configuración del Mini-Test actualizada correctamente.');
    }

    public function reset(MiniTestConfigService $service): RedirectResponse
    {
        $service->resetToDefaults();

        return redirect()->back()->with('success', 'El Mini-Test fue restaurado a los valores originales.');
    }
}
