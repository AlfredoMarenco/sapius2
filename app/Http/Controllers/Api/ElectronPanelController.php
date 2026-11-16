<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TareaEmail;
use App\Models\Cursos\AlumnoPdfRespuesta;
use App\Models\Cursos\Curso;
use App\Models\Cursos\Leccion;
use App\Models\Cursos\MaterialPdf;
use App\Models\Cursos\Pregunta;
use App\Models\Cursos\Prueba;
use App\Models\Cursos\Respuesta;
use App\Models\Evaluacion\Examen;
use App\Models\FileGuia;
use App\Models\Homework;
use App\Models\ProgrammingCalendar;
use App\Models\Registro\ContenidoProgramado;
use App\Models\Registro\CursoProgramado;
use App\Models\Registro\Inscripcion;
use App\Models\Registro\LessonUnlock;
use App\Models\Review;
use App\Models\User;
use App\Services\EnrollmentAccessService;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ElectronPanelController extends Controller
{
    private function accessService(): EnrollmentAccessService
    {
        return app(EnrollmentAccessService::class);
    }

    private function parseDurationToSeconds($value): int
    {
        if (empty($value)) {
            return 0;
        }

        $raw = trim((string) $value);
        if (preg_match('/^\d{1,3}:\d{2}(:\d{2})?$/', $raw)) {
            $parts = explode(':', $raw);
            if (count($parts) === 3) {
                return max(0, ((int) $parts[0] * 3600) + ((int) $parts[1] * 60) + (int) $parts[2]);
            }
            if (count($parts) === 2) {
                return max(0, ((int) $parts[0] * 3600) + ((int) $parts[1] * 60));
            }
        }

        if (is_numeric($raw) && (int) $raw > 0) {
            return (int) $raw * 60;
        }

        return 0;
    }

    private function resolveTimeLimitSeconds(?Prueba $prueba): int
    {
        if (! $prueba) {
            return 0;
        }

        if (! empty($prueba->duracion) && (int) $prueba->duracion > 0) {
            return (int) $prueba->duracion * 60;
        }

        return $this->parseDurationToSeconds($prueba->tiempo ?? null);
    }

    private function isMaterialDownloadAllowed(MaterialPdf $material): bool
    {
        $rawAttributes = $material->getAttributes();
        if (array_key_exists('allow_download', $rawAttributes) && $rawAttributes['allow_download'] !== null) {
            return (bool) $rawAttributes['allow_download'];
        }

        $config = is_array($material->fields_config) ? $material->fields_config : [];

        return ! empty($config['allow_download']);
    }

    private function resolveSafePathInDirs(string $rawPath, array $baseDirs, bool $basenameOnly = true): ?string
    {
        if ($rawPath === '' || str_contains($rawPath, "\0") || str_contains($rawPath, '..')) {
            return null;
        }

        $relative = $basenameOnly ? basename($rawPath) : ltrim($rawPath, '/\\');
        if ($relative === '') {
            return null;
        }

        $storageRoot = rtrim(str_replace('\\', '/', storage_path()), '/');
        $prodStorageCandidates = array_filter([
            '/home/wwsapi/SapiusProduction/storage',
            '/home/wwsapi/public_html/storage',
            '/home/wwsapi/Sapius/storage',
            base_path('../Sapius/storage'),
            base_path('../SapiusProduction/storage'),
        ], fn (string $dir) => is_dir($dir));

        $expandedDirs = $baseDirs;
        foreach ($baseDirs as $dir) {
            $normalizedDir = str_replace('\\', '/', $dir);
            if (str_starts_with($normalizedDir, $storageRoot.'/')) {
                $sub = substr($normalizedDir, strlen($storageRoot));
                foreach ($prodStorageCandidates as $prodStorage) {
                    $expandedDirs[] = $prodStorage.$sub;
                }
            }
        }

        foreach ($expandedDirs as $dir) {
            $baseReal = realpath($dir);
            if (! $baseReal) {
                continue;
            }

            $candidate = realpath($baseReal.DIRECTORY_SEPARATOR.$relative);
            if ($candidate && str_starts_with($candidate, $baseReal.DIRECTORY_SEPARATOR) && is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function validateMacAddress(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401, 'No autorizado.');
        }
        if ($user->activo !== 'si') {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Cuenta desactivada.',
                ], 403)
            );
        }
        if ((bool) $user->is_blocked || ($user->strikes ?? 0) >= 100) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Cuenta bloqueada por violación de seguridad.',
                    'is_blocked' => true,
                ], 403)
            );
        }
        if ($user->hasRole('alumno')) {
            $mac = strtolower(trim((string) $request->header('X-Sapius-MAC', '')));
            if ($mac === '') {
                throw new HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => 'Dispositivo no autorizado.',
                        'is_blocked' => false,
                    ], 403)
                );
            }
            $macs = array_filter(array_map(fn ($m) => strtolower(trim($m)), explode(',', (string) $user->mac_address)));
            if (! in_array($mac, $macs, true)) {
                throw new HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => 'Dispositivo no autorizado.',
                        'is_blocked' => false,
                    ], 403)
                );
            }
        }

        return true;
    }

    public function dashboard(Request $request)
    {
        $this->validateMacAddress($request);

        $user = $request->user();

        $mis_cursos = Inscripcion::whereHas('CursoProgramado', function ($query) {
            $query->with('Curso')->where('fecha_inicio_venta', '<=', date('Y-m-d H:i:s'))
                ->where('fecha_fin', '>=', date('Y-m-d H:i:s'));
        })->with(['CursoProgramado.Curso', 'CursoProgramado.category', 'CursoProgramado.instructor:id,nombre,apellido,foto'])->where('user_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nombre_completo' => $user->nombre_completo,
                    'username' => $user->username,
                    'email' => $user->email,
                    'is_blocked' => $user->is_blocked,
                    'mac_address' => $user->mac_address,
                    'foto_url' => $user->foto ? '/api/electron/profile/foto/'.$user->foto : null,
                ],
                'mis_cursos' => $mis_cursos,
            ],
        ]);
    }

    public function courseDetails(Request $request, $curso_programado_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $cohortId = (int) $curso_programado_id;

        $enrollment = $this->accessService()->requireActiveEnrollment($user, $cohortId);

        $inscripcion = Inscripcion::find($enrollment->id);

        $curso = CursoProgramado::with(['category', 'Curso' => function ($r) {
            $r->with(['Lecciones' => function ($q) {
                $q->where('leccion_id', 0)->where('activo', 'si')->with(['Clases' => function ($c) {
                    $c->where('activo', 'si');
                }]);
            }]);
        }])->find($cohortId);

        if (! $curso || ! $curso->Curso) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado.'], 404);
        }

        $contenido_programado = ContenidoProgramado::where('curso_programado_id', $cohortId)->first();

        if ($curso->category && $curso->category->name == 'Guias') {
            $fileGuia = FileGuia::where('curso_programado_id', $cohortId)->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'curso_programado' => $curso,
                    'inscrito' => $inscripcion,
                    'contenido_programado' => $contenido_programado,
                    'guia' => $fileGuia ? 'alumno/medias/archivo/'.$fileGuia->url : null,
                ],
            ]);
        }

        $completedLessons = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->pluck('leccion_id')
            ->toArray();

        $totalCursoClases = 0;
        foreach ($curso->Curso->Lecciones as $modulo) {
            $totalClases = $modulo->Clases->count();
            $totalCursoClases += $totalClases;
            $completedCount = 0;
            foreach ($modulo->Clases as $clase) {
                if (in_array($clase->id, $completedLessons)) {
                    $completedCount++;
                }
            }
            $modulo->progress = $totalClases > 0 ? round(($completedCount / $totalClases) * 100) : 0;
            $modulo->completedCount = $completedCount;
            $modulo->totalClases = $totalClases;
        }

        $globalProgress = $totalCursoClases > 0 ? round((count($completedLessons) / $totalCursoClases) * 100) : 0;

        $unlockedLessonsData = LessonUnlock::where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->get()
            ->keyBy('leccion_id');

        return response()->json([
            'success' => true,
            'data' => [
                'curso_programado' => $curso,
                'inscrito' => $inscripcion,
                'contenido_programado' => $contenido_programado,
                'completedLessons' => $completedLessons,
                'globalProgress' => $globalProgress,
                'unlockedLessonsData' => $unlockedLessonsData,
            ],
        ]);
    }

    public function lessonDetails(Request $request, $leccion_id, $curso_programado_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $lessonId = (int) $leccion_id;
        $cohortId = (int) $curso_programado_id;

        $context = $this->accessService()->requireLessonInCohort($user, $lessonId, $cohortId);
        $inscripcion = Inscripcion::find($context['enrollment']->id);

        $leccion = Leccion::with(['Pruebas' => function ($q) use ($inscripcion) {
            $q->where('activo', 'si');
            $q->withCount(['Preguntas' => function ($pq) {
                $pq->where('activo', 'si');
            }]);
            if ($inscripcion) {
                $q->with(['Examenes' => function ($q2) use ($inscripcion) {
                    $q2->where('inscripcion_id', $inscripcion->id);
                }]);
            }
        }, 'Medias' => function ($q) {
            $q->where('activo', 'si');
        }, 'materialPdfs', 'Curso' => function ($q1) use ($lessonId) {
            $q1->with(['Lecciones' => function ($q2) use ($lessonId) {
                $q2->with('Clases')->where('activo', 'si')->where('id', '<>', $lessonId);
            }]);
        }])->find($lessonId);

        if (! $leccion) {
            return response()->json(['success' => false, 'message' => 'Lección no encontrada.'], 404);
        }

        if ($leccion->materialPdfs) {
            $leccion->materialPdfs->each(function ($mat) {
                $mat->setAttribute('allow_download', $this->isMaterialDownloadAllowed($mat));
            });
        }

        $video = $leccion->Medias->filter(function ($m) {
            return $m->tipo == 'video';
        })->first();

        $videoext = $leccion->Medias->filter(function ($m) {
            return $m->tipo == 'videoext';
        })->first();

        // Eliminar los videos de la lista de medias para mostrarlos por separado
        $leccion->Medias = $leccion->Medias->filter(function ($m) {
            return $m->tipo != 'video';
        });

        $homework = Homework::where('leccion_id', $leccion->id)
            ->where('user_id', $user->id)
            ->first();

        $completedLessons = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->pluck('leccion_id')
            ->toArray();

        $unlockedLessonsData = LessonUnlock::where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->get()
            ->keyBy('leccion_id');

        return response()->json([
            'success' => true,
            'data' => [
                'leccion' => $leccion,
                'video' => $video,
                'videoext' => $videoext,
                'homework' => $homework,
                'completedLessons' => $completedLessons,
                'unlockedLessonsData' => $unlockedLessonsData,
                'inscripcion_id' => $inscripcion->id,
            ],
        ]);
    }

    public function toggleLessonCompletion(Request $request)
    {
        $this->validateMacAddress($request);

        $request->validate([
            'leccion_id' => 'required|integer',
            'curso_programado_id' => 'required|integer',
        ]);

        $user = $request->user();
        $leccionId = (int) $request->leccion_id;
        $cursoProgramadoId = (int) $request->curso_programado_id;

        $context = $this->accessService()->requireLessonInCohort($user, $leccionId, $cursoProgramadoId);
        $leccion = $context['lesson'];

        $exists = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('leccion_id', $leccionId)
            ->where('curso_programado_id', $cursoProgramadoId)
            ->exists();

        if ($exists) {
            DB::table('leccion_user')
                ->where('user_id', $user->id)
                ->where('leccion_id', $leccionId)
                ->where('curso_programado_id', $cursoProgramadoId)
                ->delete();
            $status = 'unmarked';
        } else {
            DB::table('leccion_user')->insert([
                'user_id' => $user->id,
                'leccion_id' => $leccionId,
                'curso_programado_id' => $cursoProgramadoId,
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $status = 'marked';
        }

        // Recalcular Progreso
        $completedLessons = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $cursoProgramadoId)
            ->pluck('leccion_id')
            ->toArray();

        $curso = CursoProgramado::with(['Curso' => function ($r) {
            $r->with(['Lecciones' => function ($q) {
                $q->where('leccion_id', 0)->where('activo', 'si')->with(['Clases' => function ($c) {
                    $c->where('activo', 'si');
                }]);
            }]);
        }])->find($cursoProgramadoId);

        $totalCursoClases = 0;
        $totalCursoCompletadas = count($completedLessons);
        $moduleProgress = 0;
        $moduleCompleted = 0;
        $moduleTotal = 0;

        $currentModuleId = $leccion->leccion_id;

        if ($curso && $curso->Curso) {
            foreach ($curso->Curso->Lecciones as $modulo) {
                $modTotal = $modulo->Clases->count();
                $totalCursoClases += $modTotal;

                if ($modulo->id == $currentModuleId) {
                    $modCompleted = 0;
                    foreach ($modulo->Clases as $clase) {
                        if (in_array($clase->id, $completedLessons)) {
                            $modCompleted++;
                        }
                    }
                    $moduleCompleted = $modCompleted;
                    $moduleTotal = $modTotal;
                    $moduleProgress = $modTotal > 0 ? round(($modCompleted / $modTotal) * 100) : 0;
                }
            }
        }

        $globalProgress = $totalCursoClases > 0 ? round(($totalCursoCompletadas / $totalCursoClases) * 100) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $status,
                'globalProgress' => $globalProgress,
                'moduleProgress' => $moduleProgress,
                'moduleCompleted' => $moduleCompleted,
                'moduleTotal' => $moduleTotal,
                'moduleId' => $currentModuleId,
            ],
        ]);
    }

    public function homeworkTracking(Request $request, $curso_programado_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $cohortId = (int) $curso_programado_id;

        if ($cohortId <= 0) {
            return response()->json([
                'success' => true,
                'data' => [
                    'curso_programado' => null,
                    'modulos' => [],
                    'homeworks' => [],
                    'schedule' => [],
                    'unlockedLessonsData' => [],
                ],
            ]);
        }

        $this->accessService()->requireActiveEnrollment($user, $cohortId);

        $curso = CursoProgramado::with(['Curso' => function ($r) {
            $r->with(['Lecciones' => function ($q) {
                $q->with(['Clases' => function ($c) {
                    $c->where('activo', 'si');
                }]);
                $q->where('leccion_id', 0)->where('activo', 'si'); // Módulos
            }]);
        }])->find($cohortId);

        if (! $curso || ! $curso->Curso) {
            return response()->json([
                'success' => true,
                'data' => [
                    'curso_programado' => null,
                    'modulos' => [],
                    'homeworks' => [],
                    'schedule' => [],
                    'unlockedLessonsData' => [],
                ],
            ]);
        }

        $leccionIds = [];
        foreach ($curso->Curso->Lecciones as $modulo) {
            foreach ($modulo->Clases as $clase) {
                $leccionIds[] = $clase->id;
            }
        }

        $homeworks = empty($leccionIds)
            ? collect()
            : Homework::where('user_id', $user->id)
                ->whereIn('leccion_id', $leccionIds)
                ->get()
                ->keyBy('leccion_id');

        $contenidoProgramado = ContenidoProgramado::where('curso_programado_id', $cohortId)->first();
        $schedule = $contenidoProgramado && $contenidoProgramado->contenido ? $contenidoProgramado->contenido : [];

        $unlockedLessonsData = LessonUnlock::where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->get()
            ->keyBy('leccion_id');

        return response()->json([
            'success' => true,
            'data' => [
                'curso_programado' => $curso,
                'modulos' => $curso->Curso->Lecciones,
                'homeworks' => $homeworks,
                'schedule' => $schedule,
                'unlockedLessonsData' => $unlockedLessonsData,
            ],
        ]);
    }

    public function sendHomework(Request $request)
    {
        $this->validateMacAddress($request);

        $validator = Validator::make($request->all(), [
            'leccion_id' => 'required|integer',
            'curso_programado_id' => 'required|integer',
            'documento' => 'required|file|mimes:pdf,doc,docx|max:20480',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $leccion_id = (int) $request->leccion_id;
        $curso_programado_id = (int) $request->curso_programado_id;

        $context = $this->accessService()->requireLessonInCohort($user, $leccion_id, $curso_programado_id);
        $leccion = $context['lesson'];
        $curso_programado = $context['scheduled'];
        $instructor = $curso_programado ? User::find($curso_programado->user_id) : null;

        $file = $request->file('documento');
        Storage::disk('local')->put('tareas', $file);

        $datos = [
            'nombre' => $user->nombre_completo ?: $user->username,
            'leccion' => $leccion->titulo ?? $leccion->title ?? 'Lección',
            'tarea' => $request->tarea ?? 'Entregado vía Electron',
        ];

        try {
            if ($instructor && $instructor->email) {
                $copia = $user->email;
                Mail::to($instructor->email)->cc([$copia, 'tareas@sapius.com.mx'])->send(new TareaEmail($datos));
            }
        } catch (\Exception $e) {
            // Log warning but continue process as mail service might fail
        }

        $isLate = false;
        $contenidoProgramado = ContenidoProgramado::where('curso_programado_id', $curso_programado_id)->first();
        if ($contenidoProgramado && $contenidoProgramado->contenido) {
            $schedule = collect($contenidoProgramado->contenido);
            $scheduleItem = $schedule->firstWhere('id', $leccion->id);
            if (! $scheduleItem) {
                $scheduleItem = $schedule->firstWhere('id', $leccion->leccion_id);
            }
            if ($scheduleItem && isset($scheduleItem['fecha_final'])) {
                try {
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
                    if (Carbon::now()->gt($fechaFinal)) {
                        $isLate = true;
                    }
                } catch (\Exception $e) {
                }
            }
        }

        $homework = new Homework;
        $homework->leccion_id = $leccion->id;
        $homework->user_id = $user->id;
        $homework->is_late = $isLate;
        $homework->save();

        return response()->json([
            'success' => true,
            'message' => 'Tarea enviada con éxito.',
            'data' => $homework,
        ]);
    }

    public function examPrevio(Request $request, $prueba_id, $inscripcion_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $this->accessService()->requireQuizAccess($user, (int) $prueba_id, (int) $inscripcion_id);

        $examen = Prueba::withCount(['Examenes' => function ($q) use ($inscripcion_id) {
            $q->where('inscripcion_id', (int) $inscripcion_id)->where('finalizado', 'si');
        }])->where('activo', 'si')->find((int) $prueba_id);

        if (! $examen) {
            return response()->json(['success' => false, 'message' => 'Prueba no encontrada.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'prueba' => $examen,
                'oportunidades_restantes' => max(0, (int) $examen->oportunidades - (int) $examen->examenes_count),
            ],
        ]);
    }

    public function examPresentar(Request $request)
    {
        $this->validateMacAddress($request);

        $request->validate([
            'inscripcion_id' => 'required|integer',
            'prueba_id' => 'required|integer',
        ]);

        $user = $request->user();
        $inscripcion_id = (int) $request->inscripcion_id;
        $prueba_id = (int) $request->prueba_id;

        $this->accessService()->requireQuizAccess($user, $prueba_id, $inscripcion_id);

        $prueba = Prueba::withCount(['Preguntas' => function ($q) {
            $q->where('activo', 'si');
        }])->with('Leccion.Curso')->where('activo', 'si')->find($prueba_id);

        if (! $prueba) {
            return response()->json(['success' => false, 'message' => 'Prueba no encontrada.'], 404);
        }

        $examen = Examen::with(['Inscripcion', 'Prueba'])
            ->where('inscripcion_id', $inscripcion_id)
            ->where('prueba_id', $prueba_id)
            ->where('finalizado', 'no')
            ->orderByDesc('id')
            ->first();

        if ($examen === null) {
            $finishedAttempts = Examen::where('inscripcion_id', $inscripcion_id)
                ->where('prueba_id', $prueba_id)
                ->where('finalizado', 'si')
                ->count();

            if ($finishedAttempts >= (int) ($prueba->oportunidades ?? 1)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Has agotado todas las oportunidades para este examen.',
                ], 403);
            }

            $examen = new Examen;
            $examen->inscripcion_id = $inscripcion_id;
            $examen->prueba_id = $prueba_id;
            $examen->total_preguntas = $prueba->preguntas_count;
            $examen->finalizado = 'no';
            $examen->retro_visualizado = 'no';
            $examen->save();
            $examen->load(['Inscripcion', 'Prueba']);
        } else {
            $timeLimitSeconds = $this->resolveTimeLimitSeconds($prueba);
            if ($timeLimitSeconds > 0 && $examen->created_at) {
                $expiresAt = Carbon::parse($examen->created_at)->addSeconds($timeLimitSeconds);
                if (now()->gt($expiresAt)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El tiempo límite para este examen ha expirado.',
                        'expired' => true,
                    ], 403);
                }
            }
        }

        $preguntas = Pregunta::with(['GrupoPreguntas' => function ($q) use ($prueba_id) {
            $q->select('id', 'prueba_id', 'slug', 'pregunta', 'imagen', 'activo')
                ->with(['Respuestas' => function ($q1) {
                    $q1->select('id', 'pregunta_id', 'respuesta', 'activo')
                        ->where('activo', 'si');
                }])
                ->where('prueba_id', $prueba_id);
        }])
            ->where('activo', 'si')
            ->where('prueba_id', $prueba_id)
            ->select('slug')
            ->inRandomOrder($user->id)
            ->groupBy('slug')
            ->paginate(1);

        $preguntas->getCollection()->each(function ($mainPreg) {
            if ($mainPreg->GrupoPreguntas) {
                $mainPreg->GrupoPreguntas->each(function ($gp) {
                    $gp->makeHidden(['score', 'opciones']);
                    if ($gp->Respuestas) {
                        $gp->Respuestas->each->makeHidden(['correcto']);
                    }
                });
            }
        });

        $respuestasMap = [];
        if ($examen->respuestas_json != null) {
            $decoded = json_decode($examen->respuestas_json);
            if (is_array($decoded)) {
                foreach ($decoded as $item) {
                    if (is_object($item) && isset($item->name)) {
                        $respuestasMap[(string) $item->name] = (object) [
                            'name' => $item->name,
                            'value' => $item->value ?? null,
                        ];
                    }
                }
            }
        }

        if ($request->filled('respuestas')) {
            $rawInput = $request->respuestas;
            $decodedInput = is_string($rawInput) ? json_decode($rawInput) : $rawInput;
            if (is_array($decodedInput)) {
                foreach ($decodedInput as $item1) {
                    $itemObj = is_array($item1) ? (object) $item1 : $item1;
                    if (is_object($itemObj) && isset($itemObj->name)) {
                        $respuestasMap[(string) $itemObj->name] = (object) [
                            'name' => $itemObj->name,
                            'value' => $itemObj->value ?? null,
                        ];
                    }
                }
                $respuestas = collect(array_values($respuestasMap));
                $examen->respuestas_json = $respuestas->toJson();
                $examen->save();
            }
        }

        $respuestas = collect(array_values($respuestasMap));
        $final = $preguntas->currentPage() == $preguntas->lastPage();

        $preguntasAll = Pregunta::with(['GrupoPreguntas' => function ($q) use ($prueba_id) {
            $q->select('id', 'prueba_id', 'slug')
                ->where('prueba_id', $prueba_id);
        }])
            ->where('activo', 'si')
            ->where('prueba_id', $prueba_id)
            ->select('slug')
            ->inRandomOrder($user->id)
            ->groupBy('slug')
            ->get();

        $preguntasAll->each(function ($mainPreg) {
            if ($mainPreg->GrupoPreguntas) {
                $mainPreg->GrupoPreguntas->each->makeHidden(['score', 'opciones']);
            }
        });

        return response()->json([
            'success' => true,
            'data' => [
                'examen' => $examen,
                'preguntas' => $preguntas,
                'respuestas_guardadas' => $respuestas,
                'preguntasAll' => $preguntasAll,
                'final' => $final,
            ],
        ]);
    }

    public function examFinalizar(Request $request)
    {
        $this->validateMacAddress($request);

        $request->validate([
            'examen_id' => 'required|integer',
        ]);

        $user = $request->user();
        $examen_id = (int) $request->examen_id;

        $this->accessService()->requireExamOwnership($user, $examen_id);

        $examen = Examen::with('Prueba')->find($examen_id);
        if (! $examen) {
            return response()->json(['success' => false, 'message' => 'Examen no encontrado.'], 404);
        }

        if ($examen->finalizado === 'si') {
            return response()->json(['success' => false, 'message' => 'Este examen ya ha sido finalizado.'], 400);
        }

        $timeLimitSeconds = $this->resolveTimeLimitSeconds($examen->Prueba);
        if ($timeLimitSeconds > 0 && $examen->created_at) {
            $deadline = Carbon::parse($examen->created_at)->addSeconds($timeLimitSeconds + 30);
            if (now()->gt($deadline)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La ventana de tiempo para finalizar el examen ha expirado.',
                ], 403);
            }
        }

        $examen->total_correctas = 0;
        $examen->score_total = ($examen->Prueba && $examen->Prueba->tipo == 'ENARM') ? 0 : 700;

        $rawAnswers = json_decode($examen->respuestas_json ?? '[]');
        $respuestas = collect(is_array($rawAnswers) ? $rawAnswers : [])
            ->filter(fn ($item) => is_object($item) && isset($item->name, $item->value))
            ->keyBy(fn ($item) => (string) $item->name);

        $respuestas_db = Respuesta::whereHas('Pregunta', function ($q1) use ($examen) {
            $q1->where('prueba_id', $examen->prueba_id)->where('activo', 'si');
        })
            ->with('Pregunta')
            ->where('correcto', 1)
            ->where('activo', 'si')
            ->get()
            ->keyBy(function ($item) {
                return $item->pregunta_id.'-'.$item->id;
            });

        $respuestas->each(function ($r) use ($respuestas_db, $examen) {
            $busqueda = $r->name.'-'.$r->value;
            if ($respuestas_db->has($busqueda)) {
                $r_db = $respuestas_db->get($busqueda);
                $examen->total_correctas++;
                if (isset($r_db->Pregunta->score)) {
                    $examen->score_total += $r_db->Pregunta->score;
                }
            }
        });

        $isLate = false;
        $inscripcion = Inscripcion::find($examen->inscripcion_id);
        if ($inscripcion && $examen->Prueba) {
            $contenidoProgramado = ContenidoProgramado::where('curso_programado_id', $inscripcion->curso_programado_id)->first();
            if ($contenidoProgramado && $contenidoProgramado->contenido) {
                $schedule = collect($contenidoProgramado->contenido);
                $leccionId = $examen->Prueba->leccion_id;
                $scheduleItem = $schedule->firstWhere('id', $leccionId);
                if (! $scheduleItem) {
                    $leccion = Leccion::find($leccionId);
                    if ($leccion) {
                        $scheduleItem = $schedule->firstWhere('id', $leccion->leccion_id);
                    }
                }

                if ($scheduleItem && isset($scheduleItem['fecha_final'])) {
                    try {
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
                        if ($examen->created_at && Carbon::parse($examen->created_at)->gt($fechaFinal)) {
                            $isLate = true;
                        }
                    } catch (\Exception $e) {
                    }
                }
            }
        }

        $examen->finalizado = 'si';
        $examen->is_late = $isLate;
        $examen->save();

        return response()->json([
            'success' => true,
            'message' => 'Examen finalizado correctamente.',
            'data' => $examen,
        ]);
    }

    public function examFeedback(Request $request, $examen_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $this->accessService()->requireExamOwnership($user, (int) $examen_id);

        $examen = Examen::with('Prueba')->find((int) $examen_id);
        if ($examen == null) {
            return response()->json(['success' => false, 'message' => 'Examen no encontrado.'], 404);
        }

        if ($examen->finalizado !== 'si') {
            return response()->json([
                'success' => false,
                'message' => 'El examen debe estar finalizado para consultar la retroalimentación.',
            ], 403);
        }

        $caducidadRaw = $examen->tiempo_caducidad ?? ($examen->Prueba?->tiempo_caducidad ?? null);
        if (! empty($caducidadRaw)) {
            $caducidadSeconds = $this->parseDurationToSeconds($caducidadRaw);
            if ($caducidadSeconds > 0 && $examen->updated_at) {
                $elapsedCaducidad = max(0, (int) Carbon::parse($examen->updated_at)->diffInSeconds(now(), false));
                if ($elapsedCaducidad > $caducidadSeconds) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El tiempo de caducidad de la retroalimentación ha concluido.',
                    ], 403);
                }
            } else {
                try {
                    if (now()->gt(Carbon::parse($caducidadRaw))) {
                        return response()->json([
                            'success' => false,
                            'message' => 'El tiempo de caducidad de la retroalimentación ha concluido.',
                        ], 403);
                    }
                } catch (\Throwable $e) {
                    // Ignore unparseable value
                }
            }
        }

        $vigenciaSeconds = $this->parseDurationToSeconds($examen->Prueba?->tiempo_vigencia ?? null);
        if ($vigenciaSeconds > 0 && $examen->updated_at) {
            $elapsedVigencia = max(0, (int) Carbon::parse($examen->updated_at)->diffInSeconds(now(), false));
            if ($elapsedVigencia > $vigenciaSeconds) {
                return response()->json([
                    'success' => false,
                    'message' => 'El tiempo de vigencia de la retroalimentación ha concluido.',
                ], 403);
            }
        }

        if ($examen->retro_visualizado === 'si' && $vigenciaSeconds <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'La retroalimentación de este examen ya fue visualizada.',
            ], 403);
        }

        if ($examen->retro_visualizado == 'no') {
            $examen->retro_visualizado = 'si';
            $examen->save();
        }

        $rawAnswers = json_decode($examen->respuestas_json ?? '[]');
        $respuestas = collect(is_array($rawAnswers) ? $rawAnswers : [])
            ->filter(fn ($item) => is_object($item) && isset($item->name, $item->value))
            ->keyBy(fn ($item) => (string) $item->name)
            ->values();

        $respuestas_db = Respuesta::whereHas('Pregunta', function ($q) use ($examen) {
            $q->where('prueba_id', $examen->prueba_id)->where('activo', 'si');
        })
            ->with(['Pregunta' => function ($q1) {
                $q1->with(['Respuestas' => function ($q2) {
                    $q2->where('activo', 'si');
                }]);
            }])
            ->where('correcto', 1)
            ->where('activo', 'si')
            ->get();

        $respuestas_db->each(function ($rdb) {
            $rdb->makeVisible('correcto');
            if ($rdb->Pregunta && $rdb->Pregunta->Respuestas) {
                $rdb->Pregunta->Respuestas->each->makeVisible('correcto');
            }
        });

        $correctasPorId = $respuestas_db->keyBy(function ($r) {
            return $r->pregunta_id.'-'.$r->id;
        });
        $correctasPorPregunta = $respuestas_db->keyBy('pregunta_id');
        $usuarioPorPregunta = $respuestas->keyBy('name');

        $feedback = [];

        // Incluir tanto las respuestas correctas como incorrectas
        $respuestas->each(function ($r) use ($correctasPorId, $correctasPorPregunta, &$feedback) {
            $llave = $r->name.'-'.$r->value;
            if ($correctasPorId->has($llave)) {
                $feedback[] = [
                    'user_answer' => $r,
                    'correct_answer' => $correctasPorId->get($llave),
                ];
            } else {
                if ($correctasPorPregunta->has($r->name)) {
                    $feedback[] = [
                        'user_answer' => $r,
                        'correct_answer' => $correctasPorPregunta->get($r->name),
                    ];
                }
            }
        });

        // Incluir las no respondidas
        $respuestas_db->each(function ($rdb) use ($usuarioPorPregunta, &$feedback) {
            if (! $usuarioPorPregunta->has($rdb->pregunta_id)) {
                $o = (object) ['name' => 0, 'value' => 0];
                $feedback[] = [
                    'user_answer' => $o,
                    'correct_answer' => $rdb,
                ];
            }
        });

        return response()->json([
            'success' => true,
            'data' => [
                'examen' => $examen,
                'feedback' => $feedback,
            ],
        ]);
    }

    public function examEventos(Request $request)
    {
        $this->validateMacAddress($request);

        $request->validate([
            'examen_id' => 'required|integer',
        ]);

        $user = $request->user();
        $this->accessService()->requireExamOwnership($user, (int) $request->examen_id);

        $examen = Examen::find((int) $request->examen_id);
        if (! $examen) {
            return response()->json(['success' => false, 'message' => 'Examen no encontrado.'], 404);
        }

        if ($examen->finalizado === 'si') {
            return response()->json(['success' => false, 'message' => 'El examen ya está finalizado.'], 400);
        }

        $array = $examen->eventos ?? [];
        $array[] = [
            'fecha_hora' => date('Y-m-d H:i:s'),
            'observacion' => mb_substr(strip_tags((string) $request->input('observacion', '')), 0, 255),
            'tecla' => mb_substr(strip_tags((string) $request->input('tecla', '')), 0, 64),
            'lugar' => mb_substr(strip_tags((string) $request->input('lugar', '')), 0, 128),
        ];

        $examen->eventos = $array;
        $examen->save();

        return response()->json(['success' => true, 'message' => 'Evento registrado.']);
    }

    public function securePdf(Request $request, $leccion_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();

        if ($leccion_id == 0 || $leccion_id === '0') {
            $curso_programado_id = (int) $request->query('curso_programado_id', 0);
            $this->accessService()->requireActiveEnrollment($user, $curso_programado_id);

            $fileGuia = FileGuia::where('curso_programado_id', $curso_programado_id)->first();
            if (! $fileGuia || ! $fileGuia->url) {
                return response()->json(['success' => false, 'message' => 'Guía no encontrada.'], 404);
            }

            $path = $this->resolveSafePathInDirs((string) $fileGuia->url, [
                storage_path('app/files/medias'),
                storage_path('app/public/files/medias'),
            ], true);
        } else {
            $leccion = Leccion::where('id', (int) $leccion_id)->where('activo', 'si')->first();
            if (! $leccion || ! $leccion->archivo_pdf) {
                return response()->json(['success' => false, 'message' => 'PDF no encontrado.'], 404);
            }

            $preferredCohortId = $request->query('curso_programado_id') ? (int) $request->query('curso_programado_id') : null;
            $this->accessService()->requireCourseEnrollment($user, (int) $leccion->curso_id, $preferredCohortId);

            $path = $this->resolveSafePathInDirs((string) $leccion->archivo_pdf, [
                storage_path('app/public'),
            ], true) ?? $this->resolveSafePathInDirs((string) $leccion->archivo_pdf, [
                storage_path('app/public'),
            ], false);
        }

        if (! $path || ! file_exists($path)) {
            return response()->json(['success' => false, 'message' => 'Archivo no encontrado en el servidor.'], 404);
        }

        return Response::file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="sapius_secure.pdf"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Sirve imágenes privadas de preguntas al cliente Electron.
     * Las imágenes se guardan en storage/app/images/preguntas/ (no pública).
     */
    public function preguntaImagen(Request $request, $filename)
    {
        $this->validateMacAddress($request);

        $path = $this->resolveSafePathInDirs((string) $filename, [
            storage_path('app/images/preguntas'),
        ], true);

        if (! $path) {
            return response()->json(['success' => false, 'message' => 'Imagen no encontrada.'], 404);
        }

        $mimeType = mime_content_type($path) ?: 'application/octet-stream';

        return Response::file($path, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    public function getProfile(Request $request)
    {
        $this->validateMacAddress($request);

        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'username' => $user->username,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'folio' => $user->folio,
                'universidad_procedencia' => $user->universidad_procedencia,
                'especialidad' => $user->especialidad,
                'fecha_sustentacion' => $user->fecha_sustentacion,
                'foto' => $user->foto,
                'documento_identificacion' => $user->documento_identificacion,
                'pase_ingreso' => $user->pase_ingreso,
                'foto_url' => $user->foto ? '/api/electron/profile/foto/'.$user->foto : null,
                'documento_url' => $user->documento_identificacion ? '/api/electron/profile/documento/'.$user->documento_identificacion : null,
                'pase_url' => $user->pase_ingreso ? '/api/electron/profile/pase/'.$user->pase_ingreso : null,
                'expediente_completo' => ($user->foto && $user->documento_identificacion && $user->pase_ingreso),
            ],
        ]);
    }

    private function serveOwnProfileFile(Request $request, string $file, ?string $expectedFilename, string $relativeDir)
    {
        $this->validateMacAddress($request);

        $safeRequested = basename($file);
        $safeExpected = $expectedFilename ? basename($expectedFilename) : '';

        if ($safeExpected === '' || ! hash_equals($safeExpected, $safeRequested)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes autorización para acceder a este archivo.',
            ], 403);
        }

        $path = $this->resolveSafePathInDirs($safeRequested, [storage_path($relativeDir)], true);
        if (! $path) {
            abort(404);
        }

        return response()->file($path);
    }

    public function profileFoto(Request $request, $file)
    {
        return $this->serveOwnProfileFile($request, (string) $file, $request->user()->foto, 'app/images/usuarios');
    }

    public function profileDocumento(Request $request, $file)
    {
        return $this->serveOwnProfileFile($request, (string) $file, $request->user()->documento_identificacion, 'app/documentos/identificaciones');
    }

    public function profilePase(Request $request, $file)
    {
        return $this->serveOwnProfileFile($request, (string) $file, $request->user()->pase_ingreso, 'app/documentos/pases');
    }

    public function updateProfile(Request $request)
    {
        $this->validateMacAddress($request);

        $user = $request->user();

        $nameRegex = 'regex:/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/u';
        $rules = [
            'nombre' => ['required', 'string', $nameRegex, 'max:255'],
            'apellido' => ['required', 'string', $nameRegex, 'max:255'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'universidad_procedencia' => ['nullable', 'string', 'max:255'],
            'especialidad' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],
            'current_password' => ['required_with:password', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'documento_identificacion' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'pase_ingreso' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->filled('password')) {
            if (! Hash::check((string) $request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La contraseña actual es incorrecta.',
                    'errors' => ['current_password' => ['La contraseña actual es incorrecta.']],
                ], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $user->nombre = strip_tags($request->nombre);
        $user->apellido = strip_tags($request->apellido);
        $user->telefono = $request->telefono !== null ? strip_tags($request->telefono) : null;
        $user->universidad_procedencia = $request->universidad_procedencia !== null ? strip_tags($request->universidad_procedencia) : null;
        $user->especialidad = $request->especialidad !== null ? strip_tags($request->especialidad) : null;

        // Upload files if provided
        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $user->foto = basename(Storage::disk('local')->put('images/usuarios', $file));
        }

        if ($request->hasFile('documento_identificacion')) {
            $file = $request->file('documento_identificacion');
            $user->documento_identificacion = basename(Storage::disk('local')->put('documentos/identificaciones', $file));
        }

        if ($request->hasFile('pase_ingreso')) {
            $file = $request->file('pase_ingreso');
            $user->pase_ingreso = basename(Storage::disk('local')->put('documentos/pases', $file));
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente.',
            'user' => [
                'nombre_completo' => $user->nombre_completo,
                'avatar' => mb_substr((string) $user->nombre, 0, 1),
                'foto_url' => $user->foto ? '/api/electron/profile/foto/'.$user->foto : null,
            ],
        ]);
    }

    public function getNotifications(Request $request)
    {
        $this->validateMacAddress($request);

        $user = $request->user();

        $notifications = $user->notifications()->take(50)->get()->map(function ($notif) {
            return [
                'id' => $notif->id,
                'type' => $notif->type,
                'data' => $notif->data,
                'read_at' => $notif->read_at,
                'created_at' => $notif->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    public function markNotificationRead(Request $request, $id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();

            return response()->json(['success' => true, 'message' => 'Notificación marcada como leída.']);
        }

        return response()->json(['success' => false, 'message' => 'Notificación no encontrada.'], 404);
    }

    public function clearAllNotifications(Request $request)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        return response()->json(['success' => true, 'message' => 'Todas las notificaciones marcadas como leídas.']);
    }

    public function checkOpinionPending(Request $request, $curso_programado_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $cohortId = (int) $curso_programado_id;

        $this->accessService()->requireActiveEnrollment($user, $cohortId);

        $courseColumn = Schema::hasColumn('reviews', 'curso_programado_id')
            ? 'curso_programado_id'
            : 'course_id';

        // Check if there is already a review for this course program
        $hasReview = Review::where('user_id', $user->id)
            ->where($courseColumn, $cohortId)
            ->exists();

        return response()->json([
            'success' => true,
            'pending' => ! $hasReview,
        ]);
    }

    public function submitOpinion(Request $request)
    {
        $this->validateMacAddress($request);

        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'course_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $cohortId = (int) $request->course_id;
        $this->accessService()->requireActiveEnrollment($user, $cohortId);

        $badWords = [
            'puta', 'puto', 'pendejo', 'pendeja', 'mierda', 'chingar', 'chingada', 'chingado',
            'verga', 'cabrón', 'cabrona', 'culero', 'culera', 'imbécil', 'idiota', 'estúpido', 'estúpida',
            'zorra', 'perra', 'maricón', 'marica', 'mamón', 'mamona', 'pinche', 'asco',
            'malo', 'pésimo', 'horrible', 'asqueroso', 'terrible', 'basura', 'fraude', 'falso',
            'estafa', 'engaño', 'mentira', 'timar', 'robo', 'inútil', 'decepción', 'engañoso',
            'aburrido', 'mediocre', 'desastre', 'pobre', 'deficiente', 'inservible', 'vergonzoso',
            'curso malo', 'curso pésimo', 'curso horrible', 'curso basura', 'profesor malo',
            'profesor pésimo', 'no sirve', 'no aprendes', 'malísimo', 'pérdida de tiempo', 'culo', 'pene',
        ];

        $comment = strtolower($request->comment);
        $containsBadWord = false;

        foreach ($badWords as $word) {
            if (strpos($comment, $word) !== false) {
                $containsBadWord = true;
                break;
            }
        }

        if ($containsBadWord) {
            $visible = false;
            $rating = 0;
        } else {
            $rating = (int) $request->rating;
            $visible = $rating >= 4;
        }

        $courseColumn = Schema::hasColumn('reviews', 'curso_programado_id')
            ? 'curso_programado_id'
            : 'course_id';

        $displayName = trim((string) $user->nombre_completo);
        if ($displayName === '') {
            $displayName = (string) ($user->username ?: 'Estudiante');
        }

        $review = new Review;
        $review->user_id = $user->id;
        $review->name = $displayName;
        $review->rating = $rating;
        $review->comment = strip_tags($request->comment);
        $review->visible = $visible;
        $review->{$courseColumn} = $cohortId;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => 'Opinión registrada correctamente.',
        ]);
    }

    public function getCalendar(Request $request, $curso_programado_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $cohortId = (int) $curso_programado_id;

        if ($cohortId <= 0) {
            return response()->json([
                'success' => true,
                'data' => [
                    'events' => [],
                    'weekly_calendars' => [],
                ],
            ]);
        }

        $this->accessService()->requireActiveEnrollment($user, $cohortId);

        $curso = CursoProgramado::with(['Curso.Lecciones'])->find($cohortId);
        if (! $curso) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado.'], 404);
        }

        $events = [];
        $contenido_programado = ContenidoProgramado::where('curso_programado_id', $cohortId)->first();
        if ($contenido_programado && $contenido_programado->contenido && $curso->Curso) {
            $schedule = collect($contenido_programado->contenido);
            foreach ($curso->Curso->Lecciones as $leccion) {
                $contenido = $schedule->where('id', $leccion->id)->first();
                if ($contenido) {
                    $fecha_inicial = isset($contenido['fecha_inicial']) ? $contenido['fecha_inicial'] : null;
                    $fecha_final = isset($contenido['fecha_final']) ? $contenido['fecha_final'] : null;
                    $events[] = [
                        'titulo' => $leccion->titulo,
                        'fecha_inicio' => $fecha_inicial,
                        'fecha_final' => $fecha_final,
                    ];
                }
            }
        }

        $current_date = now()->format('Y-m-d');
        $weekly_calendars = ProgrammingCalendar::where('curso_id', $curso->curso_id)
            ->where('start_date', '<=', $current_date)
            ->where('end_date', '>=', $current_date)
            ->orderBy('position', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'events' => $events,
                'weekly_calendars' => $weekly_calendars,
            ],
        ]);
    }

    public function getGrades(Request $request, $inscripcion_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $inscripcion = Inscripcion::with('CursoProgramado')->find((int) $inscripcion_id);
        if (! $inscripcion) {
            return response()->json(['success' => false, 'message' => 'Inscripción no encontrada.'], 404);
        }

        if ((int) $inscripcion->user_id !== (int) $user->id || $inscripcion->aceptado !== 'si') {
            return response()->json(['success' => false, 'message' => 'No tienes autorización para consultar estas calificaciones.'], 403);
        }

        if (! $inscripcion->CursoProgramado) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado.'], 404);
        }

        $curso = Curso::find($inscripcion->CursoProgramado->curso_id);
        if (! $curso) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado.'], 404);
        }

        $modulosActivosIds = $curso->Lecciones()
            ->where('leccion_id', 0)
            ->where('activo', 'si')
            ->pluck('id');

        $lecciones = $curso->Lecciones()
            ->where('activo', 'si')
            ->where(function ($query) use ($modulosActivosIds) {
                $query->where('leccion_id', 0)
                    ->orWhereIn('leccion_id', $modulosActivosIds);
            })
            ->with(['pruebas' => function ($q) {
                $q->where('activo', 'si');
            }])
            ->get();

        $examenes = Examen::with('Prueba')
            ->where('inscripcion_id', $inscripcion->id)
            ->where('finalizado', 'si')
            ->whereHas('Prueba', function ($query) use ($curso) {
                $query->where('curso_id', $curso->id);
            })
            ->orderBy('id', 'asc')
            ->get()
            ->keyBy('prueba_id');

        $calificaciones = [];

        foreach ($lecciones as $leccion) {
            foreach ($leccion->pruebas as $prueba) {
                if ($prueba->activo === 'si') {
                    $examen = $examenes->get($prueba->id);
                    if ($examen) {
                        $calificaciones[] = [
                            'prueba_id' => $prueba->id,
                            'titulo' => $prueba->titulo,
                            'tipo' => $prueba->tipo,
                            'total_preguntas' => $examen->total_preguntas,
                            'total_correctas' => $examen->total_correctas,
                            'score_total' => $examen->score_total,
                            'presented' => true,
                        ];
                    } else {
                        $calificaciones[] = [
                            'prueba_id' => $prueba->id,
                            'titulo' => $prueba->titulo,
                            'tipo' => $prueba->tipo,
                            'total_preguntas' => 0,
                            'total_correctas' => 0,
                            'score_total' => 0,
                            'presented' => false,
                        ];
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'inscripcion' => $inscripcion,
                'calificaciones' => $calificaciones,
            ],
        ]);
    }

    public function getCourseProgress(Request $request, $curso_programado_id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $cohortId = (int) $curso_programado_id;

        $enrollment = $this->accessService()->requireActiveEnrollment($user, $cohortId);

        $curso = CursoProgramado::with(['Curso' => function ($r) {
            $r->with(['Lecciones' => function ($q) {
                $q->with(['Pruebas' => function ($p) {
                    $p->where('activo', 'si');
                }, 'Clases' => function ($c) {
                    $c->where('activo', 'si')->with(['Pruebas' => function ($p) {
                        $p->where('activo', 'si');
                    }]);
                }]);
                $q->where('leccion_id', 0)->where('activo', 'si'); // Módulos
            }]);
        }])->find($cohortId);

        if (! $curso || ! $curso->Curso) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado.'], 404);
        }

        $leccionIds = [];
        $pruebaIds = [];
        foreach ($curso->Curso->Lecciones as $modulo) {
            foreach ($modulo->Pruebas as $prueba) {
                $pruebaIds[] = $prueba->id;
            }
            foreach ($modulo->Clases as $clase) {
                $leccionIds[] = $clase->id;
                foreach ($clase->Pruebas as $prueba) {
                    $pruebaIds[] = $prueba->id;
                }
            }
        }

        $completedLessons = DB::table('leccion_user')
            ->where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->pluck('leccion_id')
            ->toArray();

        $homeworks = empty($leccionIds)
            ? collect()
            : Homework::where('user_id', $user->id)
                ->whereIn('leccion_id', $leccionIds)
                ->get()
                ->keyBy('leccion_id');

        $examenes = empty($pruebaIds)
            ? collect()
            : Examen::with('Prueba')
                ->where('inscripcion_id', $enrollment->id)
                ->whereIn('prueba_id', $pruebaIds)
                ->orderBy('id', 'asc')
                ->get()
                ->keyBy('prueba_id');

        $unlockedLessonsData = LessonUnlock::where('user_id', $user->id)
            ->where('curso_programado_id', $cohortId)
            ->get()
            ->keyBy('leccion_id');

        return response()->json([
            'success' => true,
            'data' => [
                'modulos' => $curso->Curso->Lecciones,
                'completedLessons' => $completedLessons,
                'homeworks' => $homeworks,
                'examenes' => $examenes,
                'unlockedLessonsData' => $unlockedLessonsData,
            ],
        ]);
    }

    public function getMaterialPdfDetails(Request $request, $id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $material = MaterialPdf::with('leccion')->find((int) $id);
        if (! $material) {
            return response()->json(['success' => false, 'message' => 'PDF interactivo no encontrado.'], 404);
        }

        if (! $material->leccion) {
            return response()->json(['success' => false, 'message' => 'Lección asociada no encontrada.'], 404);
        }

        $this->accessService()->requireCourseEnrollment($user, (int) $material->leccion->curso_id);
        $material->setAttribute('allow_download', $this->isMaterialDownloadAllowed($material));

        $respuesta = AlumnoPdfRespuesta::where('user_id', $user->id)
            ->where('material_pdf_id', $material->id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'material' => $material,
                'respuesta' => $respuesta,
            ],
        ]);
    }

    public function saveMaterialPdfAnswers(Request $request, $id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $material = MaterialPdf::with('leccion')->find((int) $id);
        if (! $material) {
            return response()->json(['success' => false, 'message' => 'PDF interactivo no encontrado.'], 404);
        }

        if (! $material->leccion) {
            return response()->json(['success' => false, 'message' => 'Lección asociada no encontrada.'], 404);
        }

        $this->accessService()->requireCourseEnrollment($user, (int) $material->leccion->curso_id);

        AlumnoPdfRespuesta::updateOrCreate(
            [
                'user_id' => $user->id,
                'material_pdf_id' => $material->id,
            ],
            [
                'respuestas' => $request->input('respuestas', []),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Tus respuestas han sido guardadas con éxito.',
        ]);
    }

    public function downloadMaterialPdfRaw(Request $request, $id)
    {
        $this->validateMacAddress($request);

        $user = $request->user();
        $material = MaterialPdf::with('leccion')->find((int) $id);
        if (! $material) {
            return response()->json(['success' => false, 'message' => 'PDF interactivo no encontrado.'], 404);
        }

        if (! $material->leccion) {
            return response()->json(['success' => false, 'message' => 'Lección asociada no encontrada.'], 404);
        }

        $this->accessService()->requireCourseEnrollment($user, (int) $material->leccion->curso_id);

        $isStream = $request->boolean('stream') || $request->query('stream') === '1';
        $allowDownload = $this->isMaterialDownloadAllowed($material);

        if (! $allowDownload && ! $isStream) {
            return response()->json([
                'success' => false,
                'message' => 'La descarga directa de este material PDF no está permitida.',
            ], 403);
        }

        $path = $this->resolveSafePathInDirs((string) $material->file_path, [
            storage_path('app/files/interactive_pdfs'),
            storage_path('app/public/files/interactive_pdfs'),
        ], true);

        if (! $path) {
            return response()->json(['success' => false, 'message' => 'El archivo físico del PDF interactivo no existe.'], 404);
        }

        if ($isStream) {
            return Response::file($path, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="sapius_interactive.pdf"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);
        }

        return response()->download($path, ($material->titulo ?: 'material').'.pdf');
    }
}
