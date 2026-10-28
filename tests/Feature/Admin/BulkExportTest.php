<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Quiz;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BulkExportTest extends TestCase
{
    protected Role $adminRole;

    protected Role $instructorRole;

    protected Role $studentRole;

    protected User $adminUser;

    protected User $studentUser;

    protected Course $testCourse;

    protected ScheduledCourse $testCohort;

    protected Quiz $testQuiz;

    protected Enrollment $testEnrollment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createDatabaseSchema();
        $this->seedTestData();
    }

    protected function createDatabaseSchema(): void
    {
        if (! Schema::hasTable('users')) {
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
                $table->string('folio')->nullable();
                $table->string('university')->nullable();
                $table->string('universidad_procedencia')->nullable();
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

        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('special')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('role_user')) {
            Schema::create('role_user', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('user_id');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cursos')) {
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

        if (! Schema::hasTable('cursos_programados')) {
            Schema::create('cursos_programados', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->string('identificador')->nullable();
                $table->decimal('precio', 10, 2)->default(0.00);
                $table->dateTime('fecha_inicio')->nullable();
                $table->dateTime('fecha_fin')->nullable();
                $table->dateTime('fecha_inicio_venta')->nullable();
                $table->dateTime('fecha_fin_venta')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('lecciones')) {
            Schema::create('lecciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('leccion_id')->default(0)->nullable();
                $table->string('titulo');
                $table->string('slug')->nullable();
                $table->string('imagen')->nullable();
                $table->text('contenido')->nullable();
                $table->text('resumen')->nullable();
                $table->integer('posicion')->default(1);
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('pruebas')) {
            Schema::create('pruebas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('leccion_id')->nullable();
                $table->string('titulo');
                $table->text('descripcion')->nullable();
                $table->string('tipo')->default('EXANI');
                $table->integer('tiempo')->default(60);
                $table->integer('oportunidades')->default(1);
                $table->integer('min_score')->default(60);
                $table->integer('score')->default(100);
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('inscripciones')) {
            Schema::create('inscripciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('curso_programado_id');
                $table->string('aceptado')->default('no');
                $table->string('tipo_pago')->nullable();
                $table->string('referencia')->nullable();
                $table->string('clave')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('examenes')) {
            Schema::create('examenes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('inscripcion_id');
                $table->unsignedBigInteger('prueba_id');
                $table->integer('total_preguntas')->default(10);
                $table->integer('total_correctas')->default(8);
                $table->integer('aciertos')->default(8);
                $table->decimal('score_total', 8, 2)->default(80.00);
                $table->decimal('calificacion', 8, 2)->default(80.00);
                $table->string('finalizado')->default('si');
                $table->string('retro_visualizado')->default('no');
                $table->boolean('eventos')->default(false);
                $table->timestamps();
            });
        }
    }

    protected function seedTestData(): void
    {
        $this->adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $this->instructorRole = Role::firstOrCreate(['slug' => 'instructor'], ['name' => 'Instructor']);
        $this->studentRole = Role::firstOrCreate(['slug' => 'alumno'], ['name' => 'Alumno']);

        // Admin User
        $this->adminUser = User::firstOrCreate(
            ['email' => 'admin_test_export@sapius.com'],
            [
                'name' => 'Admin Test',
                'first_name' => 'Admin',
                'last_name' => 'Test',
                'password' => Hash::make('password123'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        DB::table('role_user')->updateOrInsert(
            ['role_id' => $this->adminRole->id, 'user_id' => $this->adminUser->id],
            ['created_at' => now(), 'updated_at' => now()]
        );

        // Student User
        $this->studentUser = User::firstOrCreate(
            ['email' => 'student_test_export@sapius.com'],
            [
                'name' => 'Student Test',
                'first_name' => 'Student',
                'last_name' => 'Export',
                'folio' => 'FOLIO-1234',
                'university' => 'Universidad Nacional',
                'password' => Hash::make('password123'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        DB::table('role_user')->updateOrInsert(
            ['role_id' => $this->studentRole->id, 'user_id' => $this->studentUser->id],
            ['created_at' => now(), 'updated_at' => now()]
        );

        // Course & Cohort
        $this->testCourse = Course::firstOrCreate(
            ['titulo' => 'Curso de Bioquímica Clínica'],
            [
                'title' => 'Curso de Bioquímica Clínica',
                'slug' => 'curso-bioquimica-clinica',
                'activo' => 'si',
                'is_active' => true,
            ]
        );

        $this->testCohort = ScheduledCourse::firstOrCreate(
            ['identificador' => 'BIO-2026-A'],
            [
                'curso_id' => $this->testCourse->id,
                'user_id' => $this->adminUser->id,
                'precio' => 2500.00,
                'activo' => 'si',
                'fecha_inicio' => now()->subMonth(),
                'fecha_fin' => now()->addMonth(),
            ]
        );

        // Quiz
        $this->testQuiz = Quiz::firstOrCreate(
            ['titulo' => 'Examen Parcial 1', 'curso_id' => $this->testCourse->id],
            [
                'tipo' => 'EXANI',
                'min_score' => 60,
                'score' => 100,
                'activo' => 'si',
            ]
        );

        // Enrollment
        $this->testEnrollment = Enrollment::firstOrCreate(
            ['user_id' => $this->studentUser->id, 'curso_programado_id' => $this->testCohort->id],
            [
                'aceptado' => 'si',
                'tipo_pago' => 'tarjeta',
                'referencia' => 'REF_TEST_123',
            ]
        );

        // Exam attempt
        Exam::updateOrCreate(
            ['inscripcion_id' => $this->testEnrollment->id, 'prueba_id' => $this->testQuiz->id],
            [
                'total_preguntas' => 20,
                'total_correctas' => 18,
                'aciertos' => 18,
                'score_total' => 90.00,
                'calificacion' => 90.00,
                'finalizado' => 'si',
                'eventos' => false,
            ]
        );
    }

    public function test_unauthenticated_user_cannot_access_export(): void
    {
        $response = $this->get("/admin/exportAllResults/{$this->testCohort->id}");
        $response->assertRedirect('/login');
    }

    public function test_non_admin_cannot_access_export(): void
    {
        $response = $this->actingAs($this->studentUser)->get("/admin/exportAllResults/{$this->testCohort->id}");
        $response->assertRedirect(route('dashboard'));
    }

    public function test_admin_can_export_cohort_grades_in_excel(): void
    {
        $response = $this->actingAs($this->adminUser)->get("/admin/exportAllResults/{$this->testCohort->id}?format=excel");

        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('.xlsx', $response->headers->get('Content-Disposition'));
    }

    public function test_admin_can_export_cohort_grades_in_zip(): void
    {
        $response = $this->actingAs($this->adminUser)->get("/admin/exportAllResults/{$this->testCohort->id}?format=zip");

        $response->assertStatus(200);
        $this->assertStringContainsString('.zip', $response->headers->get('Content-Disposition'));
    }

    public function test_admin_can_export_individual_student_pdf(): void
    {
        $response = $this->actingAs($this->adminUser)->get("/admin/exportCalificaciones/{$this->testEnrollment->id}");

        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('.pdf', $response->headers->get('Content-Disposition'));
    }
}
