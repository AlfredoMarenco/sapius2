<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Enrollment;
use Carbon\Carbon;

class ExamController extends Controller
{
    /**
     * Muestra la vista previa del examen (intentos restantes, información, etc)
     */
    public function preview($quiz_id, $enrollment_id = null)
    {
        $quiz = Quiz::with('lesson.module.course')->findOrFail($quiz_id);
        $user = Auth::user();

        // Encontrar la inscripción del usuario
        $enrollment = Enrollment::where('user_id', $user->id)
            ->whereHas('scheduledCourse.course.modules.lessons.quizzes', function($q) use ($quiz_id) {
                $q->where('pruebas.id', $quiz_id);
            })
            ->first();

        if (!$enrollment) {
            return redirect()->route('alumno.home')->with('error', 'No estás inscrito en el curso asociado a este examen.');
        }

        $attemptsCount = Exam::where('inscripcion_id', $enrollment->id)
            ->where('prueba_id', $quiz_id)
            ->where('finalizado', 'si')
            ->count();

        // Obtener el historial de exámenes
        $exams = Exam::where('inscripcion_id', $enrollment->id)
            ->where('prueba_id', $quiz_id)
            ->where('finalizado', 'si')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('User/Exams/Preview', [
            'quiz' => $quiz,
            'enrollment_id' => $enrollment->id,
            'attemptsCount' => $attemptsCount,
            'exams' => $exams,
        ]);
    }

    /**
     * Inicia o retoma el examen y envía los datos al frontend
     */
    public function take($quiz_id, $enrollment_id)
    {
        $quiz = Quiz::withCount(['questions' => function($q) {
            $q->where('activo', 'si');
        }])->findOrFail($quiz_id);

        $enrollment = Enrollment::findOrFail($enrollment_id);

        if ($enrollment->user_id !== Auth::id()) {
            abort(403);
        }

        // Verificar si hay un examen iniciado pero no finalizado
        $exam = Exam::where('inscripcion_id', $enrollment->id)
            ->where('prueba_id', $quiz_id)
            ->where('finalizado', 'no')
            ->first();

        // Validar intentos si se va a crear uno nuevo
        $attemptsCount = Exam::where('inscripcion_id', $enrollment->id)
            ->where('prueba_id', $quiz_id)
            ->where('finalizado', 'si')
            ->count();

        if (!$exam && $attemptsCount >= $quiz->attempts_allowed) {
            return redirect()->route('alumno.exam.preview', ['quiz_id' => $quiz_id])->with('error', 'Has agotado tus intentos.');
        }

        if (!$exam) {
            $exam = new Exam();
            $exam->inscripcion_id = $enrollment->id;
            $exam->prueba_id = $quiz_id;
            $exam->total_preguntas = $quiz->questions_count;
            $exam->finalizado = 'no';
            $exam->retro_visualizado = 'no';
            $exam->save();
        }

        // Obtener todas las preguntas activas
        $questions = Question::with(['answers' => function($q) {
                $q->where('activo', 'si');
            }])
            ->where('prueba_id', $quiz_id)
            ->where('activo', 'si')
            ->inRandomOrder(Auth::id())
            ->get();

        $savedAnswers = $exam->answers_snapshot ? json_decode($exam->answers_snapshot, true) : [];

        // Calcular el tiempo real restante para evitar trampas al recargar la página
        $timeLimitSeconds = 0;
        if ($quiz->time_limit) {
            $timeParts = explode(':', $quiz->time_limit);
            if (count($timeParts) === 3) {
                $timeLimitSeconds = ($timeParts[0] * 3600) + ($timeParts[1] * 60) + $timeParts[2];
            } else {
                $timeLimitSeconds = (int)$quiz->time_limit * 60; // Fallback legacy
            }
        }

        if ($timeLimitSeconds > 0) {
            $elapsedSeconds = \Carbon\Carbon::now()->diffInSeconds($exam->created_at);
            $timeLeft = max(0, $timeLimitSeconds - $elapsedSeconds);
        } else {
            $timeLeft = 0; // Ilimitado o sin límite
        }

        return Inertia::render('User/Exams/Take', [
            'quiz' => $quiz,
            'exam' => $exam,
            'questions' => $questions,
            'savedAnswers' => $savedAnswers,
            'timeLeft' => $timeLeft
        ]);
    }

