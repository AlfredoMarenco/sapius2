<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class CatalogController extends Controller
{
    /**
     * Get available courses filtered by category or all.
     */
    protected function getAvailableItems($categoryName = null)
    {
        $user = Auth::user();
        $now = Carbon::now();

        // Get IDs of courses the user is already enrolled in
        $enrolledScheduledIds = Enrollment::where('user_id', $user->id)
            ->where('aceptado', 'si')
            ->pluck('curso_programado_id')
            ->toArray();

        $query = ScheduledCourse::with(['category', 'course.modules.lessons', 'instructor'])
            ->where('activo', 'si')
            ->whereNotIn('id', $enrolledScheduledIds)
            ->whereHas('course', function ($q) {
                $q->where('activo', 'si');
            });

        if (Schema::hasColumn('cursos_programados', 'fecha_inicio_venta')) {
            $query->where(function ($q) use ($now) {
                $q->whereNull('fecha_inicio_venta')
                    ->orWhere('fecha_inicio_venta', '<=', $now);
            });
        }

        if (Schema::hasColumn('cursos_programados', 'fecha_fin_venta')) {
            $query->where(function ($q) use ($now) {
                $q->whereNull('fecha_fin_venta')
                    ->orWhere('fecha_fin_venta', '>=', $now);
            });
        }

        if ($categoryName) {
            $query->whereHas('category', function ($catQ) use ($categoryName) {
                $catQ->where('name', 'LIKE', '%'.$categoryName.'%');
            });
        }

        return $query->get()->map(function ($scheduled) {
            return [
                'id' => $scheduled->id,
                'course_id' => $scheduled->course_id,
                'identifier' => $scheduled->identificador,
                'title' => $scheduled->course->title,
                'category' => $scheduled->category ? $scheduled->category->name : 'General',
                'instructor' => $scheduled->instructor ? $scheduled->instructor->name : 'Sapius Team',
                'price' => (float) $scheduled->precio,
                'image' => $scheduled->course->image,
                'description' => $scheduled->course->description,
                'modules_count' => $scheduled->course->modules ? $scheduled->course->modules->count() : 0,
                'lessons_count' => $scheduled->course->modules ? $scheduled->course->modules->sum(function ($m) {
                    return $m->lessons ? $m->lessons->count() : 0;
                }) : 0,
                'start_date' => $scheduled->fecha_inicio ? Carbon::parse($scheduled->fecha_inicio)->format('d/m/Y') : null,
            ];
        });
    }

    public function index(Request $request)
    {
        return $this->cursos($request);
    }

    /**
     * Available Courses: /alumno/cursos
     */
    public function cursos(Request $request)
    {
        $courses = $this->getAvailableItems('Cursos');

        return Inertia::render('User/Catalog/Index', [
            'courses' => $courses,
            'categories' => Category::all(),
            'activeTab' => 'cursos',
            'title' => 'Cursos Disponibles',
        ]);
    }

    /**
     * Available Guides: /alumno/guias
     */
    public function guias(Request $request)
    {
        $guias = $this->getAvailableItems('Guias');

        return Inertia::render('User/Catalog/Index', [
            'courses' => $guias,
            'categories' => Category::all(),
            'activeTab' => 'guias',
            'title' => 'Guías de Estudio Disponibles',
        ]);
    }

    /**
     * Available Simulators: /alumno/simuladores
     */
    public function simuladores(Request $request)
    {
        $simuladores = $this->getAvailableItems('Simuladores');

        return Inertia::render('User/Catalog/Index', [
            'courses' => $simuladores,
            'categories' => Category::all(),
            'activeTab' => 'simuladores',
            'title' => 'Simuladores Disponibles',
        ]);
    }

    /**
     * Step 1 of enrollment / registration: /alumno/inscripcion/{curso_id}
     */
    public function inscripcion($curso_id)
    {
        ScheduledCourse::findOrFail($curso_id);

        return redirect()->route('alumno.checkout', $curso_id);
    }
}
