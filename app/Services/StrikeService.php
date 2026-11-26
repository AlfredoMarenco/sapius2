<?php

namespace App\Services;

use App\Mail\AccountBlockedEmail;
use App\Models\Answer;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\User;
use App\Models\UserStrikeHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class StrikeService
{
    public const MAX_STRIKES = 100;

    /**
     * Register a weighted security strike (0-100 scale) for either Web or Electron.
     *
     * @return array{status: string, blocked: bool, strikes: int, max_strikes: int, points_added: int}
     */
    public function register(User $user, string $action = 'Unknown', string $details = '', bool $feedbackMode = false): array
    {
        $isFeedbackMode = $feedbackMode || $details === 'Feedback Mode' || stripos($details, 'Feedback Mode') !== false;
        $points = $this->calculateSeverityPoints($action);

        if ($isFeedbackMode && $points > 0) {
            $points = self::MAX_STRIKES;
            $details = 'se tocaron teclas prohibidas en la retro y es un bloqueo grabe';
        } elseif ($details === '') {
            $details = $action;
        }

        $result = DB::transaction(function () use ($user, $action, $details, $points) {
            $freshUser = User::lockForUpdate()->findOrFail($user->id);
            $newStrikes = min(self::MAX_STRIKES, (int) ($freshUser->strikes ?? 0) + $points);
            $wasAlreadyBlocked = (bool) $freshUser->is_blocked || $freshUser->is_blocked === 'si';
            $isBlocked = $wasAlreadyBlocked || $newStrikes >= self::MAX_STRIKES;

            $freshUser->strikes = $newStrikes;
            if ($isBlocked) {
                $freshUser->is_blocked = 1;
            }
            $freshUser->save();

            if (Schema::hasTable('user_strike_histories')) {
                UserStrikeHistory::create([
                    'user_id' => $freshUser->id,
                    'action' => mb_substr($action, 0, 190),
                    'details' => mb_substr($details, 0, 250),
                ]);
            }

            if ($isBlocked) {
                $this->closeAndGradeActiveExams($freshUser);
            }

            return [
                'user' => $freshUser,
                'blocked' => $isBlocked,
                'newly_blocked' => $isBlocked && ! $wasAlreadyBlocked,
                'strikes' => $newStrikes,
            ];
        });

        Log::warning("Strike registrado para usuario {$user->id} ({$user->email}). +{$points} pts -> Total: {$result['strikes']}/100. Acción: {$action}. Detalles: {$details}");

        if ($result['newly_blocked']) {
            try {
                if ($user->email) {
                    Mail::to($user->email)
                        ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                        ->send(new AccountBlockedEmail($result['user'], $details, $result['strikes']));
                }
            } catch (\Throwable $e) {
                Log::error("Error enviando AccountBlockedEmail al usuario {$user->id}: ".$e->getMessage());
            }
        }

        return [
            'status' => $result['blocked'] ? 'blocked' : 'warning',
            'blocked' => $result['blocked'],
            'strikes' => $result['strikes'],
            'max_strikes' => self::MAX_STRIKES,
            'points_added' => $points,
        ];
    }

    public function calculateSeverityPoints(string $action): int
    {
        $normalized = strtolower(trim($action));

        if (str_contains($normalized, 'volume')) {
            return 0;
        }

        if (in_array($normalized, ['devtools', 'f12'], true) || str_contains($normalized, 'devtools')) {
            return 50;
        }

        if (
            in_array($normalized, ['copy', 'cut', 'paste', 'printscreen', 'save', 'view source', 'viewsource', 'snipping tool', 'mac screenshot'], true)
            || str_starts_with($normalized, 'shortcut')
            || str_contains($normalized, 'captura')
            || str_contains($normalized, 'screenshot')
            || str_contains($normalized, 'impresión')
            || str_contains($normalized, 'impresion')
            || str_contains($normalized, 'copiar')
        ) {
            return 34;
        }

        if (
            in_array($normalized, ['right click', 'window blur', 'external tool', 'focus loss'], true)
            || str_contains($normalized, 'clic derecho')
        ) {
            return 20;
        }

        if (in_array($normalized, ['shift', 'restricted key / modifier'], true) || str_contains($normalized, 'modifier')) {
            return 5;
        }

        return 10;
    }

    protected function closeAndGradeActiveExams(User $user): void
    {
        if (! Schema::hasTable('inscripciones') || ! Schema::hasTable('examenes')) {
            return;
        }

        $enrollmentIds = Enrollment::where('user_id', $user->id)->pluck('id');
        if ($enrollmentIds->isEmpty()) {
            return;
        }

        $activeExams = Exam::with('quiz')
            ->whereIn('inscripcion_id', $enrollmentIds)
            ->where('finalizado', 'no')
            ->get();

        foreach ($activeExams as $exam) {
            $this->gradeAndFinalizeExam($exam);
        }
    }

    public function gradeAndFinalizeExam(Exam $exam): void
    {
        $rawSnapshot = $exam->respuestas_json;
        $answers = collect(is_string($rawSnapshot) ? json_decode($rawSnapshot, true) : (is_array($rawSnapshot) ? $rawSnapshot : []))
            ->filter(fn ($item) => is_array($item) && isset($item['name'], $item['value']))
            ->keyBy(fn ($item) => (string) $item['name']);

        $quizType = $exam->quiz?->tipo ?? 'EXANI';
        $correctCount = 0;
        $score = ($quizType === 'ENARM') ? 0.0 : 700.0;

        if (Schema::hasTable('respuestas') && Schema::hasTable('preguntas')) {
            $correctAnswers = Answer::with('question')
                ->whereHas('question', fn ($q) => $q->where('prueba_id', $exam->prueba_id)->where('activo', 'si'))
                ->where('correcto', 1)
                ->where('activo', 'si')
                ->get()
                ->keyBy(fn ($item) => $item->pregunta_id.'-'.$item->id);

            foreach ($answers as $ans) {
                $key = $ans['name'].'-'.$ans['value'];
                if ($correctAnswers->has($key)) {
                    $correctAnswer = $correctAnswers->get($key);
                    $correctCount++;
                    $score += (float) ($correctAnswer->question?->score ?? 0);
                }
            }
        }

        $exam->total_correctas = $correctCount;
        $exam->score_total = $score;
        $exam->finalizado = 'si';
        $exam->retro_visualizado = 'si';
        $exam->save();
    }
}
