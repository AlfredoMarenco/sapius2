<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Models\UserStrikeHistory;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentAndAdminFixesTest extends TestCase
{
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
        if (! Schema::hasTable('users')) {
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

        if (! Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->integer('rating')->default(0);
                $table->text('comment')->nullable();
                $table->boolean('visible')->default(false);
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('curso_programado_id')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('user_strike_histories')) {
            Schema::create('user_strike_histories', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('action');
                $table->text('details')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cursos')) {
            Schema::create('cursos', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('titulo');
                $table->string('slug')->nullable();
                $table->text('descripcion')->nullable();
                $table->string('imagen')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cursos_programados')) {
            Schema::create('cursos_programados', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('identificador')->nullable();
                $table->date('fecha_inicio')->nullable();
                $table->date('fecha_fin')->nullable();
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

        if (! Schema::hasTable('descuentos')) {
            Schema::create('descuentos', function (Blueprint $table) {
                $table->id();
                $table->string('clave');
                $table->integer('descuento')->default(0);
                $table->integer('limite')->default(1);
                $table->unsignedBigInteger('curso_programado_id')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('pruebas')) {
            Schema::create('pruebas', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('curso_id')->nullable();
                $table->unsignedBigInteger('leccion_id')->nullable();
                $table->string('titulo')->nullable();
                $table->string('tipo')->default('EXANI');
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('examenes')) {
            Schema::create('examenes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('inscripcion_id');
                $table->unsignedBigInteger('prueba_id')->default(1);
                $table->integer('total_correctas')->default(0);
                $table->integer('total_preguntas')->default(0);
                $table->integer('score_total')->default(0);
                $table->string('finalizado')->default('no');
                $table->string('retro_visualizado')->default('no');
                $table->boolean('is_late')->default(false);
                $table->text('respuestas_json')->nullable();
                $table->text('eventos')->nullable();
                $table->timestamps();
            });
        }
    }

    protected function seedRoles(): void
    {
        $this->adminRole = Role::create([
            'name' => 'Administrador',
            'slug' => 'admin',
            'special' => 'all-access',
        ]);

        $this->studentRole = Role::create([
            'name' => 'Alumno',
            'slug' => 'alumno',
        ]);
    }

    protected function createUserWithRole(Role $role, array $overrides = []): User
    {
        $user = User::create(array_merge([
            'first_name' => 'Carlos',
            'last_name' => 'Mendoza',
            'email' => uniqid('user_').'@sapius.test',
            'username' => uniqid('usr_'),
            'password' => Hash::make('password'),
            'strikes' => 0,
            'is_blocked' => false,
        ], $overrides));

        $user->forceFill(['email_verified_at' => now()])->save();

        DB::table('role_user')->insert([
            'role_id' => $role->id,
            'user_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $user->fresh();
    }

    public function test_student_can_submit_opinion_without_mass_assignment_exception(): void
    {
        $student = $this->createUserWithRole($this->studentRole);

        $response = $this->actingAs($student)->post('/alumno/tu-opinion/store', [
            'name' => 'Dr. Carlos Mendoza',
            'rating' => 5,
            'comment' => 'Excelente plataforma de preparación académica con simuladores muy completos y actualizados.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('reviews', [
            'user_id' => $student->id,
            'name' => 'Dr. Carlos Mendoza',
            'rating' => 5,
            'visible' => 1,
        ]);

        $indexResponse = $this->actingAs($student)->get('/alumno/tu-opinion');
        $indexResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Opinion/Index')
                ->has('reviews', 1)
            );
    }

    public function test_admin_detailed_inscriptions_report_renders_existing_inertia_page(): void
    {
        $admin = $this->createUserWithRole($this->adminRole);
        $student = $this->createUserWithRole($this->studentRole);

        $course = Course::create([
            'title' => 'Curso ENARM Intensivo',
            'description' => 'Preparación médica',
        ]);

        $scheduled = ScheduledCourse::create([
            'curso_id' => $course->id,
            'identificador' => 'ENARM-2026-A',
            'activo' => 'si',
        ]);

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $scheduled->id,
            'aceptado' => 'si',
            'tipo_pago' => 'cupon',
            'referencia' => 'Cupon de descuento',
        ]);

        $response = $this->actingAs($admin)->get('/admin/reports/inscriptions');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Reports/Inscriptions')
                ->has('inscriptions.data', 1)
                ->where('inscriptions.data.0.id', $enrollment->id)
                ->where('inscriptions.data.0.course_title', 'Curso ENARM Intensivo')
            );

        $detailResponse = $this->actingAs($admin)->get("/admin/reports/inscriptions/{$enrollment->id}");
        $detailResponse->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Reports/ShowEnrollment')
                ->where('enrollment.id', $enrollment->id)
            );
    }

    public function test_screenshot_shortcut_strikes_accumulate_and_block_account_closing_active_exams(): void
    {
        $student = $this->createUserWithRole($this->studentRole);

        $course = Course::create([
            'title' => 'Simulador Médico',
            'description' => 'Simulador',
        ]);

        $scheduled = ScheduledCourse::create([
            'curso_id' => $course->id,
            'identificador' => 'SIM-01',
            'activo' => 'si',
        ]);

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $scheduled->id,
            'aceptado' => 'si',
            'referencia' => 'REF-123',
        ]);

        $exam = Exam::create([
            'enrollment_id' => $enrollment->id,
            'quiz_id' => 1,
            'score' => 0,
            'status' => 'no',
        ]);

        // Strike 1: Intento de captura (ImprPant -> +34 pts = 34/100)
        $res1 = $this->actingAs($student)->postJson('/alumno/strike', [
            'action' => 'PrintScreen',
            'reason' => 'Intento de captura de pantalla (ImprPant)',
        ]);
        $res1->assertOk()->assertJson([
            'success' => true,
            'status' => 'warning',
            'blocked' => false,
            'strikes' => 34,
            'max_strikes' => 100,
            'points_added' => 34,
        ]);

        // Strike 2: Combinación Ctrl+Alt+ImprPant (+34 pts = 68/100)
        $res2 = $this->actingAs($student->fresh())->postJson('/alumno/strike', [
            'action' => 'PrintScreen',
            'reason' => 'Intento de captura de pantalla (Ctrl+Alt+ImprPant)',
        ]);
        $res2->assertOk()->assertJson([
            'success' => true,
            'status' => 'warning',
            'blocked' => false,
            'strikes' => 68,
            'max_strikes' => 100,
            'points_added' => 34,
        ]);

        // Strike 3: Tercer intento (+34 pts capped at 100) -> bloquea cuenta y finaliza examen activo
        $res3 = $this->actingAs($student->fresh())->postJson('/alumno/strike', [
            'action' => 'PrintScreen',
            'reason' => 'Intento de captura de pantalla (ImprPant)',
        ]);
        $res3->assertOk()->assertJson([
            'success' => true,
            'status' => 'blocked',
            'blocked' => true,
            'strikes' => 100,
            'max_strikes' => 100,
            'points_added' => 34,
            'redirect' => route('alumno.blocked'),
        ]);

        $student->refresh();
        $this->assertTrue((bool) $student->is_blocked);
        $this->assertEquals(100, $student->strikes);
        $this->assertEquals(3, UserStrikeHistory::where('user_id', $student->id)->count());

        // Verificar que el examen en curso fue cerrado automáticamente con retro habilitada
        $exam->refresh();
        $this->assertEquals('si', $exam->finalizado);
        $this->assertEquals('si', $exam->retro_visualizado);

        // Verificar que cualquier ruta protegida redirige a /alumno/cuenta-bloqueada
        $blockedRedirect = $this->actingAs($student)->get('/alumno/dashboard');
        $blockedRedirect->assertRedirect(route('alumno.blocked'));
    }
}
