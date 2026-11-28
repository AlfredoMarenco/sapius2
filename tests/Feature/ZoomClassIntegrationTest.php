<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Models\ZoomClass;
use App\Services\ZoomService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    if (! Schema::hasTable('users')) {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('nombre')->nullable();
            $table->string('apellido')->nullable();
            $table->string('username')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('activo')->default('si');
            $table->boolean('is_blocked')->default(false);
            $table->integer('strikes')->default(0);
            $table->rememberToken();
            $table->timestamps();
        });
    }
    if (! Schema::hasTable('roles')) {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }
    if (! Schema::hasTable('role_user')) {
        Schema::create('role_user', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
        });
    }
    if (! Schema::hasTable('cursos')) {
        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('titulo')->nullable();
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
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_fin')->nullable();
            $table->decimal('precio', 10, 2)->default(0);
            $table->string('identificador')->nullable();
            $table->string('activo')->default('si');
            $table->timestamps();
        });
    }
    if (! Schema::hasTable('inscripciones')) {
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('curso_programado_id');
            $table->string('aceptado')->default('si');
            $table->timestamps();
        });
    }
    if (! Schema::hasTable('lecciones')) {
        Schema::create('lecciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('curso_id')->nullable();
            $table->unsignedBigInteger('leccion_id')->default(0);
            $table->string('titulo')->nullable();
            $table->string('slug')->nullable();
            $table->integer('posicion')->default(1);
            $table->string('activo')->default('si');
            $table->timestamps();
        });
    }
    if (! Schema::hasTable('zoom_classes')) {
        Artisan::call('migrate', [
            '--path' => 'database/migrations/2026_11_27_200000_create_zoom_classes_table.php',
        ]);
    }
});

test('zoom service generates valid HS256 JWT signature and parses zoom inputs', function () {
    config()->set('services.zoom.sdk_key', 'test-sdk-key');
    config()->set('services.zoom.sdk_secret', 'test-sdk-secret');

    $service = app(ZoomService::class);
    $jwt = $service->generateSdkSignature('812 3456 7890', 0);

    $parts = explode('.', $jwt);
    expect($parts)->toHaveCount(3);

    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
    expect($payload['sdkKey'])->toBe('test-sdk-key')
        ->and($payload['mn'])->toBe('81234567890')
        ->and($payload['role'])->toBe(0);

    $parsedUrl = $service->parseZoomInput('https://us06web.zoom.us/j/89912345678?pwd=MySecretPass');
    expect($parsedUrl['meeting_number'])->toBe('89912345678')
        ->and($parsedUrl['passcode'])->toBe('MySecretPass')
        ->and($parsedUrl['join_url'])->toBe('https://us06web.zoom.us/j/89912345678?pwd=MySecretPass');
});

test('admin and assigned instructor can manage zoom classes while other instructors are forbidden', function () {
    $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
    $instructorRole = Role::create(['name' => 'Instructor', 'slug' => 'instructor']);

    $admin = User::factory()->create(['activo' => 'si']);
    $admin->roles()->attach($adminRole->id);

    $instructor = User::factory()->create(['activo' => 'si']);
    $instructor->roles()->attach($instructorRole->id);

    $otherInstructor = User::factory()->create(['activo' => 'si']);
    $otherInstructor->roles()->attach($instructorRole->id);

    $course = Course::create([
        'user_id' => $admin->id,
        'title' => 'Curso EGEL Medicina',
        'slug' => 'curso-egel-medicina',
        'is_active' => true,
    ]);

    $schedule = ScheduledCourse::create([
        'course_id' => $course->id,
        'instructor_id' => $instructor->id,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => 1500,
        'internal_id' => 'MED-2026-A',
        'is_active' => true,
    ]);

    // Admin can create manual zoom class
    $this->actingAs($admin)
        ->post("/admin/schedules/{$schedule->id}/zoom-classes", [
            'title' => 'Clase Inaugural',
            'creation_mode' => 'manual',
            'meeting_input' => 'https://zoom.us/j/81234567890?pwd=pass123',
            'scheduled_at' => now()->format('Y-m-d H:i:s'),
            'duration_minutes' => 90,
        ])
        ->assertRedirect();

    expect(ZoomClass::where('curso_programado_id', $schedule->id)->count())->toBe(1);

    // Assigned instructor can access and create in their cohort
    $this->actingAs($instructor)
        ->get("/instructor/schedules/{$schedule->id}/zoom-classes")
        ->assertOk();

    // Other instructor is forbidden (403)
    $this->actingAs($otherInstructor)
        ->get("/instructor/schedules/{$schedule->id}/zoom-classes")
        ->assertForbidden();
});

