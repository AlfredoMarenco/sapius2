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
 * Adversarial Security & Authorization Stress Suite
 * 
 * Verifies strict boundary isolation, query param tampering immunity,
 * cross-instructor access blocking, role transitions, and zero data leakage.
 */
class AdversarialSecurityTest extends TestCase
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

    protected function createDatabaseSchema(): void
    {
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
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->rememberToken();
                $table->timestamp('email_verified_at')->nullable();
                $table->timestamps();
            });
        }

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
                $table->unsignedBigInteger('course_id')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('instructor_id')->nullable();
                $table->dateTime('fecha_inicio')->nullable();
                $table->dateTime('fecha_fin')->nullable();
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
                $table->string('aceptado')->default('no');
                $table->string('status')->nullable();
                $table->string('tipo_pago')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('lecciones')) {
            Schema::create('lecciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->default(0);
                $table->string('titulo');
                $table->string('slug')->nullable();
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
                $table->string('titulo');
                $table->string('tipo')->default('EXANI');
                $table->string('activo')->default('si');
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

    protected function createInstructor(): User
    {
        $user = User::create([
            'nombre' => 'Instructor',
            'apellido' => 'Test',
            'name' => 'Instructor Test',
            'email' => 'instructor_' . uniqid() . '@adversarial.test',
            'password' => Hash::make('secret123'),
            'email_verified_at' => now(),
            'activo' => 'si',
            'is_active' => true,
        ]);
        $user->roles()->syncWithoutDetaching([$this->instructorRole->id]);
        $user->load('roles');
        return $user;
    }

    protected function createAdmin(): User
    {
        $user = User::create([
            'nombre' => 'Admin',
            'apellido' => 'Supervisor',
            'name' => 'Admin Supervisor',
            'email' => 'admin_' . uniqid() . '@adversarial.test',
            'password' => Hash::make('secret123'),
            'email_verified_at' => now(),
            'activo' => 'si',
            'is_active' => true,
        ]);
        $user->roles()->syncWithoutDetaching([$this->adminRole->id]);
        $user->load('roles');
        return $user;
    }

    protected function createStudent(): User
    {
        $user = User::create([
            'nombre' => 'Estudiante',
            'apellido' => 'Adversarial',
            'name' => 'Estudiante Adversarial',
            'email' => 'student_' . uniqid() . '@adversarial.test',
            'password' => Hash::make('secret123'),
            'email_verified_at' => now(),
            'activo' => 'si',
            'is_active' => true,
        ]);
        $user->roles()->syncWithoutDetaching([$this->studentRole->id]);
        $user->load('roles');
        return $user;
    }

    protected function createCourse(): Course
    {
        return Course::create([
            'titulo' => 'Curso ' . uniqid(),
            'slug' => 'curso-' . uniqid(),
            'activo' => 'si',
            'is_active' => true,
        ]);
    }

    protected function createCohort(Course $course, User $instructor): ScheduledCourse
    {
        return ScheduledCourse::create([
            'curso_id' => $course->id,
            'user_id' => $instructor->id,
            'identificador' => 'COHORT-' . uniqid(),
            'fecha_inicio' => now()->subDays(5),
            'fecha_fin' => now()->addDays(25),
            'activo' => 'si',
            'is_active' => true,
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
    // 1. Cross-Instructor Course Access (403 Enforcement)
    // =========================================================================

    public function test_adversarial_non_assigned_instructor_accessing_course_view_receives_403(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        $courseB = $this->createCourse();
        $this->createCohort($courseB, $instructorB);

        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$courseB->id}/view");

        $response->assertStatus(403);
    }

    public function test_adversarial_non_assigned_instructor_accessing_course_builder_receives_403(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        $courseB = $this->createCourse();
        $this->createCohort($courseB, $instructorB);

        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$courseB->id}/builder");

        $response->assertStatus(403);
    }

    public function test_adversarial_instructor_accessing_course_with_zero_cohorts_receives_403_on_view(): void
    {
        $instructor = $this->createInstructor();
        $emptyCourse = $this->createCourse();

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$emptyCourse->id}/view");

        $response->assertStatus(403);
    }

    public function test_adversarial_instructor_accessing_course_with_zero_cohorts_receives_403_on_builder(): void
    {
        $instructor = $this->createInstructor();
        $emptyCourse = $this->createCourse();

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$emptyCourse->id}/builder");

        $response->assertStatus(403);
    }

    // =========================================================================
    // 2. Query Parameter Tampering (?cohort_id=...)
    // =========================================================================

    public function test_adversarial_tampering_cohort_id_to_unassigned_cohort_in_same_course_receives_403(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        // Shared course with separate cohorts
        $course = $this->createCourse();
        $cohortA = $this->createCohort($course, $instructorA);
        $cohortB = $this->createCohort($course, $instructorB);

        // Instructor A attempts to inspect Instructor B's cohort via parameter tampering
        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$course->id}/view?cohort_id={$cohortB->id}");

        $response->assertStatus(403);
    }

    public function test_adversarial_tampering_cohort_id_to_foreign_course_cohort_receives_404_or_403(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        $courseA = $this->createCourse();
        $cohortA = $this->createCohort($courseA, $instructorA);

        $courseB = $this->createCourse();
        $cohortB = $this->createCohort($courseB, $instructorB);

        // Instructor A attempts to pass cohort from course B into course A
        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$courseA->id}/view?cohort_id={$cohortB->id}");

        $this->assertContains($response->getStatusCode(), [403, 404]);
    }

    public function test_adversarial_tampering_cohort_id_with_nonexistent_id_receives_404(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $this->createCohort($course, $instructor);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view?cohort_id=99999999");

        $response->assertStatus(404);
    }

    public function test_adversarial_tampering_cohort_id_with_negative_id_receives_404(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $this->createCohort($course, $instructor);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view?cohort_id=-1");

        $response->assertStatus(404);
    }

    public function test_adversarial_tampering_cohort_id_with_sql_injection_string_receives_404(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        // Malicious SQL injection payload
        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/view?cohort_id=" . urlencode("{$cohort->id}' OR '1'='1"));

        $response->assertStatus(404);
    }

    // =========================================================================
    // 3. Role Enforcement (Unauthenticated, Student, Admin)
    // =========================================================================

    public function test_adversarial_unauthenticated_user_accessing_instructor_index_redirects_to_login(): void
    {
        $response = $this->get('/instructor/cursos');

        $response->assertRedirect('login');
    }

    public function test_adversarial_unauthenticated_user_accessing_instructor_view_redirects_to_login(): void
    {
        $course = $this->createCourse();

        $response = $this->get("/instructor/cursos/{$course->id}/view");

        $response->assertRedirect('login');
    }

    public function test_adversarial_unauthenticated_user_accessing_instructor_builder_redirects_to_login(): void
    {
        $course = $this->createCourse();

        $response = $this->get("/instructor/cursos/{$course->id}/builder");

        $response->assertRedirect('login');
    }

    public function test_adversarial_student_role_accessing_instructor_index_redirects_to_dashboard(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->get('/instructor/cursos');

        $response->assertRedirect(route('dashboard'));
    }

    public function test_adversarial_student_role_accessing_instructor_view_redirects_to_dashboard(): void
    {
        $student = $this->createStudent();
        $course = $this->createCourse();

        $response = $this->actingAs($student)->get("/instructor/cursos/{$course->id}/view");

        $response->assertRedirect(route('dashboard'));
    }

    public function test_adversarial_student_role_accessing_instructor_builder_redirects_to_dashboard(): void
    {
        $student = $this->createStudent();
        $course = $this->createCourse();

        $response = $this->actingAs($student)->get("/instructor/cursos/{$course->id}/builder");

        $response->assertRedirect(route('dashboard'));
    }

    public function test_adversarial_enrolled_student_cannot_bypass_role_to_view_instructor_portal(): void
    {
        $instructor = $this->createInstructor();
        $student = $this->createStudent();
        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);

        // Student is enrolled with aceptado = 'si'
        Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $cohort->id,
            'aceptado' => 'si',
        ]);

        $response = $this->actingAs($student)->get("/instructor/cursos/{$course->id}/view");

        $response->assertRedirect(route('dashboard'));
    }

    public function test_adversarial_admin_accesses_everything_without_403(): void
    {
        $admin = $this->createAdmin();
        $instructor = $this->createInstructor();

        $course = $this->createCourse();
        $cohort = $this->createCohort($course, $instructor);
        $emptyCourse = $this->createCourse();

        // Admin accesses index
        $this->actingAs($admin)->get('/instructor/cursos')->assertOk();

        // Admin accesses assigned course view
        $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/view")->assertOk();

        // Admin accesses unassigned empty course view
        $this->actingAs($admin)->get("/instructor/cursos/{$emptyCourse->id}/view")->assertOk();

        // Admin accesses assigned course builder
        $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/builder")->assertOk();

        // Admin accesses unassigned course builder
        $this->actingAs($admin)->get("/instructor/cursos/{$emptyCourse->id}/builder")->assertOk();

        // Admin accesses specific cohort via query param without 403
        $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/view?cohort_id={$cohort->id}")->assertOk();
    }

    // =========================================================================
    // 4. Data Leakage & Isolation Verification
    // =========================================================================

    public function test_adversarial_cohort_dropdown_does_not_leak_unassigned_cohorts(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        $course = $this->createCourse();
        $cohortA = $this->createCohort($course, $instructorA);
        $cohortB = $this->createCohort($course, $instructorB);

        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $cohorts = collect($props['cohorts'] ?? []);

        $cohortIds = $cohorts->pluck('id')->all();
        $this->assertContains($cohortA->id, $cohortIds, "Assigned Cohort A should be present.");
        $this->assertNotContains($cohortB->id, $cohortIds, "Unassigned Cohort B must NEVER be leaked in cohorts prop.");
    }

    public function test_adversarial_students_from_unassigned_cohorts_are_never_leaked(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();

        $course = $this->createCourse();
        $cohortA = $this->createCohort($course, $instructorA);
        $cohortB = $this->createCohort($course, $instructorB);

        $studentA = $this->createStudent();
        $studentB = $this->createStudent();

        Enrollment::create(['user_id' => $studentA->id, 'curso_programado_id' => $cohortA->id, 'aceptado' => 'si']);
        Enrollment::create(['user_id' => $studentB->id, 'curso_programado_id' => $cohortB->id, 'aceptado' => 'si']);

        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$course->id}/view");

        $response->assertOk();
        $props = $this->getInertiaProps($response);
        $students = collect($props['students'] ?? []);

        $studentIds = $students->pluck('id')->all();
        $this->assertContains($studentA->id, $studentIds, "Student in Cohort A should be visible.");
        $this->assertNotContains($studentB->id, $studentIds, "Student in Cohort B must NEVER be visible to Instructor A.");
    }
}
