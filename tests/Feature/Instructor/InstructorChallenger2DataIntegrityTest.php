<?php

namespace Tests\Feature\Instructor;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Challenger 2 Adversarial Test Suite:
 * Data Integrity, Boundaries, Calculations, and Legacy Schema Compatibility.
 *
 * Explicitly verifies:
 * 1. Active student boundary (unaccepted students: 'no', null, 'pendiente', etc. NEVER leak).
 * 2. Calculations:
 *    - 0 exams: average strictly 0, not NaN/null/error.
 *    - Uncompleted exams: excluded from average.
 *    - Multiple exams: accurate arithmetic mean of score_total with rounding.
 *    - Multiple attempts: all itemized with score_total and status.
 *    - Homework timeliness: boolean true/false for is_late; isolation from other courses.
 *    - Lesson progress: 0%, 100%, partial%, 0 lessons total, deduplication, isolation.
 * 3. Legacy columns: Table users strictly WITHOUT name, avatar, first_name, last_name, photo.
 *    Zero SQL 1054 / no such column errors.
 * 4. High-volume stress test harness.
 */
class InstructorChallenger2DataIntegrityTest extends TestCase
{
    protected Role $instructorRole;
    protected Role $adminRole;
    protected Role $studentRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createStrictLegacyDatabaseSchema();
        $this->seedRoles();
    }

    /**
     * Create strict database schema for testing.
     * Table `users` contains ONLY legacy columns: nombre, apellido, foto, etc.
     * OMITTING `name`, `first_name`, `last_name`, `avatar`, `photo` columns to prove
     * that no queries fail with SQL 1054 ("Unknown column") or SQLite "no such column".
     */
    protected function createStrictLegacyDatabaseSchema(): void
    {
        // Re-create users table strictly with ONLY legacy columns
        Schema::dropIfExists('users');
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->nullable();
            $table->string('apellido')->nullable();
            $table->string('email')->unique();
            $table->string('username')->nullable();
            $table->string('password');
            $table->string('foto')->nullable();
            $table->string('telefono')->nullable();
            $table->string('folio')->nullable();
            $table->string('universidad_procedencia')->nullable();
            $table->string('documento_identificacion')->nullable();
            $table->string('pase_ingreso')->nullable();
            $table->string('especialidad')->nullable();
            $table->integer('strikes')->default(0);
            $table->boolean('is_blocked')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('activo')->default('si');
            $table->rememberToken();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->timestamps();
        });

        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('special')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('role_user')) {
            Schema::create('role_user', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('user_id');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('cursos')) {
            Schema::create('cursos', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('titulo');
                $table->string('title')->nullable();
                $table->string('slug')->nullable();
                $table->text('descripcion')->nullable();
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('cursos_programados')) {
            Schema::create('cursos_programados', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('user_id'); // instructor
                $table->dateTime('fecha_inicio')->nullable();
                $table->dateTime('fecha_fin')->nullable();
                $table->dateTime('start_date')->nullable();
                $table->dateTime('end_date')->nullable();
                $table->decimal('precio', 10, 2)->nullable();
                $table->string('identificador')->nullable();
                $table->string('internal_id')->nullable();
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('inscripciones')) {
            Schema::create('inscripciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('curso_programado_id');
                $table->string('aceptado')->nullable()->default('no');
                $table->string('status')->nullable();
                $table->string('tipo_pago')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('lecciones')) {
            Schema::create('lecciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->default(0); // 0 = module, >0 = lesson
                $table->string('titulo');
                $table->string('title')->nullable();
                $table->integer('posicion')->default(1);
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('leccion_user')) {
            Schema::create('leccion_user', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('leccion_id');
                $table->unsignedBigInteger('curso_programado_id')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('pruebas')) {
            Schema::create('pruebas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->nullable();
                $table->string('titulo');
                $table->string('title')->nullable();
                $table->string('tipo')->default('EXANI');
                $table->integer('tiempo')->nullable();
                $table->integer('oportunidades')->default(1);
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('examenes')) {
            Schema::create('examenes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('inscripcion_id');
                $table->unsignedBigInteger('prueba_id');
                $table->decimal('score_total', 8, 2)->default(0);
                $table->string('finalizado')->default('si');
                $table->text('respuestas_json')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('homework')) {
            Schema::create('homework', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('leccion_id');
                $table->unsignedBigInteger('user_id');
                $table->boolean('is_late')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('media')) {
            Schema::create('media', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('leccion_id');
                $table->string('ruta')->nullable();
                $table->string('tipo')->nullable();
                $table->integer('downloadable')->default(0);
                $table->string('programable')->default('no');
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }
    }

    protected function seedRoles(): void
    {
        $this->instructorRole = Role::firstOrCreate(
            ['slug' => 'instructor'],
            ['name' => 'Instructor']
        );

        $this->adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrador']
        );

        $this->studentRole = Role::firstOrCreate(
            ['slug' => 'alumno'],
            ['name' => 'Alumno']
        );
    }

    protected function createInstructor(array $attributes = []): User
    {
        $user = User::create(array_merge([
            'nombre' => 'Docente',
            'apellido' => 'Sapius',
            'email' => 'instructor_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));

        $user->roles()->syncWithoutDetaching([$this->instructorRole->id]);
        $user->load('roles');

        return $user;
    }

    protected function createStudent(array $attributes = []): User
    {
        $user = User::create(array_merge([
            'nombre' => 'Alumno',
            'apellido' => 'Prueba',
            'email' => 'alumno_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));

        $user->roles()->syncWithoutDetaching([$this->studentRole->id]);
        $user->load('roles');

        return $user;
    }

    protected function createCourse(array $attributes = []): Course
    {
        return Course::create(array_merge([
            'titulo' => 'Curso ' . uniqid(),
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));
    }

    protected function createCohort(Course $course, User $instructor, array $attributes = []): ScheduledCourse
    {
        return ScheduledCourse::create(array_merge([
            'curso_id' => $course->id,
            'user_id' => $instructor->id,
            'identificador' => 'GRUPO-' . strtoupper(uniqid()),
            'fecha_inicio' => now()->subDays(5),
            'fecha_fin' => now()->addDays(25),
            'activo' => 'si',
        ], $attributes));
    }

    protected function enrollStudent(ScheduledCourse $cohort, User $student, ?string $accepted = 'si'): Enrollment
    {
        return Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $cohort->id,
            'aceptado' => $accepted,
            'status' => $accepted,
        ]);
    }

    protected function createQuiz(Course $course, array $attributes = []): Quiz
    {
        return Quiz::create(array_merge([
            'curso_id' => $course->id,
            'titulo' => 'Evaluación ' . uniqid(),
            'tipo' => 'EXANI',
            'tiempo' => 60,
            'oportunidades' => 1,
            'activo' => 'si',
        ], $attributes));
    }

    protected function createExam(Enrollment $enrollment, Quiz $quiz, float $score = 100, string $status = 'si'): Exam
    {
        return Exam::create([
            'inscripcion_id' => $enrollment->id,
            'prueba_id' => $quiz->id,
            'score_total' => $score,
            'finalizado' => $status,
        ]);
    }

    protected function createLesson(Course $course, array $attributes = []): Lesson
    {
        $module = Module::withoutGlobalScopes()->where('curso_id', $course->id)->where('leccion_id', 0)->first();
        if (!$module) {
            $module = Module::withoutGlobalScopes()->create([
                'curso_id' => $course->id,
                'leccion_id' => 0,
                'titulo' => 'Módulo 1',
                'activo' => 'si',
            ]);
        }

        return Lesson::withoutGlobalScopes()->create(array_merge([
            'curso_id' => $course->id,
            'leccion_id' => $module->id,
            'titulo' => 'Lección ' . uniqid(),
            'activo' => 'si',
        ], $attributes));
    }

    protected function getInertiaProps($response): array
    {
        $page = $response->viewData('page');
        if (is_array($page) && isset($page['props'])) {
            return $page['props'];
        }
        if (is_object($page) && isset($page->props)) {
            return (array) $page->props;
        }
        $data = json_decode(json_encode($page), true);
        return $data['props'] ?? [];
    }

    // =========================================================================
    // SECTION 1: Active Student Boundary Stress
    // =========================================================================

    public function test_cohort_with_only_unaccepted_students_no_returns_zero_students(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        $student1 = $this->createStudent(['nombre' => 'Rechazado Uno']);
        $student2 = $this->createStudent(['nombre' => 'Rechazado Dos']);

        $this->enrollStudent($cohort, $student1, 'no');
        $this->enrollStudent($cohort, $student2, 'no');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertCount(0, $students, 'Cohort with only aceptado = "no" must return 0 students in roster.');

        // Cohort active_students_count must also be 0
        $cohorts = collect($props['cohorts'] ?? []);
        $cohortData = $cohorts->firstWhere('id', $cohort->id);
        $this->assertEquals(0, $cohortData['active_students_count'] ?? 0);
    }

    public function test_cohort_with_only_unaccepted_students_null_returns_zero_students(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        $student = $this->createStudent(['nombre' => 'Null Student']);
        $this->enrollStudent($cohort, $student, null);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertCount(0, $students, 'Cohort with aceptado = null must return 0 students.');
    }

    public function test_cohort_with_various_non_accepted_statuses_never_leak(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        $nonAcceptedStatuses = ['pendiente', 'rechazado', 'cancelado', 'espera', 'baja', '', '0', 'false', 'NO', 'None'];

        foreach ($nonAcceptedStatuses as $status) {
            $student = $this->createStudent(['nombre' => 'Student ' . $status]);
            $this->enrollStudent($cohort, $student, $status);
        }

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertCount(0, $students, 'None of the non-accepted statuses must leak into the student roster.');
    }

    public function test_mixed_cohort_only_returns_accepted_students(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        $acceptedA = $this->createStudent(['nombre' => 'Aceptado Alpha']);
        $acceptedB = $this->createStudent(['nombre' => 'Aceptado Beta']);
        $acceptedC = $this->createStudent(['nombre' => 'Aceptado Gamma']);

        $unaccepted1 = $this->createStudent(['nombre' => 'No One']);
        $unaccepted2 = $this->createStudent(['nombre' => 'No Two']);
        $nullStudent = $this->createStudent(['nombre' => 'Null User']);
        $pendingUser = $this->createStudent(['nombre' => 'Pending User']);

        $this->enrollStudent($cohort, $acceptedA, 'si');
        $this->enrollStudent($cohort, $unaccepted1, 'no');
        $this->enrollStudent($cohort, $acceptedB, 'si');
        $this->enrollStudent($cohort, $nullStudent, null);
        $this->enrollStudent($cohort, $acceptedC, 'si');
        $this->enrollStudent($cohort, $unaccepted2, 'no');
        $this->enrollStudent($cohort, $pendingUser, 'pendiente');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertCount(3, $students, 'Exactly 3 accepted students must appear.');

        $studentIds = $students->pluck('id')->all();
        $this->assertContains($acceptedA->id, $studentIds);
        $this->assertContains($acceptedB->id, $studentIds);
        $this->assertContains($acceptedC->id, $studentIds);
        $this->assertNotContains($unaccepted1->id, $studentIds);
        $this->assertNotContains($unaccepted2->id, $studentIds);
        $this->assertNotContains($nullStudent->id, $studentIds);
        $this->assertNotContains($pendingUser->id, $studentIds);

        // Cohort active_students_count must match 3
        $cohorts = collect($props['cohorts'] ?? []);
        $cohortData = $cohorts->firstWhere('id', $cohort->id);
        $this->assertEquals(3, (int) ($cohortData['active_students_count'] ?? 0));
    }

    public function test_orphaned_enrollment_with_deleted_user_does_not_crash_roster(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        // Valid student
        $validStudent = $this->createStudent(['nombre' => 'Valido']);
        $this->enrollStudent($cohort, $validStudent, 'si');

        // Orphaned enrollment pointing to non-existent user_id
        Enrollment::create([
            'user_id' => 888888,
            'curso_programado_id' => $cohort->id,
            'aceptado' => 'si',
        ]);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertCount(1, $students, 'Orphaned enrollment must be skipped without crashing.');
        $this->assertEquals($validStudent->id, $students->first()['id']);
    }

    // =========================================================================
    // SECTION 2: Calculations Stress (Exams, Homework, Timeliness, Progress)
    // =========================================================================

    public function test_student_with_zero_exams_has_exams_average_strictly_zero_and_empty_list(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertNotNull($studentData);
        $this->assertSame(0, (int) $studentData['exams_average'], 'exams_average must be strictly 0 for zero exams.');
        $this->assertFalse(is_nan($studentData['exams_average']), 'exams_average must not be NaN.');
        $this->assertIsArray($studentData['exams']);
        $this->assertCount(0, $studentData['exams']);
    }

    public function test_student_with_uncompleted_exams_only_has_exams_average_zero(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz1 = $this->createQuiz($course);
        $quiz2 = $this->createQuiz($course);

        // Both exams are in progress (finalizado = 'no')
        $this->createExam($enrollment, $quiz1, 75.0, 'no');
        $this->createExam($enrollment, $quiz2, 85.0, 'no');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertEquals(0, $studentData['exams_average'], 'Uncompleted exams must not factor into exams_average.');
        $this->assertCount(2, $studentData['exams']);
        foreach ($studentData['exams'] as $ex) {
            $this->assertEquals('En progreso', $ex['status']);
            $this->assertEquals('no', $ex['finalizado']);
        }
    }

    public function test_student_with_mixed_completed_and_uncompleted_exams_averages_only_completed(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz1 = $this->createQuiz($course, ['titulo' => 'Completado']);
        $quiz2 = $this->createQuiz($course, ['titulo' => 'Pendiente']);

        $this->createExam($enrollment, $quiz1, 90.0, 'si');
        $this->createExam($enrollment, $quiz2, 30.0, 'no');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        // Average should be strictly 90.0, NOT (90 + 30) / 2 = 60.0
        $this->assertEquals(90.0, (float) $studentData['exams_average'], 'exams_average must strictly compute average of completed exams only.');
        $this->assertCount(2, $studentData['exams']);
    }

    public function test_student_with_multiple_completed_exams_calculates_exact_mean_with_rounding(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz1 = $this->createQuiz($course);
        $quiz2 = $this->createQuiz($course);
        $quiz3 = $this->createQuiz($course);

        // Scores: 85.50, 92.25, 78.00 -> Sum = 255.75, Avg = 85.25
        $this->createExam($enrollment, $quiz1, 85.50, 'si');
        $this->createExam($enrollment, $quiz2, 92.25, 'si');
        $this->createExam($enrollment, $quiz3, 78.00, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertEquals(85.25, (float) $studentData['exams_average']);
    }

    public function test_student_with_boundary_exam_scores_zero_and_hundred(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quizZero = $this->createQuiz($course);
        $quizHundred = $this->createQuiz($course);

        $this->createExam($enrollment, $quizZero, 0.0, 'si');
        $this->createExam($enrollment, $quizHundred, 100.0, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        // Average of 0.0 and 100.0 is 50.0
        $this->assertEquals(50.0, (float) $studentData['exams_average']);
    }

    public function test_multiple_attempts_for_same_quiz_are_all_itemized(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz = $this->createQuiz($course, ['titulo' => 'Examen Repetido']);

        $this->createExam($enrollment, $quiz, 60.0, 'si');
        $this->createExam($enrollment, $quiz, 95.0, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $exams = collect($studentData['exams'] ?? []);
        $this->assertCount(2, $exams, 'Both exam attempts must be itemized.');

        $scores = $exams->pluck('score_total')->map(fn ($s) => (float) $s)->all();
        $this->assertContains(60.0, $scores);
        $this->assertContains(95.0, $scores);

        // Average of both attempts: (60 + 95) / 2 = 77.5
        $this->assertEquals(77.5, (float) $studentData['exams_average']);
    }

    public function test_homework_on_time_submission_has_is_late_strictly_false(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $lesson = $this->createLesson($course);
        Homework::create([
            'leccion_id' => $lesson->id,
            'user_id' => $student->id,
            'is_late' => false,
        ]);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $homeworks = collect($studentData['homeworks'] ?? []);
        $this->assertCount(1, $homeworks);
        $this->assertFalse($homeworks->first()['is_late'], 'On-time homework must have is_late = false.');
    }

    public function test_homework_late_submission_has_is_late_strictly_true(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $lesson = $this->createLesson($course);
        Homework::create([
            'leccion_id' => $lesson->id,
            'user_id' => $student->id,
            'is_late' => true,
        ]);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $homeworks = collect($studentData['homeworks'] ?? []);
        $this->assertCount(1, $homeworks);
        $this->assertTrue($homeworks->first()['is_late'], 'Late homework must have is_late = true.');
    }

    public function test_homework_counts_and_itemization_for_multiple_submissions(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $l1 = $this->createLesson($course);
        $l2 = $this->createLesson($course);
        $l3 = $this->createLesson($course);
        $l4 = $this->createLesson($course);

        Homework::create(['leccion_id' => $l1->id, 'user_id' => $student->id, 'is_late' => false]);
        Homework::create(['leccion_id' => $l2->id, 'user_id' => $student->id, 'is_late' => true]);
        Homework::create(['leccion_id' => $l3->id, 'user_id' => $student->id, 'is_late' => false]);
        Homework::create(['leccion_id' => $l4->id, 'user_id' => $student->id, 'is_late' => true]);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertEquals(4, $studentData['homework_completed_count']);
        $homeworks = collect($studentData['homeworks'] ?? []);
        $this->assertCount(4, $homeworks);

        $lateCount = $homeworks->filter(fn ($h) => $h['is_late'] === true)->count();
        $onTimeCount = $homeworks->filter(fn ($h) => $h['is_late'] === false)->count();

        $this->assertEquals(2, $lateCount);
        $this->assertEquals(2, $onTimeCount);
    }

    public function test_student_with_zero_homework_has_empty_list_and_zero_count(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertEquals(0, $studentData['homework_completed_count']);
        $this->assertIsArray($studentData['homeworks']);
        $this->assertCount(0, $studentData['homeworks']);
    }

    public function test_homework_isolation_other_course_homework_never_leaks(): void
    {
        $instructor = $this->createInstructor();
        $courseA = $this->createCourse(['titulo' => 'Curso A']);
        $courseB = $this->createCourse(['titulo' => 'Curso B']);

        $cohortA = $this->createCohort($courseA, $instructor);
        $cohortB = $this->createCohort($courseB, $instructor);

        $student = $this->createStudent();
        $this->enrollStudent($cohortA, $student, 'si');
        $this->enrollStudent($cohortB, $student, 'si');

        $lessonA = $this->createLesson($courseA, ['titulo' => 'Tarea Curso A']);
        $lessonB = $this->createLesson($courseB, ['titulo' => 'Tarea Curso B']);

        // Submit homework for both courses
        Homework::create(['leccion_id' => $lessonA->id, 'user_id' => $student->id, 'is_late' => false]);
        Homework::create(['leccion_id' => $lessonB->id, 'user_id' => $student->id, 'is_late' => true]);

        // Query Course A view
        $responseA = $this->actingAs($instructor)->get("/instructor/cursos/{$courseA->id}/view");
        $responseA->assertOk();
        $propsA = $this->getInertiaProps($responseA);
        $studentA = collect($propsA['students'] ?? [])->firstWhere('id', $student->id);

        $hwA = collect($studentA['homeworks'] ?? []);
        $this->assertCount(1, $hwA, 'Course A view must only include homework belonging to Course A.');
        $this->assertEquals($lessonA->id, $hwA->first()['lesson_id']);
        $this->assertEquals(1, $studentA['homework_completed_count']);
    }

    public function test_lesson_progress_course_with_zero_lessons_returns_zero_percent_no_division_by_zero(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse(); // Has 0 modules and 0 lessons
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertEquals(0, $studentData['progress_percent'], 'Course with 0 lessons must evaluate to 0% progress without division by zero.');
    }

    public function test_lesson_progress_zero_completed_lessons_returns_zero_percent(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        // Create 5 lessons in course
        for ($i = 0; $i < 5; $i++) {
            $this->createLesson($course);
        }

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $studentData = collect($props['students'] ?? [])->firstWhere('id', $student->id);

        $this->assertEquals(0, $studentData['progress_percent']);
    }

    public function test_lesson_progress_all_lessons_completed_returns_hundred_percent(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $lessonIds = [];
        for ($i = 0; $i < 4; $i++) {
            $lesson = $this->createLesson($course);
            $lessonIds[] = $lesson->id;
            DB::table('leccion_user')->insert([
                'user_id' => $student->id,
                'leccion_id' => $lesson->id,
                'curso_programado_id' => $cohort->id,
                'completed_at' => now(),
            ]);
        }

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $studentData = collect($props['students'] ?? [])->firstWhere('id', $student->id);

        $this->assertEquals(100, $studentData['progress_percent'], '4 of 4 completed must yield 100%.');
    }

    public function test_lesson_progress_partial_completions_calculates_accurate_rounded_percentage(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        $studentA = $this->createStudent(['nombre' => 'Alumno 33']);
        $studentB = $this->createStudent(['nombre' => 'Alumno 67']);
        $this->enrollStudent($cohort, $studentA, 'si');
        $this->enrollStudent($cohort, $studentB, 'si');

        // 3 lessons total: 1 of 3 = 33%, 2 of 3 = 67%
        $l1 = $this->createLesson($course);
        $l2 = $this->createLesson($course);
        $l3 = $this->createLesson($course);

        // Student A completes 1
        DB::table('leccion_user')->insert([
            'user_id' => $studentA->id,
            'leccion_id' => $l1->id,
            'curso_programado_id' => $cohort->id,
        ]);

        // Student B completes 2
        DB::table('leccion_user')->insert([
            'user_id' => $studentB->id,
            'leccion_id' => $l1->id,
            'curso_programado_id' => $cohort->id,
        ]);
        DB::table('leccion_user')->insert([
            'user_id' => $studentB->id,
            'leccion_id' => $l2->id,
            'curso_programado_id' => $cohort->id,
        ]);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $dataA = $students->firstWhere('id', $studentA->id);
        $dataB = $students->firstWhere('id', $studentB->id);

        $this->assertEquals(33, $dataA['progress_percent'], '1 of 3 lessons must round to 33%.');
        $this->assertEquals(67, $dataB['progress_percent'], '2 of 3 lessons must round to 67%.');
    }

    public function test_lesson_progress_duplicate_completions_in_leccion_user_are_deduplicated(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $student = $this->createStudent();
        $this->enrollStudent($cohort, $student, 'si');

        $l1 = $this->createLesson($course);
        $l2 = $this->createLesson($course);

        // Student completed lesson 1 three separate times
        for ($i = 0; $i < 3; $i++) {
            DB::table('leccion_user')->insert([
                'user_id' => $student->id,
                'leccion_id' => $l1->id,
                'curso_programado_id' => $cohort->id,
            ]);
        }

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $studentData = collect($props['students'] ?? [])->firstWhere('id', $student->id);

        // 1 unique lesson out of 2 = 50%
        $this->assertEquals(50, $studentData['progress_percent'], 'Duplicate completion rows must not inflate progress.');
    }

    public function test_lesson_progress_isolation_other_course_completions_never_counted(): void
    {
        $instructor = $this->createInstructor();
        $courseA = $this->createCourse(['titulo' => 'Curso Alpha']);
        $courseB = $this->createCourse(['titulo' => 'Curso Beta']);

        $cohortA = $this->createCohort($courseA, $instructor);
        $cohortB = $this->createCohort($courseB, $instructor);

        $student = $this->createStudent();
        $this->enrollStudent($cohortA, $student, 'si');
        $this->enrollStudent($cohortB, $student, 'si');

        $lessonA = $this->createLesson($courseA);
        $lessonB = $this->createLesson($courseB);

        // Student completes lesson belonging to Course B only
        DB::table('leccion_user')->insert([
            'user_id' => $student->id,
            'leccion_id' => $lessonB->id,
            'curso_programado_id' => $cohortB->id,
        ]);

        // When viewing Course A, student has 0 completed lessons in Course A
        $responseA = $this->actingAs($instructor)->get("/instructor/cursos/{$courseA->id}/view");
        $responseA->assertOk();
        $propsA = $this->getInertiaProps($responseA);
        $studentA = collect($propsA['students'] ?? [])->firstWhere('id', $student->id);

        $this->assertEquals(0, $studentA['progress_percent'], 'Completions from other courses must not count.');
    }

    // =========================================================================
    // SECTION 3: Legacy Schema Freeze (MySQL 1054 / Unknown Column Immunity)
    // =========================================================================

    public function test_users_table_strictly_without_name_or_avatar_columns_executes_without_sql_errors(): void
    {
        // Assert users table schema does NOT contain name or avatar columns
        $columns = Schema::getColumnListing('users');
        $this->assertNotContains('name', $columns, 'Table users must NOT contain column name.');
        $this->assertNotContains('avatar', $columns, 'Table users must NOT contain column avatar.');
        $this->assertNotContains('first_name', $columns, 'Table users must NOT contain column first_name.');
        $this->assertNotContains('last_name', $columns, 'Table users must NOT contain column last_name.');
        $this->assertNotContains('photo', $columns, 'Table users must NOT contain column photo.');

        $this->assertContains('nombre', $columns, 'Table users must contain legacy column nombre.');
        $this->assertContains('apellido', $columns, 'Table users must contain legacy column apellido.');
        $this->assertContains('foto', $columns, 'Table users must contain legacy column foto.');

        $instructor = $this->createInstructor([
            'nombre' => 'Doctor',
            'apellido' => 'Especialista',
            'foto' => 'profile_pic.png',
        ]);

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        $student = $this->createStudent([
            'nombre' => 'Guillermo',
            'apellido' => 'del Toro',
            'foto' => 'guillermo.jpg',
        ]);
        $this->enrollStudent($cohort, $student, 'si');

        // 1. Test Index endpoint
        $resIndex = $this->actingAs($instructor)->get('/instructor/cursos');
        $resIndex->assertOk();

        // 2. Test Show endpoint
        $resShow = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");
        $resShow->assertOk();

        $props = $this->getInertiaProps($resShow);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertNotNull($studentData);
        $this->assertEquals('Guillermo', $studentData['first_name']);
        $this->assertEquals('del Toro', $studentData['last_name']);
        $this->assertEquals('Guillermo del Toro', $studentData['full_name']);
        $this->assertEquals('Guillermo', $studentData['name']);
        $this->assertEquals('guillermo.jpg', $studentData['avatar']);
        $this->assertEquals('guillermo.jpg', $studentData['foto']);
    }

    // =========================================================================
    // SECTION 4: High-Volume Adversarial Stress Test Harness
    // =========================================================================

    public function test_high_volume_stress_cohort_with_many_students_and_complex_grades(): void
    {
        $instructor = $this->createInstructor(['nombre' => 'Profesor', 'apellido' => 'Titular']);
        $course = $this->createCourse(['titulo' => 'Medicina Interna de Alta Intensidad']);
        $cohort = $this->createCohort($course, $instructor, ['identificador' => 'MED-INT-2026']);

        // Create 4 lessons
        $lessons = [];
        for ($l = 1; $l <= 4; $l++) {
            $lessons[] = $this->createLesson($course, ['titulo' => "Tema $l"]);
        }

        // Create 3 quizzes
        $quizzes = [];
        for ($q = 1; $q <= 3; $q++) {
            $quizzes[] = $this->createQuiz($course, ['titulo' => "Evaluación $q"]);
        }

        // 30 Total enrollments: 15 accepted, 15 rejected/null/pending
        $acceptedStudentIds = [];
        for ($i = 1; $i <= 30; $i++) {
            $isAccepted = ($i <= 15);
            $acceptedStatus = $isAccepted ? 'si' : ($i % 3 === 0 ? 'no' : ($i % 3 === 1 ? null : 'pendiente'));

            $student = $this->createStudent([
                'nombre' => "Estudiante $i",
                'apellido' => "Apellido $i",
                'email' => "stress_student_{$i}_" . uniqid() . "@sapius.com",
            ]);

            $enrollment = $this->enrollStudent($cohort, $student, $acceptedStatus);

            if ($isAccepted) {
                $acceptedStudentIds[] = $student->id;

                // Add exams: Student 1 has 100 on all 3, Student 2 has 50 on 2, Student 3 has incomplete
                if ($i % 3 === 1) {
                    // All 3 completed with 100
                    foreach ($quizzes as $quiz) {
                        $this->createExam($enrollment, $quiz, 100.0, 'si');
                    }
                } elseif ($i % 3 === 2) {
                    // 2 completed with 60 and 80, 1 pending with 40
                    $this->createExam($enrollment, $quizzes[0], 60.0, 'si');
                    $this->createExam($enrollment, $quizzes[1], 80.0, 'si');
                    $this->createExam($enrollment, $quizzes[2], 40.0, 'no');
                } else {
                    // 0 exams completed, all pending
                    $this->createExam($enrollment, $quizzes[0], 50.0, 'no');
                }

                // Add homework
                Homework::create([
                    'leccion_id' => $lessons[0]->id,
                    'user_id' => $student->id,
                    'is_late' => ($i % 2 === 0),
                ]);

                // Add lesson completion
                DB::table('leccion_user')->insert([
                    'user_id' => $student->id,
                    'leccion_id' => $lessons[0]->id,
                    'curso_programado_id' => $cohort->id,
                ]);
                DB::table('leccion_user')->insert([
                    'user_id' => $student->id,
                    'leccion_id' => $lessons[1]->id,
                    'curso_programado_id' => $cohort->id,
                ]);
            }
        }

        $startTime = microtime(true);
        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");
        $elapsedTime = microtime(true) - $startTime;

        $response->assertOk();
        $this->assertLessThan(2.0, $elapsedTime, 'Stress query should execute in under 2 seconds.');

        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        // 1. Strict boundary check: exactly 15 accepted students returned
        $this->assertCount(15, $students, 'Roster must contain strictly the 15 accepted students.');
        $returnedIds = $students->pluck('id')->all();
        sort($returnedIds);
        sort($acceptedStudentIds);
        $this->assertEquals($acceptedStudentIds, $returnedIds);

        // 2. Active students count on cohort must be 15
        $cohortData = collect($props['cohorts'] ?? [])->firstWhere('id', $cohort->id);
        $this->assertEquals(15, (int) ($cohortData['active_students_count'] ?? 0));

        // 3. Mathematical precision checks across roster
        foreach ($students as $stu) {
            $studentId = $stu['id'];
            $index = null;
            // determine $i from name "Estudiante i"
            if (preg_match('/Estudiante (\d+)/', $stu['name'] ?? '', $matches)) {
                $i = (int) $matches[1];
                if ($i % 3 === 1) {
                    $this->assertEquals(100.0, (float) $stu['exams_average'], "Student $i should have 100 average.");
                } elseif ($i % 3 === 2) {
                    $this->assertEquals(70.0, (float) $stu['exams_average'], "Student $i should have (60+80)/2 = 70 average.");
                } else {
                    $this->assertEquals(0.0, (float) $stu['exams_average'], "Student $i with only uncompleted exams should have 0 average.");
                }

                // Homework is_late verification
                $hw = collect($stu['homeworks'] ?? [])->first();
                $expectedLate = ($i % 2 === 0);
                $this->assertSame($expectedLate, (bool) $hw['is_late'], "Student $i homework timeliness mismatch.");

                // Progress percent: 2 of 4 lessons completed = 50%
                $this->assertEquals(50, $stu['progress_percent'], "Student $i progress should be 50%.");
            }
        }
    }
}
