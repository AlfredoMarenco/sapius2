<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Homework;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\ScheduledCourse;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isAdmin = ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) || ($user && isset($user->role) && $user->role === 'admin');

        $query = Course::with('category');

        if (! $isAdmin) {
            $query->whereHas('scheduledCourses', function ($q) use ($user) {
                $q->where('user_id', $user?->id);
            });
        }

        $courses = $query->get();

        return Inertia::render('Instructor/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = auth()->user();
        $isAdmin = ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) || ($user && isset($user->role) && $user->role === 'admin');

        $course = Course::with(['category', 'modules.lessons.media', 'modules.lessons.quizzes'])->findOrFail($id);

        if (! $isAdmin) {
            $isAssigned = $user && $course->scheduledCourses()->where('user_id', $user->id)->exists();
            if (! $isAssigned) {
                abort(403, 'No tienes autorización para acceder a este curso.');
            }
        }

        // Cohorts visible to current user (instructors only see their own assigned cohorts)
        $cohortsQuery = ScheduledCourse::where('curso_id', $id)
            ->withCount(['enrollments as active_students_count' => function ($q) {
                $q->where('aceptado', 'si');
            }]);

        if (! $isAdmin) {
            $cohortsQuery->where('user_id', $user->id);
        }

        $cohorts = $cohortsQuery->orderBy('fecha_inicio', 'desc')->get();

        // Selected cohort handling
        $requestedCohortId = $request->query('cohort_id');
        $selectedCohort = null;

        if ($requestedCohortId !== null && $requestedCohortId !== '') {
            $targetCohort = ScheduledCourse::where('curso_id', $id)->find($requestedCohortId);
            if (! $targetCohort) {
                abort(404, 'Cohorte no encontrada.');
            }
            if (! $isAdmin && (int) $targetCohort->user_id !== (int) $user->id) {
                abort(403, 'No tienes autorización para acceder a esta cohorte.');
            }
            $selectedCohort = $targetCohort;
        } else {
            $selectedCohort = $cohorts->first();
        }

        // Formatted cohorts data for frontend
        $cohortsData = $cohorts->map(function ($c) {
            return [
                'id' => $c->id,
                'identificador' => $c->identificador ?? $c->internal_id ?? ('Grupo '.$c->id),
                'internal_id' => $c->internal_id ?? $c->identificador ?? ('Grupo '.$c->id),
                'fecha_inicio' => $c->fecha_inicio ? ($c->fecha_inicio instanceof CarbonInterface ? $c->fecha_inicio->format('Y-m-d') : (string) $c->fecha_inicio) : null,
                'fecha_fin' => $c->fecha_fin ? ($c->fecha_fin instanceof CarbonInterface ? $c->fecha_fin->format('Y-m-d') : (string) $c->fecha_fin) : null,
                'start_date' => $c->start_date ? ($c->start_date instanceof CarbonInterface ? $c->start_date->format('Y-m-d') : (string) $c->start_date) : null,
                'end_date' => $c->end_date ? ($c->end_date instanceof CarbonInterface ? $c->end_date->format('Y-m-d') : (string) $c->end_date) : null,
                'active_students_count' => (int) ($c->active_students_count ?? 0),
                'user_id' => $c->user_id,
                'instructor_id' => $c->instructor_id ?? $c->user_id,
            ];
        })->values();

        $enrolledStudents = collect();

        if ($selectedCohort) {
            // Find all lessons belonging to this course
            $moduleIds = Module::withoutGlobalScopes()
                ->where('curso_id', $course->id)
                ->where('leccion_id', 0)
                ->pluck('id')
                ->toArray();

            $courseLessons = Lesson::withoutGlobalScopes()
                ->where('leccion_id', '>', 0)
                ->where(function ($q) use ($course, $moduleIds) {
                    $q->where('curso_id', $course->id);
                    if (! empty($moduleIds)) {
                        $q->orWhereIn('leccion_id', $moduleIds);
                    }
                })
                ->get();

            $courseLessonIds = $courseLessons->pluck('id')->toArray();
            $totalLessonsCount = count($courseLessonIds);
            $lessonMap = $courseLessons->keyBy('id');

            // Query active enrollments (aceptado = 'si')
            $enrollments = Enrollment::with([
                'user',
                'exams.quiz',
            ])
                ->where('curso_programado_id', $selectedCohort->id)
                ->where('aceptado', 'si')
                ->get();

            $studentUserIds = $enrollments->pluck('user_id')->unique()->filter()->values()->toArray();

            // Batch query homework submissions for course lessons
            $allHomeworks = collect();
            if (! empty($studentUserIds) && ! empty($courseLessonIds)) {
                $allHomeworks = Homework::whereIn('user_id', $studentUserIds)
                    ->whereIn('leccion_id', $courseLessonIds)
                    ->with('lesson')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->groupBy('user_id');
            }

            // Batch query lesson completions for cohort
            $allCompletions = collect();
            if (! empty($studentUserIds) && ! empty($courseLessonIds)) {
                $allCompletions = DB::table('leccion_user')
                    ->whereIn('user_id', $studentUserIds)
                    ->whereIn('leccion_id', $courseLessonIds)
                    ->where(function ($q) use ($selectedCohort) {
                        $q->where('curso_programado_id', $selectedCohort->id)
                            ->orWhereNull('curso_programado_id');
                    })
                    ->get()
                    ->groupBy('user_id');
            }

            foreach ($enrollments as $enrollment) {
                $student = $enrollment->user;
                if (! $student) {
                    continue;
                }

                // Exams itemization
                $studentExamsList = [];
                if ($enrollment->exams) {
                    foreach ($enrollment->exams as $exam) {
                        $quiz = $exam->quiz;
                        $quizTitle = $quiz?->titulo ?? $quiz?->title ?? 'Evaluación';
                        $score = (float) ($exam->score_total ?? $exam->score ?? 0);
                        $totalQuestions = $exam->total_preguntas !== null ? (int) $exam->total_preguntas : null;
                        $totalCorrect = $exam->total_correctas !== null ? (int) $exam->total_correctas : null;

                        $studentExamsList[] = [
                            'id' => $exam->id,
                            'quiz_id' => $exam->prueba_id ?? $exam->quiz_id,
                            'quiz_title' => $quizTitle,
                            'title' => $quizTitle,
                            'score' => $score,
                            'score_total' => $score,
                            'total_preguntas' => $totalQuestions,
                            'total_correctas' => $totalCorrect,
                            'total_questions' => $totalQuestions,
                            'correct_answers' => $totalCorrect,
                            'status' => $exam->finalizado === 'si' ? 'Finalizado' : 'En progreso',
                            'finalizado' => $exam->finalizado,
                            'is_late' => (bool) $exam->is_late,
                            'date' => $exam->updated_at ? $exam->updated_at->format('Y-m-d H:i') : ($exam->created_at ? $exam->created_at->format('Y-m-d H:i') : null),
                        ];
                    }
                }

                // Average score of completed exams
                $completedExams = collect($studentExamsList)->filter(fn ($e) => $e['finalizado'] === 'si');
                $examsAverage = $completedExams->count() > 0 ? (float) round($completedExams->avg('score_total'), 2) : 0;

                // Homework itemization
                $studentHomeworksList = [];
                if (isset($allHomeworks[$student->id])) {
                    foreach ($allHomeworks[$student->id] as $hw) {
                        $lesson = $hw->lesson ?? $lessonMap->get($hw->leccion_id);
                        $lessonTitle = $lesson?->titulo ?? $lesson?->title ?? 'Tarea';

                        $studentHomeworksList[] = [
                            'id' => $hw->id,
                            'lesson_id' => $hw->leccion_id,
                            'lesson_title' => $lessonTitle,
                            'title' => $lessonTitle,
                            'is_late' => (bool) $hw->is_late,
                            'submitted_at' => $hw->created_at ? $hw->created_at->format('Y-m-d H:i') : null,
                            'status' => 'Entregado',
                        ];
                    }
                }
                $homeworkCompletedCount = count($studentHomeworksList);

                // Progress calculation
                $completedLessonsCount = isset($allCompletions[$student->id])
                    ? $allCompletions[$student->id]->pluck('leccion_id')->unique()->count()
                    : 0;
                $progressPercent = $totalLessonsCount > 0
                    ? (int) round(($completedLessonsCount / $totalLessonsCount) * 100)
                    : 0;

                $firstName = $student->nombre ?? $student->first_name ?? $student->name ?? '';
                $lastName = $student->apellido ?? $student->last_name ?? '';
                $fullName = trim($firstName.' '.$lastName);
                $avatar = $student->foto ?? $student->avatar ?? $student->photo ?? null;

                $enrolledStudents->push([
                    'id' => $student->id,
                    'enrollment_id' => $enrollment->id,
                    'name' => $firstName ?: $student->name,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'full_name' => $fullName ?: $student->name,
                    'email' => $student->email,
                    'username' => $student->username,
                    'avatar' => $avatar,
                    'foto' => $avatar,
                    'enrolled_at' => $enrollment->created_at ? $enrollment->created_at->format('Y-m-d H:i') : null,
                    'status' => $enrollment->aceptado,
                    'cohort' => $selectedCohort->identificador ?? $selectedCohort->internal_id ?? ('Grupo '.$selectedCohort->id),
                    'progress_percent' => $progressPercent,
                    'exams' => $studentExamsList,
                    'exams_average' => $examsAverage,
                    'homeworks' => $studentHomeworksList,
                    'homework_completed_count' => $homeworkCompletedCount,
                ]);
            }
        }

        return Inertia::render('Instructor/Courses/Show', [
            'course' => $course,
            'cohorts' => $cohortsData,
            'selectedCohortId' => $selectedCohort?->id,
            'selectedCohort' => $selectedCohort,
            'students' => $enrolledStudents->values(),
            'total_cohorts' => $cohorts->count(),
        ]);
    }
}
