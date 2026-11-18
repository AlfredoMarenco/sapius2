<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\ManageableGuiaMedicine;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\CreatesLegacySchema;

uses(CreatesLegacySchema::class);

beforeEach(function () {
    $this->setUpAcademicSchema();
    $this->seedLegacyRoles();

    foreach ([
        'manageable_guia_medicines',
        'manageable_guia_nutrition',
        'manageable_simulator_medicines',
        'manageable_simulator_nutrition',
    ] as $tableName) {
        if (! Schema::hasTable($tableName)) {
            Schema::create($tableName, function (Blueprint $table) {
                $table->id();
                $table->string('titulo');
                $table->text('descripcion');
                $table->string('image')->nullable();
                $table->string('type');
                $table->string('category');
                $table->integer('position')->default(0);
                $table->timestamps();
            });
        }
    }

    $this->uploadedEditorFiles = [];
});

afterEach(function () {
    foreach ($this->uploadedEditorFiles as $filePath) {
        if (is_file($filePath)) {
            @unlink($filePath);
        }
    }
});

function createUserWithRole(string $roleSlug): User
{
    $user = User::create([
        'first_name' => ucfirst($roleSlug),
        'last_name' => 'Tester',
        'username' => $roleSlug.'_'.uniqid(),
        'email' => $roleSlug.'_'.uniqid().'@sapius.test',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
        'activo' => 'si',
    ]);

    $role = Role::where('slug', $roleSlug)->firstOrFail();
    $now = now();
    DB::table('role_user')->updateOrInsert(
        ['role_id' => $role->id, 'user_id' => $user->id],
        ['created_at' => $now, 'updated_at' => $now]
    );

    return $user->load('roles');
}

test('admin can upload an editor image and serve it via publicMediaStream while guests and students are blocked', function () {
    $admin = createUserWithRole('admin');
    $student = createUserWithRole('alumno');

    $fakeImage = UploadedFile::fake()->image('diagrama.png', 200, 120);

    $this->post('/admin/editor/upload-image', ['image' => $fakeImage])
        ->assertRedirect(route('login'));

    $this->actingAs($student)
        ->post('/admin/editor/upload-image', ['image' => $fakeImage])
        ->assertRedirect(route('dashboard'));

    $noRoleUser = User::create([
        'first_name' => 'No',
        'last_name' => 'Role',
        'username' => 'norole_'.uniqid(),
        'email' => 'norole_'.uniqid().'@sapius.test',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
        'activo' => 'si',
    ]);

    $this->actingAs($noRoleUser)
        ->post('/admin/editor/upload-image', ['image' => $fakeImage])
        ->assertForbidden();

    $response = $this->actingAs($admin)
        ->postJson('/admin/editor/upload-image', ['image' => $fakeImage])
        ->assertOk()
        ->assertJsonStructure(['url']);

    $url = (string) $response->json('url');
    expect($url)->toStartWith('/media/stream/editor/');

    $relativePath = ltrim(str_replace('/media/stream/', '', $url), '/');
    $fullPath = storage_path('app/public/'.$relativePath);
    $this->uploadedEditorFiles[] = $fullPath;

    expect(is_file($fullPath))->toBeTrue();

    $this->get($url)->assertOk();
});

test('instructor can upload editor image only for an assigned course', function () {
    $instructor = createUserWithRole('instructor');
    $otherInstructor = createUserWithRole('instructor');

    $assignedCourse = Course::create([
        'user_id' => $instructor->id,
        'title' => 'Curso Asignado',
        'slug' => 'curso-asignado-'.uniqid(),
        'is_active' => true,
    ]);

    ScheduledCourse::create([
        'course_id' => $assignedCourse->id,
        'instructor_id' => $instructor->id,
        'internal_id' => 'INST-01',
        'price' => 500,
        'is_active' => true,
    ]);

    $unassignedCourse = Course::create([
        'user_id' => $otherInstructor->id,
        'title' => 'Curso Ajeno',
        'slug' => 'curso-ajeno-'.uniqid(),
        'is_active' => true,
    ]);

    $fakeImage = UploadedFile::fake()->image('caso.png', 120, 120);

    $this->actingAs($instructor)
        ->postJson('/instructor/editor/upload-image', [
            'image' => $fakeImage,
            'course_id' => $unassignedCourse->id,
        ])
        ->assertForbidden();

    $response = $this->actingAs($instructor)
        ->postJson('/instructor/editor/upload-image', [
            'image' => $fakeImage,
            'course_id' => $assignedCourse->id,
        ])
        ->assertOk();

    $relativePath = ltrim(str_replace('/media/stream/', '', (string) $response->json('url')), '/');
    $this->uploadedEditorFiles[] = storage_path('app/public/'.$relativePath);
});

