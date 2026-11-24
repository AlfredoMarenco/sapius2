<?php

use App\Http\Controllers\Admin\QaFeedbackBotController;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Tests\Concerns\CreatesLegacySchema;

uses(CreatesLegacySchema::class);

function cleanQaBotStorage(): void
{
    $dir = QaFeedbackBotController::baseDirectory();
    if (is_dir($dir)) {
        File::deleteDirectory($dir);
    }
}

beforeEach(function () {
    $this->setUpLegacySchema();
    $this->seedLegacyRoles();
    cleanQaBotStorage();
});

afterEach(function () {
    cleanQaBotStorage();
});

test('guests cannot access qa bot endpoints', function () {
    $this->get('/admin/qa-bot/reports')->assertRedirect(route('login'));
    $this->post('/admin/qa-bot/reports', ['message' => 'Error'])->assertRedirect(route('login'));
    $this->patch('/admin/qa-bot/reports/QA-001', ['status' => 'resolved'])->assertRedirect(route('login'));
    $this->delete('/admin/qa-bot/reports/QA-001')->assertRedirect(route('login'));
});

test('students cannot access qa bot endpoints and do not receive admin cookie or script flag', function () {
    $student = $this->assignLegacyRole(User::factory()->create(), 'alumno');

    $pageResponse = $this->actingAs($student)->get(route('appearance.edit'));
    $pageResponse->assertOk();
    $pageResponse->assertCookieMissing('qa_admin_active');
    $pageResponse->assertDontSee('window.__SAPIUS_QA_ADMIN__ = true', false);

    $this->actingAs($student)->get('/admin/qa-bot/reports')->assertRedirect(route('dashboard'));
    $this->actingAs($student)->post('/admin/qa-bot/reports', ['message' => 'Intento no autorizado'])->assertRedirect(route('dashboard'));
    $this->actingAs($student)->patch('/admin/qa-bot/reports/QA-001', ['status' => 'resolved'])->assertRedirect(route('dashboard'));
    $this->actingAs($student)->delete('/admin/qa-bot/reports/QA-001')->assertRedirect(route('dashboard'));
});

test('admins receive signed qa_admin_active cookie and admin flag in inertia root view', function () {
    $admin = $this->assignLegacyRole(User::factory()->create(), 'admin');

    $response = $this->actingAs($admin)->get(route('appearance.edit'));

    $response->assertOk();
    $response->assertSee('window.__SAPIUS_QA_ADMIN__ = true', false);
    $response->assertSee('/js/qa-bot.js', false);

    $passCookie = collect($response->headers->getCookies())
        ->first(fn ($cookie) => $cookie->getName() === QaFeedbackBotController::PASS_COOKIE_NAME);

    expect($passCookie)->not->toBeNull();
    $verified = QaFeedbackBotController::verifyReviewerPassToken($passCookie->getValue());
    expect($verified)->toBeArray()
        ->and($verified['admin_id'])->toBe($admin->id)
        ->and($verified['email'])->toBe($admin->email);
});

test('forged or tampered qa_admin_active cookie is rejected and expired for students', function () {
    $student = $this->assignLegacyRole(User::factory()->create(), 'alumno');

    $pageResponse = $this->actingAs($student)
        ->withUnencryptedCookie(QaFeedbackBotController::PASS_COOKIE_NAME, '1')
        ->get(route('appearance.edit'));

    $pageResponse->assertOk();
    $pageResponse->assertCookieExpired(QaFeedbackBotController::PASS_COOKIE_NAME);
    $pageResponse->assertDontSee('window.__SAPIUS_QA_ADMIN__ = true', false);

    $this->actingAs($student)
        ->withCredentials()
        ->withUnencryptedCookie(QaFeedbackBotController::PASS_COOKIE_NAME, 'forged.signature')
        ->getJson('/admin/qa-bot/reports')
        ->assertForbidden();
});