    /**
     * Guarda una respuesta de manera asíncrona (auto-save)
     */
    public function saveAnswer(Request $request, $exam_id)
    {
        $exam = Exam::findOrFail($exam_id);

        if ($exam->finalizado === 'si') {
            return response()->json(['success' => false, 'message' => 'Examen finalizado.']);
        }

        // respuestas: [{'name': question_id, 'value': answer_id}, ...]
        $newAnswers = $request->input('answers', []);
        
        $currentAnswers = $exam->answers_snapshot ? json_decode($exam->answers_snapshot, true) : [];

        // Combinar o actualizar respuestas
        $answersMap = [];
        foreach ($currentAnswers as $ans) {
            $answersMap[$ans['name']] = $ans['value'];
        }
        
        foreach ($newAnswers as $ans) {
            $answersMap[$ans['name']] = $ans['value'];
        }

        $mergedAnswers = [];
        foreach ($answersMap as $q_id => $ans_val) {
            $mergedAnswers[] = ['name' => $q_id, 'value' => $ans_val];
        }

        $exam->answers_snapshot = json_encode($mergedAnswers);
        $exam->save();

        return response()->json(['success' => true]);
    }

    /**
     * Finaliza y califica el examen
     */
    public function finish(Request $request, $exam_id)
    {
        $exam = Exam::with('quiz')->findOrFail($exam_id);

        if ($exam->finalizado === 'si') {
            return redirect()->route('alumno.exam.preview', ['quiz_id' => $exam->prueba_id]);
        }

        // Actualizar respuestas finales enviadas por el alumno
        if ($request->has('answers')) {
            $exam->answers_snapshot = json_encode($request->input('answers'));
        }

        $answers = $exam->answers_snapshot ? collect(json_decode($exam->answers_snapshot)) : collect([]);

        $exam->total_correctas = 0;
        $exam->score_total = ($exam->quiz->type === 'ENARM') ? 0 : 700; // Legacy logic

        // Obtener respuestas correctas de la base de datos
        $correctAnswers = Answer::with('question')
            ->whereHas('question', function($q) use ($exam) {
                $q->where('prueba_id', $exam->prueba_id);
            })
            ->where('correcto', 1)
            ->where('activo', 'si')
            ->get()
            ->keyBy(function ($item) {
                return $item->pregunta_id . '-' . $item->id;
            });

        foreach ($answers as $ans) {
            $key = $ans->name . '-' . $ans->value;
            if ($correctAnswers->has($key)) {
                $correct = $correctAnswers->get($key);
                $exam->total_correctas++;
                if (isset($correct->question->score)) {
                    $exam->score_total += $correct->question->score;
                }
            }
        }

        // (Opcional) Lógica de entrega tardía
        $isLate = false;
        // Aquí se puede agregar la lógica de isLate comparando con el ContenidoProgramado

        $exam->finalizado = 'si';
        $exam->is_late = $isLate;
        $exam->save();

        return redirect()->route('alumno.exam.feedback', ['exam_id' => $exam->id])
            ->with('success', 'Examen enviado exitosamente.');
    }

