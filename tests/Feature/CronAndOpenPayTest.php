<?php

namespace Tests\Feature;

use App\Mail\AutoAceptacionEmail;
use App\Mail\TarjetaEmail;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Services\EnrollmentFulfillmentService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CronAndOpenPayTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('nombre')->nullable();
                $table->string('apellido')->nullable();
                $table->string('username')->nullable();
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password')->nullable();
                $table->string('remember_token')->nullable();
                $table->string('activo')->default('si');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cursos')) {
            Schema::create('cursos', function (Blueprint $table) {
                $table->id();
                $table->string('titulo');
                $table->text('descripcion')->nullable();
                $table->string('activo')->default('si');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cursos_programados')) {
            Schema::create('cursos_programados', function (Blueprint $table) {
                $table->id();
                $table->string('identificador');
                $table->unsignedBigInteger('curso_id');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->dateTime('fecha_inicio')->nullable();
                $table->dateTime('fecha_fin')->nullable();
                $table->decimal('precio', 10, 2)->default(0);
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
    }
    public function test_artisan_commands_are_registered(): void
    {
        $commands = \Illuminate\Support\Facades\Artisan::all();

        $this->assertArrayHasKey('inscripciones:auto-aprobar', $commands);
        $this->assertArrayHasKey('reminders:overdue-lessons', $commands);
        $this->assertArrayHasKey('usuarios:verificar', $commands);
    }

    public function test_openpay_webhook_verification_handshake(): void
    {
        $response = $this->postJson('/api/webhooks/openpay', [
            'type' => 'verification',
            'event_date' => now()->toIso8601String(),
            'verification_code' => 'TEST_VERIF_12345',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'verification_code' => 'TEST_VERIF_12345',
            ]);
    }

    public function test_openpay_webhook_unhandled_event_returns_200(): void
    {
        $response = $this->postJson('/api/webhooks/openpay', [
            'type' => 'charge.pending',
            'event_date' => now()->toIso8601String(),
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ignored',
            ]);
    }

    public function test_auto_aprobar_inscripciones_approves_after_two_hours_even_on_last_day(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'activo' => 'si',
        ]);

        $category = Category::create([
            'name' => 'Cursos',
            'slug' => 'cursos',
        ]);

        $course = Course::create([
            'title' => 'Curso Prueba',
            'description' => 'Descripción',
            'activo' => 'si',
            'category_id' => $category->id,
        ]);

        $scheduledCourse = ScheduledCourse::create([
            'identificador' => 'TEST-2026',
            'curso_id' => $course->id,
            'category_id' => $category->id,
            'fecha_inicio' => now()->subDays(5)->startOfDay(),
            'fecha_fin' => now()->startOfDay(),
            'precio' => 1000,
            'activo' => 'si',
        ]);

        $twoHoursAgo = now()->subHours(2)->subMinute();
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'curso_programado_id' => $scheduledCourse->id,
            'aceptado' => 'no',
            'tipo_pago' => 'tarjeta',
            'referencia' => 'tr_test_auto_approve',
        ]);
        $enrollment->created_at = $twoHoursAgo;
        $enrollment->updated_at = $twoHoursAgo;
        $enrollment->save();

        $this->artisan('inscripciones:auto-aprobar')
            ->assertExitCode(0);

        $enrollment->refresh();
        $this->assertSame('si', $enrollment->aceptado);
        Mail::assertSent(AutoAceptacionEmail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_auto_aprobar_skips_admin_modified_enrollments_and_fulfill_syncs_timestamps(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'activo' => 'si',
        ]);

        $category = Category::create([
            'name' => 'Cursos',
            'slug' => 'cursos',
        ]);

        $course = Course::create([
            'title' => 'Curso Prueba 2',
            'description' => 'Descripción',
            'activo' => 'si',
            'category_id' => $category->id,
        ]);

        $scheduledCourse = ScheduledCourse::create([
            'identificador' => 'TEST-2026-2',
            'curso_id' => $course->id,
            'category_id' => $category->id,
            'fecha_inicio' => now()->subDays(5)->startOfDay(),
            'fecha_fin' => now()->addDays(5)->startOfDay(),
            'precio' => 1000,
            'activo' => 'si',
        ]);

        // Caso 1: Inscripción modificada manualmente por un admin (updated_at > created_at) no se auto-aprueba
        $enrollmentAdmin = Enrollment::create([
            'user_id' => $user->id,
            'curso_programado_id' => $scheduledCourse->id,
            'aceptado' => 'no',
            'tipo_pago' => 'tarjeta',
            'referencia' => 'tr_admin_disabled',
        ]);
        $enrollmentAdmin->created_at = now()->subHours(5);
        $enrollmentAdmin->updated_at = now()->subHours(3);
        $enrollmentAdmin->save();

        $this->artisan('inscripciones:auto-aprobar')
            ->assertExitCode(0);

        $enrollmentAdmin->refresh();
        $this->assertSame('no', $enrollmentAdmin->aceptado);
        Mail::assertNotSent(AutoAceptacionEmail::class);

        // Caso 2: EnrollmentFulfillmentService::fulfill() sobre una inscripción previa iguala created_at y updated_at
        $service = app(EnrollmentFulfillmentService::class);
        $fulfilled = $service->fulfill($user, $scheduledCourse, 'tr_new_payment', 'tarjeta', 1000.0);

        $this->assertEquals($fulfilled->created_at->toDateTimeString(), $fulfilled->updated_at->toDateTimeString());
        Mail::assertSent(TarjetaEmail::class);
    }
}