test('reviewer pass allows admin to keep qa bot when testing as a student and records both identities', function () {
    $admin = $this->assignLegacyRole(User::factory()->create(['nombre' => 'Alfredo', 'apellido' => 'Revisor']), 'admin');
    $student = $this->assignLegacyRole(User::factory()->create(['nombre' => 'Alumno', 'apellido' => 'Prueba']), 'alumno');

    $adminResponse = $this->actingAs($admin)->get(route('appearance.edit'));
    $passCookie = collect($adminResponse->headers->getCookies())
        ->first(fn ($cookie) => $cookie->getName() === QaFeedbackBotController::PASS_COOKIE_NAME);

    expect($passCookie)->not->toBeNull();
    $token = $passCookie->getValue();

    $studentPage = $this->actingAs($student)
        ->withUnencryptedCookie(QaFeedbackBotController::PASS_COOKIE_NAME, $token)
        ->get(route('appearance.edit'));

    $studentPage->assertOk();
    $studentPage->assertSee('window.__SAPIUS_QA_ADMIN__ = true', false);
    $studentPage->assertSee('window.__SAPIUS_QA_CONTEXT__', false);

    $reportResponse = $this->actingAs($student)
        ->withCredentials()
        ->withUnencryptedCookie(QaFeedbackBotController::PASS_COOKIE_NAME, $token)
        ->postJson('/admin/qa-bot/reports', [
            'message' => 'El video no carga en modo alumno',
            'defect_type' => 'broken_action',
            'url' => 'https://test.sapius.com.mx/alumno/curso/1',
        ]);

    $reportResponse->assertStatus(201)
        ->assertJsonPath('report.author.id', $admin->id)
        ->assertJsonPath('report.author.email', $admin->email)
        ->assertJsonPath('report.tested_as.id', $student->id)
        ->assertJsonPath('report.tested_as.role', 'alumno');

    $revokeResponse = $this->actingAs($student)
        ->withCredentials()
        ->withUnencryptedCookie(QaFeedbackBotController::PASS_COOKIE_NAME, $token)
        ->postJson('/admin/qa-bot/revoke-pass');

    $revokeResponse->assertOk()
        ->assertJsonPath('revoked', true)
        ->assertCookieExpired(QaFeedbackBotController::PASS_COOKIE_NAME);

    // If admin account is deactivated, existing pass token is immediately rejected
    $admin->forceFill(['activo' => 'no'])->save();
    $this->actingAs($student)
        ->withCredentials()
        ->withUnencryptedCookie(QaFeedbackBotController::PASS_COOKIE_NAME, $token)
        ->getJson('/admin/qa-bot/reports')
        ->assertForbidden();
});

test('laravel error pages inject qa bot and exception payload only for admins', function () {
    Route::middleware('web')->get('/_test-qa-error-500', function () {
        abort(500, 'Fallo de prueba QA');
    });

    $admin = $this->assignLegacyRole(User::factory()->create(), 'admin');
    $student = $this->assignLegacyRole(User::factory()->create(), 'alumno');

    $adminError = $this->actingAs($admin)->get('/_test-qa-error-500');
    $adminError->assertStatus(500);
    $adminError->assertSee('window.__SAPIUS_QA_ADMIN__ = true', false);
    $adminError->assertSee('window.__SAPIUS_QA_EXCEPTION__', false);
    $adminError->assertSee('Fallo de prueba QA', false);
    $adminError->assertSee('/js/qa-bot.js', false);

    $studentError = $this->actingAs($student)->get('/_test-qa-error-500');
    $studentError->assertStatus(500);
    $studentError->assertDontSee('window.__SAPIUS_QA_ADMIN__ = true', false);
    $studentError->assertDontSee('/js/qa-bot.js', false);
});

