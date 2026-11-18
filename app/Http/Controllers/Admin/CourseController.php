<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Category;
use App\Models\Course;
use App\Models\InteractivePdf;
use App\Models\Lesson;
use App\Models\Media;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\User;
use App\Services\CourseCategoryService;
use App\Traits\OptimizesImages;
use App\Traits\SanitizesRichHtml;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CourseController extends Controller
{
    use OptimizesImages;
    use SanitizesRichHtml;

    public function index()
    {
        $courses = Course::with('category')
            ->withCount(['modules', 'scheduledCourses'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (Course $course) {
                if (! $course->relationLoaded('category') || ! $course->category) {
                    $fallbackCat = CourseCategoryService::getCategoryForCourse($course->id);
                    if ($fallbackCat) {
                        $course->setRelation('category', $fallbackCat);
                    }
                }

                return $course;
            });

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function getAll($active)
    {
        if ($active == 'enable') {
            $cursos = Course::where('activo', 'si')->get();
        } else {
            $cursos = Course::where('activo', 'no')->get();
        }

        return response()->json($cursos);
    }

    public function create()
    {
        return Inertia::render('Admin/Courses/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $course = new Course;
        $course->user_id = auth()->id();
        $course->title = $validated['title'];
        $course->slug = Str::slug($validated['title']).'-'.time();
        $course->description = $this->sanitizeRichHtml($validated['description'] ?? null, true);
        $course->activo = 'si';

        if ($request->hasFile('image')) {
            $course->image = $this->optimizeAndStoreImage($request->file('image'), 'courses');
        }

        $course->save();

        if (! empty($validated['category_id'])) {
            CourseCategoryService::setForCourse($course->id, (int) $validated['category_id']);
            $course->scheduledCourses()->update(['category_id' => (int) $validated['category_id']]);
        }

        return redirect()->route('admin.courses.index')->with('success', 'Curso creado con éxito');
    }

    public function show($id)
    {
        $course = Course::with(['category', 'modules.lessons', 'scheduledCourses.instructor'])
            ->withCount('modules')
            ->findOrFail($id);
        if (! $course->category) {
            $fallbackCat = CourseCategoryService::getCategoryForCourse($course->id);
            if ($fallbackCat) {
                $course->setRelation('category', $fallbackCat);
            }
        }

        $instructors = User::whereHas('roles', function ($q) {
            $q->where('roles.slug', 'instructor');
        })->get();

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'instructors' => $instructors,
            'categories' => Category::all(),
        ]);
    }

    public function edit($id)
    {
        $course = Course::with('category')->findOrFail($id);
        $resolvedCategoryId = $course->category?->id ?? CourseCategoryService::getCategoryIdForCourse($course->id);

        return Inertia::render('Admin/Courses/Edit', [
            'course' => array_merge($course->toArray(), [
                'category_id' => $resolvedCategoryId ?? '',
            ]),
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $course->title = $validated['title'];
        $course->description = $this->sanitizeRichHtml($validated['description'] ?? null, true);

        if ($request->has('activo')) {
            $course->activo = $request->activo ? 'si' : 'no';
        }

        if ($request->hasFile('image')) {
            $course->image = $this->optimizeAndStoreImage($request->file('image'), 'courses');
        }

        $course->save();

        if ($request->filled('category_id')) {
            CourseCategoryService::setForCourse($course->id, (int) $request->category_id);
            $course->scheduledCourses()->update(['category_id' => (int) $request->category_id]);
        }

        return redirect()->route('admin.courses.index')->with('success', 'Curso actualizado con éxito');
    }

    public function toggle($id)
    {
        $course = Course::findOrFail($id);
        $course->activo = ($course->activo === 'si') ? 'no' : 'si';
        $course->save();

        return redirect()->back()->with('success', 'Estado del curso actualizado');
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->activo = 'no';
        $course->save();

        return redirect()->route('admin.courses.index')->with('success', 'Curso desactivado correctamente');
    }

    public function copyIndex()
    {
        $courses = Course::orderBy('titulo', 'asc')->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'title' => $c->title,
                'activo' => $c->activo,
                'image' => $c->image,
            ];
        });

        return Inertia::render('Admin/Courses/Copy', [
            'courses' => $courses,
        ]);
    }

    public function copyCreate(Request $request)
    {
        set_time_limit(300);

        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
        ]);

        if ($request->boolean('copyAll')) {
            DB::transaction(function () use ($request) {
                $cursoOriginal = Course::with([
                    'modules.lessons.quizzes.questions.answers',
                    'modules.lessons.media',
                    'modules.quizzes.questions.answers',
                    'modules.media',
                ])->findOrFail($request->curso_id);

                $nuevoCurso = new Course;
                $nuevoCurso->user_id = auth()->id() ?? $cursoOriginal->user_id;
                $nuevoCurso->title = $cursoOriginal->title.' (Copia)';
                $nuevoCurso->slug = Str::slug($cursoOriginal->title).'-copia-'.time();
                $nuevoCurso->description = $cursoOriginal->description;
                $nuevoCurso->image = $cursoOriginal->image;
                $nuevoCurso->activo = 'si';
                $nuevoCurso->save();

                // Mapeo viejo_id -> nuevo_id
                $nuevosModulos = [];

                // Copiar Módulos (leccion_id = 0)
                $modulos = Module::where('curso_id', $cursoOriginal->id)->get();
                foreach ($modulos as $modOriginal) {
                    $nuevoMod = $modOriginal->replicate();
                    $nuevoMod->curso_id = $nuevoCurso->id;
                    $nuevoMod->leccion_id = 0;
                    $nuevoMod->save();
                    $nuevosModulos[$modOriginal->id] = $nuevoMod->id;

                    // Copiar Quizzes, Medias e InteractivePdfs del módulo
                    $this->copyQuizzes($modOriginal->id, $nuevoMod->id, $nuevoCurso->id);
                    $this->copyMedias($modOriginal->id, $nuevoMod->id);
                    $this->copyInteractivePdfs($modOriginal->id, $nuevoMod->id);
                }

                // Copiar Clases (leccion_id > 0)
                $clases = Lesson::where('curso_id', $cursoOriginal->id)->get();
                foreach ($clases as $claseOriginal) {
                    if (! isset($nuevosModulos[$claseOriginal->leccion_id])) {
                        continue;
                    }

                    $nuevaClase = $claseOriginal->replicate();
                    $nuevaClase->curso_id = $nuevoCurso->id;
                    $nuevaClase->leccion_id = $nuevosModulos[$claseOriginal->leccion_id];
                    $nuevaClase->save();

                    // Copiar Quizzes, Medias e InteractivePdfs de la clase
                    $this->copyQuizzes($claseOriginal->id, $nuevaClase->id, $nuevoCurso->id);
                    $this->copyMedias($claseOriginal->id, $nuevaClase->id);
                    $this->copyInteractivePdfs($claseOriginal->id, $nuevaClase->id);
                }
            });

            return redirect()->route('admin.cursos.index')->with('success', 'El curso ha sido clonado completamente con éxito');
        } else {
            return redirect()->route('admin.cursos.details.copy', ['curso' => $request->curso_id]);
        }
    }

    public function getAllContentOfCurso($curso_id)
    {
        $course = Course::with([
            'modules.lessons',
            'category',
        ])->findOrFail($curso_id);

        return Inertia::render('Admin/Courses/CopyDetails', [
            'course' => $course,
        ]);
    }

    public function copySelectContentOfCourse(Request $request)
    {
        set_time_limit(300);

        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'items' => 'required|array|min:1',
        ]);

        DB::transaction(function () use ($request) {
            $itemsSeleccionados = $request->items;
            $cursoOriginal = Course::findOrFail($request->curso_id);

            $nuevoCurso = new Course;
            $nuevoCurso->user_id = auth()->id() ?? $cursoOriginal->user_id;
            $nuevoCurso->title = $cursoOriginal->title.' (Copia Parcial)';
            $nuevoCurso->slug = Str::slug($cursoOriginal->title).'-copia-'.time();
            $nuevoCurso->description = $cursoOriginal->description;
            $nuevoCurso->image = $cursoOriginal->image;
            $nuevoCurso->activo = 'si';
            $nuevoCurso->save();

            $nuevosModulos = [];

            // Módulos seleccionados
            $modulos = Module::where('curso_id', $cursoOriginal->id)
                ->whereIn('id', $itemsSeleccionados)
                ->get();

            foreach ($modulos as $modOriginal) {
                $nuevoMod = $modOriginal->replicate();
                $nuevoMod->curso_id = $nuevoCurso->id;
                $nuevoMod->leccion_id = 0;
                $nuevoMod->save();
                $nuevosModulos[$modOriginal->id] = $nuevoMod->id;

                $this->copyQuizzes($modOriginal->id, $nuevoMod->id, $nuevoCurso->id);
                $this->copyMedias($modOriginal->id, $nuevoMod->id);
                $this->copyInteractivePdfs($modOriginal->id, $nuevoMod->id);
            }

            // Clases seleccionadas
            $clases = Lesson::where('curso_id', $cursoOriginal->id)
                ->whereIn('id', $itemsSeleccionados)
                ->get();

            foreach ($clases as $claseOriginal) {
                if (! isset($nuevosModulos[$claseOriginal->leccion_id])) {
                    continue;
                }

                $nuevaClase = $claseOriginal->replicate();
                $nuevaClase->curso_id = $nuevoCurso->id;
                $nuevaClase->leccion_id = $nuevosModulos[$claseOriginal->leccion_id];
                $nuevaClase->save();

                $this->copyQuizzes($claseOriginal->id, $nuevaClase->id, $nuevoCurso->id);
                $this->copyMedias($claseOriginal->id, $nuevaClase->id);
                $this->copyInteractivePdfs($claseOriginal->id, $nuevaClase->id);
            }
        });

        return redirect()->route('admin.cursos.index')->with('success', 'Los contenidos seleccionados fueron copiados con éxito');
    }

    private function copyQuizzes($origLessonId, $newLessonId, $newCourseId)
    {
        $quizzes = Quiz::where('leccion_id', $origLessonId)->get();
        foreach ($quizzes as $q) {
            $nuevoQ = $q->replicate();
            $nuevoQ->curso_id = $newCourseId;
            $nuevoQ->leccion_id = $newLessonId;
            $nuevoQ->save();

            $preguntas = Question::where('prueba_id', $q->id)->get();
            foreach ($preguntas as $p) {
                $nuevaP = $p->replicate();
                $nuevaP->prueba_id = $nuevoQ->id;
                $nuevaP->save();

                $respuestas = Answer::where('pregunta_id', $p->id)->get();
                foreach ($respuestas as $r) {
                    $nuevaR = $r->replicate();
                    $nuevaR->pregunta_id = $nuevaP->id;
                    $nuevaR->save();
                }
            }
        }
    }

    private function copyMedias($origLessonId, $newLessonId)
    {
        $medias = Media::where('leccion_id', $origLessonId)->get();
        foreach ($medias as $m) {
            $nuevoM = $m->replicate();
            $nuevoM->leccion_id = $newLessonId;
            $nuevoM->save();
        }
    }

    private function copyInteractivePdfs($origLessonId, $newLessonId)
    {
        $pdfs = InteractivePdf::where('leccion_id', $origLessonId)->get();
        foreach ($pdfs as $pdf) {
            $nuevoPdf = $pdf->replicate();
            $nuevoPdf->leccion_id = $newLessonId;

            if (! empty($pdf->file_path)) {
                $origFilename = basename($pdf->file_path);
                $ext = pathinfo($origFilename, PATHINFO_EXTENSION) ?: 'pdf';
                $newFilename = Str::random(40).'.'.$ext;

                if (Storage::disk('public')->exists('files/interactive_pdfs/'.$origFilename)) {
                    Storage::disk('public')->copy(
                        'files/interactive_pdfs/'.$origFilename,
                        'files/interactive_pdfs/'.$newFilename
                    );
                    $nuevoPdf->file_path = $newFilename;
                } elseif (Storage::disk('local')->exists('files/interactive_pdfs/'.$origFilename)) {
                    Storage::disk('local')->copy(
                        'files/interactive_pdfs/'.$origFilename,
                        'files/interactive_pdfs/'.$newFilename
                    );
                    $nuevoPdf->file_path = $newFilename;
                }
            }

            $nuevoPdf->save();
        }
    }
}
