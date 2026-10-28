<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Console Tasks (Cron Jobs)
|--------------------------------------------------------------------------
|
| Comandos programados para la automatización de la plataforma:
| 1. Auto-aprobación periódica de inscripciones pendientes (cada 15 min).
| 2. Recordatorios de lecciones vencidas a los estudiantes (diario a las 08:00).
| 3. Verificación de usuarios sin documentos o pase de ingreso (lunes a las 08:00).
|
*/

Schedule::command('inscripciones:auto-aprobar')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('reminders:overdue-lessons')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('usuarios:verificar')
    ->mondays()
    ->at('08:00')
    ->withoutOverlapping()
    ->runInBackground();

