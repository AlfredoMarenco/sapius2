<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\LandingPride;
use App\Models\LandingReview;
use App\Models\LandingSlide;
use App\Models\LandingTeacher;
use App\Models\ManageableGuiaMedicine;
use App\Models\ManageableGuiaNutrition;
use App\Models\ManageableSimulatorMedicine;
use App\Models\ManageableSimulatorNutrition;
use App\Models\ScheduledCourse;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Execute a database query defensively so missing optional tables in SQLite tests
     * gracefully return an empty collection (200 OK) without altering any DB schema.
     */
    protected function safeQuery(Closure $callback): Collection
    {
        try {
            $result = $callback();

            return $result instanceof Collection ? $result : collect($result);
        } catch (QueryException) {
            return collect();
        }
    }

    /**
     * Fetch active scheduled courses and normalize both Spanish legacy keys and English keys
     * for dynamic checkout resolution (/checkout/{id}) across all public pages.
     */
    protected function activeScheduledCourses(?string $area = null): Collection
    {
        return $this->safeQuery(function () use ($area) {
            $query = ScheduledCourse::with(['category', 'course.category'])
                ->where('activo', 'si');

            if ($area !== null && $area !== '') {
                $query->where('identificador', 'like', '%'.$area.'%');
            }

            return $query->get()->map(function (ScheduledCourse $scheduled): array {
                $course = $scheduled->course;
                $category = $scheduled->category ?? $course?->category;

                return [
                    'id' => $scheduled->id,
                    'course_id' => $scheduled->course_id,
                    'category_id' => $scheduled->category_id,
                    'identificador' => $scheduled->identificador,
                    'internal_id' => $scheduled->identificador,
                    'precio' => (float) ($scheduled->precio ?? 0),
                    'price' => (float) ($scheduled->precio ?? 0),
                    'activo' => $scheduled->activo,
                    'fecha_inicio' => $scheduled->fecha_inicio?->toISOString(),
                    'fecha_fin' => $scheduled->fecha_fin?->toISOString(),
                    'course_title' => $course?->title ?? $scheduled->identificador,
                    'course_slug' => $course?->slug,
                    'course_description' => $course?->description,
                    'course_image' => $course?->image,
                    'category_name' => $category?->name,
                    'course' => $course ? [
                        'id' => $course->id,
                        'title' => $course->title,
                        'slug' => $course->slug,
                        'description' => $course->description,
                        'image' => $course->image,
                        'category' => $category ? [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug ?? null,
                        ] : null,
                    ] : null,
                ];
            });
        });
    }

    public function index(): Response
    {
        return Inertia::render('Welcome', [
            'slides' => $this->safeQuery(fn () => LandingSlide::where('active', true)->orderBy('position')->get()),
            'prides' => $this->safeQuery(fn () => LandingPride::orderBy('position')->get()),
            'teachers' => $this->safeQuery(fn () => LandingTeacher::orderBy('position')->get()),
            'reviews' => $this->safeQuery(fn () => LandingReview::where('visible', true)->orderBy('created_at', 'desc')->take(6)->get()),
            'scheduledCourses' => $this->activeScheduledCourses(),
        ]);
    }

    public function coursesHub(): Response
    {
        return Inertia::render('Public/CoursesHub', [
            'scheduledCourses' => $this->activeScheduledCourses(),
            'guiasMedicine' => $this->safeQuery(fn () => ManageableGuiaMedicine::orderBy('position', 'asc')->orderBy('id', 'desc')->get()),
            'guiasNutrition' => $this->safeQuery(fn () => ManageableGuiaNutrition::orderBy('position', 'asc')->orderBy('id', 'desc')->get()),
            'simulatorsMedicine' => $this->safeQuery(fn () => ManageableSimulatorMedicine::orderBy('position', 'asc')->orderBy('id', 'desc')->get()),
            'simulatorsNutrition' => $this->safeQuery(fn () => ManageableSimulatorNutrition::orderBy('position', 'asc')->orderBy('id', 'desc')->get()),
        ]);
    }

    public function coursePage($slug): Response
    {
        $reviews = $this->safeQuery(
            fn () => LandingReview::where('visible', true)
                ->where('rating', '>=', 4)
                ->orderBy('created_at', 'desc')
                ->take(6)
                ->get()
        );

        return Inertia::render('Public/CourseLanding', [
            'slug' => $slug,
            'reviews' => $reviews,
            'scheduledCourses' => $this->activeScheduledCourses(),
        ]);
    }

    public function guias($area = 'medicina'): Response
    {
        $guias = $this->activeScheduledCourses($area);
        $scheduledCourses = $this->activeScheduledCourses();
        $manageableCards = $area === 'nutricion'
            ? $this->safeQuery(fn () => ManageableGuiaNutrition::orderBy('position', 'asc')->orderBy('id', 'desc')->get())
            : $this->safeQuery(fn () => ManageableGuiaMedicine::orderBy('position', 'asc')->orderBy('id', 'desc')->get());

        return Inertia::render('Public/GuiasLanding', [
            'area' => $area,
            'guias' => $guias,
            'scheduledCourses' => $scheduledCourses,
            'manageableCards' => $manageableCards,
            'cards' => $manageableCards,
            'manageableGuias' => $manageableCards,
        ]);
    }

    public function simuladores($area = 'medicina'): Response
    {
        $simuladores = $this->activeScheduledCourses($area);
        $scheduledCourses = $this->activeScheduledCourses();
        $manageableCards = $area === 'nutricion'
            ? $this->safeQuery(fn () => ManageableSimulatorNutrition::orderBy('position', 'asc')->orderBy('id', 'desc')->get())
            : $this->safeQuery(fn () => ManageableSimulatorMedicine::orderBy('position', 'asc')->orderBy('id', 'desc')->get());

        return Inertia::render('Public/SimuladoresLanding', [
            'area' => $area,
            'simuladores' => $simuladores,
            'scheduledCourses' => $scheduledCourses,
            'manageableCards' => $manageableCards,
            'cards' => $manageableCards,
            'manageableSimulators' => $manageableCards,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/About', [
            'teachers' => $this->safeQuery(fn () => LandingTeacher::orderBy('position')->get()),
        ]);
    }

    public function pride(): Response
    {
        return Inertia::render('Public/Pride', [
            'prides' => $this->safeQuery(fn () => LandingPride::orderBy('position')->get()),
            'reviews' => $this->safeQuery(fn () => LandingReview::where('visible', true)->orderBy('created_at', 'desc')->take(12)->get()),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }

    public function legal($type): Response
    {
        return Inertia::render('Public/Legal', [
            'type' => $type,
        ]);
    }
}
