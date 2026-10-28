<?php

namespace Tests\Feature\Instructor;

use App\Models\Course;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class InstructorCourseBuilderAccessTest extends TestCase
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
                $table->string('email')->unique();
                $table->string('username')->nullable();
                $table->string('password');
                $table->string('foto')->nullable();
                $table->string('avatar')->nullable();
                $table->boolean('is_active')->default(true);
                $table->string('activo')->default('si');
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
                $table->string('imagen')->nullable();
                $table->string('activo')->default('si');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('cursos_programados')) {
            Schema::create('cursos_programados', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->string('identificador')->nullable();
                $table->dateTime('fecha_inicio')->nullable();
                $table->dateTime('fecha_fin')->nullable();
                $table->decimal('precio', 10, 2)->nullable();
                $table->string('activo')->default('si');
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
                $table->timestamps();
            });
        }
    }

    protected function seedRoles(): void
    {
        $this->adminRole = Role::firstOrCreate(['slug' => 'admin'], [
            'name' => 'Administrador',
            'special' => 'all-access',
        ]);

        $this->instructorRole = Role::firstOrCreate(['slug' => 'instructor'], [
            'name' => 'Instructor',
        ]);

        $this->studentRole = Role::firstOrCreate(['slug' => 'alumno'], [
            'name' => 'Alumno',
        ]);
    }

    protected function createInstructor(): User
    {
        $user = User::create([
            'first_name' => 'Profesor',
            'last_name' => 'Docente',
            'email' => 'instructor_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
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
            'first_name' => 'Admin',
            'last_name' => 'Root',
            'email' => 'admin_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
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
            'first_name' => 'Estudiante',
            'last_name' => 'Alumno',
            'email' => 'student_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
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
            'titulo' => 'Curso de Cirugía ' . uniqid(),
            'slug' => 'cirugia-' . uniqid(),
            'descripcion' => 'Descripción',
            'activo' => 'si',
        ]);
    }

    protected function createCohort(Course $course, User $instructor): ScheduledCourse
    {
        return ScheduledCourse::create([
            'curso_id' => $course->id,
            'user_id' => $instructor->id,
            'identificador' => 'GRUPO-' . uniqid(),
            'activo' => 'si',
        ]);
    }

    public function test_instructor_can_access_builder_for_assigned_course(): void
    {
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $this->createCohort($course, $instructor);

        $response = $this->actingAs($instructor)->get("/instructor/cursos/{$course->id}/builder");

        $response->assertOk();
    }

    public function test_instructor_cannot_access_builder_for_unassigned_course_returns_403(): void
    {
        $instructorA = $this->createInstructor();
        $instructorB = $this->createInstructor();
        $course = $this->createCourse();
        $this->createCohort($course, $instructorB);

        $response = $this->actingAs($instructorA)->get("/instructor/cursos/{$course->id}/builder");

        $response->assertStatus(403);
    }

    public function test_admin_can_access_builder_for_any_course(): void
    {
        $admin = $this->createAdmin();
        $instructor = $this->createInstructor();
        $course = $this->createCourse();
        $this->createCohort($course, $instructor);

        $response = $this->actingAs($admin)->get("/instructor/cursos/{$course->id}/builder");

        $response->assertOk();
    }

    public function test_admin_can_access_builder_for_course_without_cohorts(): void
    {
        $admin = $this->createAdmin();
        $emptyCourse = $this->createCourse();

        $response = $this->actingAs($admin)->get("/instructor/cursos/{$emptyCourse->id}/builder");

        $response->assertOk();
    }

    public function test_unauthenticated_user_accessing_builder_is_redirected_to_login(): void
    {
        $course = $this->createCourse();

        $response = $this->get("/instructor/cursos/{$course->id}/builder");

        $response->assertRedirect('login');
    }

    public function test_student_role_accessing_instructor_builder_is_redirected_to_dashboard(): void
    {
        $student = $this->createStudent();
        $course = $this->createCourse();

        $response = $this->actingAs($student)->get("/instructor/cursos/{$course->id}/builder");

        $response->assertRedirect(route('dashboard'));
    }

    public function test_checkrole_middleware_admin_bypass_allows_admin_on_instructor_routes(): void
    {
        $admin = $this->createAdmin();
        $this->assertTrue($admin->hasRole('admin'));
        $this->assertFalse($admin->hasRole('instructor'));

        $response = $this->actingAs($admin)->get('/instructor/cursos');

        $response->assertOk();
    }
}
