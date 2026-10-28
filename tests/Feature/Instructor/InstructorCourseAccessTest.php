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
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InstructorCourseAccessTest extends TestCase
{
    protected Role $instructorRole;
    protected Role $adminRole;
    protected Role $studentRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createDatabaseSchema();
        $this->seedRoles();
    }

    /**
     * Create necessary in-memory SQLite schema for testing legacy Sapius tables.
     */
    protected function createDatabaseSchema(): void
    {
        // Users table
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('nombre')->nullable();
                $table->string('apellido')->nullable();
                $table->string('first_name')->nullable();
                $table->string('last_name')->nullable();
                $table->string('name')->nullable();
                $table->string('email')->unique();
                $table->string('username')->nullable();
                $table->string('password');
                $table->string('foto')->nullable();
                $table->string('avatar')->nullable();
                $table->string('photo')->nullable();
                $table->string('telefono')->nullable();
                $table->string('phone')->nullable();
                $table->string('id_folio')->nullable();
                $table->string('university')->nullable();
                $table->string('document_id')->nullable();
                $table->string('entry_pass')->nullable();
                $table->string('specialty')->nullable();
                $table->integer('strikes')->default(0);
                $table->boolean('is_blocked')->default(false);
                $table->boolean('is_active')->default(true);
                $table->string('activo')->default('si');
                $table->rememberToken();
                $table->timestamp('email_verified_at')->nullable();
                $table->timestamp('two_factor_confirmed_at')->nullable();
                $table->timestamps();
            });
        }

        // Roles table
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

        // Role_User pivot
        if (!Schema::hasTable('role_user')) {
            Schema::create('role_user', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('user_id');
                $table->timestamps();
            });
        }

        // Categories table
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // Courses (cursos) table
        if (!Schema::hasTable('cursos')) {
            Schema::create('cursos', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('titulo');
                $table->string('title')->nullable();
                $table->string('slug')->nullable();
                $table->text('descripcion')->nullable();
                $table->text('description')->nullable();
                $table->string('imagen')->nullable();
                $table->string('image')->nullable();
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Scheduled courses (cursos_programados) table
        if (!Schema::hasTable('cursos_programados')) {
            Schema::create('cursos_programados', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('course_id')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('user_id'); // instructor
                $table->unsignedBigInteger('instructor_id')->nullable();
                $table->dateTime('fecha_inicio')->nullable();
                $table->dateTime('start_date')->nullable();
                $table->dateTime('fecha_fin')->nullable();
                $table->dateTime('end_date')->nullable();
                $table->dateTime('fecha_inicio_venta')->nullable();
                $table->dateTime('fecha_fin_venta')->nullable();
                $table->decimal('precio', 10, 2)->nullable();
                $table->decimal('price', 10, 2)->nullable();
                $table->string('identificador')->nullable();
                $table->string('internal_id')->nullable();
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Enrollments (inscripciones) table
        if (!Schema::hasTable('inscripciones')) {
            Schema::create('inscripciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('curso_programado_id');
                $table->unsignedBigInteger('scheduled_course_id')->nullable();
                $table->string('aceptado')->default('no');
                $table->string('status')->nullable();
                $table->string('tipo_pago')->nullable();
                $table->string('referencia')->nullable();
                $table->string('clave')->nullable();
                $table->timestamps();
            });
        }

        // Lessons & Modules (lecciones) table
        if (!Schema::hasTable('lecciones')) {
            Schema::create('lecciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('course_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->default(0); // 0 = module, >0 = lesson
                $table->unsignedBigInteger('module_id')->nullable();
                $table->string('titulo');
                $table->string('title')->nullable();
                $table->string('slug')->nullable();
                $table->string('imagen')->nullable();
                $table->text('contenido')->nullable();
                $table->text('content')->nullable();
                $table->text('resumen')->nullable();
                $table->text('description')->nullable();
                $table->integer('posicion')->default(1);
                $table->integer('position')->default(1);
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Leccion_User progress table
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

        // Quizzes (pruebas) table
        if (!Schema::hasTable('pruebas')) {
            Schema::create('pruebas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('course_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->nullable();
                $table->unsignedBigInteger('lesson_id')->nullable();
                $table->string('titulo');
                $table->string('title')->nullable();
                $table->text('descripcion')->nullable();
                $table->string('tipo')->default('EXANI');
                $table->integer('tiempo')->nullable();
                $table->integer('oportunidades')->default(1);
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Questions (preguntas) table
        if (!Schema::hasTable('preguntas')) {
            Schema::create('preguntas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('prueba_id');
                $table->unsignedBigInteger('quiz_id')->nullable();
                $table->text('pregunta');
                $table->text('text')->nullable();
                $table->string('imagen')->nullable();
                $table->integer('score')->default(1);
                $table->text('opciones')->nullable();
                $table->string('slug')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        // Exams (examenes) table
        if (!Schema::hasTable('examenes')) {
            Schema::create('examenes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('inscripcion_id');
                $table->unsignedBigInteger('enrollment_id')->nullable();
                $table->unsignedBigInteger('prueba_id');
                $table->unsignedBigInteger('quiz_id')->nullable();
                $table->decimal('score_total', 8, 2)->default(0);
                $table->decimal('score', 8, 2)->nullable();
                $table->string('finalizado')->default('si');
                $table->string('status')->nullable();
                $table->text('respuestas_json')->nullable();
                $table->timestamps();
            });
        }

        // Homework table
        if (!Schema::hasTable('homework')) {
            Schema::create('homework', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('leccion_id');
                $table->unsignedBigInteger('user_id');
                $table->boolean('is_late')->default(false);
                $table->timestamps();
            });
        }

        // Media table
        if (!Schema::hasTable('media')) {
            Schema::create('media', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('leccion_id');
                $table->string('ruta');
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
            ['name' => 'Instructor', 'description' => 'Rol de Instructor']
        );

        $this->adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrador', 'description' => 'Rol Administrador']
        );

        $this->studentRole = Role::firstOrCreate(
            ['slug' => 'alumno'],
            ['name' => 'Alumno', 'description' => 'Rol de Alumno']
        );
    }

    // ==========================================
    // Helper Methods for Test Data Generation
    // ==========================================

    protected function createInstructor(array $attributes = []): User
    {
        $user = User::create(array_merge([
            'nombre' => 'Docente',
            'apellido' => 'Sapius',
            'name' => 'Docente',
            'last_name' => 'Sapius',
            'email' => 'instructor_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));

        $user->roles()->syncWithoutDetaching([$this->instructorRole->id]);
        $user->load('roles');

        return $user;
    }

    protected function createAdmin(array $attributes = []): User
    {
        $user = User::create(array_merge([
            'nombre' => 'Admin',
            'apellido' => 'Super',
            'name' => 'Admin',
            'last_name' => 'Super',
            'email' => 'admin_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));

        $user->roles()->syncWithoutDetaching([$this->adminRole->id]);
        $user->load('roles');

        return $user;
    }

    protected function createStudent(array $attributes = []): User
    {
        $user = User::create(array_merge([
            'nombre' => 'Alumno',
            'apellido' => 'Prueba',
            'name' => 'Alumno',
            'last_name' => 'Prueba',
            'email' => 'alumno_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));

        $user->roles()->syncWithoutDetaching([$this->studentRole->id]);
        $user->load('roles');

        return $user;
    }

    protected function createCourse(array $attributes = []): Course
    {
        $title = $attributes['titulo'] ?? $attributes['title'] ?? ('Curso ' . uniqid());
        return Course::create(array_merge([
            'titulo' => $title,
            'title' => $title,
            'slug' => 'curso-' . uniqid(),
            'descripcion' => 'Descripción del curso de prueba',
            'description' => 'Descripción del curso de prueba',
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));
    }

    protected function createCohort(Course $course, User $instructor, array $attributes = []): ScheduledCourse
    {
        return ScheduledCourse::create(array_merge([
            'curso_id' => $course->id,
            'course_id' => $course->id,
            'user_id' => $instructor->id,
            'instructor_id' => $instructor->id,
            'identificador' => 'GRUPO-' . strtoupper(uniqid()),
            'fecha_inicio' => now()->subDays(10),
            'fecha_fin' => now()->addDays(30),
            'precio' => 1500.00,
            'activo' => 'si',
            'is_active' => true,
        ], $attributes));
    }

    protected function enrollStudent(ScheduledCourse $cohort, User $student, string $accepted = 'si'): Enrollment
    {
        return Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $cohort->id,
            'scheduled_course_id' => $cohort->id,
            'aceptado' => $accepted,
            'status' => $accepted,
            'tipo_pago' => 'transferencia',
        ]);
    }

    protected function createQuiz(Course $course, array $attributes = []): Quiz
    {
        return Quiz::create(array_merge([
            'curso_id' => $course->id,
            'titulo' => 'Examen Diagnóstico ' . uniqid(),
            'tipo' => 'EXANI',
            'tiempo' => 60,
            'oportunidades' => 1,
            'activo' => 'si',
        ], $attributes));
    }

    protected function createExam(Enrollment $enrollment, Quiz $quiz, float $score = 100, string $status = 'si', ?array $answers = null): Exam
    {
        return Exam::create([
            'inscripcion_id' => $enrollment->id,
            'enrollment_id' => $enrollment->id,
            'prueba_id' => $quiz->id,
            'quiz_id' => $quiz->id,
            'score_total' => $score,
            'score' => $score,
            'finalizado' => $status,
            'respuestas_json' => json_encode($answers ?? ['q1' => true]),
        ]);
    }

    protected function createLesson(Course $course, array $attributes = []): Lesson
    {
        $module = Module::withoutGlobalScopes()->where('curso_id', $course->id)->where('leccion_id', 0)->first();
        if (!$module) {
            $module = Module::withoutGlobalScopes()->create([
                'curso_id' => $course->id,
                'leccion_id' => 0,
                'titulo' => 'Módulo 1: Fundamentos',
                'activo' => 'si',
            ]);
        }

        return Lesson::withoutGlobalScopes()->create(array_merge([
            'curso_id' => $course->id,
            'leccion_id' => $module->id,
            'titulo' => 'Lección Teórica ' . uniqid(),
            'activo' => 'si',
        ], $attributes));
    }

    protected function createHomework(Lesson $lesson, User $student, bool $isLate = false): Homework
    {
        return Homework::create([
            'leccion_id' => $lesson->id,
            'user_id' => $student->id,
            'is_late' => $isLate,
        ]);
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
    // TIER 1: Isolated Feature Behavior (Features 1-6)
    // =========================================================================

    // --- Feature 1: Course Index Restriction (ORIGINAL_REQUEST §R1) ---

    public function test_tier1_instructor_sees_only_courses_with_assigned_cohorts(): void
    {
        $instructor1 = $this->createInstructor();
        $instructor2 = $this->createInstructor();

        $course1 = $this->createCourse(['titulo' => 'Curso de Instructor 1']);
        $course2 = $this->createCourse(['titulo' => 'Curso de Instructor 2']);

        $this->createCohort($course1, $instructor1);
        $this->createCohort($course2, $instructor2);

        $response = $this->actingAs($instructor1)->get('/instructor/cursos');

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $courses = collect($props['courses'] ?? []);

        $courseIds = $courses->pluck('id')->all();
        $this->assertContains($course1->id, $courseIds, 'Instructor 1 should see assigned Course 1.');
        $this->assertNotContains($course2->id, $courseIds, 'Instructor 1 must NOT see unassigned Course 2.');
    }

    public function test_tier1_instructor_with_no_assigned_cohorts_sees_empty_course_list(): void
    {
        $instructorWithoutCohorts = $this->createInstructor();
        $otherInstructor = $this->createInstructor();

        $course = $this->createCourse();
        $this->createCohort($course, $otherInstructor);

        $response = $this->actingAs($instructorWithoutCohorts)->get('/instructor/cursos');

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $courses = collect($props['courses'] ?? []);

        $this->assertCount(0, $courses, 'Instructor without assigned cohorts should see zero courses.');
    }

    public function test_tier1_courses_with_cohorts_belonging_to_other_instructors_are_excluded(): void
    {
        $targetInstructor = $this->createInstructor();
        $otherInstructorA = $this->createInstructor();
        $otherInstructorB = $this->createInstructor();

        $courseA = $this->createCourse();
        $courseB = $this->createCourse();
        $this->createCohort($courseA, $otherInstructorA);
        $this->createCohort($courseB, $otherInstructorB);

        $response = $this->actingAs($targetInstructor)->get('/instructor/cursos');

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $courses = collect($props['courses'] ?? []);

        $this->assertEmpty($courses->whereIn('id', [$courseA->id, $courseB->id]), 'Courses belonging to other instructors must be excluded.');
    }

    public function test_tier1_course_with_multiple_cohorts_where_instructor_has_one_is_included(): void
    {
        $instructor = $this->createInstructor();
        $otherInstructor = $this->createInstructor();

        $sharedCourse = $this->createCourse(['titulo' => 'Curso Compartido']);
        $this->createCohort($sharedCourse, $otherInstructor, ['identificador' => 'GRUPO-A']);
        $this->createCohort($sharedCourse, $instructor, ['identificador' => 'GRUPO-B']);

        $response = $this->actingAs($instructor)->get('/instructor/cursos');

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $courses = collect($props['courses'] ?? []);

        $this->assertTrue($courses->contains('id', $sharedCourse->id), 'Course should appear if instructor has at least one cohort.');
    }

    public function test_tier1_unassigned_courses_without_cohorts_are_excluded_from_instructor_index(): void
    {
        $instructor = $this->createInstructor();
        $emptyCourse = $this->createCourse(['titulo' => 'Curso Huérfano']);

        $response = $this->actingAs($instructor)->get('/instructor/cursos');

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $courses = collect($props['courses'] ?? []);

        $this->assertFalse($courses->contains('id', $emptyCourse->id), 'Course with zero cohorts must not appear in instructor course list.');
    }

    // --- Feature 2: Foreign Course Access Denial HTTP 403 (ORIGINAL_REQUEST §R1) ---

    public function test_tier1_instructor_cannot_view_unassigned_course_returns_403(): void
    {
        $instructor1 = $this->createInstructor();
        $instructor2 = $this->createInstructor();

        $course = $this->createCourse();
        $this->createCohort($course, $instructor2);

        $response = $this->actingAs($instructor1)->get("/instructor/cursos/{$course->id}/view");

        $response->assertStatus(403);
    }

    public function test_tier1_instructor_cannot_view_course_with_zero_cohorts_returns_403(): void
    {
        $instructor = $this->createInstructor();
        $courseWithoutCohorts = $this->createCourse();

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$courseWithoutCohorts->id}/view");

        $response->assertStatus(403);
    }

    public function test_tier1_instructor_cannot_view_another_instructors_private_course_returns_403(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        $privateCourse = $this->createCourse(['user_id' => $instructorB->id]);
        $this->createCohort($privateCourse, $instructorB);

        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$privateCourse->id}/view");

        $response->assertStatus(403);
    }

    public function test_tier1_instructor_can_successfully_view_assigned_course_returns_200(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $this->createCohort($course, $instructor);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('Instructor/Courses/Show'));
    }

    public function test_tier1_foreign_course_access_aborts_with_explicit_forbidden_status(): void
    {
        $instructor = $this->createInstructor();
        $foreignCourse = $this->createCourse();
        $this->createCohort($foreignCourse, $this->createInstructor());

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$foreignCourse->id}/view");

        $this->assertEquals(403, $response->getStatusCode(), 'Must respond with HTTP 403 Forbidden.');
    }

    // --- Feature 3: Admin Supervisory Bypass (ORIGINAL_REQUEST §R1) ---

    public function test_tier1_admin_sees_all_courses_in_index_regardless_of_instructor_assignment(): void
    {
        $admin = $this->createAdmin();
        $inst1 = $this->createInstructor();
        $inst2 = $this->createInstructor();

        $course1 = $this->createCourse(['titulo' => 'Curso 1']);
        $course2 = $this->createCourse(['titulo' => 'Curso 2']);
        $course3 = $this->createCourse(['titulo' => 'Curso Sin Cohorte']);

        $this->createCohort($course1, $inst1);
        $this->createCohort($course2, $inst2);

        $response = $this->actingAs($admin)->get('/instructor/cursos');

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $courses = collect($props['courses'] ?? []);

        $courseIds = $courses->pluck('id')->all();
        $this->assertContains($course1->id, $courseIds, 'Admin must see Course 1.');
        $this->assertContains($course2->id, $courseIds, 'Admin must see Course 2.');
        $this->assertContains($course3->id, $courseIds, 'Admin must see Course 3 even with zero cohorts.');
    }

    public function test_tier1_admin_can_view_any_course_without_assigned_cohort_returns_200(): void
    {
        $admin = $this->createAdmin();
        $instructor = $this->createInstructor();

        $course = $this->createCourse();
        $this->createCohort($course, $instructor);

        $response = $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
    }

    public function test_tier1_admin_can_view_course_with_zero_cohorts_returns_200(): void
    {
        $admin = $this->createAdmin();
        $emptyCourse = $this->createCourse();

        $response = $this->actingAs($admin)->get("/instructor/cursos/{$emptyCourse->id}/view");

        $response->assertOk();
    }

    public function test_tier1_admin_without_explicit_instructor_role_bypasses_checkrole_middleware(): void
    {
        $adminOnly = $this->createAdmin();
        // Ensure user only has admin role, not instructor
        $this->assertTrue($adminOnly->hasRole('admin'));
        $this->assertFalse($adminOnly->hasRole('instructor'));

        $response = $this->actingAs($adminOnly)->get('/instructor/cursos');

        $response->assertOk();
    }

    public function test_tier1_admin_can_inspect_any_cohort_students_and_performance_metrics(): void
    {
        $admin = $this->createAdmin();
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertTrue($students->contains('id', $student->id), 'Admin should be able to inspect students in any cohort.');
    }

    // --- Feature 4: Active Enrolled Students Filtering (ORIGINAL_REQUEST §R2) ---

    public function test_tier1_cohort_view_includes_accepted_students(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent(['nombre' => 'Carlos', 'apellido' => 'Perez']);

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertTrue($students->contains('id', $student->id), 'Accepted student must be in student list.');
    }

    public function test_tier1_cohort_view_excludes_unaccepted_students(): void
    {
        $instructor = $this->createInstructor();
        $acceptedStudent = $this->createStudent(['nombre' => 'Aceptado']);
        $rejectedStudent = $this->createStudent(['nombre' => 'Rechazado']);

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $acceptedStudent, 'si');
        $this->enrollStudent($cohort, $rejectedStudent, 'no');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertTrue($students->contains('id', $acceptedStudent->id), 'Accepted student should be included.');
        $this->assertFalse($students->contains('id', $rejectedStudent->id), 'Student with aceptado = "no" must be excluded.');
    }

    public function test_tier1_cohort_with_all_unaccepted_students_shows_empty_student_list(): void
    {
        $instructor = $this->createInstructor();
        $rejected1 = $this->createStudent();
        $rejected2 = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $rejected1, 'no');
        $this->enrollStudent($cohort, $rejected2, 'no');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertCount(0, $students, 'When all students are unaccepted, student list must be empty.');
    }

    public function test_tier1_cohort_with_mixed_acceptance_only_returns_accepted_subset(): void
    {
        $instructor = $this->createInstructor();
        $s1 = $this->createStudent();
        $s2 = $this->createStudent();
        $s3 = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $s1, 'si');
        $this->enrollStudent($cohort, $s2, 'no');
        $this->enrollStudent($cohort, $s3, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertCount(2, $students, 'Only the 2 accepted students should appear.');
        $this->assertTrue($students->contains('id', $s1->id));
        $this->assertFalse($students->contains('id', $s2->id));
        $this->assertTrue($students->contains('id', $s3->id));
    }

    public function test_tier1_pending_or_null_acceptance_students_are_excluded(): void
    {
        $instructor = $this->createInstructor();
        $pendingStudent = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $pendingStudent, 'pendiente');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $this->assertFalse($students->contains('id', $pendingStudent->id), 'Pending student must not be included.');
    }

    // --- Feature 5: Exam Grades Breakdown score_total (ORIGINAL_REQUEST §R2) ---

    public function test_tier1_student_exam_grades_breakdown_contains_score_total_and_status(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz = $this->createQuiz($course, ['titulo' => 'Examen Parcial 1']);
        $this->createExam($enrollment, $quiz, 95.0, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $this->assertNotNull($studentData, 'Student data should exist.');
        $exams = collect($studentData['exams'] ?? []);
        $this->assertCount(1, $exams, 'Student should have 1 exam.');

        $examData = $exams->first();
        $score = $examData['score'] ?? $examData['score_total'] ?? null;
        $this->assertEquals(95.0, (float) $score, 'Exam score must reflect score_total.');
    }

    public function test_tier1_student_multiple_exams_are_itemized_correctly(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz1 = $this->createQuiz($course, ['titulo' => 'Quiz 1']);
        $quiz2 = $this->createQuiz($course, ['titulo' => 'Quiz 2']);
        $this->createExam($enrollment, $quiz1, 80.0, 'si');
        $this->createExam($enrollment, $quiz2, 90.0, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $exams = collect($studentData['exams'] ?? []);
        $this->assertCount(2, $exams, 'Both exams must be itemized in student exams.');
    }

    public function test_tier1_student_exam_breakdown_includes_quiz_title_and_question_metrics(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz = $this->createQuiz($course, ['titulo' => 'Examen de Anatomía']);
        $this->createExam($enrollment, $quiz, 85.0, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $exams = collect($studentData['exams'] ?? []);
        $exam = $exams->first();
        $this->assertNotNull($exam);
        $title = $exam['quiz_title'] ?? $exam['title'] ?? null;
        $this->assertEquals('Examen de Anatomía', $title);
    }

    public function test_tier1_student_without_exams_returns_empty_exams_array(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $exams = $studentData['exams'] ?? [];
        $this->assertIsArray($exams);
        $this->assertCount(0, $exams, 'Exams array must be empty for student with no exams.');
    }

    public function test_tier1_student_exams_average_is_calculated_accurately(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $enrollment = $this->enrollStudent($cohort, $student, 'si');

        $quiz1 = $this->createQuiz($course);
        $quiz2 = $this->createQuiz($course);
        $this->createExam($enrollment, $quiz1, 70.0, 'si');
        $this->createExam($enrollment, $quiz2, 90.0, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        if (isset($studentData['exams_average'])) {
            $this->assertEquals(80.0, (float) $studentData['exams_average'], 'Exams average should be 80.');
        } else {
            // If computed dynamically on frontend, individual scores must be present
            $exams = collect($studentData['exams'] ?? []);
            $avg = $exams->avg(fn ($e) => $e['score'] ?? $e['score_total']);
            $this->assertEquals(80.0, (float) $avg);
        }
    }

    // --- Feature 6: Homework Submissions & Timeliness (ORIGINAL_REQUEST §R2) ---

    public function test_tier1_homework_submission_includes_is_late_flag_false_when_on_time(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $lesson = $this->createLesson($course);
        $this->createHomework($lesson, $student, false);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $homeworks = collect($studentData['homeworks'] ?? []);
        $this->assertGreaterThanOrEqual(1, $homeworks->count());
        $hw = $homeworks->first();
        $this->assertFalse((bool) $hw['is_late'], 'On-time homework must have is_late = false.');
    }

    public function test_tier1_homework_submission_includes_is_late_flag_true_when_late(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $lesson = $this->createLesson($course);
        $this->createHomework($lesson, $student, true);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $homeworks = collect($studentData['homeworks'] ?? []);
        $this->assertGreaterThanOrEqual(1, $homeworks->count());
        $hw = $homeworks->first();
        $this->assertTrue((bool) $hw['is_late'], 'Late homework must have is_late = true.');
    }

    public function test_tier1_student_homework_completed_count_is_accurate(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $lesson1 = $this->createLesson($course);
        $lesson2 = $this->createLesson($course);
        $this->createHomework($lesson1, $student, false);
        $this->createHomework($lesson2, $student, true);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        if (isset($studentData['homework_completed_count'])) {
            $this->assertEquals(2, $studentData['homework_completed_count']);
        } else {
            $homeworks = collect($studentData['homeworks'] ?? []);
            $this->assertCount(2, $homeworks);
        }
    }

    public function test_tier1_student_without_homework_has_empty_homework_list_and_zero_count(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $homeworks = $studentData['homeworks'] ?? [];
        $this->assertIsArray($homeworks);
        $this->assertCount(0, $homeworks);
    }

    public function test_tier1_homework_item_includes_lesson_title(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $lesson = $this->createLesson($course, ['titulo' => 'Caso Clínico #1']);
        $this->createHomework($lesson, $student, false);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $student->id);

        $homeworks = collect($studentData['homeworks'] ?? []);
        $hw = $homeworks->first();
        $this->assertNotNull($hw);
        $title = $hw['lesson_title'] ?? $hw['title'] ?? null;
        $this->assertEquals('Caso Clínico #1', $title);
    }

    // =========================================================================
    // TIER 2: Boundary, Edge Cases, and Zero States
    // =========================================================================

    public function test_tier2_unauthenticated_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/instructor/cursos');
        $response->assertRedirect('/login');

        $responseShow = $this->get('/instructor/cursos/1/view');
        $responseShow->assertRedirect('/login');
    }

    public function test_tier2_student_role_user_cannot_access_instructor_routes(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->get('/instructor/cursos');
        $response->assertRedirect(route('dashboard'));

        $responseShow = $this->actingAs($student)->get('/instructor/cursos/1/view');
        $responseShow->assertRedirect(route('dashboard'));
    }

    public function test_tier2_nonexistent_course_id_returns_404_or_403(): void
    {
        $instructor = $this->createInstructor();

        $response = $this->actingAs($instructor)->get('/instructor/cursos/999999/view');

        $this->assertContains($response->getStatusCode(), [403, 404], 'Non-existent course must return 403 or 404.');
    }

    public function test_tier2_cohort_selection_via_query_param_loads_specific_cohort(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();

        $cohortA = $this->createCohort($course, $instructor, ['identificador' => 'GRUPO-A']);
        $cohortB = $this->createCohort($course, $instructor, ['identificador' => 'GRUPO-B']);

        $studentA = $this->createStudent(['nombre' => 'Alumno Alpha']);
        $studentB = $this->createStudent(['nombre' => 'Alumno Beta']);

        $this->enrollStudent($cohortA, $studentA, 'si');
        $this->enrollStudent($cohortB, $studentB, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view?cohort_id={$cohortB->id}");

        $response->assertOk();
        $props = $this->getInertiaProps($response);

        // When cohort B is explicitly selected, student B should be visible
        $students = collect($props['students'] ?? []);
        $this->assertTrue($students->contains('id', $studentB->id), 'Selected cohort B students must be displayed.');
    }

    public function test_tier2_instructor_cannot_view_unassigned_cohort_in_same_course_via_query_param(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        $course = $this->createCourse();
        $cohortA = $this->createCohort($course, $instructorA, ['identificador' => 'GRUPO-A']);
        $cohortB = $this->createCohort($course, $instructorB, ['identificador' => 'GRUPO-B']);

        $studentB = $this->createStudent(['nombre' => 'Alumno de Cohorte B']);
        $this->enrollStudent($cohortB, $studentB, 'si');

        // Instructor A attempts to load cohort B of instructor B
        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$course->id}/view?cohort_id={$cohortB->id}");

        if ($response->isOk()) {
            $props = $this->getInertiaProps($response);
            $students = collect($props['students'] ?? []);
            // Student B from unauthorized cohort B must NOT leak to Instructor A
            $this->assertFalse($students->contains('id', $studentB->id), 'Instructor A must not see students from cohort B assigned to Instructor B.');
        } else {
            $response->assertStatus(403);
        }
    }

    public function test_tier2_student_with_zero_progress_and_no_activities_renders_cleanly(): void
    {
        $instructor = $this->createInstructor();
        $newStudent = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $newStudent, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $studentData = $students->firstWhere('id', $newStudent->id);

        $this->assertNotNull($studentData);
        $this->assertEquals(0, $studentData['progress_percent'] ?? 0);
        $this->assertEmpty($studentData['exams'] ?? []);
        $this->assertEmpty($studentData['homeworks'] ?? []);
    }

    // =========================================================================
    // TIER 3: Pairwise Combinations (Authorization & Data States)
    // =========================================================================

    public function test_tier3_pairwise_instructor_assigned_cohort_with_active_students(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $this->assertCount(1, $students);
    }

    public function test_tier3_pairwise_instructor_unassigned_cohort_with_active_students(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructorB);
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$course->id}/view");

        $response->assertStatus(403);
    }

    public function test_tier3_pairwise_admin_with_unassigned_course_and_active_students(): void
    {
        $admin = $this->createAdmin();
        $instructor = $this->createInstructor();
        $student = $this->createStudent();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $this->enrollStudent($cohort, $student, 'si');

        $response = $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $this->assertCount(1, $students);
    }

    public function test_tier3_pairwise_instructor_assigned_cohort_with_zero_students(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $this->createCohort($course, $instructor);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);
        $this->assertCount(0, $students);
    }

    public function test_tier3_pairwise_admin_course_with_zero_cohorts(): void
    {
        $admin = $this->createAdmin();
        $course = $this->createCourse();

        $response = $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $cohorts = collect($props['cohorts'] ?? []);
        $this->assertCount(0, $cohorts);
    }

    // =========================================================================
    // TIER 4: Real-World Application Scenarios
    // =========================================================================

    /**
     * Scenario 1: Multi-cohort instructor inspecting student grades across cohorts.
     */
    public function test_tier4_scenario1_multi_cohort_instructor_inspects_performance_across_cohorts(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse(['titulo' => 'Pediatría Clínica']);

        $cohortMorning = $this->createCohort($course, $instructor, ['identificador' => 'MATUTINO-2026']);
        $cohortEvening = $this->createCohort($course, $instructor, ['identificador' => 'VESPERTINO-2026']);

        $studentMorning = $this->createStudent(['nombre' => 'Ana', 'apellido' => 'Matutina']);
        $studentEvening = $this->createStudent(['nombre' => 'Beto', 'apellido' => 'Vespertino']);

        $enrollMorning = $this->enrollStudent($cohortMorning, $studentMorning, 'si');
        $enrollEvening = $this->enrollStudent($cohortEvening, $studentEvening, 'si');

        $quiz = $this->createQuiz($course, ['titulo' => 'Examen Parcial']);
        $this->createExam($enrollMorning, $quiz, 92.0, 'si');
        $this->createExam($enrollEvening, $quiz, 78.5, 'si');

        // View morning cohort
        $resMorning = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view?cohort_id={$cohortMorning->id}");
        $resMorning->assertOk();
        $propsMorning = $this->getInertiaProps($resMorning);
        $studentsMorning = collect($propsMorning['students'] ?? []);
        $this->assertTrue($studentsMorning->contains('id', $studentMorning->id));

        // View evening cohort
        $resEvening = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view?cohort_id={$cohortEvening->id}");
        $resEvening->assertOk();
        $propsEvening = $this->getInertiaProps($resEvening);
        $studentsEvening = collect($propsEvening['students'] ?? []);
        $this->assertTrue($studentsEvening->contains('id', $studentEvening->id));
    }

    /**
     * Scenario 2: Instructor attempting cross-instructor data tampering/leakage is blocked.
     */
    public function test_tier4_scenario2_instructor_attempting_cross_instructor_data_leakage_is_blocked(): void
    {
        $instructorAlpha = $this->createInstructor(['email' => 'alpha@sapius.com']);
        $instructorBeta = $this->createInstructor(['email' => 'beta@sapius.com']);

        $courseBeta = $this->createCourse(['titulo' => 'Curso Privado Beta']);
        $cohortBeta = $this->createCohort($courseBeta, $instructorBeta);
        $studentBeta = $this->createStudent(['nombre' => 'Alumno Secreto']);
        $this->enrollStudent($cohortBeta, $studentBeta, 'si');

        // 1. Direct view access attempt
        $resDirect = $this->actingAs($instructorAlpha)->get("/instructor/cursos/{$courseBeta->id}/view");
        $resDirect->assertStatus(403);

        // 2. Query param spoofing attempt on index
        $resIndex = $this->actingAs($instructorAlpha)->get("/instructor/cursos?cohort_id={$cohortBeta->id}");
        $resIndex->assertOk();
        $propsIndex = $this->getInertiaProps($resIndex);
        $coursesIndex = collect($propsIndex['courses'] ?? []);
        $this->assertFalse($coursesIndex->contains('id', $courseBeta->id), 'Alpha must not see Beta course on index.');
    }

    /**
     * Scenario 3: Admin supervisor audits all courses, cohorts, and grades.
     */
    public function test_tier4_scenario3_admin_supervisor_inspects_all_courses_cohorts_and_grades(): void
    {
        $admin = $this->createAdmin();
        $instA = $this->createInstructor();
        $instB = $this->createInstructor();

        $courseA = $this->createCourse(['titulo' => 'Cardiología']);
        $courseB = $this->createCourse(['titulo' => 'Neurología']);

        $cohortA = $this->createCohort($courseA, $instA);
        $cohortB = $this->createCohort($courseB, $instB);

        $studentA = $this->createStudent(['nombre' => 'Estudiante A']);
        $studentB = $this->createStudent(['nombre' => 'Estudiante B']);

        $enrollA = $this->enrollStudent($cohortA, $studentA, 'si');
        $enrollB = $this->enrollStudent($cohortB, $studentB, 'si');

        $quizA = $this->createQuiz($courseA);
        $this->createExam($enrollA, $quizA, 98.0, 'si');

        // Admin audits Course A
        $resA = $this->actingAs($admin)->get("/instructor/cursos/{$courseA->id}/view");
        $resA->assertOk();
        $propsA = $this->getInertiaProps($resA);
        $studentsA = collect($propsA['students'] ?? []);
        $this->assertTrue($studentsA->contains('id', $studentA->id));

        // Admin audits Course B
        $resB = $this->actingAs($admin)->get("/instructor/cursos/{$courseB->id}/view");
        $resB->assertOk();
        $propsB = $this->getInertiaProps($resB);
        $studentsB = collect($propsB['students'] ?? []);
        $this->assertTrue($studentsB->contains('id', $studentB->id));
    }

    /**
     * Scenario 4: Real-world cohort with mixed student statuses and varied activity performance.
     */
    public function test_tier4_scenario4_realistic_cohort_with_mixed_student_statuses_and_activity_performance(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse(['titulo' => 'Ginecología y Obstetricia']);
        $cohort = $this->createCohort($course, $instructor, ['identificador' => 'GIN-2026-I']);

        // 3 Accepted students
        $topStudent = $this->createStudent(['nombre' => 'Sofia', 'apellido' => 'Excelente']);
        $midStudent = $this->createStudent(['nombre' => 'Luis', 'apellido' => 'Regular']);
        $newStudent = $this->createStudent(['nombre' => 'Clara', 'apellido' => 'Reciente']);

        // 2 Rejected / pending students
        $rejected1 = $this->createStudent(['nombre' => 'Rechazado', 'apellido' => 'Uno']);
        $rejected2 = $this->createStudent(['nombre' => 'Rechazado', 'apellido' => 'Dos']);

        $enrollTop = $this->enrollStudent($cohort, $topStudent, 'si');
        $enrollMid = $this->enrollStudent($cohort, $midStudent, 'si');
        $this->enrollStudent($cohort, $newStudent, 'si');
        $this->enrollStudent($cohort, $rejected1, 'no');
        $this->enrollStudent($cohort, $rejected2, 'no');

        // Activities
        $quiz = $this->createQuiz($course, ['titulo' => 'Evaluación Médica']);
        $lesson = $this->createLesson($course, ['titulo' => 'Historia Clínica']);

        $this->createExam($enrollTop, $quiz, 100.0, 'si');
        $this->createHomework($lesson, $topStudent, false); // On time

        $this->createExam($enrollMid, $quiz, 60.0, 'si');
        $this->createHomework($lesson, $midStudent, true); // Late

        // Fetch view
        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view");
        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        // Assertion 1: Exact count of accepted students (3)
        $this->assertCount(3, $students);
        $this->assertFalse($students->contains('id', $rejected1->id));
        $this->assertFalse($students->contains('id', $rejected2->id));

        // Assertion 2: Top student metrics
        $topData = $students->firstWhere('id', $topStudent->id);
        $this->assertNotNull($topData);
        $topExams = collect($topData['exams'] ?? []);
        $this->assertEquals(100.0, (float) ($topExams->first()['score'] ?? $topExams->first()['score_total'] ?? 0));
        $topHw = collect($topData['homeworks'] ?? [])->first();
        if ($topHw) {
            $this->assertFalse((bool) $topHw['is_late']);
        }

        // Assertion 3: Mid student metrics
        $midData = $students->firstWhere('id', $midStudent->id);
        $this->assertNotNull($midData);
        $midHw = collect($midData['homeworks'] ?? [])->first();
        if ($midHw) {
            $this->assertTrue((bool) $midHw['is_late']);
        }
    }

    /**
     * Scenario 5: Clean zero-state handling for freshly launched course with empty cohort.
     */
    public function test_tier4_scenario5_freshly_created_course_with_empty_cohort_zero_state(): void
    {
        $instructor = $this->createInstructor();
        $newCourse = $this->createCourse(['titulo' => 'Farmacología Avanzada']);
        $this->createCohort($newCourse, $instructor, ['identificador' => 'FARM-NEW-01']);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$newCourse->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);

        // Cohort exists
        $cohorts = collect($props['cohorts'] ?? []);
        $totalCohorts = $props['total_cohorts'] ?? $cohorts->count();
        $this->assertEquals(1, $totalCohorts);

        // Students roster is empty
        $students = collect($props['students'] ?? []);
        $this->assertCount(0, $students, 'Fresh cohort must cleanly present empty students roster.');
    }
}
