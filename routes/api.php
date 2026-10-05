<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// App\Http\Controllers\Api is defined for these routes
Route::namespace('App\Http\Controllers\Api')->group(function () {
    
    Route::post('sort/teachers','SortController@teachers')->name('api.sort.teachers');
    Route::post('sort/prides','SortController@prides')->name('api.sort.prides');
    Route::post('sort/slides','SortController@slides')->name('api.sort.slides');
    Route::post('sort/simuladores-medicina','SortController@manageableSimulatorMedicine')->name('api.sort.simuladores.medicina');
    Route::post('sort/simuladores-nutricion','SortController@manageableSimulatorNutrition')->name('api.sort.simuladores.nutricion');
    Route::post('sort/guias-medicina','SortController@manageableGuiasMedicine')->name('api.sort.guias.medicines');
    Route::post('sort/guias-nutricion','SortController@manageableGuiasNutrition')->name('api.sort.guias.nutricion');

    Route::get('/test-n8n', 'N8nTestController@send')->name('test.n8n');

    // Electron MAC Detector Routes
    Route::post('/login', 'AuthController@login');
    
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
});
