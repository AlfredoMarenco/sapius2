<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\FileGuia;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Services\CourseCategoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ScheduledCourseController extends Controller
{
    /**
     * Display listing of scheduled cohorts
     * Legacy URL: /admin/registro/programacion
     */
    public function index(Request $request)
    {
        $cursoId = $request->input('curso_id');
        $query = ScheduledCourse::with(['course', 'instructor'])->withCount('enrollments');

        if ($cursoId) {
            $query->where('curso_id', $cursoId);
        }

        $schedules = $query->orderBy('id', 'desc')->paginate(15)->withQueryString()->through(function ($s) {
            return [
                'id' => $s->id,
                'course_id' => $s->curso_id,
                'course_title' => $s->course ? $s->course->title : 'Sin curso asignado',
                'course_image' => $s->course ? $s->course->image : null,
                'internal_id' => $s->identificador,
                'instructor_name' => $s->instructor ? $s->instructor->name : 'No asignado',
                'start_date' => $s->fecha_inicio ? $s->fecha_inicio->format('d/m/Y') : null,
                'end_date' => $s->fecha_fin ? $s->fecha_fin->format('d/m/Y') : null,
                'fecha_inicio_venta' => $s->fecha_inicio_venta ? $s->fecha_inicio_venta->format('Y-m-d') : null,
                'fecha_fin_venta' => $s->fecha_fin_venta ? $s->fecha_fin_venta->format('Y-m-d') : null,
                'price' => $s->precio,
                'students_count' => $s->enrollments_count,
                'is_active' => $s->activo === 'si',
            ];
        });

        $courses = Course::where('activo', 'si')->select('id', 'titulo')->get()->map(fn ($c) => [
            'id' => $c->id,
            'title' => $c->titulo,
        ]);

        $instructors = User::whereHas('roles', function ($q) {
            $q->whereIn('slug', ['admin', 'instructor']);
        })->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
        ]);

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $schedules,
            'courses' => $courses,
            'instructors' => $instructors,
            'selectedCourseId' => $cursoId ? (int) $cursoId : null,
        ]);
    }

    public function store(Request $request, ?Course $course = null)
    {
        $courseId = $course ? $course->id : $request->input('course_id');

        $validated = $request->validate([
            'course_id' => $course ? 'nullable' : 'required|exists:cursos,id',
            'instructor_id' => 'required|exists:users,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'fecha_inicio_venta' => 'nullable|date',
            'fecha_fin_venta' => 'nullable|date|after_or_equal:fecha_inicio_venta',
            'sale_start_date' => 'nullable|date',
            'sale_end_date' => 'nullable|date',
            'price' => 'required|numeric|min:0',
            'internal_id' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'guia_file' => 'nullable|file|mimes:pdf|max:51200',
        ]);

        $resolvedCategoryId = $validated['category_id']
            ?? CourseCategoryService::getCategoryIdForCourse((int) $courseId)
            ?? ScheduledCourse::where('curso_id', $courseId)->whereNotNull('category_id')->value('category_id');

        $saleStart = $validated['fecha_inicio_venta'] ?? $validated['sale_start_date'] ?? null;
        $saleEnd = $validated['fecha_fin_venta'] ?? $validated['sale_end_date'] ?? null;

        DB::transaction(function () use ($request, $validated, $courseId, $resolvedCategoryId, $saleStart, $saleEnd) {
            $schedule = ScheduledCourse::create([
                'curso_id' => $courseId,
                'category_id' => $resolvedCategoryId,
                'user_id' => $validated['instructor_id'],
                'fecha_inicio' => $validated['start_date'],
                'fecha_fin' => $validated['end_date'],
                'fecha_inicio_venta' => $saleStart,
                'fecha_fin_venta' => $saleEnd,
                'precio' => $validated['price'],
                'identificador' => $validated['internal_id'] ?? null,
                'activo' => ($request->input('is_active', true)) ? 'si' : 'no',
            ]);

            $this->storeGuiaFileIfPresent($request, $schedule);
        });

        return redirect()->back()->with('success', 'Programación de cohorte creada correctamente.');
    }

    public function update(Request $request, ScheduledCourse $schedule)
    {
        $validated = $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'fecha_inicio_venta' => 'nullable|date',
            'fecha_fin_venta' => 'nullable|date|after_or_equal:fecha_inicio_venta',
            'sale_start_date' => 'nullable|date',
            'sale_end_date' => 'nullable|date',
            'price' => 'required|numeric|min:0',
            'internal_id' => 'nullable|string|max:50',
            'guia_file' => 'nullable|file|mimes:pdf|max:51200',
        ]);

        DB::transaction(function () use ($request, $validated, $schedule) {
            $updateData = [
                'user_id' => $validated['instructor_id'],
                'fecha_inicio' => $validated['start_date'],
                'fecha_fin' => $validated['end_date'],
                'precio' => $validated['price'],
                'identificador' => $validated['internal_id'] ?? null,
            ];

            if ($request->hasAny(['fecha_inicio_venta', 'sale_start_date'])) {
                $updateData['fecha_inicio_venta'] = $validated['fecha_inicio_venta'] ?? $validated['sale_start_date'] ?? null;
            }

            if ($request->hasAny(['fecha_fin_venta', 'sale_end_date'])) {
                $updateData['fecha_fin_venta'] = $validated['fecha_fin_venta'] ?? $validated['sale_end_date'] ?? null;
            }

            $schedule->update($updateData);
            $this->storeGuiaFileIfPresent($request, $schedule);
        });

        return redirect()->back()->with('success', 'Programación actualizada exitosamente.');
    }

    public function destroy(ScheduledCourse $schedule)
    {
        $schedule->activo = 'no';
        $schedule->save();

        return redirect()->back()->with('success', 'Programación desactivada correctamente.');
    }

    public function toggle(ScheduledCourse $schedule)
    {
        $schedule->activo = ($schedule->activo === 'si') ? 'no' : 'si';
        $schedule->save();

        $status = ($schedule->activo === 'si') ? 'activada' : 'desactivada';

        return redirect()->back()->with('success', "Cohorte {$status} correctamente.");
    }

    protected function storeGuiaFileIfPresent(Request $request, ScheduledCourse $schedule): void
    {
        if (! $request->hasFile('guia_file')) {
            return;
        }

        $file = $request->file('guia_file');
        $destDir = storage_path('app/files/medias');
        if (! is_dir($destDir)) {
            mkdir($destDir, 0750, true);
        }

        $filename = Str::random(40).'.'.strtolower($file->getClientOriginalExtension() ?: 'pdf');
        $file->move($destDir, $filename);

        FileGuia::updateOrCreate(
            ['curso_programado_id' => $schedule->id],
            ['url' => basename($filename)]
        );
    }
}
