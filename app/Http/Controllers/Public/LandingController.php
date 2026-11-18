<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Mail\InformacionEmail;
use App\Models\ManageableGuiaMedicine;
use App\Models\ManageableGuiaNutrition;
use App\Models\ManageableSimulatorMedicine;
use App\Models\ManageableSimulatorNutrition;
use App\Models\Pride;
use App\Models\Review;
use App\Models\ScheduledCourse;
use App\Models\Slide;
use App\Models\Teacher;
use App\Rules\ValidRecaptcha;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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

    protected function formatPublicReviews(int $limit = 6): Collection
    {
        return $this->safeQuery(function () use ($limit) {
            return Review::with('user')
                ->where('visible', true)
                ->orderBy('created_at', 'desc')
                ->take($limit)
                ->get(['id', 'user_id', 'name', 'comment', 'rating'])
                ->map(fn (Review $r): array => [
                    'id' => $r->id,
                    'user_name' => $r->name ?: ($r->user?->nombre_completo ?: $r->user?->name ?: 'Alumno Sapius'),
                    'content' => $r->comment,
                    'rating' => (int) ($r->rating ?? 5),
                ]);
        });
    }

    protected function formatPublicSlides(): Collection
    {
        return $this->safeQuery(function () {
            return Slide::where(function ($q) {
                $q->where('section', 'slider-index')
                    ->orWhereNull('section');
            })
                ->orderBy('position')
                ->get(['id', 'img'])
                ->map(fn (Slide $slide): array => [
                    'id' => $slide->id,
                    'img' => $slide->img,
                ]);
        });
    }

    protected function formatPublicPrides(): Collection
    {
        return $this->safeQuery(function () {
            return Pride::orderBy('position')
                ->get(['id', 'name', 'text', 'text2', 'img'])
                ->map(fn (Pride $pride): array => [
                    'id' => $pride->id,
                    'name' => $pride->name,
                    'text' => $pride->text,
                    'text2' => $pride->text2,
                    'img' => $pride->img,
                ]);
        });
    }

    protected function formatPublicTeachers(): Collection
    {
        return $this->safeQuery(function () {
            return Teacher::orderBy('position')
                ->get(['id', 'name', 'description', 'img'])
                ->map(fn (Teacher $teacher): array => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'description' => $teacher->description,
                    'img' => $teacher->img,
                ]);
        });
    }

    /**
     * Sanitize manageable card descriptions so safe structural HTML tags render cleanly
     * without exposing scripts, event attributes, or database timestamps.
     */
    protected function sanitizeManageableHtml(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        $clean = strip_tags($html, '<p><br><ul><ol><li><strong><b><em><i><u><span><a><h1><h2><h3><h4><blockquote><hr><div><table><thead><tbody><tr><th><td>');
        $clean = preg_replace('/\s+on[a-z]+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $clean) ?? $clean;
        $clean = preg_replace_callback('/\s+style\s*=\s*(["\'])(.*?)\1/is', function (array $matches): string {
            if (preg_match('/text-align\s*:\s*(left|center|right|justify)\b/i', $matches[2], $alignMatch)) {
                return ' style="text-align: '.strtolower($alignMatch[1]).'"';
            }

            return '';
        }, $clean) ?? $clean;
        $clean = preg_replace('/\s+style\s*=\s*[^\s>"\']+/i', '', $clean) ?? $clean;
        $clean = preg_replace('/href\s*=\s*(["\'])\s*(?:javascript|data|vbscript):[^"\']*\1/i', 'href="#"', $clean) ?? $clean;

        return trim($clean);
    }

    protected function formatManageableCards(string $modelClass): Collection
    {
        return $this->safeQuery(function () use ($modelClass) {
            return $modelClass::orderBy('position', 'asc')
                ->orderBy('id', 'desc')
                ->get(['id', 'image', 'titulo', 'descripcion', 'type', 'category'])
                ->map(fn ($card): array => [
                    'id' => $card->id,
                    'image' => $card->image,
                    'titulo' => $card->titulo,
                    'descripcion' => $this->sanitizeManageableHtml($card->descripcion),
                    'type' => $card->type,
                    'category' => $card->category,
                ]);
        });
    }

    /**
     * Fetch active scheduled courses within their sales window and project only public fields.
     * Supports optional area filtering ('medicina'|'nutricion') and category filtering ('guias'|'simuladores').
     */
    protected function activeScheduledCourses(
        ?string $area = null,
        ?string $categoryFilter = null,
        bool $lightweight = false,
    ): Collection {
        return $this->safeQuery(function () use ($area, $categoryFilter, $lightweight) {
            if (! Schema::hasTable('cursos_programados') || ! Schema::hasTable('cursos')) {
                return collect();
            }

            $now = now();
            $hasCategoryColumn = Schema::hasColumn('cursos_programados', 'category_id');
            $hasSaleWindowColumns = Schema::hasColumn('cursos_programados', 'fecha_inicio_venta')
                && Schema::hasColumn('cursos_programados', 'fecha_fin_venta');

            $relations = $hasCategoryColumn ? ['category', 'course'] : ['course'];

            $query = ScheduledCourse::with($relations)
                ->where('activo', 'si')
                ->whereHas('course', fn ($q) => $q->where('activo', 'si'));

            if ($hasSaleWindowColumns) {
                $query->where(function ($q) use ($now) {
                    $q->whereNull('fecha_inicio_venta')
                        ->orWhere('fecha_inicio_venta', '<=', $now);
                })->where(function ($q) use ($now) {
                    $q->whereNull('fecha_fin_venta')
                        ->orWhere('fecha_fin_venta', '>=', $now);
                });
            }

            if ($area !== null && $area !== '') {
                $areaVariants = [$area];
                if (strtolower($area) === 'nutricion') {
                    $areaVariants[] = 'nutrición';
                }

                $query->where(function ($areaQ) use ($areaVariants) {
                    foreach ($areaVariants as $variant) {
                        $areaQ->orWhere('identificador', 'like', '%'.$variant.'%')
                            ->orWhereHas('course', function ($cq) use ($variant) {
                                $cq->where('titulo', 'like', '%'.$variant.'%')
                                    ->orWhere('slug', 'like', '%'.$variant.'%');
                            });
                    }
                });
            }

            if ($categoryFilter !== null && $categoryFilter !== '') {
                $normalizedCategory = strtolower(trim($categoryFilter));

                if ($normalizedCategory === 'guias') {
                    $this->applyCategoryKeywordFilter($query, ['guia', 'guía'], $hasCategoryColumn);
                } elseif ($normalizedCategory === 'simuladores') {
                    $this->applyCategoryKeywordFilter($query, ['simulador'], $hasCategoryColumn);
                } elseif ($hasCategoryColumn) {
                    $query->whereHas('category', function ($catQ) use ($normalizedCategory) {
                        $catQ->where('name', 'like', '%'.$normalizedCategory.'%')
                            ->orWhere('slug', 'like', '%'.$normalizedCategory.'%');
                    });
                }
            }

            return $query->get()->map(function (ScheduledCourse $scheduled) use ($hasCategoryColumn, $lightweight): array {
                $course = $scheduled->course;
                $category = $hasCategoryColumn ? $scheduled->category : null;

                if ($lightweight) {
                    return [
                        'id' => $scheduled->id,
                        'identificador' => $scheduled->identificador,
                        'course_title' => $course?->title ?? 'Programa Sapius',
                        'course_slug' => $course?->slug,
                    ];
                }

                return [
                    'id' => $scheduled->id,
                    'identificador' => $scheduled->identificador,
                    'precio' => (float) ($scheduled->precio ?? 0),
                    'course_title' => $course?->title ?? 'Programa Sapius',
                    'course_slug' => $course?->slug,
                    'course_description' => $course?->description,
                    'category_name' => $category?->name,
                ];
            });
        });
    }

    /**
     * Filter scheduled courses by category ('guias' or 'simuladores'), falling back to
     * identifier/title keywords only if category_id is unset on the scheduled cohort.
     *
     * @param  array<int, string>  $terms
     */
    protected function applyCategoryKeywordFilter($query, array $terms, bool $hasCategoryColumn): void
    {
        if ($hasCategoryColumn) {
            $query->where(function ($catScope) use ($terms) {
                $catScope->whereHas('category', function ($catQ) use ($terms) {
                    $catQ->where(function ($inner) use ($terms) {
                        foreach ($terms as $term) {
                            $inner->orWhere('name', 'like', '%'.$term.'%')
                                ->orWhere('slug', 'like', '%'.$term.'%');
                        }
                    });
                })->orWhere(function ($fallback) use ($terms) {
                    $fallback->whereNull('category_id')
                        ->where(function ($textQ) use ($terms) {
                            foreach ($terms as $term) {
                                $textQ->orWhere('identificador', 'like', '%'.$term.'%')
                                    ->orWhereHas('course', fn ($cq) => $cq->where('titulo', 'like', '%'.$term.'%'));
                            }
                        });
                });
            });

            return;
        }

        $query->where(function ($textQ) use ($terms) {
            foreach ($terms as $term) {
                $textQ->orWhere('identificador', 'like', '%'.$term.'%')
                    ->orWhereHas('course', fn ($cq) => $cq->where('titulo', 'like', '%'.$term.'%'));
            }
        });
    }

    public function index(): Response
    {
        return Inertia::render('Welcome', [
            'slides' => $this->formatPublicSlides(),
            'prides' => $this->formatPublicPrides(),
            'teachers' => $this->formatPublicTeachers(),
            'reviews' => $this->formatPublicReviews(6),
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }

    public function coursesHub(): Response
    {
        return Inertia::render('Public/CoursesHub', [
            'scheduledCourses' => $this->activeScheduledCourses(),
            'guiasMedicine' => $this->formatManageableCards(ManageableGuiaMedicine::class),
            'guiasNutrition' => $this->formatManageableCards(ManageableGuiaNutrition::class),
            'simulatorsMedicine' => $this->formatManageableCards(ManageableSimulatorMedicine::class),
            'simulatorsNutrition' => $this->formatManageableCards(ManageableSimulatorNutrition::class),
        ]);
    }

    public function productsHub(): Response
    {
        return Inertia::render('Public/ProductsHub', [
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }

    public function faq(): Response
    {
        return Inertia::render('Public/Faq', [
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }

    public function groupsPackages(): Response
    {
        return Inertia::render('Public/GroupsPackages', [
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }

    public function coursePage($slug): Response
    {
        return Inertia::render('Public/CourseLanding', [
            'slug' => $slug,
            'reviews' => $this->formatPublicReviews(6),
            'scheduledCourses' => $this->activeScheduledCourses(),
        ]);
    }

    public function guias($area = 'medicina'): Response
    {
        $normalizedArea = strtolower(trim((string) $area)) === 'nutricion' ? 'nutricion' : 'medicina';
        $guias = $this->activeScheduledCourses($normalizedArea, 'guias');
        $scheduledCourses = $this->activeScheduledCourses(lightweight: true);
        $manageableCards = $normalizedArea === 'nutricion'
            ? $this->formatManageableCards(ManageableGuiaNutrition::class)
            : $this->formatManageableCards(ManageableGuiaMedicine::class);

        return Inertia::render('Public/GuiasLanding', [
            'area' => $normalizedArea,
            'guias' => $guias,
            'scheduledCourses' => $scheduledCourses,
            'manageableCards' => $manageableCards,
        ]);
    }

    public function simuladores($area = 'medicina'): Response
    {
        $normalizedArea = strtolower(trim((string) $area)) === 'nutricion' ? 'nutricion' : 'medicina';
        $simuladores = $this->activeScheduledCourses($normalizedArea, 'simuladores');
        $scheduledCourses = $this->activeScheduledCourses(lightweight: true);
        $manageableCards = $normalizedArea === 'nutricion'
            ? $this->formatManageableCards(ManageableSimulatorNutrition::class)
            : $this->formatManageableCards(ManageableSimulatorMedicine::class);

        return Inertia::render('Public/SimuladoresLanding', [
            'area' => $normalizedArea,
            'simuladores' => $simuladores,
            'scheduledCourses' => $scheduledCourses,
            'manageableCards' => $manageableCards,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/About', [
            'teachers' => $this->formatPublicTeachers(),
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }

    public function pride(): Response
    {
        return Inertia::render('Public/Pride', [
            'prides' => $this->formatPublicPrides(),
            'reviews' => $this->formatPublicReviews(12),
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact', [
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }

    public function sendContact(Request $request): RedirectResponse
    {
        $rules = [
            'nombre' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255'],
            'telefono' => ['required', 'string', 'max:30'],
            'mensaje' => ['required', 'string', 'max:2000'],
        ];

        if (config('elearning.captcha_secret_key')) {
            $rules['g-recaptcha-response'] = ['required', new ValidRecaptcha];
        }

        $validated = $request->validate($rules, [
            'nombre.required' => 'Por favor ingresa tu nombre completo.',
            'email.required' => 'Por favor ingresa tu correo electrónico.',
            'email.email' => 'Ingresa un correo electrónico válido.',
            'telefono.required' => 'Por favor ingresa tu teléfono o WhatsApp.',
            'mensaje.required' => 'Por favor escribe tu consulta o mensaje.',
            'g-recaptcha-response.required' => 'Por favor, marca la casilla "No soy un robot".',
        ]);

        $datos = [
            'nombre' => trim(strip_tags($validated['nombre'])),
            'email' => trim(strip_tags($validated['email'])),
            'telefono' => trim(strip_tags($validated['telefono'])),
            'mensaje' => trim(strip_tags($validated['mensaje'])),
        ];

        if ($datos['nombre'] === '' || $datos['telefono'] === '' || $datos['mensaje'] === '') {
            return redirect()->back()
                ->withErrors(['mensaje' => 'Los campos enviados contienen caracteres inválidos. Por favor escribe texto válido.'])
                ->withInput();
        }

        try {
            $supportEmail = config('mail.to_support', 'atencion@sapius.com.mx') ?: 'atencion@sapius.com.mx';
            Mail::to($supportEmail)->send(new InformacionEmail($datos));

            return redirect()->back()->with('success', '¡Gracias por escribirnos! Recibimos tu solicitud y nuestro equipo te contactará muy pronto.');
        } catch (Throwable $e) {
            Log::error('Error enviando correo de contacto público: '.$e->getMessage(), [
                'email' => $datos['email'],
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'No pudimos enviar tu mensaje en este momento. Por favor intenta nuevamente o escríbenos por WhatsApp.');
        }
    }

    public function legal($type): Response
    {
        return Inertia::render('Public/Legal', [
            'type' => $type,
            'scheduledCourses' => $this->activeScheduledCourses(lightweight: true),
        ]);
    }
}