test('admins can create, list, view screenshot, update, and delete qa reports', function () {
    $admin = $this->assignLegacyRole(User::factory()->create(), 'admin');

    $tinyPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    $createResponse = $this->actingAs($admin)->postJson('/admin/qa-bot/reports', [
        'message' => 'El botón guardar arroja error 500 en cursos',
        'defect_type' => 'legacy_parity',
        'url' => 'https://test.sapius.com.mx/admin/cursos',
        'component' => 'Admin/Courses/Index',
        'viewport' => '1440x900',
        'console_errors' => [
            ['type' => 'window.error', 'message' => 'TypeError: x is undefined'],
        ],
        'server_exception' => [
            'status' => 500,
            'exception' => 'RuntimeException',
            'message' => 'Error de prueba',
        ],
        'screenshot' => $tinyPngBase64,
    ]);

    $createResponse->assertStatus(201)
        ->assertJsonPath('report.id', 'QA-001')
        ->assertJsonPath('report.status', 'pending')
        ->assertJsonPath('report.defect_type', 'legacy_parity')
        ->assertJsonPath('report.screenshot_url', '/admin/qa-bot/screenshots/QA-001.png')
        ->assertJsonPath('report.author.email', $admin->email);

    $screenshotFile = QaFeedbackBotController::screenshotsDirectory().DIRECTORY_SEPARATOR.'QA-001.png';
    expect(is_file($screenshotFile))->toBeTrue();

    $this->actingAs($admin)
        ->get('/admin/qa-bot/screenshots/QA-001.png')
        ->assertOk()
        ->assertHeader('Content-Type', 'image/png');

    $this->actingAs($admin)
        ->getJson('/admin/qa-bot/reports')
        ->assertOk()
        ->assertJsonPath('counts.pending', 1)
        ->assertJsonPath('reports.0.id', 'QA-001');

    $this->actingAs($admin)
        ->patchJson('/admin/qa-bot/reports/QA-001', [
            'status' => 'verified',
            'follow_up_message' => 'Probado y funcionando.',
        ])
        ->assertOk()
        ->assertJsonPath('report.status', 'verified')
        ->assertJsonPath('report.follow_up_message', 'Probado y funcionando.');

    $this->actingAs($admin)
        ->deleteJson('/admin/qa-bot/reports/QA-001')
        ->assertOk()
        ->assertJsonPath('deleted', true);

    expect(is_file($screenshotFile))->toBeFalse();
    expect(QaFeedbackBotController::readReports())->toBeEmpty();
});

test('qa:reports artisan command lists, shows, and updates reports', function () {
    $admin = $this->assignLegacyRole(User::factory()->create(), 'admin');

    $this->actingAs($admin)->postJson('/admin/qa-bot/reports', [
        'message' => 'Primer error QA',
        'url' => '/admin/cursos',
    ])->assertStatus(201);

    $this->actingAs($admin)->postJson('/admin/qa-bot/reports', [
        'message' => 'Segundo error QA',
        'url' => '/admin/users',
    ])->assertStatus(201);

    $exitUpdate = Artisan::call('qa:reports', [
        'action' => 'update',
        'id' => 'QA-001',
        '--status' => 'resolved',
        '--reply' => 'Se corrigió el controlador.',
    ]);
    expect($exitUpdate)->toBe(0);

    $exitList = Artisan::call('qa:reports', [
        'action' => 'list',
        '--status' => 'pending',
    ]);
    expect($exitList)->toBe(0);
    $listOutput = Artisan::output();
    expect($listOutput)->toContain('QA-002');
    expect($listOutput)->not->toContain('QA-001');

    $exitShow = Artisan::call('qa:reports', [
        'action' => 'show',
        'id' => 'QA-001',
    ]);
    expect($exitShow)->toBe(0);
    $showOutput = Artisan::output();
    expect($showOutput)->toContain('Se corrigió el controlador.');
    expect($showOutput)->toContain('"status": "resolved"');

    $rejectReason = 'En esta fase de revisión solo se atienden correcciones de errores y paridad con el sistema original (sin nuevas funciones ni cambios a la estructura de la base de datos).';
    $exitReject = Artisan::call('qa:reports', [
        'action' => 'update',
        'id' => 'QA-002',
        '--status' => 'rejected',
        '--reply' => $rejectReason,
    ]);
    expect($exitReject)->toBe(0);

    $this->actingAs($admin)
        ->getJson('/admin/qa-bot/reports')
        ->assertOk()
        ->assertJsonPath('counts.resolved', 1)
        ->assertJsonPath('counts.rejected', 1);
});

