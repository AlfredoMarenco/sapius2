<?php

namespace Tests\Feature;

use App\Mail\AccountBlockedEmail;
use App\Models\Answer;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\ContenidoProgramado;
use App\Models\Course;
use App\Models\Discount;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\InteractivePdf;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\ScheduledCourse;
use App\Models\User;
use App\Models\UserStrikeHistory;
use App\Services\StrikeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\CreatesLegacySchema;
use Tests\TestCase;

class SecurityAndParityRegressionTest extends TestCase
{
    use CreatesLegacySchema;

    /** @var array<int, string> */
    protected array $tempFiles = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpAcademicSchema();
        $this->seedLegacyRoles();
    }

    protected function tearDown(): void
    {
        foreach ($this->tempFiles as $file) {
            if (is_file($file)) {
                @unlink($file);
            }
        }

        if (Certificate::defaultHasTable() === false) {
            DB::purge('certificates_sqlite');
            $sqlitePath = Certificate::sqlitePath();
            if (is_file($sqlitePath)) {
                @unlink($sqlitePath);
            }
            config(['database.connections.certificates_sqlite' => null]);
        }

        parent::tearDown();
    }

    protected function createStudent(array $overrides = []): User
    {
        $user = User::create(array_merge([
            'first_name' => 'Ana',
            'last_name' => 'López',
            'username' => 'alu_'.uniqid(),
            'email' => 'alu_'.uniqid().'@sapius.test',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'activo' => 'si',
        ], $overrides));

        return $this->assignLegacyRole($user, 'alumno');
    }

    protected function createInstructor(array $overrides = []): User
    {
        $user = User::create(array_merge([
            'first_name' => 'Dr. Hugo',
            'last_name' => 'Vega',
            'username' => 'inst_'.uniqid(),
            'email' => 'inst_'.uniqid().'@sapius.test',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'activo' => 'si',
        ], $overrides));

        return $this->assignLegacyRole($user, 'instructor');
    }

    protected function createFullCourseHierarchy(?User $instructor = null): array
    {
        $instructor ??= $this->createInstructor();
        $category = Category::create(['name' => 'Cursos', 'slug' => 'cursos']);

        $course = Course::create([
            'user_id' => $instructor->id,
            'title' => 'Curso EGEL Medicina',
            'slug' => 'curso-egel-medicina-'.uniqid(),
            'description' => 'Preparación integral EGEL',
            'is_active' => true,
        ]);

        $scheduled = ScheduledCourse::create([
            'course_id' => $course->id,
            'category_id' => $category->id,
            'instructor_id' => $instructor->id,
            'internal_id' => 'MED-2026-01',
            'price' => 1000.00,
            'start_date' => now()->subDays(5),
            'end_date' => now()->addMonths(3),
            'fecha_inicio_venta' => now()->subDays(10),
            'fecha_fin_venta' => now()->addMonths(2),
            'is_active' => true,
        ]);

        $module = Module::create([
            'course_id' => $course->id,
            'titulo' => 'Módulo 1 Cardiología',
            'posicion' => 1,
            'activo' => 'si',
        ]);

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'module_id' => $module->id,
            'titulo' => 'Lección 1 Arritmias',
            'contenido' => '<p>Contenido clínico</p>',
            'posicion' => 1,
            'activo' => 'si',
        ]);

        $quiz = Quiz::create([
            'course_id' => $course->id,
            'lesson_id' => $lesson->id,
            'title' => 'Quiz Cardiología',
            'type' => 'EXANI',
            'time_limit' => '30',
            'attempts_allowed' => 2,
            'is_active' => true,
        ]);

        $question = Question::create([
            'quiz_id' => $quiz->id,
            'slug' => 'caso-clinico-arritmias',
            'text' => '<p>Paciente con fibrilación auricular</p>',
            'points' => 10,
            'explanation' => 'Explicación clínica secreta',
            'is_active' => true,
        ]);

        $correctAnswer = Answer::create([
            'question_id' => $question->id,
            'text' => 'Amiodarona',
            'is_correct' => true,
            'position' => 1,
            'is_active' => true,
        ]);

        $wrongAnswer = Answer::create([
            'question_id' => $question->id,
            'text' => 'Ibuprofeno',
            'is_correct' => false,
            'position' => 2,
            'is_active' => true,
        ]);

        return compact('instructor', 'category', 'course', 'scheduled', 'module', 'lesson', 'quiz', 'question', 'correctAnswer', 'wrongAnswer');
    }

    // =========================================================================
    // 1. ZERO DATA LEAKS & EXPOSED FILE REMOVAL
    // =========================================================================

    public function test_inertia_auth_dto_never_exposes_sensitive_fields_and_legacy_probes_are_closed(): void
    {
        $student = $this->createStudent();
        $student->forceFill([
            'api_token' => 'super-secret-electron-token',
            'mac_address' => 'aa:bb:cc:dd:ee:ff',
            'pending_mac_address' => '11:22:33:44:55:66',
            'session_id' => 'sess-secret-123',
            'documento_identificacion' => 'ine_secreto.pdf',
            'pase_ingreso' => 'ceneval_secreto.pdf',
        ])->save();

        $this->actingAs($student)
            ->get('/alumno/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('auth.user', fn (Assert $userProp) => $userProp
                    ->where('id', $student->id)
                    ->where('role', 'alumno')
                    ->missing('api_token')
                    ->missing('mac_address')
                    ->missing('pending_mac_address')
                    ->missing('session_id')
                    ->missing('documento_identificacion')
                    ->missing('pase_ingreso')
                    ->missing('document_id')
                    ->missing('entry_pass')
                    ->missing('password')
                    ->etc()
                )
            );

        $this->get('/media/stream/index.php')->assertForbidden();
        $this->assertFileDoesNotExist(public_path('test.php'));
    }

    public function test_exam_take_lesson_and_electron_presentar_never_leak_correct_answers_or_explanations(): void
    {
        $h = $this->createFullCourseHierarchy();
        $student = $this->createStudent();
        $student->forceFill([
            'api_token' => Str::random(64),
            'mac_address' => 'aa:bb:cc:dd:ee:ff',
        ])->save();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $h['scheduled']->id,
            'aceptado' => 'si',
        ]);

        // 1) Web ExamController@take
        $takeResponse = $this->actingAs($student)
            ->get("/alumno/exams/{$h['quiz']->id}/take/{$enrollment->id}")
            ->assertOk();

        $takeJson = json_encode($takeResponse->original->getData()['page']['props'] ?? []);
        $this->assertStringNotContainsString('Explicación clínica secreta', $takeJson);
        $this->assertStringNotContainsString('"correcto"', $takeJson);
        $this->assertStringNotContainsString('"is_correct"', $takeJson);

        // 2) Web CourseLearningController@leccionDetallada
        $lessonResponse = $this->actingAs($student)
            ->get("/alumno/modulo/{$h['lesson']->id}/{$h['scheduled']->id}")
            ->assertOk();

        $lessonJson = json_encode($lessonResponse->original->getData()['page']['props'] ?? []);
        $this->assertStringNotContainsString('"correcto"', $lessonJson);
        $this->assertStringNotContainsString('"is_correct"', $lessonJson);
        $this->assertStringNotContainsString('Explicación clínica secreta', $lessonJson);

        // 3) Electron ElectronPanelController@examPresentar
        $electronExam = $this->withHeaders([
            'Authorization' => 'Bearer '.$student->api_token,
            'X-Sapius-MAC' => 'aa:bb:cc:dd:ee:ff',
        ])->postJson('/api/electron/exam/presentar', [
            'inscripcion_id' => $enrollment->id,
            'prueba_id' => $h['quiz']->id,
        ])->assertOk();

        $electronJson = $electronExam->getContent();
        $this->assertStringNotContainsString('"correcto"', $electronJson);
        $this->assertStringNotContainsString('Explicación clínica secreta', $electronJson);
    }

    // =========================================================================
    // 2. RBAC, DEACTIVATED USERS, MOBILE RESTRICTION & ANTI-IDOR
    // =========================================================================

    public function test_deactivated_users_are_rejected_across_web_and_api_and_mobile_ua_is_blocked(): void
    {
        $h = $this->createFullCourseHierarchy();
        $inactive = $this->createStudent();
        $inactive->forceFill([
            'activo' => 'no',
            'api_token' => 'inactive-token-123',
        ])->save();

        // Web CheckRole logs out and redirects deactivated user
        $this->actingAs($inactive)
            ->get('/alumno/dashboard')
            ->assertRedirect(route('login'));

        // API ApiTokenAuth rejects deactivated user with 401
        $this->withHeaders([
            'Authorization' => 'Bearer inactive-token-123',
        ])->getJson('/api/electron/dashboard')->assertUnauthorized();

        // Active student on Mobile UA is redirected to /no-access for academic routes
        $active = $this->createStudent();
        Enrollment::create([
            'user_id' => $active->id,
            'curso_programado_id' => $h['scheduled']->id,
            'aceptado' => 'si',
        ]);

        $this->actingAs($active)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'])
            ->get("/alumno/curso/{$h['scheduled']->id}")
            ->assertRedirect(route('no-access'));

        // Desktop and Electron UAs are permitted on academic routes
        $this->actingAs($active)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0'])
            ->get("/alumno/curso/{$h['scheduled']->id}")
            ->assertOk();

        $this->actingAs($active)
            ->withHeaders(['User-Agent' => 'SapiusDesktop/2.0 Electron/31.0'])
            ->get("/alumno/curso/{$h['scheduled']->id}")
            ->assertOk();
    }

    public function test_anti_idor_enforces_accepted_enrollment_and_ownership_across_web_and_electron(): void
    {
        $h = $this->createFullCourseHierarchy();
        $owner = $this->createStudent();
        $intruder = $this->createStudent();
        $intruder->forceFill([
            'api_token' => 'intruder-token-999',
            'mac_address' => '22:22:22:22:22:22',
        ])->save();

        // Pending enrollment (aceptado = 'no') cannot enter classroom
        $pendingEnrollment = Enrollment::create([
            'user_id' => $intruder->id,
            'curso_programado_id' => $h['scheduled']->id,
            'aceptado' => 'no',
        ]);
        $this->actingAs($intruder)
            ->get("/alumno/curso/{$h['scheduled']->id}")
            ->assertForbidden();

        // Owner has accepted enrollment & active exam
        $ownerEnrollment = Enrollment::create([
            'user_id' => $owner->id,
            'curso_programado_id' => $h['scheduled']->id,
            'aceptado' => 'si',
        ]);
        $ownerExam = Exam::create([
            'inscripcion_id' => $ownerEnrollment->id,
            'prueba_id' => $h['quiz']->id,
            'finalizado' => 'no',
            'retro_visualizado' => 'no',
        ]);

        // Feedback cannot be viewed before finishing exam
        $this->actingAs($owner)
            ->get("/alumno/exams/{$ownerExam->id}/feedback")
            ->assertRedirect(route('alumno.exam.take', [
                'quiz_id' => $h['quiz']->id,
                'enrollment_id' => $ownerEnrollment->id,
            ]));

        // Intruder cannot save/finish/view feedback of owner's exam
        $this->actingAs($intruder)
            ->postJson("/alumno/exams/{$ownerExam->id}/save-answer", ['answers' => []])
            ->assertForbidden();
        $this->actingAs($intruder)
            ->post("/alumno/exams/{$ownerExam->id}/finish")
            ->assertForbidden();
        $this->actingAs($intruder)
            ->get("/alumno/exams/{$ownerExam->id}/feedback")
            ->assertForbidden();

        // Intruder without accepted enrollment cannot solve interactive PDF
        $material = InteractivePdf::create([
            'leccion_id' => $h['lesson']->id,
            'titulo' => 'Manual ECG',
            'file_path' => 'manual_ecg.pdf',
            'allow_download' => false,
        ]);
        $this->actingAs($intruder)
            ->get("/alumno/material-pdfs/{$material->id}/resolver")
            ->assertForbidden();

        // Intruder cannot query owner's grades or present exam via Electron API
        $this->withHeaders([
            'Authorization' => 'Bearer intruder-token-999',
            'X-Sapius-MAC' => '22:22:22:22:22:22',
        ])->getJson("/api/electron/grades/{$ownerEnrollment->id}")->assertForbidden();

        $this->withHeaders([
            'Authorization' => 'Bearer intruder-token-999',
            'X-Sapius-MAC' => '22:22:22:22:22:22',
        ])->postJson('/api/electron/exam/presentar', [
            'inscripcion_id' => $ownerEnrollment->id,
            'prueba_id' => $h['quiz']->id,
        ])->assertForbidden();
    }

    // =========================================================================
    // 3. WEIGHTED STRIKES (0-100), FEEDBACK MODE BLOCK & FINISH IMPREVISTO
    // =========================================================================

    public function test_weighted_strikes_feedback_mode_immediate_block_and_finish_imprevisto(): void
    {
        Mail::fake();
        $h = $this->createFullCourseHierarchy();
        $student = $this->createStudent();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $h['scheduled']->id,
            'aceptado' => 'si',
        ]);

        // Verify weighted severity scale via /alumno/register-strike
        $this->actingAs($student)
            ->postJson('/alumno/register-strike', ['action' => 'Shift'])
            ->assertOk()
            ->assertJson(['strikes' => 5, 'points_added' => 5, 'blocked' => false]);

        $this->actingAs($student->fresh())
            ->postJson('/alumno/register-strike', ['action' => 'Right Click'])
            ->assertOk()
            ->assertJson(['strikes' => 25, 'points_added' => 20, 'blocked' => false]);

        $this->actingAs($student->fresh())
            ->postJson('/alumno/register-strike', ['action' => 'DevTools'])
            ->assertOk()
            ->assertJson(['strikes' => 75, 'points_added' => 50, 'blocked' => false]);

        // Test finish-imprevisto still works after user reaches 100 strikes / blocked
        $examForImprevisto = Exam::create([
            'inscripcion_id' => $enrollment->id,
            'prueba_id' => $h['quiz']->id,
            'finalizado' => 'no',
            'retro_visualizado' => 'no',
        ]);

        $imprevistoUser = $this->createStudent();
        $imprevistoEnrollment = Enrollment::create([
            'user_id' => $imprevistoUser->id,
            'curso_programado_id' => $h['scheduled']->id,
            'aceptado' => 'si',
        ]);
        $activeExam = Exam::create([
            'inscripcion_id' => $imprevistoEnrollment->id,
            'prueba_id' => $h['quiz']->id,
            'finalizado' => 'no',
            'retro_visualizado' => 'no',
            'respuestas_json' => json_encode([
                ['name' => (string) $h['question']->id, 'value' => (string) $h['correctAnswer']->id],
            ]),
        ]);

        // Feedback Mode triggers instant 100 pts block and closes active exams on student
        $service = app(StrikeService::class);
        $result = $service->register($student->fresh(), 'Copy', 'Feedback Mode', true);

        $this->assertTrue($result['blocked']);
        $this->assertEquals(100, $result['strikes']);
        $this->assertEquals('si', $examForImprevisto->fresh()->finalizado);
        $this->assertEquals('si', $examForImprevisto->fresh()->retro_visualizado);

        $lastHistory = UserStrikeHistory::where('user_id', $student->id)->latest('id')->first();
        $this->assertSame('se tocaron teclas prohibidas en la retro y es un bloqueo grabe', $lastHistory->details);
        Mail::assertSent(AccountBlockedEmail::class);

        // Mark imprevistoUser as blocked (simulating concurrent frontend block before finish-imprevisto fires)
        $imprevistoUser->strikes = 100;
        $imprevistoUser->is_blocked = 1;
        $imprevistoUser->save();

        $this->actingAs($imprevistoUser)
            ->postJson("/alumno/exams/{$activeExam->id}/finish-imprevisto", [
                'observacion' => 'Cierre por infraccion de seguridad',
                'infraccion' => true,
            ])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'total_correctas' => 1,
                'score' => 710.0,
            ]);

        $activeExam->refresh();
        $this->assertEquals('si', $activeExam->finalizado);
        $this->assertEquals('si', $activeExam->retro_visualizado);
    }

    // =========================================================================
    // 4. ELECTRON CONNECTIVITY, MAC BINDING & HYBRID STREAMING
    // =========================================================================

    public function test_electron_login_mac_validation_hybrid_media_and_panel_endpoints(): void
    {
        $h = $this->createFullCourseHierarchy();
        $student = $this->createStudent(['username' => 'desktop_user']);
        $student->forceFill(['session_id' => 'old-web-session'])->save();

        // /api/login returns user with 'rol', fresh api_token, and clears session_id
        $loginRes = $this->postJson('/api/login', [
            'username' => 'desktop_user',
            'password' => 'password',
        ])->assertOk()
            ->assertJsonStructure(['user' => ['id', 'nombre', 'email', 'rol'], 'api_token']);

        $token = $loginRes->json('api_token');
        $this->assertNull($student->fresh()->session_id);

        // /api/validate-mac normalizes uppercase MAC on first link and validates matching MAC
        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/validate-mac', ['mac_address' => ' AA:BB:CC:11:22:33 '])
            ->assertOk()
            ->assertJson(['success' => true]);

        $this->assertSame('aa:bb:cc:11:22:33', $student->fresh()->mac_address);

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/validate-mac', ['mac_address' => 'AA:BB:CC:11:22:33'])
            ->assertOk();

        // Create temporary physical files in private storage for hybrid streaming tests
        @mkdir(storage_path('app/uploads'), 0775, true);
        @mkdir(storage_path('app/images/preguntas'), 0775, true);
        $mediaFile = storage_path('app/uploads/clase_test_stream.pdf');
        $preguntaFile = storage_path('app/images/preguntas/pregunta_test.png');
        file_put_contents($mediaFile, '%PDF-1.4 test');
        file_put_contents($preguntaFile, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='));
        $this->tempFiles[] = $mediaFile;
        $this->tempFiles[] = $preguntaFile;

        // Without accepted enrollment -> 403 even with Bearer token
        $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->get('/alumno/medias/stream/clase_test_stream.pdf')->assertForbidden();

        // Enroll student and schedule content
        Enrollment::create([
            'user_id' => $student->id,
            'curso_programado_id' => $h['scheduled']->id,
            'aceptado' => 'si',
        ]);
        ContenidoProgramado::create([
            'curso_programado_id' => $h['scheduled']->id,
            'contenido' => [['id' => $h['lesson']->id, 'fecha_inicial' => now()->toDateString(), 'fecha_final' => now()->addDays(5)->toDateString()]],
        ]);

        // Hybrid Bearer streaming succeeds for enrolled student
        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->get('/alumno/medias/stream/clase_test_stream.pdf')
            ->assertOk();

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->get('/alumno/preguntas/imagen/pregunta_test.png')
            ->assertOk();

        // Electron Calendar, Notifications & Opinion endpoints
        $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'X-Sapius-MAC' => 'aa:bb:cc:11:22:33',
        ])->getJson("/api/electron/calendar/{$h['scheduled']->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'X-Sapius-MAC' => 'aa:bb:cc:11:22:33',
        ])->getJson('/api/electron/notifications')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'X-Sapius-MAC' => 'aa:bb:cc:11:22:33',
        ])->postJson('/api/electron/opinion/submit', [
            'course_id' => $h['scheduled']->id,
            'rating' => 5,
            'comment' => str_repeat('Excelente curso de preparación médica muy completo. ', 2),
        ])->assertOk()->assertJsonPath('success', true);

        // Blocked account rejected with is_blocked = true on validate-mac
        $student->strikes = 100;
        $student->is_blocked = 1;
        $student->save();

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/validate-mac', ['mac_address' => 'aa:bb:cc:11:22:33'])
            ->assertForbidden()
            ->assertJson(['success' => false, 'is_blocked' => true]);
    }

    // =========================================================================
    // 5. CHECKOUT, % COUPONS, WEBHOOK FAIL-CLOSED & SQLITE CERTIFICATES
    // =========================================================================

    public function test_checkout_auth_percentage_coupons_pending_enrollment_webhook_and_sqlite_certificates(): void
    {
        Mail::fake();
        $h = $this->createFullCourseHierarchy();
        $otherScheduled = ScheduledCourse::create([
            'course_id' => $h['course']->id,
            'category_id' => $h['category']->id,
            'instructor_id' => $h['instructor']->id,
            'internal_id' => 'MED-OTHER-02',
            'price' => 1500.00,
            'fecha_inicio_venta' => now()->subDays(5),
            'fecha_fin_venta' => now()->addMonths(1),
            'is_active' => true,
        ]);

        // Guest accessing /checkout/{id} is redirected to /login
        $this->get("/checkout/{$h['scheduled']->id}")
            ->assertRedirect(route('login'));

        $student = $this->createStudent();

        // Foreign cohort coupon rejected for this course
        Discount::create([
            'clave' => 'OTRO50',
            'descuento' => 50,
            'limite' => 5,
            'curso_programado_id' => $otherScheduled->id,
            'activo' => 'si',
        ]);
        $this->actingAs($student)
            ->post('/alumno/checkout/check-coupon', [
                'clave' => 'OTRO50',
                'curso_id' => $h['scheduled']->id,
            ])
            ->assertSessionHas('error');

        // Valid 25% coupon reduces $1000 to $750
        Discount::create([
            'clave' => 'DESC25',
            'descuento' => 25,
            'limite' => 5,
            'curso_programado_id' => $h['scheduled']->id,
            'activo' => 'si',
        ]);
        $this->actingAs($student)
            ->post('/alumno/checkout/check-coupon', [
                'clave' => 'DESC25',
                'curso_id' => $h['scheduled']->id,
            ])
            ->assertSessionHas('success');

        $this->actingAs($student)
            ->get("/alumno/checkout/{$h['scheduled']->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Checkout/Index')
                ->where('course.originalPrice', 1000)
                ->where('course.price', 750)
            );

        // Valid 100% coupon fulfills enrollment with aceptado = 'no' & decrements limite
        $fullCoupon = Discount::create([
            'clave' => 'BECA100',
            'descuento' => 100,
            'limite' => 2,
            'curso_programado_id' => $h['scheduled']->id,
            'activo' => 'si',
        ]);
        $this->actingAs($student)
            ->post('/alumno/checkout/check-coupon', [
                'clave' => 'BECA100',
                'curso_id' => $h['scheduled']->id,
            ]);

        $payRes = $this->actingAs($student)
            ->post('/alumno/payout', ['curso_id' => $h['scheduled']->id]);
        $enrollment = Enrollment::where('user_id', $student->id)
            ->where('curso_programado_id', $h['scheduled']->id)
            ->firstOrFail();
        $payRes->assertRedirect(route('checkout.payout.approved', ['id' => $enrollment->id]));

        $this->assertSame('no', $enrollment->aceptado);
        $this->assertSame('BECA100', $enrollment->clave);
        $this->assertEquals(1, (int) $fullCoupon->fresh()->limite);

        // OpenPay webhook fail-closed Basic Auth when credentials are configured
        config([
            'openpay.webhook_user' => 'openpay_user',
            'openpay.webhook_password' => 'openpay_secret',
        ]);
        $this->postJson('/api/webhooks/openpay', [
            'type' => 'charge.succeeded',
            'transaction' => ['id' => 'tr12345678'],
        ])->assertUnauthorized();

        // Certificates SQLite fallback works transparently when default DB lacks certificates table
        $this->assertFalse(Certificate::defaultHasTable());
        Certificate::ensureStorageReady();
        $cert = Certificate::create([
            'user_id' => $student->id,
            'curso_programado_id' => $h['scheduled']->id,
            'codigo_validacion' => 'SAP-2026-TEST01',
            'fecha_emision' => now()->toDateString(),
        ]);

        $this->actingAs($student)
            ->get('/alumno/certificados')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Certificates/Index')
                ->where('certificates.0.id', $cert->id)
                ->where('certificates.0.validation_code', 'SAP-2026-TEST01')
                ->where('certificates.0.course_title', 'Curso EGEL Medicina')
            );

        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'Root',
            'username' => 'admin_cert_'.uniqid(),
            'email' => 'admin_cert_'.uniqid().'@sapius.test',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $this->assignLegacyRole($admin, 'admin');

        $this->actingAs($admin)
            ->get('/admin/certificates')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Certificates/Index')
                ->where('certificates.data.0.validation_code', 'SAP-2026-TEST01')
                ->where('certificates.data.0.course_title', 'Curso EGEL Medicina')
            );
    }
}
