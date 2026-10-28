<?php

namespace App\Console\Commands;

use App\Mail\OverdueLessonsReminderEmail;
use App\Models\Homework;
use App\Models\Registro\ContenidoProgramado;
use App\Models\Registro\CursoProgramado;
use App\Models\Registro\LessonUnlock;
use App\Notifications\OverdueLessonNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOverdueLessonReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:overdue-lessons';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía recordatorios a los alumnos con lecciones atrasadas.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();

        $this->info('Verificando lecciones pendientes al '.$now->format('d/m/Y H:i'));

        // 1. Obtener cursos activos con su árbol de lecciones
        $cursos = CursoProgramado::with(['Curso' => function ($r) {
            $r->with(['Lecciones' => function ($q) {
                $q->with(['Clases' => function ($c) {
                    $c->where('activo', 'si');
                }]);
                $q->where('leccion_id', 0)->where('activo', 'si');
            }]);
        }])
            ->where('activo', 'si')
            ->get();

        foreach ($cursos as $curso) {
            if (! $curso->Curso) {
                continue;
            }

            // 2. Obtener cronograma de contenido
            $contenidoProgramado = ContenidoProgramado::where('curso_programado_id', $curso->id)->first();

            if (! $contenidoProgramado || ! $contenidoProgramado->contenido) {
                continue;
            }

            $schedule = collect($contenidoProgramado->contenido);

            // Determinar si el curso completo ya finalizó
            $maxFechaFinal = null;
            foreach ($schedule as $item) {
                if (isset($item['fecha_final'])) {
                    try {
                        $format = 'd/m/Y';
                        $dateStr = $item['fecha_final'];

                        if (isset($item['hora_final'])) {
                            $format .= ' H:i';
                            $dateStr .= ' '.$item['hora_final'];
                        }

                        $fecha = Carbon::createFromFormat($format, $dateStr);

                        if (! isset($item['hora_final'])) {
                            $fecha->setTime(23, 59, 59);
                        }

                        if ($maxFechaFinal === null || $fecha->gt($maxFechaFinal)) {
                            $maxFechaFinal = $fecha;
                        }
                    } catch (\Exception $e) {
                        continue;
                    }
                }
            }

            if ($maxFechaFinal && $now->gt($maxFechaFinal)) {
                $this->info("Curso {$curso->id} expirado (Fin: {$maxFechaFinal->format('d/m/Y H:i')}). Omitiendo.");

                continue;
            }

            // 3. Obtener alumnos inscritos y aceptados
            $inscritos = $curso->Inscritos()->wherePivot('aceptado', 'si')->get();

            foreach ($inscritos as $user) {
                if (! $user) {
                    continue;
                }

                $completedLessonIds = $user->completedLessons()
                    ->wherePivot('curso_programado_id', $curso->id)
                    ->pluck('lecciones.id')
                    ->toArray();

                $submittedHomeworkLessonIds = Homework::where('user_id', $user->id)
                    ->pluck('leccion_id')
                    ->toArray();

                $unlockedLessonIds = LessonUnlock::where('user_id', $user->id)
                    ->where('curso_programado_id', $curso->id)
                    ->where('until_date', '>=', $now->toDateString())
                    ->pluck('leccion_id')
                    ->toArray();

                $pendingLessons = [];

                // 4. Evaluar módulos y clases respecto al cronograma
                foreach ($curso->Curso->Lecciones as $modulo) {
                    $moduleScheduleItem = $schedule->firstWhere('id', $modulo->id);

                    $moduleIsClosed = false;
                    if ($moduleScheduleItem && isset($moduleScheduleItem['fecha_final'])) {
                        try {
                            $mEndFormat = 'd/m/Y';
                            $mEndStr = $moduleScheduleItem['fecha_final'];
                            if (isset($moduleScheduleItem['hora_final'])) {
                                $mEndFormat .= ' H:i';
                                $mEndStr .= ' '.$moduleScheduleItem['hora_final'];
                            }
                            $moduleFechaFinal = Carbon::createFromFormat($mEndFormat, $mEndStr);
                            if (! isset($moduleScheduleItem['hora_final'])) {
                                $moduleFechaFinal->setTime(23, 59, 59);
                            }

                            if ($now->gt($moduleFechaFinal)) {
                                $moduleIsClosed = true;
                            }
                        } catch (\Exception $e) {
                            // Ignorar parsing defectuoso
                        }
                    }

                    foreach ($modulo->Clases as $clase) {
                        if (in_array($clase->id, $completedLessonIds) || in_array($clase->id, $submittedHomeworkLessonIds)) {
                            continue;
                        }

                        if ($moduleIsClosed && ! in_array($clase->id, $unlockedLessonIds)) {
                            continue;
                        }

                        $scheduleItem = $schedule->firstWhere('id', $clase->id) ?? $moduleScheduleItem;

                        if ($scheduleItem && isset($scheduleItem['fecha_inicial']) && isset($scheduleItem['fecha_final'])) {
                            try {
                                $startFormat = 'd/m/Y';
                                $startStr = $scheduleItem['fecha_inicial'];
                                if (isset($scheduleItem['hora_inicial'])) {
                                    $startFormat .= ' H:i';
                                    $startStr .= ' '.$scheduleItem['hora_inicial'];
                                }
                                $fechaInicial = Carbon::createFromFormat($startFormat, $startStr);

                                $endFormat = 'd/m/Y';
                                $endStr = $scheduleItem['fecha_final'];
                                if (isset($scheduleItem['hora_final'])) {
                                    $endFormat .= ' H:i';
                                    $endStr .= ' '.$scheduleItem['hora_final'];
                                }
                                $fechaFinal = Carbon::createFromFormat($endFormat, $endStr);

                                if (! isset($scheduleItem['hora_final'])) {
                                    $fechaFinal->setTime(23, 59, 59);
                                }
                            } catch (\Exception $e) {
                                continue;
                            }

                            // Regla de recordatorio: Lección iniciada hace más de 2 días
                            $reminderStartDate = $fechaInicial->copy()->addDays(2);

                            if ($now->gte($reminderStartDate)) {
                                $fechaFinalMostrar = $scheduleItem['fecha_final'].(isset($scheduleItem['hora_final']) ? ' '.$scheduleItem['hora_final'] : '');
                                $isExpired = isset($fechaFinal) ? $now->gt($fechaFinal) : false;

                                $pendingLessons[] = [
                                    'titulo' => $clase->titulo,
                                    'modulo' => $modulo->titulo,
                                    'fecha_final' => $fechaFinalMostrar,
                                    'is_expired' => $isExpired,
                                    'leccion_id' => $clase->id,
                                    'curso_programado_id' => $curso->id,
                                    'inscripcion_id' => $user->pivot->id ?? null,
                                ];
                            }
                        }
                    }
                }

                // 5. Enviar Notificación y Correo
                if (count($pendingLessons) > 0) {
                    $this->info('Se encontraron '.count($pendingLessons)." lecciones pendientes para el usuario: {$user->email}");

                    try {
                        Mail::to($user->email)->queue(new OverdueLessonsReminderEmail($user, $pendingLessons));
                    } catch (\Exception $e) {
                        Log::error("Error enviando correo de recordatorio a {$user->email}: ".$e->getMessage());
                    }

                    foreach ($pendingLessons as $lessonData) {
                        try {
                            $user->notify(new OverdueLessonNotification($lessonData));
                        } catch (\Exception $e) {
                            Log::error("Error guardando notificación para {$user->email}: ".$e->getMessage());
                        }
                    }
                }
            }
        }

        $this->info('Verificación de recordatorios completada con éxito.');

        return Command::SUCCESS;
    }
}