test('course store and update sanitize rich html and convert empty paragraphs to null', function () {
    $admin = createUserWithRole('admin');

    $rawHtml = '<p><strong>Curso Clínico</strong></p><ol><li>Módulo 1</li></ol><script>alert(1)</script><img src="https://example.com/a.png" onerror="alert(2)">';

    $this->actingAs($admin)
        ->post('/admin/courses', [
            'title' => 'Curso Nutrición Pro',
            'description' => $rawHtml,
        ])
        ->assertRedirect(route('admin.courses.index'));

    $course = Course::where('titulo', 'Curso Nutrición Pro')->firstOrFail();

    expect($course->description)
        ->toContain('<strong>Curso Clínico</strong>')
        ->toContain('<ol><li>Módulo 1</li></ol>')
        ->not->toContain('<script')
        ->not->toContain('onerror');

    $this->actingAs($admin)
        ->put('/admin/courses/'.$course->id, [
            'title' => 'Curso Nutrición Pro',
            'description' => '<p></p>',
        ])
        ->assertRedirect(route('admin.courses.index'));

    expect($course->fresh()->description)->toBeNull();
});

test('manageable store and update sanitize rich html, respect not-null descripcion, and preserve safe landing formatting', function () {
    $admin = createUserWithRole('admin');

    $this->actingAs($admin)
        ->post('/admin/manageable/store', [
            'titulo' => 'Guía Medicina Integral',
            'descripcion' => '<h2 class="MsoNormal" style="font-family: Calibri; text-align: center;">Temario</h2><ol><li>Cardiología</li></ol><script>evil()</script><span onclick="hack()">Nota</span>',
            'type' => 'guias',
            'category' => 'medicina',
        ])
        ->assertRedirect();

    $card = ManageableGuiaMedicine::firstOrFail();

    expect($card->descripcion)
        ->toContain('Temario')
        ->toContain('<ol><li>Cardiología</li></ol>')
        ->not->toContain('<script')
        ->not->toContain('onclick');

    $this->get('/guias-medicina')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/GuiasLanding')
            ->has('manageableCards', 1)
            ->where('manageableCards.0.descripcion', function (string $desc) {
                return str_contains($desc, '<h2')
                    && str_contains($desc, 'style="text-align: center"')
                    && str_contains($desc, '<ol><li>Cardiología</li></ol>')
                    && ! str_contains($desc, 'Calibri');
            })
        );

    $this->actingAs($admin)
        ->put('/admin/manageable/update', [
            'id' => $card->id,
            'titulo' => 'Guía Medicina Integral',
            'descripcion' => '<p></p>',
            'type' => 'guias',
            'category' => 'medicina',
        ])
        ->assertRedirect();

    expect($card->fresh()->descripcion)->toBe('');
});

test('course builder storeQuiz saves, updates with quiz_id without duplicating, and clears rich description', function () {
    $admin = createUserWithRole('admin');

    $course = Course::create([
        'user_id' => $admin->id,
        'title' => 'Curso Quiz',
        'slug' => 'curso-quiz-'.uniqid(),
        'is_active' => true,
    ]);

    $module = Module::create([
        'course_id' => $course->id,
        'title' => 'Módulo 1',
        'slug' => 'modulo-1',
        'position' => 1,
    ]);

    $lesson = Lesson::create([
        'course_id' => $course->id,
        'leccion_id' => $module->id,
        'title' => 'Lección 1',
        'slug' => 'leccion-1',
        'position' => 1,
    ]);

    $this->actingAs($admin)
        ->post('/admin/lessons/'.$lesson->id.'/quiz', [
            'title' => 'Simulador 1',
            'description' => '<p><strong>Instrucciones:</strong> lee con atención.</p><script>xss()</script>',
            'type' => 'EGEL',
            'time_limit' => 45,
            'attempts_allowed' => 2,
        ])
        ->assertRedirect();

    $quiz = Quiz::where('leccion_id', $lesson->id)->firstOrFail();

    expect(Quiz::where('leccion_id', $lesson->id)->count())->toBe(1);
    expect($quiz->description)
        ->toContain('<strong>Instrucciones:</strong> lee con atención.')
        ->not->toContain('<script');

    $this->actingAs($admin)
        ->post('/admin/lessons/'.$lesson->id.'/quiz', [
            'quiz_id' => $quiz->id,
            'title' => 'Simulador 1 Editado',
            'description' => '<p></p>',
            'type' => 'EGEL',
            'time_limit' => 60,
            'attempts_allowed' => 3,
        ])
        ->assertRedirect();

    expect(Quiz::where('leccion_id', $lesson->id)->count())->toBe(1);
    expect($quiz->fresh()->title)->toBe('Simulador 1 Editado');
    expect($quiz->fresh()->description)->toBeNull();
});
