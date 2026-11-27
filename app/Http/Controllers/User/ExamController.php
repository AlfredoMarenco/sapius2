<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Exam;
use App\Models\Lesson;
use App\Models\Question;
use App\Services\EnrollmentAccessService;
use App\Services\ExamCriteriaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function __construct(
        protected EnrollmentAccessService $accessService
    ) {}

    /**
     * Muestra la vista previa del examen (intentos restantes, información, etc.).
     */
    public function preview(Request $request, $quiz_id, $enrollment_id = null)
    {
        $user = Auth::user();
        $preferredEnrollmentId = $enrollment_id ?: $request->query('enrollment_id');

        $access = $this->accessService->requireQuizAccess(
            $user,
            (int) $quiz_id,
            $preferredEnrollmentId ? (int) $preferredEnrollmentId : null
        );

        $quiz = $access['quiz'];
        $enrollment = $access['enrollment'];

        $quiz->loadCount(['questions' => fn ($q) => $q->where('activo', 'si')]);

        $isScheduleAvailable = true;
        if ($quiz->leccion_id) {
            $lesson = Lesson::withoutGlobalScopes()->find($quiz->leccion_id);
            if ($lesson) {
                $isModule = empty($lesson->leccion_id) || (int) $lesson->leccion_id === 0;
                $schedule = $this->accessService->evaluateSchedule(
                    (int) $enrollment->curso_programado_id,
                    (int) $user->id,
                    (int) $lesson->id,
                    $isModule ? null : (int) $lesson->leccion_id
                );
                $isScheduleAvailable = (bool) ($schedule['is_available'] ?? true);
            }
        }

        $finishedExams = Exam::with('quiz')
            ->where('inscripcion_id', $enrollment->id)
            ->where('prueba_id', $quiz->id)
            ->where('finalizado', 'si')
            ->orderBy('created_at', 'desc')
            ->get();

        $attemptsCount = $finishedExams->count();

        $hasActiveAttempt = Exam::where('inscripcion_id', $enrollment->id)
            ->where('prueba_id', $quiz->id)
            ->where('finalizado', 'no')
            ->exists();

        $timeLimitSeconds = $this->parseDurationSeconds($quiz->tiempo ?? $quiz->time_limit);

        $mappedExams = $finishedExams->map(function (Exam $ex) {
            $availability = $this->evaluateFeedbackAvailability($ex);

            return [
                'id' => $ex->id,
                'quiz_id' => $ex->prueba_id,
                'enrollment_id' => $ex->inscripcion_id,
                'score' => (float) ($ex->score_total ?? 0),
                'score_total' => (float) ($ex->score_total ?? 0),
                'total_correctas' => (int) ($ex->total_correctas ?? 0),
                'total_preguntas' => (int) ($ex->total_preguntas ?? 0),
                'finalizado' => $ex->finalizado,
                'retro_visualizado' => $ex->retro_visualizado ?? 'no',
                'is_late' => (bool) ($ex->is_late ?? false),
                'finished_at' => $ex->updated_at?->toIso8601String(),
                'updated_at' => $ex->updated_at?->toIso8601String(),
                'feedback_available' => $availability['available'],
                'feedback_status' => $availability['status'],
                'feedback_time_left' => $availability['time_left'],
            ];
        })->values();

        return Inertia::render('User/Exams/Preview', [
            'quiz' => [
                'id' => $quiz->id,
                'course_id' => $quiz->curso_id,
                'lesson_id' => $quiz->leccion_id,
                'title' => $quiz->titulo ?? $quiz->title,
                'description' => $quiz->descripcion ?? $quiz->description,
                'type' => $quiz->tipo ?? $quiz->type,
                'time_limit' => $quiz->tiempo ?? $quiz->time_limit,
                'time_limit_seconds' => $timeLimitSeconds,
                'time_limit_formatted' => $timeLimitSeconds > 0 ? $this->formatSecondsToHms($timeLimitSeconds) : null,
                'attempts_allowed' => (int) ($quiz->oportunidades ?? $quiz->attempts_allowed ?? 1),
                'questions_count' => (int) ($quiz->questions_count ?? 0),
            ],
            'enrollment_id' => $enrollment->id,
            'scheduled_course_id' => $enrollment->curso_programado_id,
            'attemptsCount' => $attemptsCount,
            'hasActiveAttempt' => $hasActiveAttempt,
            'isScheduleAvailable' => $isScheduleAvailable,
            'exams' => $mappedExams,
            'examCriteria' => ExamCriteriaService::getAll(),
            'vigencia_formatted' => $quiz->tiempo_vigencia,
        ]);
    }

    /**
     * Inicia o retoma el examen y envía únicamente campos seguros al frontend.
     */
    public function take($quiz_id, $enrollment_id)
    {
        $user = Auth::user();
        $access = $this->accessService->requireQuizAccess($user, (int) $quiz_id, (int) $enrollment_id);

        $quiz = $access['quiz'];
        $enrollment = $access['enrollment'];

        $quiz->loadCount(['questions' => fn ($q) => $q->where('activo', 'si')]);

        $exam = Exam::where('inscripcion_id', $enrollment->id)
            ->where('prueba_id', $quiz->id)
            ->where('finalizado', 'no')
            ->first();

        $timeLimitSeconds = $this->parseDurationSeconds($quiz->tiempo ?? $quiz->time_limit);

        // Si existe intento abierto y expiró su tiempo límite en servidor, calificar y cerrar inmediatamente
        if ($exam && $timeLimitSeconds > 0) {
            $elapsedSeconds = max(0, (int) Carbon::parse($exam->created_at)->diffInSeconds(now(), false));
            $remaining = $timeLimitSeconds - $elapsedSeconds;

            if ($remaining <= 0) {
                $this->gradeExam($exam);

                return redirect()
                    ->route('alumno.exam.preview', ['quiz_id' => $quiz->id, 'enrollment_id' => $enrollment->id])
                    ->with('error', 'El tiempo límite de tu examen ha expirado y tu intento fue calificado automáticamente.');
            }
        }

        if (! $exam) {
            if ($quiz->leccion_id) {
                $lesson = Lesson::withoutGlobalScopes()->find($quiz->leccion_id);
                if ($lesson) {
                    $isModule = empty($lesson->leccion_id) || (int) $lesson->leccion_id === 0;
                    $schedule = $this->accessService->evaluateSchedule(
                        (int) $enrollment->curso_programado_id,
                        (int) $user->id,
                        (int) $lesson->id,
                        $isModule ? null : (int) $lesson->leccion_id
                    );
                    if (! ($schedule['is_available'] ?? true)) {
                        return redirect()
                            ->route('alumno.exam.preview', ['quiz_id' => $quiz->id, 'enrollment_id' => $enrollment->id])
                            ->with('error', 'Esta evaluación no se encuentra disponible según el calendario programado.');
                    }
                }
            }

            $attemptsCount = Exam::where('inscripcion_id', $enrollment->id)
                ->where('prueba_id', $quiz->id)
                ->where('finalizado', 'si')
                ->count();

            $attemptsAllowed = (int) ($quiz->oportunidades ?? $quiz->attempts_allowed ?? 1);
            if ($attemptsAllowed > 0 && $attemptsCount >= $attemptsAllowed) {
                return redirect()
                    ->route('alumno.exam.preview', ['quiz_id' => $quiz->id])
                    ->with('error', 'Has agotado tus intentos.');
            }

            $exam = new Exam;
            $exam->inscripcion_id = $enrollment->id;
            $exam->prueba_id = $quiz->id;
            $exam->total_preguntas = (int) ($quiz->questions_count ?? 0);
            $exam->finalizado = 'no';
            $exam->retro_visualizado = 'no';
            $exam->save();
        }

        // Agrupar preguntas seriadas por slug (GrupoPreguntas), mezclar grupos determinísticamente por Auth::id()
        // y mantener el orden interno de viñetas (id asc).
        $allQuestions = Question::with(['answers' => function ($q) {
            $q->where('activo', 'si')
                ->orderBy('posicion', 'asc')
                ->orderBy('id', 'asc');
        }])
            ->where('prueba_id', $quiz->id)
            ->where('activo', 'si')
            ->orderBy('id', 'asc')
            ->get();

        $groups = $allQuestions->groupBy(function (Question $q) {
            $slug = trim((string) ($q->slug ?? ''));

            return $slug !== '' ? $slug : '__single_'.$q->id;
        });

        $sortedGroupKeys = $groups->keys()
            ->sortBy(fn (string $groupKey) => md5($user->id.'|'.$quiz->id.'|'.$groupKey))
            ->values();

        $projectedQuestions = collect();
        foreach ($sortedGroupKeys as $groupKey) {
            foreach ($groups->get($groupKey, collect()) as $question) {
                $projectedQuestions->push([
                    'id' => $question->id,
                    'slug' => $question->slug,
                    'text' => $question->pregunta ?? $question->text,
                    'image' => $question->imagen ?? $question->image,
                    'answers' => $question->answers->map(function (Answer $ans) {
                        return [
                            'id' => $ans->id,
                            'question_id' => $ans->pregunta_id ?? $ans->question_id,
                            'text' => $ans->respuesta ?? $ans->text,
                            'image' => $ans->imagen ?? $ans->image,
                            'position' => (int) ($ans->posicion ?? $ans->position ?? 1),
                        ];
                    })->values()->all(),
                ]);
            }
        }

        $savedAnswers = $this->decodeAnswersSnapshot($exam);

        if ($timeLimitSeconds > 0) {
            $elapsedSeconds = max(0, (int) Carbon::parse($exam->created_at)->diffInSeconds(now(), false));
            $timeLeft = max(0, $timeLimitSeconds - $elapsedSeconds);
        } else {
            // Exámenes sin límite usan null (nunca 0)
            $timeLeft = null;
        }

        return Inertia::render('User/Exams/Take', [
            'quiz' => [
                'id' => $quiz->id,
                'course_id' => $quiz->curso_id,
                'lesson_id' => $quiz->leccion_id,
                'title' => $quiz->titulo ?? $quiz->title,
                'description' => $quiz->descripcion ?? $quiz->description,
                'type' => $quiz->tipo ?? $quiz->type,
                'time_limit' => $quiz->tiempo ?? $quiz->time_limit,
                'attempts_allowed' => (int) ($quiz->oportunidades ?? $quiz->attempts_allowed ?? 1),
            ],
            'exam' => [
                'id' => $exam->id,
                'quiz_id' => $exam->prueba_id,
                'enrollment_id' => $exam->inscripcion_id,
                'total_preguntas' => (int) ($exam->total_preguntas ?? $projectedQuestions->count()),
                'finalizado' => $exam->finalizado,
                'started_at' => $exam->created_at?->toIso8601String(),
            ],
            'questions' => $projectedQuestions->values()->all(),
            'savedAnswers' => $savedAnswers,
            'timeLeft' => $timeLeft,
            'scheduled_course_id' => $enrollment->curso_programado_id,
        ]);
    }

    /**
     * Guarda respuestas de manera asíncrona (auto-save) validando propiedad y tiempo límite + 15s.
     */
    public function saveAnswer(Request $request, $exam_id)
    {
        $exam = $this->accessService->requireExamOwnership($request->user(), (int) $exam_id);

        if ($exam->finalizado === 'si') {
            return response()->json(['success' => false, 'message' => 'Examen finalizado.'], 409);
        }

        if ($this->isTimeExpired($exam, 15)) {
            return response()->json([
                'success' => false,
                'expired' => true,
                'message' => 'El tiempo límite del examen ha expirado; no se aceptan nuevas respuestas.',
            ], 422);
        }

        $newAnswers = $request->input('answers', []);
        if (is_string($newAnswers)) {
            $newAnswers = json_decode($newAnswers, true) ?: [];
        }

        $mergedAnswers = $this->mergeAndDeduplicateAnswers($exam, is_array($newAnswers) ? $newAnswers : []);
        $exam->respuestas_json = json_encode($mergedAnswers);
        $exam->save();

        return response()->json(['success' => true]);
    }

    /**
     * Finaliza y califica el examen.
     */
    public function finish(Request $request, $exam_id)
    {
        $exam = $this->accessService->requireExamOwnership($request->user(), (int) $exam_id);

        if ($exam->finalizado === 'si') {
            return redirect()->route('alumno.exam.preview', ['quiz_id' => $exam->prueba_id]);
        }

        if ($request->has('answers') && ! $this->isTimeExpired($exam, 15)) {
            $incoming = $request->input('answers', []);
            if (is_string($incoming)) {
                $incoming = json_decode($incoming, true) ?: [];
            }
            if (is_array($incoming)) {
                $merged = $this->mergeAndDeduplicateAnswers($exam, $incoming);
                $exam->respuestas_json = json_encode($merged);
            }
        }

        $this->gradeExam($exam);

        if ($exam->retro_visualizado === 'si') {
            return redirect()
                ->route('alumno.exam.preview', ['quiz_id' => $exam->prueba_id])
                ->with('success', 'Examen enviado exitosamente.');
        }

        return redirect()
            ->route('alumno.exam.preview', [
                'quiz_id' => $exam->prueba_id,
                'enrollment_id' => $exam->inscripcion_id,
            ])
            ->with('success', 'Examen enviado exitosamente.');
    }

    /**
     * Muestra la retroalimentación del examen validando finalizado, vigencia y bloqueo retro_visualizado.
     */
    public function feedback(Request $request, $exam_id)
    {
        $exam = $this->accessService->requireExamOwnership($request->user(), (int) $exam_id);
        $scheduledCourseId = $exam->enrollment?->curso_programado_id;

        if ($exam->finalizado !== 'si') {
            return redirect()
                ->route('alumno.exam.take', [
                    'quiz_id' => $exam->prueba_id,
                    'enrollment_id' => $exam->inscripcion_id,
                ])
                ->with('error', 'Debes finalizar el examen antes de consultar la retroalimentación.');
        }

        $availability = $this->evaluateFeedbackAvailability($exam);

        if (! $availability['available']) {
            $message = $availability['status'] === 'expired'
                ? 'El tiempo de visualización de la retroalimentación ha concluido.'
                : 'La retroalimentación de este examen ya fue visualizada o se encuentra bloqueada.';

            if ($scheduledCourseId) {
                return redirect()
                    ->route('cursos.detallado', ['id' => $scheduledCourseId])
                    ->with('error', $message);
            }

            return redirect()
                ->route('alumno.exam.preview', ['quiz_id' => $exam->prueba_id])
                ->with('error', $message);
        }

        // Consumir bloqueo de retroalimentación la primera vez, actualizando updated_at al inicio de la revisión
        if ($exam->retro_visualizado !== 'si') {
            $exam->retro_visualizado = 'si';
            $exam->updated_at = now();
            $exam->save();
        }

        $answers = collect($this->decodeAnswersSnapshot($exam));

        $correctAnswersDb = Answer::with('question')
            ->whereHas('question', fn ($q) => $q->where('prueba_id', $exam->prueba_id)->where('activo', 'si'))
            ->where('correcto', 1)
            ->where('activo', 'si')
            ->get()
            ->each(fn (Answer $ans) => $ans->makeVisible(['correcto', 'is_correct']));

        $correctAnswersById = $correctAnswersDb->keyBy(fn (Answer $r) => $r->pregunta_id.'-'.$r->id);
        $correctAnswersByQuestion = $correctAnswersDb->keyBy('pregunta_id');
        $userAnswersByQuestion = $answers->keyBy('name');

        $questions = Question::with(['answers' => function ($q) {
            $q->where('activo', 'si')->orderBy('posicion', 'asc')->orderBy('id', 'asc');
        }])
            ->where('prueba_id', $exam->prueba_id)
            ->where('activo', 'si')
            ->orderBy('id', 'asc')
            ->get();

        $questions->each(function (Question $question) {
            $question->answers->each(fn (Answer $ans) => $ans->makeVisible(['correcto', 'is_correct']));
        });

        $feedback = [];

        foreach ($questions as $question) {
            $correctAnswer = $correctAnswersByQuestion->get($question->id);
            $userAnswerData = $userAnswersByQuestion->get($question->id);

            if (! $userAnswerData) {
                $feedback[] = [
                    'status' => 'unanswered',
                    'user_answer' => ['name' => $question->id, 'value' => null],
                    'correct_answer' => $correctAnswer,
                ];
            } else {
                $key = $userAnswerData['name'].'-'.$userAnswerData['value'];
                if ($correctAnswersById->has($key)) {
                    $feedback[] = [
                        'status' => 'correct',
                        'user_answer' => $userAnswerData,
                        'correct_answer' => $correctAnswer,
                    ];
                } else {
                    $feedback[] = [
                        'status' => 'incorrect',
                        'user_answer' => $userAnswerData,
                        'correct_answer' => $correctAnswer,
                    ];
                }
            }
        }

        return Inertia::render('User/Exams/Feedback', [
            'exam' => $exam,
            'feedback' => $feedback,
            'questions' => $questions,
            'timeLeft' => $availability['time_left'] ?? 0,
            'scheduled_course_id' => $scheduledCourseId,
            'examCriteria' => ExamCriteriaService::getAll(),
        ]);
    }

    /**
     * Registra un evento anti-trampas (cambio de pestaña, pérdida de foco, etc.).
     */
    public function registrarEvento(Request $request, $exam_id)
    {
        $exam = $this->accessService->requireExamOwnership($request->user(), (int) $exam_id);

        if ($exam->finalizado === 'si') {
            return response()->json(['success' => false, 'message' => 'Examen finalizado.']);
        }

        $events = is_array($exam->eventos) ? $exam->eventos : [];
        $events[] = [
            'fecha_hora' => now()->format('Y-m-d H:i:s'),
            'observacion' => mb_substr((string) $request->input('observacion', 'Cambio de pestaña o pérdida de foco'), 0, 255),
            'tecla' => mb_substr((string) $request->input('tecla', ''), 0, 100),
            'lugar' => mb_substr((string) $request->input('lugar', 'Navegador Web'), 0, 100),
        ];

        $exam->eventos = $events;
        $exam->save();

        return response()->json(['success' => true]);
    }

    /**
     * Finaliza por imprevisto o infracción, calificando respuestas guardadas y evaluando is_late.
     */
    public function finalizarImprevisto(Request $request, $exam_id)
    {
        $exam = $this->accessService->requireExamOwnership($request->user(), (int) $exam_id);

        if ($exam->finalizado === 'si') {
            return response()->json(['success' => false, 'message' => 'Examen finalizado.']);
        }

        $observacion = (string) $request->input('observacion', 'Finalización por imprevisto (tiempo expirado o cierre forzoso)');
        $tecla = (string) $request->input('tecla', '');

        $events = is_array($exam->eventos) ? $exam->eventos : [];
        $events[] = [
            'fecha_hora' => now()->format('Y-m-d H:i:s'),
            'observacion' => mb_substr($observacion, 0, 255),
            'tecla' => mb_substr($tecla, 0, 100),
            'lugar' => mb_substr((string) $request->input('lugar', 'Navegador Web'), 0, 100),
        ];
        $exam->eventos = $events;

        if ($request->has('answers') && ! $this->isTimeExpired($exam, 15)) {
            $answersInput = $request->input('answers', []);
            if (is_string($answersInput)) {
                $answersInput = json_decode($answersInput, true) ?: [];
            }
            if (is_array($answersInput)) {
                $merged = $this->mergeAndDeduplicateAnswers($exam, $answersInput);
                $exam->respuestas_json = json_encode($merged);
            }
        }

        $user = $request->user();
        $obsLower = mb_strtolower($observacion);
        $isInfraction = $request->boolean('infraction')
            || $request->boolean('infraccion')
            || $request->boolean('is_infraction')
            || $tecla !== ''
            || (bool) $user->is_blocked
            || (int) ($user->strikes ?? 0) >= 100
            || str_contains($obsLower, 'infracc')
            || str_contains($obsLower, 'normas')
            || str_contains($obsLower, 'strike')
            || str_contains($obsLower, 'bloque');

        if ($isInfraction) {
            $exam->retro_visualizado = 'si';
        }

        $this->gradeExam($exam);

        return response()->json([
            'success' => true,
            'score' => (float) $exam->score_total,
            'total_correctas' => (int) $exam->total_correctas,
        ]);
    }

    /**
     * Califica un examen de manera centralizada (reutilizado por finish y finalizarImprevisto).
     */
    protected function gradeExam(Exam $exam): Exam
    {
        $exam->loadMissing(['quiz', 'enrollment']);

        $answers = collect($this->decodeAnswersSnapshot($exam))->keyBy('name');

        $quizType = strtoupper((string) ($exam->quiz?->tipo ?? $exam->quiz?->type ?? 'EXANI'));
        $score = str_contains($quizType, 'ENARM') ? 0.0 : 700.0;
        $correctCount = 0;

        $correctAnswers = Answer::with('question')
            ->whereHas('question', fn ($q) => $q->where('prueba_id', $exam->prueba_id)->where('activo', 'si'))
            ->where('correcto', 1)
            ->where('activo', 'si')
            ->get()
            ->keyBy(fn (Answer $item) => $item->pregunta_id.'-'.$item->id);

        foreach ($answers as $qId => $ans) {
            $key = $qId.'-'.$ans['value'];
            if ($correctAnswers->has($key)) {
                $correct = $correctAnswers->get($key);
                $correctCount++;
                $score += (float) ($correct->question?->score ?? 0);
            }
        }

        $isLate = false;
        if ($exam->enrollment && $exam->quiz && $exam->quiz->leccion_id) {
            $lesson = Lesson::withoutGlobalScopes()->find($exam->quiz->leccion_id);
            if ($lesson) {
                $isModule = empty($lesson->leccion_id) || (int) $lesson->leccion_id === 0;
                $schedule = $this->accessService->evaluateSchedule(
                    (int) $exam->enrollment->curso_programado_id,
                    (int) $exam->enrollment->user_id,
                    (int) $lesson->id,
                    $isModule ? null : (int) $lesson->leccion_id,
                    null,
                    $exam->created_at ? Carbon::parse($exam->created_at) : now()
                );
                $isLate = (bool) ($schedule['is_late'] ?? false);
            }
        }

        $exam->total_preguntas = Question::where('prueba_id', $exam->prueba_id)
            ->where('activo', 'si')
            ->count();
        $exam->total_correctas = $correctCount;
        $exam->score_total = $score;
        $exam->finalizado = 'si';
        $exam->is_late = $isLate ? 1 : 0;
        $exam->save();

        return $exam;
    }

    protected function parseDurationSeconds($raw): int
    {
        if ($raw === null || $raw === '' || $raw === 0 || $raw === '0') {
            return 0;
        }

        $value = trim((string) $raw);
        if (str_contains($value, ':')) {
            $parts = explode(':', $value);
            if (count($parts) === 3) {
                return max(0, ((int) $parts[0] * 3600) + ((int) $parts[1] * 60) + (int) $parts[2]);
            }
            if (count($parts) === 2) {
                return max(0, ((int) $parts[0] * 3600) + ((int) $parts[1] * 60));
            }
        }

        if (is_numeric($value)) {
            return max(0, (int) $value * 60);
        }

        return 0;
    }

    protected function formatSecondsToHms(int $seconds): string
    {
        $valid = max(0, $seconds);
        $h = (int) floor($valid / 3600);
        $m = (int) floor(($valid % 3600) / 60);
        $s = $valid % 60;

        return sprintf('%02d:%02d:%02d', $h, $m, $s);
    }

    protected function isTimeExpired(Exam $exam, int $graceSeconds = 15): bool
    {
        $exam->loadMissing('quiz');
        $timeLimitSeconds = $this->parseDurationSeconds($exam->quiz?->tiempo ?? $exam->quiz?->time_limit);
        if ($timeLimitSeconds <= 0 || ! $exam->created_at) {
            return false;
        }

        $deadline = Carbon::parse($exam->created_at)->addSeconds($timeLimitSeconds + $graceSeconds);

        return now()->gt($deadline);
    }

    protected function decodeAnswersSnapshot(Exam $exam): array
    {
        $raw = $exam->respuestas_json;
        $decoded = is_string($raw) ? json_decode($raw, true) : (is_array($raw) ? $raw : []);

        if (! is_array($decoded)) {
            return [];
        }

        return collect($decoded)
            ->filter(fn ($item) => is_array($item) && isset($item['name'], $item['value']))
            ->keyBy(fn ($item) => (int) $item['name'])
            ->map(fn ($item, $qId) => [
                'name' => (int) $qId,
                'value' => (int) $item['value'],
            ])
            ->values()
            ->all();
    }

    protected function mergeAndDeduplicateAnswers(Exam $exam, array $newAnswers): array
    {
        $validAnswersById = Answer::whereHas('question', fn ($q) => $q->where('prueba_id', $exam->prueba_id)->where('activo', 'si'))
            ->where('activo', 'si')
            ->get(['id', 'pregunta_id'])
            ->keyBy('id');

        $existingMap = collect($this->decodeAnswersSnapshot($exam))->keyBy('name');

        $incomingMap = collect($newAnswers)
            ->filter(function ($item) use ($validAnswersById) {
                if (! is_array($item) || ! isset($item['name'], $item['value'])) {
                    return false;
                }
                $qId = (int) $item['name'];
                $ansId = (int) $item['value'];
                $answerRow = $validAnswersById->get($ansId);

                return $answerRow && (int) $answerRow->pregunta_id === $qId;
            })
            ->keyBy(fn ($item) => (int) $item['name'])
            ->map(fn ($item) => [
                'name' => (int) $item['name'],
                'value' => (int) $item['value'],
            ]);

        return $existingMap->replace($incomingMap)->values()->all();
    }

    /**
     * Evalúa disponibilidad y vigencia de retroalimentación según finalizado, retro_visualizado y tiempo_caducidad.
     *
     * @return array{available: bool, status: string, time_left: ?int}
     */
    protected function evaluateFeedbackAvailability(Exam $exam): array
    {
        if ($exam->finalizado !== 'si') {
            return ['available' => false, 'status' => 'unfinished', 'time_left' => null];
        }

        $exam->loadMissing('quiz');
        $vigenciaRaw = $exam->quiz?->tiempo_vigencia;
        $vigenciaSeconds = ($vigenciaRaw !== null && trim((string) $vigenciaRaw) !== '')
            ? $this->parseDurationSeconds((string) $vigenciaRaw)
            : 0;

        if ($exam->retro_visualizado === 'si') {
            if ($vigenciaSeconds > 0 && $exam->updated_at) {
                $elapsed = max(0, (int) Carbon::parse($exam->updated_at)->diffInSeconds(now(), false));
                $remaining = $vigenciaSeconds - $elapsed;
                if ($remaining > 0) {
                    return ['available' => true, 'status' => 'in_progress', 'time_left' => $remaining];
                }
            }

            return ['available' => false, 'status' => 'consumed', 'time_left' => 0];
        }

        $timerSeconds = $vigenciaSeconds > 0 ? $vigenciaSeconds : null;
        $caducidadRaw = $exam->quiz?->tiempo_caducidad;

        if ($caducidadRaw !== null && trim((string) $caducidadRaw) !== '') {
            $caducidadStr = trim((string) $caducidadRaw);
            $finishedAt = Carbon::parse($exam->updated_at ?? $exam->created_at ?? now());

            if (preg_match('/^\d{4}-\d{2}-\d{2}/', $caducidadStr)) {
                try {
                    $expiresAt = Carbon::parse($caducidadStr);
                    if (now()->gt($expiresAt)) {
                        return ['available' => false, 'status' => 'expired', 'time_left' => 0];
                    }
                } catch (\Throwable $e) {
                    // Fallback below
                }
            } elseif (is_numeric($caducidadStr)) {
                $days = (int) $caducidadStr;
                if ($days > 0) {
                    $expiresAt = $finishedAt->copy()->addDays($days);
                    if (now()->gt($expiresAt)) {
                        return ['available' => false, 'status' => 'expired', 'time_left' => 0];
                    }
                }
            } elseif (str_contains($caducidadStr, ':')) {
                $caducidadSeconds = $this->parseDurationSeconds($caducidadStr);
                if ($caducidadSeconds > 0) {
                    $expiresAt = $finishedAt->copy()->addSeconds($caducidadSeconds);
                    if (now()->gt($expiresAt)) {
                        return ['available' => false, 'status' => 'expired', 'time_left' => 0];
                    }
                    if ($timerSeconds === null) {
                        $timerSeconds = max(0, (int) now()->diffInSeconds($expiresAt, false));
                    }
                }
            }
        }

        return ['available' => true, 'status' => 'available', 'time_left' => $timerSeconds];
    }
}
