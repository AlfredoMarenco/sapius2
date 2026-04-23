<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Media;
use App\Models\HomeworkAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CourseBuilderController extends Controller
{
    /**
     * Display the course builder interface.
     */
    public function show(Course $course)
    {
        return Inertia::render('Admin/Courses/Builder', [
            'course' => $course->load([
                'category',
                'modules.lessons.media',
                'modules.lessons.quizzes.questions.answers',
                'modules.lessons.homeworkAssignments'
            ]),
        ]);
    }

    /**
     * Store a new module for the course.
     */
    public function storeModule(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|string',
            'position' => 'nullable|integer',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $course->modules()->create([
            'title' => $validated['title'],
            'image' => $validated['image'],
            'slug' => Str::slug($validated['title']) . '-' . time(),
            'position' => $validated['position'] ?? ($course->modules()->count() + 1),
            'is_scheduled' => $validated['is_scheduled'] ?? false,
            'available_at' => $validated['available_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return back()->with('success', 'Módulo añadido correctamente');
    }

    /**
     * Update module details.
     */
    public function updateModule(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'position' => 'nullable|integer',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $module->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . time();
        }

        $module->update($validated);

        return back()->with('success', 'Módulo actualizado');
    }

    /**
     * Delete a module.
     */
    public function destroyModule(Module $module)
    {
        if ($module->lessons()->exists()) {
            return back()->with('error', 'No se puede eliminar un módulo que ya tiene lecciones. Vacíalo primero.');
        }

        $module->delete();
        return back()->with('success', 'Módulo eliminado correctamente');
    }

    /**
     * Store a new lesson for a module.
     */
    public function storeLesson(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'position' => 'nullable|integer',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $module->lessons()->create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . time(),
            'position' => $validated['position'] ?? ($module->lessons()->count() + 1),
            'is_scheduled' => $validated['is_scheduled'] ?? false,
            'available_at' => $validated['available_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return back()->with('success', 'Lección añadida correctamente');
    }

    /**
     * Delete a lesson.
     */
    public function destroyLesson(Lesson $lesson)
    {
        if ($lesson->media()->exists() || $lesson->quizzes()->exists() || $lesson->homeworkAssignments()->exists()) {
            return back()->with('error', 'No se puede eliminar una lección que ya tiene contenido (media, exámenes o tareas).');
        }

        $lesson->delete();
        return back()->with('success', 'Lección eliminada correctamente');
    }

    /**
     * Update lesson content.
     */
    public function updateLesson(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $lesson->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . time();
        }

        $lesson->update($validated);

        return back()->with('success', 'Contenido de la lección actualizado');
    }

    /**
     * Add media to a lesson.
     */
    public function storeMedia(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'file_type' => 'required|string', // video, image, document, link
            'file_path' => 'required|string',
            'is_downloadable' => 'boolean',
        ]);

        $lesson->media()->create($validated);

        return back()->with('success', 'Recurso añadido');
    }

    /**
     * Delete media from a lesson.
     */
    public function destroyMedia(Media $media)
    {
        $media->delete();
        return back()->with('success', 'Recurso eliminado');
    }

    /**
     * Add/Update a quiz for a lesson.
     */
    public function storeQuiz(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:EXANI I,EXANI II,EGEL,ENARM,ENQ,PRÁCTICA,EXAMEN',
            'time_limit' => 'nullable|integer',
            'attempts_allowed' => 'required|integer|min:1',
            'passing_score' => 'required|numeric|min:0|max:100',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $lesson->quizzes()->updateOrCreate(
            ['lesson_id' => $lesson->id],
            $validated
        );

        return back()->with('success', 'Examen actualizado correctamente');
    }

    /**
     * Store/Update a question and its answers.
     */
    public function storeQuestion(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'text' => 'required|string',
            'explanation' => 'nullable|string',
            'points' => 'required|integer|min:0',
            'answers' => 'required|array|min:2',
            'answers.*.text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        $question = $quiz->questions()->create([
            'text' => $validated['text'],
            'explanation' => $validated['explanation'],
            'points' => $validated['points'],
        ]);

        foreach ($validated['answers'] as $answerData) {
            $question->answers()->create($answerData);
        }

        return back()->with('success', 'Pregunta añadida correctamente');
    }

    /**
     * Delete a question.
     */
    public function destroyQuestion(Question $question)
    {
        $question->delete();
        return back()->with('success', 'Pregunta eliminada');
    }

    /**
     * Add/Update homework for a lesson.
     */
    public function storeHomework(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'points' => 'required|integer|min:0',
        ]);

        $lesson->homeworkAssignments()->updateOrCreate(
            ['lesson_id' => $lesson->id],
            $validated
        );

        return back()->with('success', 'Tarea actualizada correctamente');
    }
}
