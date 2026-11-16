<?php

namespace App\Services;

use App\Models\ContenidoProgramado;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Lesson;
use App\Models\LessonUnlock;
use App\Models\Quiz;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class EnrollmentAccessService
{
    public function requireActiveEnrollment(User $user, int $cohortId): Enrollment
    {
        $enrollment = Enrollment::with(['scheduledCourse.course'])
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->where('aceptado', 'si')
            ->first();

        if (! $enrollment) {
            abort(403, 'No cuentas con una inscripción activa y aprobada en este curso.');
        }

        return $enrollment;
    }

    public function requireCourseEnrollment(User $user, int $courseId, ?int $preferredCohortId = null): Enrollment
    {
        $query = Enrollment::with(['scheduledCourse.course'])
            ->where('user_id', $user->id)
            ->where('aceptado', 'si')
            ->whereHas('scheduledCourse', fn ($q) => $q->where('curso_id', $courseId));

        if ($preferredCohortId) {
            $preferred = (clone $query)->where('curso_programado_id', $preferredCohortId)->first();
            if ($preferred) {
                return $preferred;
            }
        }

        $enrollment = $query->orderByDesc('id')->first();

        if (! $enrollment) {
            abort(403, 'No cuentas con una inscripción activa en este curso.');
        }

        return $enrollment;
    }

    public function requireExamOwnership(User $user, int $examId): Exam
    {
        $exam = Exam::with(['enrollment.scheduledCourse', 'quiz'])->findOrFail($examId);

        if (! $exam->enrollment || (int) $exam->enrollment->user_id !== (int) $user->id || $exam->enrollment->aceptado !== 'si') {
            abort(403, 'No tienes autorización para acceder a este examen.');
        }

        return $exam;
    }

    public function requireLessonInCohort(User $user, int $lessonId, int $cohortId): array
    {
        $enrollment = $this->requireActiveEnrollment($user, $cohortId);
        $scheduled = $enrollment->scheduledCourse;

        $lesson = Lesson::withoutGlobalScopes()
            ->where('id', $lessonId)
            ->where('activo', 'si')
            ->first();

        if (! $lesson || ! $scheduled || (int) $lesson->curso_id !== (int) $scheduled->curso_id) {
            abort(403, 'La lección no pertenece a este curso o no se encuentra disponible.');
        }

        return [
            'enrollment' => $enrollment,
            'scheduled' => $scheduled,
            'lesson' => $lesson,
        ];
    }

    public function requireQuizAccess(User $user, int $quizId, ?int $enrollmentId = null): array
    {
        $quiz = Quiz::where('id', $quizId)->where('activo', 'si')->firstOrFail();

        if ($enrollmentId) {
            $enrollment = Enrollment::with('scheduledCourse')
                ->where('id', $enrollmentId)
                ->where('user_id', $user->id)
                ->where('aceptado', 'si')
                ->first();
        } else {
            $enrollment = Enrollment::with('scheduledCourse')
                ->where('user_id', $user->id)
                ->where('aceptado', 'si')
                ->whereHas('scheduledCourse', fn ($q) => $q->where('curso_id', $quiz->curso_id))
                ->orderByDesc('id')
                ->first();
        }

        if (! $enrollment || ! $enrollment->scheduledCourse || (int) $enrollment->scheduledCourse->curso_id !== (int) $quiz->curso_id) {
            abort(403, 'No tienes autorización para presentar esta evaluación.');
        }

        return [
            'quiz' => $quiz,
            'enrollment' => $enrollment,
        ];
    }

    /**
     * Evaluate availability and lateness according to ContenidoProgramado and LessonUnlock.
     */
    public function evaluateSchedule(
        int $cohortId,
        int $userId,
        int $lessonOrModuleId,
        ?int $parentModuleId = null,
        ?Collection $childLessonIds = null,
        ?Carbon $referenceTime = null
    ): array {
        $now = $referenceTime ?? now();

        $contenidoRecord = Schema::hasTable('contenidos_programados')
            ? ContenidoProgramado::where('curso_programado_id', $cohortId)->first()
            : null;

        $unlocks = Schema::hasTable('lesson_unlocks')
            ? LessonUnlock::where('user_id', $userId)
                ->where('curso_programado_id', $cohortId)
                ->get()
                ->keyBy('leccion_id')
            : collect();

        $directUnlock = $unlocks->get($lessonOrModuleId);
        $parentUnlock = $parentModuleId ? $unlocks->get($parentModuleId) : null;
        $childUnlocked = $childLessonIds
            ? $childLessonIds->contains(function ($childId) use ($unlocks, $now) {
                $u = $unlocks->get($childId);

                return $u && (! $u->until_date || $now->lte(Carbon::parse($u->until_date)));
            })
            : false;

        if (! $contenidoRecord || empty($contenidoRecord->contenido)) {
            $closesAt = $directUnlock?->until_date ? Carbon::parse($directUnlock->until_date) : null;

            return [
                'is_available' => true,
                'is_late' => false,
                'opens_at' => null,
                'closes_at' => $closesAt,
                'order' => null,
            ];
        }

        $items = collect($contenidoRecord->contenido);
        $item = $items->firstWhere('id', $lessonOrModuleId);

        if (! $item && $parentModuleId) {
            $item = $items->firstWhere('id', $parentModuleId);
        }

        $opensAt = null;
        $closesAt = null;
        $order = $item['orden'] ?? null;

        if ($item) {
            $opensAt = $this->parseDateTime($item['fecha_inicial'] ?? null, $item['hora_inicial'] ?? '00:00', false);
            $closesAt = $this->parseDateTime($item['fecha_final'] ?? null, $item['hora_final'] ?? '23:59', true);
        }

        $activeUnlock = $directUnlock ?? $parentUnlock;
        if ($activeUnlock && $activeUnlock->until_date) {
            $unlockUntil = Carbon::parse($activeUnlock->until_date);
            if (! $closesAt || $unlockUntil->gt($closesAt)) {
                $closesAt = $unlockUntil;
            }
        }

        $isAvailable = false;
        if ($childUnlocked) {
            $isAvailable = true;
        } elseif ($activeUnlock && (! $activeUnlock->until_date || $now->lte(Carbon::parse($activeUnlock->until_date)))) {
            $isAvailable = true;
        } elseif ($opensAt && $closesAt) {
            $isAvailable = $now->gte($opensAt) && $now->lte($closesAt);
        } elseif ($opensAt && ! $closesAt) {
            $isAvailable = $now->gte($opensAt);
        } elseif (! $opensAt && $closesAt) {
            $isAvailable = $now->lte($closesAt);
        }

        $isLate = $closesAt ? $now->gt($closesAt) : false;

        return [
            'is_available' => $isAvailable,
            'is_late' => $isLate,
            'opens_at' => $opensAt,
            'closes_at' => $closesAt,
            'order' => $order !== null ? (int) $order : null,
        ];
    }

    protected function parseDateTime(?string $dateStr, ?string $timeStr, bool $isEnd): ?Carbon
    {
        if (! $dateStr) {
            return null;
        }

        $cleanDate = trim($dateStr);
        $cleanTime = $timeStr ? substr(trim($timeStr), 0, 5) : ($isEnd ? '23:59' : '00:00');
        $seconds = $isEnd ? ':59' : ':00';

        try {
            if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $cleanDate)) {
                return Carbon::createFromFormat('d/m/Y H:i:s', "{$cleanDate} {$cleanTime}{$seconds}");
            }

            return Carbon::parse("{$cleanDate} {$cleanTime}{$seconds}");
        } catch (\Throwable $e) {
            return null;
        }
    }
}
