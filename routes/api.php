<?php

use Illuminate\Support\Facades\Route;

// App\Http\Controllers\Api is defined for these routes
Route::namespace('App\Http\Controllers\Api')->group(function () {

    // Admin drag-and-drop sorting endpoints (requiere sesión web autenticada + rol admin)
    Route::middleware(['web', 'auth', 'role:admin'])->group(function () {
        Route::post('sort/teachers', 'SortController@teachers')->name('api.sort.teachers');
        Route::post('sort/prides', 'SortController@prides')->name('api.sort.prides');
        Route::post('sort/slides', 'SortController@slides')->name('api.sort.slides');
        Route::post('sort/simuladores-medicina', 'SortController@manageableSimulatorMedicine')->name('api.sort.simuladores.medicina');
        Route::post('sort/simuladores-nutricion', 'SortController@manageableSimulatorNutrition')->name('api.sort.simuladores.nutricion');
        Route::post('sort/guias-medicina', 'SortController@manageableGuiasMedicine')->name('api.sort.guias.medicines');
        Route::post('sort/guias-nutricion', 'SortController@manageableGuiasNutrition')->name('api.sort.guias.nutricion');
    });

    // OpenPay Webhook (Pagos asíncronos: OXXO Pay, SPEI, Tarjeta y verificación)
    Route::post('/webhooks/openpay', 'OpenPayWebhookController@handleWebhook')->name('api.webhooks.openpay');

    // Electron MAC Detector Routes
    Route::post('/login', 'AuthController@login')->middleware('throttle:10,1');

    // Todo lo que requiera autenticación con api_token (middleware custom api_token_auth)
    Route::middleware('api_token_auth')->group(function () {
        Route::post('/validate-mac', 'AuthController@validateMac');
        Route::post('/register-strike', 'AuthController@registerStrike');
        Route::get('/user/locked-details', 'AuthController@getLockedDetails');
        Route::get('/electron/dashboard', 'ElectronPanelController@dashboard');
        Route::get('/electron/course/{id}', 'ElectronPanelController@courseDetails');
        Route::get('/electron/lesson/{leccion_id}/{curso_programado_id}', 'ElectronPanelController@lessonDetails');
        Route::post('/electron/lecciones/toggle-completion', 'ElectronPanelController@toggleLessonCompletion');
        Route::get('/electron/homework-tracking/{curso_programado_id}', 'ElectronPanelController@homeworkTracking');
        Route::post('/electron/send-homework', 'ElectronPanelController@sendHomework');
        Route::get('/electron/calendar/{curso_programado_id}', 'ElectronPanelController@getCalendar');
        Route::get('/electron/grades/{inscripcion_id}', 'ElectronPanelController@getGrades');
        Route::get('/electron/course-progress/{curso_programado_id}', 'ElectronPanelController@getCourseProgress');

        // Exams / Pruebas
        Route::get('/electron/exam/previo/{prueba_id}/{inscripcion_id}', 'ElectronPanelController@examPrevio');
        Route::post('/electron/exam/presentar', 'ElectronPanelController@examPresentar');
        Route::post('/electron/exam/finalizar', 'ElectronPanelController@examFinalizar');
        Route::get('/electron/exam/feedback/{examen_id}', 'ElectronPanelController@examFeedback');
        Route::post('/electron/exam/eventos', 'ElectronPanelController@examEventos');

        // Secure Delivery
        Route::get('/electron/pdf/{leccion_id}', 'ElectronPanelController@securePdf');

        // Interactive PDFs
        Route::get('/electron/material-pdfs/{id}/show', 'ElectronPanelController@getMaterialPdfDetails');
        Route::post('/electron/material-pdfs/{id}/save-answers', 'ElectronPanelController@saveMaterialPdfAnswers');
        Route::get('/electron/material-pdfs/{id}/download-raw', 'ElectronPanelController@downloadMaterialPdfRaw');

        // Imágenes de preguntas (ruta privada, no pública)
        Route::get('/electron/pregunta-imagen/{filename}', 'ElectronPanelController@preguntaImagen');

        // Perfil del alumno (Fase 1)
        Route::get('/electron/profile', 'ElectronPanelController@getProfile');
        Route::post('/electron/profile/update', 'ElectronPanelController@updateProfile');
        Route::get('/electron/profile/foto/{file}', 'ElectronPanelController@profileFoto');
        Route::get('/electron/profile/documento/{file}', 'ElectronPanelController@profileDocumento');
        Route::get('/electron/profile/pase/{file}', 'ElectronPanelController@profilePase');
        Route::post('/electron/request-mac-auth', 'AuthController@requestMacAuth');

        // Notificaciones (Fase 2)
        Route::get('/electron/notifications', 'ElectronPanelController@getNotifications');
        Route::post('/electron/notifications/{id}/read', 'ElectronPanelController@markNotificationRead');
        Route::post('/electron/notifications/clear-all', 'ElectronPanelController@clearAllNotifications');

        // Opiniones (Fase 3)
        Route::get('/electron/opinion/check/{curso_programado_id}', 'ElectronPanelController@checkOpinionPending');
        Route::post('/electron/opinion/submit', 'ElectronPanelController@submitOpinion');
    });

    // Endpoint directo para reportes QA desde Electron Desktop (sin requerir cookie de admin)
    Route::post('/electron/qa-report', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'required|string|max:5000',
            'defect_type' => 'nullable|string|max:100',
            'severity' => 'nullable|string|max:50',
            'app_version' => 'nullable|string|max:50',
            'current_server' => 'nullable|string|max:255',
            'mac_address' => 'nullable|string|max:100',
            'user_email' => 'nullable|string|max:255',
            'user_name' => 'nullable|string|max:255',
            'current_view' => 'nullable|string|max:100',
            'active_tab' => 'nullable|string|max:100',
            'console_logs' => 'nullable|array',
            'timestamp' => 'nullable|string',
        ]);

        $reportsFile = storage_path('app/qa-bot/reports.json');
        $reports = [];
        if (file_exists($reportsFile)) {
            $reports = json_decode(file_get_contents($reportsFile), true) ?: [];
        }

        $nextIdNum = 1;
        foreach ($reports as $r) {
            if (isset($r['id']) && preg_match('/QA-(\d+)/', $r['id'], $m)) {
                $num = (int) $m[1];
                if ($num >= $nextIdNum) $nextIdNum = $num + 1;
            }
        }
        $id = sprintf('QA-%03d', $nextIdNum);

        $newReport = [
            'id' => $id,
            'status' => 'pending',
            'defect_type' => $validated['defect_type'] ?? 'desktop_issue',
            'perspective' => 'desktop',
            'platform' => 'desktop',
            'message' => trim(($validated['title'] ? '['.$validated['title'].'] ' : '').$validated['description']),
            'url' => $validated['current_server'] ?? 'Electron App',
            'component' => 'Desktop / '.($validated['current_view'] ?? 'App'),
            'viewport' => 'Electron Desktop',
            'user_agent' => 'SapiusDesktop/'.$validated['app_version'].' (MAC: '.($validated['mac_address'] ?? 'N/A').')',
            'console_errors' => $validated['console_logs'] ?? [],
            'server_exception' => null,
            'laravel_log_excerpt' => [],
            'screenshot_url' => null,
            'author' => [
                'id' => 0,
                'name' => $validated['user_name'] ?? 'Usuario Desktop',
                'email' => $validated['user_email'] ?? 'desktop@sapius.com.mx',
            ],
            'agent_reply' => null,
            'created_at' => now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ];

        array_unshift($reports, $newReport);
        @file_put_contents($reportsFile, json_encode($reports, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        return response()->json([
            'success' => true,
            'message' => 'Reporte QA registrado con ID '.$id,
            'id' => $id,
        ]);
    });
});