    /**
     * Muestra la retroalimentación del examen
     */
    public function feedback($exam_id)
    {
        $exam = Exam::with(['quiz', 'enrollment'])->findOrFail($exam_id);
        $user = Auth::user();

        // Verificar que el examen pertenece al usuario a través de la inscripción
        if ($exam->enrollment->user_id !== $user->id) {
            abort(403);
        }

        if ($exam->retro_visualizado === 'no') {
            $exam->retro_visualizado = 'si';
            $exam->save();
        }

        $answers = $exam->answers_snapshot ? collect(json_decode($exam->answers_snapshot)) : collect([]);

        $correctAnswersDb = Answer::with('question')
            ->whereHas('question', function($q) use ($exam) {
                $q->where('prueba_id', $exam->prueba_id);
            })
            ->where('correcto', 1)
            ->where('activo', 'si')
            ->get();

        $correctAnswersById = $correctAnswersDb->keyBy(function($r) { return $r->pregunta_id . '-' . $r->id; });
        $correctAnswersByQuestion = $correctAnswersDb->keyBy('pregunta_id');
        $userAnswersByQuestion = $answers->keyBy('name');

        $questions = Question::with(['answers' => function($q){$q->where('activo','si');}])->where('prueba_id', $exam->prueba_id)->get();

        $feedback = [];

        foreach ($questions as $question) {
            $correctAnswer = $correctAnswersByQuestion->get($question->id);
            $userAnswerData = $userAnswersByQuestion->get($question->id);

            if (!$userAnswerData) {
                $feedback[] = [
                    'status' => 'unanswered',
                    'user_answer' => ['name' => $question->id, 'value' => null],
                    'correct_answer' => $correctAnswer
                ];
            } else {
                $key = $userAnswerData->name . '-' . $userAnswerData->value;
                if ($correctAnswersById->has($key)) {
                    $feedback[] = [
                        'status' => 'correct',
                        'user_answer' => $userAnswerData,
                        'correct_answer' => $correctAnswer
                    ];
                } else {
                    $feedback[] = [
                        'status' => 'incorrect',
                        'user_answer' => $userAnswerData,
                        'correct_answer' => $correctAnswer
                    ];
                }
            }
        }

        // Calcular tiempo de vigencia de la retroalimentación
        $feedbackTimeLeft = 0;
        if ($exam->quiz && $exam->quiz->tiempo_vigencia) {
            $timeParts = explode(':', $exam->quiz->tiempo_vigencia);
            if (count($timeParts) === 3) {
                $vigenciaSeconds = ($timeParts[0] * 3600) + ($timeParts[1] * 60) + $timeParts[2];
            } else {
                $vigenciaSeconds = (int)$exam->quiz->tiempo_vigencia * 60;
            }
            
            if ($vigenciaSeconds > 0) {
                // Ticking from the moment the exam was finished (updated_at is updated when finalizado='si' is saved)
                $elapsedSeconds = \Carbon\Carbon::now()->diffInSeconds($exam->updated_at);
                $feedbackTimeLeft = max(0, $vigenciaSeconds - $elapsedSeconds);
                
                // Si el tiempo expiró, redirigir
                if ($feedbackTimeLeft <= 0) {
                    $redirectId = $exam->enrollment->curso_programado_id ?? $exam->enrollment->curso_id;
                    return redirect()->route('alumno.curso', ['id' => $redirectId])
                        ->with('error', 'El tiempo de visualización de la retroalimentación ha concluido.');
                }
            }
        }

        return Inertia::render('User/Exams/Feedback', [
            'exam' => $exam,
            'feedback' => $feedback,
            'questions' => $questions,
            'timeLeft' => $feedbackTimeLeft
        ]);
    }

    /**
     * Registra un evento anti-trampas (ej. cambio de pestaña)
     */
    public function registrarEvento(Request $request, $exam_id)
    {
        $exam = Exam::findOrFail($exam_id);

        if ($exam->finalizado === 'si') {
            return response()->json(['success' => false, 'message' => 'Examen finalizado.']);
        }

        $array = $exam->eventos ?? [];
        $array[] = [
            "fecha_hora" => date('Y-m-d H:i:s'),
            "observacion" => $request->input('observacion', 'Cambio de pestaña o pérdida de foco'),
            "tecla" => $request->input('tecla', ''),
            "lugar" => $request->input('lugar', 'Navegador Web')
        ];
        
        $exam->eventos = $array;
        $exam->save();

        return response()->json(['success' => true]);
    }

    /**
     * Finaliza abruptamente si el navegador se cierra o el tiempo expira
     */
    public function finalizarImprevisto(Request $request, $exam_id)
    {
        $exam = Exam::findOrFail($exam_id);

        if ($exam->finalizado === 'si') {
            return response()->json(['success' => false]);
        }

        // Se marcan eventos si es cierre forzoso
        $array = $exam->eventos ?? [];
        $array[] = [
            "fecha_hora" => date('Y-m-d H:i:s'),
            "observacion" => 'Finalización por imprevisto (tiempo expirado o navegador cerrado)',
            "tecla" => '',
            "lugar" => 'Navegador Web'
        ];
        
        $exam->eventos = $array;

        // Se guardan las últimas respuestas recibidas
        if ($request->has('answers')) {
            $answersInput = $request->input('answers');
            if (is_string($answersInput)) {
                $answersInput = json_decode($answersInput, true);
            }
            $exam->answers_snapshot = json_encode($answersInput);
        }

        $exam->finalizado = 'si';
        $exam->save();

        return response()->json(['success' => true]);
    }
}