test('qa reports are private: reviewers cannot see, update, delete or view screenshots of other reviewers', function () {
    $admin1 = $this->assignLegacyRole(User::factory()->create(['name' => 'Admin Uno']), 'admin');
    $admin2 = $this->assignLegacyRole(User::factory()->create(['name' => 'Admin Dos']), 'admin');

    $tinyPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    // Admin 1 creates report
    $res1 = $this->actingAs($admin1)->postJson('/admin/qa-bot/reports', [
        'message' => 'Reporte privado de Admin 1',
        'screenshot' => $tinyPngBase64,
    ]);
    $res1->assertStatus(201);
    $report1Id = $res1->json('report.id');
    $screenshotUrl = $res1->json('report.screenshot_url');

    // Admin 2 creates report
    $res2 = $this->actingAs($admin2)->postJson('/admin/qa-bot/reports', [
        'message' => 'Reporte privado de Admin 2',
    ]);
    $res2->assertStatus(201);
    $report2Id = $res2->json('report.id');

    // Admin 1 only sees their own reports
    $list1 = $this->actingAs($admin1)->getJson('/admin/qa-bot/reports');
    $list1->assertOk()
        ->assertJsonPath('counts.total', 1)
        ->assertJsonPath('reports.0.id', $report1Id);

    // Admin 2 only sees their own reports
    $list2 = $this->actingAs($admin2)->getJson('/admin/qa-bot/reports');
    $list2->assertOk()
        ->assertJsonPath('counts.total', 1)
        ->assertJsonPath('reports.0.id', $report2Id);

    // Admin 2 cannot update Admin 1 report
    $this->actingAs($admin2)->patchJson("/admin/qa-bot/reports/{$report1Id}", [
        'follow_up_message' => 'Intento de modificar ajeno',
    ])->assertForbidden();

    // Admin 2 cannot delete Admin 1 report
    $this->actingAs($admin2)->deleteJson("/admin/qa-bot/reports/{$report1Id}")
        ->assertForbidden();

    // Admin 2 cannot view Admin 1 screenshot
    $this->actingAs($admin2)->get($screenshotUrl)
        ->assertForbidden();

    // Admin 1 CAN view their own screenshot
    $this->actingAs($admin1)->get($screenshotUrl)
        ->assertOk();
});

test('qa reports support perspective selection and filtering', function () {
    $admin = $this->assignLegacyRole(User::factory()->create(['name' => 'Admin QA']), 'admin');

    $resDesigner = $this->actingAs($admin)->postJson('/admin/qa-bot/reports', [
        'message' => 'Ajuste de tipografía e iconos',
        'defect_type' => 'visual_copy',
        'perspective' => 'designer',
    ])->assertStatus(201);
    $resDesigner->assertJsonPath('report.perspective', 'designer');

    $resStudent = $this->actingAs($admin)->postJson('/admin/qa-bot/reports', [
        'message' => 'Fricción en visualizador de PDFs para alumno',
        'defect_type' => 'broken_action',
        'perspective' => 'student',
    ])->assertStatus(201);
    $resStudent->assertJsonPath('report.perspective', 'student');

    // Test Artisan filter by perspective
    $exitListDesigner = Artisan::call('qa:reports', [
        'action' => 'list',
        '--perspective' => 'designer',
    ]);
    expect($exitListDesigner)->toBe(0);
    $outputDesigner = Artisan::output();
    expect($outputDesigner)->toContain('Ajuste de tipografía e iconos');
    expect($outputDesigner)->not->toContain('Fricción en visualizador de PDFs');

    $exitListStudent = Artisan::call('qa:reports', [
        'action' => 'list',
        '--perspective' => 'student',
    ]);
    expect($exitListStudent)->toBe(0);
    $outputStudent = Artisan::output();
    expect($outputStudent)->toContain('Fricción en visualizador de PDFs');
    expect($outputStudent)->not->toContain('Ajuste de tipografía e iconos');
});
