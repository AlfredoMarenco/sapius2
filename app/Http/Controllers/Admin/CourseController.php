<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Category;
use App\Models\ScheduledCourse;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\User;

use App\Traits\OptimizesImages;

class CourseController extends Controller
{
    use OptimizesImages;
    public function index()
    {
        $courses = Course::with('category')
            ->withCount(['modules', 'scheduledCourses'])
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function getAll($active)
    {
        if ($active == "enable") {
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
            'category_id' => 'required',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $course = new Course();
        $course->user_id = auth()->id();
        $course->category_id = $validated['category_id'];
        $course->title = $validated['title'];
        $course->slug = Str::slug($validated['title']) . '-' . time();
        $course->description = $validated['description'];
        $course->activo = 'si';
        
        if ($request->hasFile('image')) {
            $course->image = $this->optimizeAndStoreImage($request->file('image'), 'courses');
        }

        $course->save();

        return redirect()->route('admin.cursos.index')->with('success', 'Curso creado con éxito');
    }

    public function show($id)
    {
        $course = Course::with(['category', 'modules.lessons', 'scheduledCourses.instructor'])->findOrFail($id);
        
        $instructors = User::whereHas('roles', function ($q) {
            $q->where('name', 'instructor');
        })->get();

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'instructors' => $instructors,
        ]);
    }

    public function edit($id)
    {
        $course = Course::findOrFail($id);

        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required',
            'description' => 'nullable|string',
        ]);

        $course->title = $request->title;
        $course->category_id = $request->category_id;
        $course->description = $request->description;

        if ($request->has('activo')) {
            $course->activo = $request->activo ? 'si' : 'no';
        }

        if ($request->hasFile('image')) {
            $course->image = $this->optimizeAndStoreImage($request->file('image'), 'courses');
        }

        $course->save();

        return redirect()->route('admin.cursos.index')->with('success', 'Curso actualizado con éxito');
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
        $course->delete();

        return redirect()->route('admin.cursos.index')->with('success', 'Curso eliminado');
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
            $cursoOriginal = Course::with([
                'modules.lessons.quizzes.questions.answers',
                'modules.lessons.media',
                'modules.quizzes.questions.answers',
                'modules.media',
            ])->findOrFail($request->curso_id);

            $nuevoCurso = new Course();
            $nuevoCurso->user_id = auth()->id() ?? $cursoOriginal->user_id;
            $nuevoCurso->category_id = $cursoOriginal->category_id;
            $nuevoCurso->title = $cursoOriginal->title . ' (Copia)';
            $nuevoCurso->slug = Str::slug($cursoOriginal->title) . '-copia-' . time();
            $nuevoCurso->description = $cursoOriginal->description;
            $nuevoCurso->image = $cursoOriginal->image;
            $nuevoCurso->activo = 'si';
            $nuevoCurso->save();

            // Mapeo viejo_id -> nuevo_id
            $nuevosModulos = [];

            // Copiar Módulos (leccion_id = 0)
            $modulos = \App\Models\Module::where('curso_id', $cursoOriginal->id)->get();
            foreach ($modulos as $modOriginal) {
                $nuevoMod = $modOriginal->replicate();
                $nuevoMod->curso_id = $nuevoCurso->id;
                $nuevoMod->leccion_id = 0;
                $nuevoMod->save();
                $nuevosModulos[$modOriginal->id] = $nuevoMod->id;

                // Copiar Quizzes del módulo
                $this->copyQuizzes($modOriginal->id, $nuevoMod->id, $nuevoCurso->id);
                // Copiar Medias del módulo
                $this->copyMedias($modOriginal->id, $nuevoMod->id);
            }

            // Copiar Clases (leccion_id > 0)
            $clases = \App\Models\Lesson::where('curso_id', $cursoOriginal->id)->get();
            foreach ($clases as $claseOriginal) {
                if (!isset($nuevosModulos[$claseOriginal->leccion_id])) continue;

                $nuevaClase = $claseOriginal->replicate();
                $nuevaClase->curso_id = $nuevoCurso->id;
                $nuevaClase->leccion_id = $nuevosModulos[$claseOriginal->leccion_id];
                $nuevaClase->save();

                // Copiar Quizzes de la clase
                $this->copyQuizzes($claseOriginal->id, $nuevaClase->id, $nuevoCurso->id);
                // Copiar Medias de la clase
                $this->copyMedias($claseOriginal->id, $nuevaClase->id);
            }

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

        $itemsSeleccionados = $request->items;
        $cursoOriginal = Course::findOrFail($request->curso_id);

        $nuevoCurso = new Course();
        $nuevoCurso->user_id = auth()->id() ?? $cursoOriginal->user_id;
        $nuevoCurso->category_id = $cursoOriginal->category_id;
        $nuevoCurso->title = $cursoOriginal->title . ' (Copia Parcial)';
        $nuevoCurso->slug = Str::slug($cursoOriginal->title) . '-copia-' . time();
        $nuevoCurso->description = $cursoOriginal->description;
        $nuevoCurso->image = $cursoOriginal->image;
        $nuevoCurso->activo = 'si';
        $nuevoCurso->save();

        $nuevosModulos = [];

        // Módulos seleccionados
        $modulos = \App\Models\Module::where('curso_id', $cursoOriginal->id)
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
        }

        // Clases seleccionadas
        $clases = \App\Models\Lesson::where('curso_id', $cursoOriginal->id)
            ->whereIn('id', $itemsSeleccionados)
            ->get();

        foreach ($clases as $claseOriginal) {
            if (!isset($nuevosModulos[$claseOriginal->leccion_id])) continue;

            $nuevaClase = $claseOriginal->replicate();
            $nuevaClase->curso_id = $nuevoCurso->id;
            $nuevaClase->leccion_id = $nuevosModulos[$claseOriginal->leccion_id];
            $nuevaClase->save();

            $this->copyQuizzes($claseOriginal->id, $nuevaClase->id, $nuevoCurso->id);
            $this->copyMedias($claseOriginal->id, $nuevaClase->id);
        }

        return redirect()->route('admin.cursos.index')->with('success', 'Los contenidos seleccionados fueron copiados con éxito');
    }

    private function copyQuizzes($origLessonId, $newLessonId, $newCourseId)
    {
        $quizzes = \App\Models\Quiz::where('leccion_id', $origLessonId)->get();
        foreach ($quizzes as $q) {
            $nuevoQ = $q->replicate();
            $nuevoQ->curso_id = $newCourseId;
            $nuevoQ->leccion_id = $newLessonId;
            $nuevoQ->save();

            $preguntas = \App\Models\Question::where('prueba_id', $q->id)->get();
            foreach ($preguntas as $p) {
                $nuevaP = $p->replicate();
                $nuevaP->prueba_id = $nuevoQ->id;
                $nuevaP->save();

                $respuestas = \App\Models\Answer::where('pregunta_id', $p->id)->get();
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
        $medias = \App\Models\Media::where('leccion_id', $origLessonId)->get();
        foreach ($medias as $m) {
            $nuevoM = $m->replicate();
            $nuevoM->leccion_id = $newLessonId;
            $nuevoM->save();
        }
    }
}

