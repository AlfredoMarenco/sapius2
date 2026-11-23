<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Media;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Traits\OptimizesImages;
use App\Traits\SanitizesRichHtml;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CourseBuilderController extends Controller
{
    use OptimizesImages;
    use SanitizesRichHtml;

    /**
     * Display the course builder interface.
     */
    public function show(Course $course)
    {
        $course->load([
            'category',
            'modules.lessons.media',
            'modules.lessons.quizzes.questions.answers',
            'modules.lessons.homeworkAssignments',
        ]);

        $this->revealCorrectAnswers($course);

        return Inertia::render('Admin/Courses/Builder', [
            'course' => $course,
            'routePrefix' => 'admin',
        ]);
    }

    /**
     * Reveal hidden correct answer flags for authorized Builder views.
     */
    protected function revealCorrectAnswers(Course $course): void
    {
        foreach ($course->modules ?? [] as $module) {
            foreach ($module->lessons ?? [] as $lesson) {
                foreach ($lesson->quizzes ?? [] as $quiz) {
                    foreach ($quiz->questions ?? [] as $question) {
                        if ($question->answers) {
                            $question->answers->makeVisible(['correcto', 'is_correct']);
                        }
                    }
                }
            }
        }
    }

    /**
     * Sanitize HTML input to strip script tags, inline event handlers, and dangerous URIs.
     */
    protected function sanitizeHtml(?string $html, bool $nullIfEmpty = false): ?string
    {
        return $this->sanitizeRichHtml($html, $nullIfEmpty);
    }

    /**
     * Upload and optimize an image pasted/inserted in the rich text editor.
     */
    public function uploadEditorImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:4096',
            'course_id' => 'nullable|integer',
        ]);

        $path = $this->optimizeAndStoreImage($request->file('image'), 'editor');

        return response()->json([
            'url' => '/media/stream/'.$path,
        ]);
    }

    /**
     * Store an uploaded question/answer image in storage/app/images/preguntas and return basename.
     */
    protected function storeQuestionImage(UploadedFile $file): string
    {
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        $guessed = strtolower((string) $file->guessExtension());
        $client = strtolower((string) $file->getClientOriginalExtension());

        if ($guessed !== '' && ! in_array($guessed, $allowed, true)) {
            throw ValidationException::withMessages([
                'image' => ['Formato de imagen no válido. Solo se permiten archivos JPG, JPEG, PNG o WEBP.'],
            ]);
        }

        $ext = $guessed !== '' ? $guessed : $client;
        if (! in_array($ext, $allowed, true)) {
            throw ValidationException::withMessages([
                'image' => ['Formato de imagen no válido. Solo se permiten archivos JPG, JPEG, PNG o WEBP.'],
            ]);
        }

        $destDir = storage_path('app/images/preguntas');
        if (! is_dir($destDir)) {
            mkdir($destDir, 0750, true);
        }

        $filename = Str::random(40).'.'.$ext;
        $file->move($destDir, $filename);

        return basename($filename);
    }

    /**
     * Store a new module for the course.
     */
    public function storeModule(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|string',
            'position' => 'nullable|integer|min:0',
            'posicion' => 'nullable|integer|min:0',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $title = strip_tags($validated['title']);
        $position = $validated['posicion'] ?? $validated['position'] ?? ($course->modules()->count() + 1);

        $course->modules()->create([
            'title' => $title,
            'image' => $validated['image'] ?? null,
            'slug' => Str::slug($title).'-'.time(),
            'position' => $position,
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
            'position' => 'nullable|integer|min:0',
            'posicion' => 'nullable|integer|min:0',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $data = array_intersect_key($validated, array_flip(['title', 'image']));

        if (isset($data['title'])) {
            $data['title'] = strip_tags($data['title']);
            if ($data['title'] !== $module->title) {
                $data['slug'] = Str::slug($data['title']).'-'.time();
            }
        }

        $position = $validated['posicion'] ?? $validated['position'] ?? null;
        if ($position !== null) {
            $data['position'] = $position;
        }

        if (! empty($data)) {
            $module->update($data);
        }

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
            'position' => 'nullable|integer|min:0',
            'posicion' => 'nullable|integer|min:0',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $title = strip_tags($validated['title']);
        $position = $validated['posicion'] ?? $validated['position'] ?? ($module->lessons()->count() + 1);

        $module->lessons()->create([
            'course_id' => $module->curso_id,
            'title' => $title,
            'slug' => Str::slug($title).'-'.time(),
            'position' => $position,
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
            'summary' => 'nullable|string',
            'position' => 'nullable|integer|min:0',
            'posicion' => 'nullable|integer|min:0',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $data = array_intersect_key($validated, array_flip(['title', 'content', 'summary']));

        if (isset($data['title'])) {
            $data['title'] = strip_tags($data['title']);
            if ($data['title'] !== $lesson->title) {
                $data['slug'] = Str::slug($data['title']).'-'.time();
            }
        }

        if (array_key_exists('content', $data)) {
            $data['content'] = $this->sanitizeHtml($data['content']);
        }

        if (array_key_exists('summary', $data)) {
            $data['summary'] = $this->sanitizeHtml($data['summary']);
        }

        $position = $validated['posicion'] ?? $validated['position'] ?? null;
        if ($position !== null) {
            $data['position'] = $position;
        }

        if (! empty($data)) {
            $lesson->update($data);
        }

        return back()->with('success', 'Contenido de la lección actualizado');
    }

    /**
     * Add media to a lesson.
     */
    public function storeMedia(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'file_type' => 'required|string',
            'file_path' => 'required|string',
            'is_downloadable' => 'boolean',
        ]);

        $tipoMap = [
            'image' => 'imagen',
            'document' => 'archivo',
            'link' => 'liga',
            'video' => 'video',
            'videoext' => 'videoext',
        ];

        $tipo = $tipoMap[$validated['file_type']] ?? $validated['file_type'];

        $lesson->media()->create([
            'tipo' => $tipo,
            'ruta' => $validated['file_path'],
            'downloadable' => $validated['is_downloadable'] ?? false,
            'activo' => 'si',
            'programable' => 'si',
        ]);

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
     * Add/Update a quiz for a lesson (supports multiple quizzes per lesson; updates only when quiz_id is provided).
     */
    public function storeQuiz(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'quiz_id' => ['nullable', 'integer', Rule::exists(Quiz::class, 'id')],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'descripcion' => 'nullable|string',
            'type' => 'required|in:EXANI,EXANI I,EXANI II,EGEL,ENARM,ENQ,PRÁCTICA,EXAMEN',
            'time_limit' => ['nullable', function ($attribute, $value, $fail) {
                if ($value === null || $value === '') {
                    return;
                }
                if (is_numeric($value) && (int) $value >= 0) {
                    return;
                }
                if (is_string($value) && preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $value)) {
                    return;
                }
                $fail('El límite de tiempo debe ser minutos enteros o formato HH:MM:SS.');
            }],
            'attempts_allowed' => 'required|integer|min:1',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'tiempo_caducidad' => 'nullable|string|max:50',
            'tiempo_vigencia' => 'nullable|string|max:50',
            'is_scheduled' => 'boolean',
            'available_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:available_at',
        ]);

        $tipo = $validated['type'];
        if (str_starts_with($tipo, 'EXANI')) {
            $tipo = 'EXANI';
        } elseif (str_starts_with($tipo, 'ENARM')) {
            $tipo = 'ENARM';
        } elseif (! in_array($tipo, ['EXANI', 'EGEL', 'ENARM'], true)) {
            $tipo = 'EGEL';
        }

        $timeLimit = $validated['time_limit'] ?? null;
        if (is_numeric($timeLimit)) {
            $minsTotal = (int) $timeLimit;
            $hours = intdiv($minsTotal, 60);
            $mins = $minsTotal % 60;
            $timeString = sprintf('%02d:%02d:00', $hours, $mins);
        } elseif (is_string($timeLimit) && preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $timeLimit)) {
            $parts = explode(':', $timeLimit);
            $timeString = count($parts) === 2
                ? sprintf('%02d:%02d:00', (int) $parts[0], (int) $parts[1])
                : sprintf('%02d:%02d:%02d', (int) $parts[0], (int) $parts[1], (int) $parts[2]);
        } else {
            $timeString = '01:00:00';
        }

        $descripcion = $this->sanitizeHtml($validated['descripcion'] ?? $validated['description'] ?? null, true);

        $quizData = [
            'course_id' => $lesson->curso_id,
            'title' => strip_tags($validated['title']),
            'type' => $tipo,
            'time_limit' => $timeString,
            'attempts_allowed' => (int) $validated['attempts_allowed'],
        ];

        if ($request->exists('description') || $request->exists('descripcion')) {
            $quizData['description'] = $descripcion;
        }

        DB::transaction(function () use ($request, $validated, $lesson, $quizData) {
            if (! empty($validated['quiz_id'])) {
                $quiz = $lesson->quizzes()->where('id', (int) $validated['quiz_id'])->firstOrFail();
                $quiz->fill($quizData);
            } else {
                $quiz = $lesson->quizzes()->make($quizData);
            }

            if ($request->has('tiempo_caducidad') && Schema::hasColumn('pruebas', 'tiempo_caducidad')) {
                $quiz->tiempo_caducidad = $validated['tiempo_caducidad'];
            }

            if ($request->has('tiempo_vigencia') && Schema::hasColumn('pruebas', 'tiempo_vigencia')) {
                $quiz->tiempo_vigencia = $validated['tiempo_vigencia'];
            }

            $quiz->save();
        });

        return back()->with('success', 'Examen guardado correctamente');
    }

    /**
     * Delete a quiz and its questions/answers.
     */
    public function destroyQuiz(Quiz $quiz)
    {
        DB::transaction(function () use ($quiz) {
            $quiz->load('questions');
            foreach ($quiz->questions as $question) {
                $question->answers()->delete();
            }
            $quiz->questions()->delete();
            $quiz->delete();
        });

        return back()->with('success', 'Examen eliminado correctamente');
    }

    /**
     * Store a new question and its answers.
     */
    public function storeQuestion(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'text' => 'required|string',
            'explanation' => 'nullable|string',
            'points' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'answers' => 'required|array|min:2',
            'answers.*.text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
            'answers.*.image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'answers.*.imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $hasCorrect = collect($validated['answers'])->contains(
            fn ($a) => filter_var($a['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN)
        );
        if (! $hasCorrect) {
            throw ValidationException::withMessages([
                'answers' => ['Debe marcar al menos una respuesta como correcta.'],
            ]);
        }

        $questionImageFile = $request->file('image') ?? $request->file('imagen');
        $questionImage = $questionImageFile ? $this->storeQuestionImage($questionImageFile) : null;

        DB::transaction(function () use ($request, $validated, $quiz, $questionImage) {
            $questionData = [
                'text' => $this->sanitizeHtml($validated['text']),
                'explanation' => $this->sanitizeHtml($validated['explanation'] ?? null),
                'points' => (float) $validated['points'],
            ];

            if ($questionImage !== null) {
                $questionData['image'] = $questionImage;
            }

            $question = $quiz->questions()->create($questionData);

            foreach ($validated['answers'] as $index => $answerData) {
                $answerImageFile = $request->file("answers.{$index}.image") ?? $request->file("answers.{$index}.imagen");
                $answerImage = $answerImageFile ? $this->storeQuestionImage($answerImageFile) : null;

                $createAnswer = [
                    'text' => $this->sanitizeHtml($answerData['text']),
                    'is_correct' => filter_var($answerData['is_correct'], FILTER_VALIDATE_BOOLEAN),
                    'position' => $index + 1,
                    'activo' => 'si',
                ];

                if ($answerImage !== null) {
                    $createAnswer['image'] = $answerImage;
                }

                $question->answers()->create($createAnswer);
            }
        });

        return back()->with('success', 'Pregunta añadida correctamente');
    }

    /**
     * Update an existing question and its answers.
     */
    public function updateQuestion(Request $request, Question $question)
    {
        $validated = $request->validate([
            'text' => 'required|string',
            'explanation' => 'nullable|string',
            'points' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'answers' => 'required|array|min:2',
            'answers.*.id' => ['nullable', Rule::exists(Answer::class, 'id')],
            'answers.*.text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
            'answers.*.image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'answers.*.imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $hasCorrect = collect($validated['answers'])->contains(
            fn ($a) => filter_var($a['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN)
        );
        if (! $hasCorrect) {
            throw ValidationException::withMessages([
                'answers' => ['Debe marcar al menos una respuesta como correcta.'],
            ]);
        }

        $questionImageFile = $request->file('image') ?? $request->file('imagen');
        $questionImage = $questionImageFile ? $this->storeQuestionImage($questionImageFile) : null;

        DB::transaction(function () use ($request, $validated, $question, $questionImage) {
            $updateQuestion = [
                'text' => $this->sanitizeHtml($validated['text']),
                'explanation' => $this->sanitizeHtml($validated['explanation'] ?? null),
                'points' => (float) $validated['points'],
            ];

            if ($questionImage !== null) {
                $updateQuestion['image'] = $questionImage;
            }

            $question->update($updateQuestion);

            $existingAnswerIds = [];
            foreach ($validated['answers'] as $index => $answerData) {
                $answerImageFile = $request->file("answers.{$index}.image") ?? $request->file("answers.{$index}.imagen");
                $answerImage = $answerImageFile ? $this->storeQuestionImage($answerImageFile) : null;

                $payload = [
                    'text' => $this->sanitizeHtml($answerData['text']),
                    'is_correct' => filter_var($answerData['is_correct'], FILTER_VALIDATE_BOOLEAN),
                    'position' => $index + 1,
                ];

                if ($answerImage !== null) {
                    $payload['image'] = $answerImage;
                }

                if (isset($answerData['id'])) {
                    $answer = $question->answers()->find($answerData['id']);
                    if ($answer) {
                        $answer->update($payload);
                        $existingAnswerIds[] = $answer->id;
                    }
                } else {
                    $payload['activo'] = 'si';
                    $newAnswer = $question->answers()->create($payload);
                    $existingAnswerIds[] = $newAnswer->id;
                }
            }

            $question->answers()->whereNotIn('id', $existingAnswerIds)->delete();
        });

        return back()->with('success', 'Pregunta actualizada correctamente');
    }

    /**
     * Delete a question and its answers.
     */
    public function destroyQuestion(Question $question)
    {
        DB::transaction(function () use ($question) {
            $question->answers()->delete();
            $question->delete();
        });

        return back()->with('success', 'Pregunta eliminada');
    }

    /**
     * Duplicate a quiz and its questions.
     */
    public function duplicateQuiz(Quiz $quiz)
    {
        DB::transaction(function () use ($quiz) {
            $quiz->load('questions.answers');

            $newQuiz = $quiz->replicate();
            $newQuiz->title = $quiz->title.' (Copia)';
            $newQuiz->save();

            foreach ($quiz->questions as $question) {
                $newQuestion = $question->replicate();
                $newQuestion->quiz_id = $newQuiz->id;
                $newQuestion->slug = Str::slug($newQuestion->pregunta ?? 'pregunta').'-'.rand(1000, 9999);
                $newQuestion->save();

                foreach ($question->answers as $answer) {
                    $newAnswer = $answer->replicate();
                    $newAnswer->question_id = $newQuestion->id;
                    $newAnswer->save();
                }
            }
        });

        return back()->with('success', 'Examen duplicado correctamente');
    }

    /**
     * Reorder modules.
     */
    public function reorderModules(Request $request, Course $course)
    {
        $validated = $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => ['required', Rule::exists(Module::class, 'id')],
            'modules.*.position' => 'required_without:modules.*.posicion|integer|min:0',
            'modules.*.posicion' => 'required_without:modules.*.position|integer|min:0',
        ]);

        DB::transaction(function () use ($course, $validated) {
            foreach ($validated['modules'] as $moduleData) {
                $pos = $moduleData['posicion'] ?? $moduleData['position'];
                $course->modules()->where('id', $moduleData['id'])->update(['posicion' => $pos]);
            }
        });

        return back()->with('success', 'Módulos reordenados');
    }

    /**
     * Reorder lessons.
     */
    public function reorderLessons(Request $request, Module $module)
    {
        $validated = $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => ['required', Rule::exists(Lesson::class, 'id')],
            'lessons.*.position' => 'required_without:lessons.*.posicion|integer|min:0',
            'lessons.*.posicion' => 'required_without:lessons.*.position|integer|min:0',
        ]);

        DB::transaction(function () use ($module, $validated) {
            foreach ($validated['lessons'] as $lessonData) {
                $pos = $lessonData['posicion'] ?? $lessonData['position'];
                $module->lessons()->where('id', $lessonData['id'])->update(['posicion' => $pos]);
            }
        });

        return back()->with('success', 'Lecciones reordenadas');
    }

    /**
     * Add/Update homework for a lesson.
     */
    public function storeHomework(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'points' => 'nullable|integer|min:0',
        ]);

        $description = $this->sanitizeHtml($validated['description'] ?? strip_tags($validated['title']));

        $lesson->update([
            'resumen' => $description,
        ]);

        return back()->with('success', 'Tarea actualizada correctamente');
    }

    /**
     * Upload a chunk of a large media file.
     */
    public function uploadChunk(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240',
            'index' => 'required|integer|min:0|max:2000',
            'total_chunks' => 'required|integer|min:1|max:2000',
            'identifier' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_\-]+$/'],
            'filename' => 'required|string|max:255',
        ]);

        $chunk = $request->file('file');
        $index = (int) $validated['index'];
        $totalChunks = (int) $validated['total_chunks'];
        $identifier = preg_replace('/[^a-zA-Z0-9_\-]/', '', $validated['identifier']);
        $originalName = basename($validated['filename']);

        if ($index >= $totalChunks || $identifier === '') {
            return response()->json(['error' => 'Datos de fragmento inválidos.'], 422);
        }

        $extension = strtolower((string) pathinfo($originalName, PATHINFO_EXTENSION));
        if ($extension !== 'mp4') {
            return response()->json(['error' => 'Solo se permiten archivos de video con extensión MP4.'], 422);
        }

        $allowedMimes = ['video/mp4', 'video/quicktime', 'application/mp4', 'application/octet-stream'];

        // Only the first chunk carries the MP4 container header; intermediate chunks are raw
        // bytes that finfo may misdetect. The fully assembled file is validated again below.
        if ($index === 0) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $chunkMime = $finfo ? finfo_file($finfo, $chunk->getRealPath()) : null;
            if ($finfo) {
                finfo_close($finfo);
            }

            if ($chunkMime && ! in_array($chunkMime, $allowedMimes, true)) {
                return response()->json(['error' => 'Tipo MIME no permitido para video MP4.'], 422);
            }
        }

        $tempDir = storage_path('app/chunks/'.$identifier);
        if (! file_exists($tempDir)) {
            mkdir($tempDir, 0750, true);
        }

        $chunkName = 'chunk_'.$index;
        $chunk->move($tempDir, $chunkName);

        $uploadedCount = count(glob($tempDir.'/chunk_*'));

        if ($uploadedCount == $totalChunks) {
            $finalFilename = $identifier.'.mp4';

            $finalDir = storage_path('app/uploads');
            if (! file_exists($finalDir)) {
                mkdir($finalDir, 0750, true);
            }

            $finalPath = $finalDir.'/'.$finalFilename;

            $out = fopen($finalPath, 'wb');
            if ($out) {
                for ($i = 0; $i < $totalChunks; $i++) {
                    $chunkFile = $tempDir.'/chunk_'.$i;
                    if (file_exists($chunkFile)) {
                        $in = fopen($chunkFile, 'rb');
                        if ($in) {
                            while ($buff = fread($in, 4096)) {
                                fwrite($out, $buff);
                            }
                            fclose($in);
                            unlink($chunkFile);
                        }
                    }
                }
                fclose($out);
            }

            if (file_exists($tempDir)) {
                @rmdir($tempDir);
            }

            $finalFinfo = finfo_open(FILEINFO_MIME_TYPE);
            $finalMime = ($finalFinfo && file_exists($finalPath)) ? finfo_file($finalFinfo, $finalPath) : null;
            if ($finalFinfo) {
                finfo_close($finalFinfo);
            }

            if ($finalMime && ! in_array($finalMime, $allowedMimes, true)) {
                @unlink($finalPath);

                return response()->json(['error' => 'El archivo ensamblado no corresponde a un video MP4 válido.'], 422);
            }

            return response()->json([
                'completed' => true,
                'filename' => $finalFilename,
            ]);
        }

        return response()->json([
            'completed' => false,
            'progress' => round(($uploadedCount / $totalChunks) * 100, 2),
        ]);
    }
}