test('auto mode creates meeting via zoom rest api when configured', function () {
    config()->set('services.zoom.account_id', 'acc-123');
    config()->set('services.zoom.client_id', 'cli-123');
    config()->set('services.zoom.client_secret', 'sec-123');

    Http::fake([
        'https://zoom.us/oauth/token*' => Http::response(['access_token' => 'fake-token'], 200),
        'https://api.zoom.us/v2/users/*/meetings' => Http::response([
            'id' => 98765432100,
            'password' => 'auto999',
            'join_url' => 'https://zoom.us/j/98765432100',
            'start_url' => 'https://zoom.us/s/98765432100?zak=abc',
        ], 201),
    ]);

    $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
    $admin = User::factory()->create(['activo' => 'si']);
    $admin->roles()->attach($adminRole->id);

    $course = Course::create([
        'user_id' => $admin->id,
        'title' => 'Curso Auto Zoom',
        'slug' => 'curso-auto-zoom',
        'is_active' => true,
    ]);

    $schedule = ScheduledCourse::create([
        'course_id' => $course->id,
        'instructor_id' => $admin->id,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => 1000,
        'internal_id' => 'AUTO-01',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->post("/admin/schedules/{$schedule->id}/zoom-classes", [
            'title' => 'Sesión Automática',
            'creation_mode' => 'auto',
            'scheduled_at' => now()->addHour()->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
        ])
        ->assertRedirect();

    $zoomClass = ZoomClass::first();
    expect($zoomClass)->not->toBeNull()
        ->and($zoomClass->meeting_number)->toBe('98765432100')
        ->and($zoomClass->passcode)->toBe('auto999')
        ->and($zoomClass->start_url)->toContain('zak=abc');
});

test('enrolled student can open embedded zoom room and obtain sdk signature while non-enrolled student gets 403', function () {
    config()->set('services.zoom.sdk_key', 'sdk-key-123');
    config()->set('services.zoom.sdk_secret', 'sdk-secret-123');

    $studentRole = Role::create(['name' => 'Alumno', 'slug' => 'alumno']);
    $enrolledStudent = User::factory()->create(['activo' => 'si', 'is_blocked' => false, 'strikes' => 0]);
    $enrolledStudent->roles()->attach($studentRole->id);

    $outsiderStudent = User::factory()->create(['activo' => 'si', 'is_blocked' => false, 'strikes' => 0]);
    $outsiderStudent->roles()->attach($studentRole->id);

    $course = Course::create([
        'user_id' => $enrolledStudent->id,
        'title' => 'Curso Nutrición',
        'slug' => 'curso-nutricion',
        'is_active' => true,
    ]);

    $schedule = ScheduledCourse::create([
        'course_id' => $course->id,
        'instructor_id' => $enrolledStudent->id,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => 1200,
        'internal_id' => 'NUT-01',
        'is_active' => true,
    ]);

    Enrollment::create([
        'user_id' => $enrolledStudent->id,
        'curso_programado_id' => $schedule->id,
        'aceptado' => 'si',
    ]);

    $zoomClass = ZoomClass::create([
        'curso_programado_id' => $schedule->id,
        'curso_id' => $course->id,
        'title' => 'Clase En Vivo Nutrición',
        'creation_mode' => 'manual',
        'meeting_number' => '81122334455',
        'passcode' => 'nutri123',
        'scheduled_at' => now(),
        'duration_minutes' => 60,
        'status' => 'live',
        'is_active' => true,
    ]);

    $this->actingAs($enrolledStudent)
        ->get("/alumno/clases-en-vivo/{$zoomClass->id}/sala")
        ->assertOk();

    $this->actingAs($enrolledStudent)
        ->postJson("/alumno/clases-en-vivo/{$zoomClass->id}/signature")
        ->assertOk()
        ->assertJsonStructure(['signature', 'sdkKey', 'meetingNumber', 'password', 'userName', 'userEmail']);

    $this->actingAs($outsiderStudent)
        ->get("/alumno/clases-en-vivo/{$zoomClass->id}/sala")
        ->assertForbidden();

    $this->actingAs($outsiderStudent)
        ->postJson("/alumno/clases-en-vivo/{$zoomClass->id}/signature")
        ->assertForbidden();
});

test('admin schedules index supports search, status and course filters and zoom page provides available cohorts', function () {
    $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
    $admin = User::factory()->create(['activo' => 'si']);
    $admin->roles()->attach($adminRole->id);

    $courseA = Course::create([
        'user_id' => $admin->id,
        'title' => 'Manejo de Servicios Alimenticios',
        'slug' => 'manejo-servicios-alimenticios',
        'is_active' => true,
    ]);
    $courseB = Course::create([
        'user_id' => $admin->id,
        'title' => 'EXANI II Medicina',
        'slug' => 'exani-ii-medicina',
        'is_active' => true,
    ]);

    $schedA = ScheduledCourse::create([
        'course_id' => $courseA->id,
        'instructor_id' => $admin->id,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => 1500,
        'internal_id' => 'DIC-2026-ALIM',
        'is_active' => true,
    ]);
    ScheduledCourse::create([
        'course_id' => $courseB->id,
        'instructor_id' => $admin->id,
        'start_date' => now()->subMonth(),
        'end_date' => now()->subDay(),
        'price' => 2000,
        'internal_id' => 'ENE-2026-EXANI',
        'is_active' => false,
    ]);

    $this->actingAs($admin)
        ->get('/admin/registro/programacion?search=alimenticios&status=active')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Schedules/Index')
            ->has('schedules.data', 1)
            ->where('schedules.data.0.internal_id', 'DIC-2026-ALIM')
        );

    $this->actingAs($admin)
        ->get('/admin/registro/programacion?status=inactive')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Schedules/Index')
            ->has('schedules.data', 1)
            ->where('schedules.data.0.internal_id', 'ENE-2026-EXANI')
        );

    $this->actingAs($admin)
        ->get("/admin/schedules/{$schedA->id}/zoom-classes")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Schedules/ZoomClasses')
            ->has('availableCohorts', 2)
        );
});

