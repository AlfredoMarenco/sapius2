<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AutoAceptacionEmail;
use App\Mail\RegistroEmail;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\ScheduledCourse;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CohortEnrollmentController extends Controller
{
    /**
     * Display enrolled students for a scheduled course cohort.
     * Supports both GET /admin/curso/{curso_id} and legacy POST /admin/curso
     */
    public function index(Request $request, $curso_id = null)
    {
        $targetId = $curso_id ?? $request->input('curso_programado_id');

        if (! $targetId) {
            return redirect()->route('admin.dashboard')->with('error', 'Cohorte no especificada');
        }

        $cohort = ScheduledCourse::with(['course', 'instructor'])->findOrFail($targetId);

        // Alumnos inscritos en la cohorte
        $enrollments = Enrollment::with('user')
            ->where('curso_programado_id', $targetId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($enrollment) {
                $user = $enrollment->user;

                return [
                    'id' => $enrollment->id,
                    'user_id' => $enrollment->user_id,
                    'student_name' => $user ? ($user->name ?? $user->email) : 'Usuario no encontrado',
                    'student_email' => $user ? $user->email : '',
                    'student_phone' => $user ? $user->phone : '',
                    'enrolled_at' => $enrollment->created_at ? $enrollment->created_at->format('d/m/Y H:i') : null,
                    'accepted' => $enrollment->aceptado ?? 'no',
                    'is_blocked' => $user ? (bool) $user->is_blocked : false,
                    'mac_address' => $user ? $user->mac_address : null,
                    'reference' => $enrollment->referencia ?? '',
                ];
            });

        // Otras cohortes activas para el modal de copiado masivo
        $otherCohorts = ScheduledCourse::with('course')
            ->where('id', '<>', $targetId)
            ->where('activo', 'si')
            ->orderBy('fecha_inicio', 'desc')
            ->get(['id', 'identificador', 'curso_id'])
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'title' => ($c->course ? $c->course->title : 'Curso').' - '.$c->identificador,
                ];
            });

        return Inertia::render('Admin/Schedules/Enrollments', [
            'cohort' => [
                'id' => $cohort->id,
                'internal_id' => $cohort->identificador,
                'start_date' => $cohort->fecha_inicio ? Carbon::parse($cohort->fecha_inicio)->format('d/m/Y') : null,
                'end_date' => $cohort->fecha_fin ? Carbon::parse($cohort->fecha_fin)->format('d/m/Y') : null,
                'price' => $cohort->precio,
                'course' => $cohort->course ? [
                    'id' => $cohort->course->id,
                    'title' => $cohort->course->title,
                    'image' => $cohort->course->image,
                ] : null,
                'instructor' => $cohort->instructor ? [
                    'id' => $cohort->instructor->id,
                    'name' => $cohort->instructor->name,
                ] : null,
            ],
            'enrollments' => $enrollments,
            'otherCohorts' => $otherCohorts,
        ]);
    }

    /**
     * Handle legacy POST /admin/curso (cards detail button)
     */
    public function indexPost(Request $request)
    {
        $id = $request->input('curso_programado_id');

        return redirect()->route('admin.cursos.get-inscritos', ['curso_id' => $id]);
    }

    /**
     * Inscribir un alumno individualmente (Venta Presencial / Manual)
     * Puede recibir user_id (existente) o datos para un usuario nuevo.
     */
    public function manualEnroll(Request $request, $id)
    {
        $cohort = ScheduledCourse::findOrFail($id);
        $userId = $request->input('user_id');

        if (! $userId) {
            $validated = $request->validate([
                'new_name' => 'required|string|max:255',
                'new_last_name' => 'nullable|string|max:255',
                'apellido' => 'nullable|string|max:255',
                'new_email' => 'required|email|max:255|unique:users,email',
                'new_phone' => 'nullable|string|max:255',
                'validado' => 'nullable|in:si,no',
            ]);
        } else {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'validado' => 'nullable|in:si,no',
            ]);
        }

        [$user, $enrollment, $isNewUser] = DB::transaction(function () use ($userId, $validated, $cohort) {
            $isNewUser = false;

            if (! $userId) {
                $isNewUser = true;
                $rawName = trim($validated['new_name']);
                $explicitLastName = trim((string) ($validated['new_last_name'] ?? $validated['apellido'] ?? ''));

                if ($explicitLastName !== '') {
                    $firstName = $rawName;
                    $lastName = $explicitLastName;
                } else {
                    $parts = preg_split('/\s+/', $rawName, 2);
                    $firstName = $parts[0] ?? $rawName;
                    $lastName = trim($parts[1] ?? '');
                }

                $baseUsername = trim($validated['new_email']);
                $username = $baseUsername;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername.'_'.$counter;
                    $counter++;
                }

                $user = new User;
                $user->nombre = strip_tags($firstName);
                $user->apellido = strip_tags($lastName);
                $user->email = strip_tags($validated['new_email']);
                $user->username = $username;
                $user->password = Hash::make(Str::password(12));
                $user->telefono = isset($validated['new_phone']) ? strip_tags($validated['new_phone']) : null;
                $user->activo = 'si';
                $user->validado = $validated['validado'] ?? 'si';
                $user->save();

                $alumnoRoleId = Role::where('slug', 'alumno')->value('id') ?? 3;
                $now = now();
                $user->roles()->syncWithoutDetaching([
                    $alumnoRoleId => [
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                ]);
                $user->unsetRelation('roles');
            } else {
                $user = User::findOrFail($userId);
                if (isset($validated['validado'])) {
                    $user->validado = $validated['validado'];
                    $user->save();
                }
            }

            $enrollment = Enrollment::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'curso_programado_id' => $cohort->id,
                ],
                [
                    'aceptado' => 'si',
                    'tipo_pago' => 'Administrativo',
                    'referencia' => 'Inscripción manual por Administrador',
                ]
            );

            $enrollment->aceptado = 'si';
            $enrollment->save();

            return [$user, $enrollment, $isNewUser];
        });

        if ($isNewUser) {
            try {
                Mail::to($user->email)
                    ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                    ->send(new RegistroEmail($user));
            } catch (\Throwable $e) {
                Log::warning("Error enviando RegistroEmail a {$user->email}: {$e->getMessage()}");
            }
        }

        try {
            Mail::to($user->email)
                ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                ->send(new AutoAceptacionEmail($enrollment));
        } catch (\Throwable $e) {
            Log::warning("Error enviando AutoAceptacionEmail a {$user->email}: {$e->getMessage()}");
        }

        return redirect()->route('admin.cursos.get-inscritos', ['curso_id' => $id])
            ->with('success', 'Alumno inscrito manualmente con éxito.');
    }

    /**
     * Legacy JSON endpoint /admin/curso/{curso_id}/{active?}
     */
    public function getInscritos($curso_id, $active = 'si')
    {
        $cohort = ScheduledCourse::with(['students' => function ($q) use ($active) {
            $q->wherePivot('aceptado', $active);
        }])->find($curso_id);

        if (! $cohort) {
            return response()->json([], 404);
        }

        return response()->json($cohort->students);
    }

    /**
     * Accept enrolled student: sets aceptado = 'si'
     */
    public function activate(Request $request)
    {
        $enrollmentId = $request->input('id') ?? $request->input('inscripcion_id');
        $enrollment = Enrollment::findOrFail($enrollmentId);
        $enrollment->aceptado = 'si';
        $enrollment->save();

        return back()->with('success', 'Alumno aceptado exitosamente en el curso');
    }

    /**
     * Deactivate / reject student: sets aceptado = 'no'
     */
    public function destroy(Request $request)
    {
        $enrollmentId = $request->input('id') ?? $request->input('inscripcion_id');
        $enrollment = Enrollment::findOrFail($enrollmentId);
        $enrollment->aceptado = 'no';
        $enrollment->save();

        return back()->with('success', 'Inscripción desactivada exitosamente');
    }

    /**
     * Returns JSON list of students from another cohort for the copy modal
     */
    public function getAlumnosByCurso($id_curso)
    {
        $cohort = ScheduledCourse::with('students')->find($id_curso);

        if (! $cohort) {
            return response()->json(['error' => 'Curso programado no encontrado'], 404);
        }

        return response()->json($cohort->students);
    }

    /**
     * Bulk enroll selected students into this cohort
     */
    public function addStudents(Request $request, $id)
    {
        $validated = $request->validate([
            'alumnos' => 'required|array',
            'alumnos.*' => 'exists:users,id',
        ]);

        $cohort = ScheduledCourse::findOrFail($id);

        $added = DB::transaction(function () use ($validated, $cohort) {
            $added = 0;

            foreach ($validated['alumnos'] as $userId) {
                // Evitar duplicados
                $exists = Enrollment::where('user_id', $userId)
                    ->where('curso_programado_id', $cohort->id)
                    ->exists();

                if (! $exists) {
                    $enrollment = new Enrollment;
                    $enrollment->user_id = $userId;
                    $enrollment->curso_programado_id = $cohort->id;
                    $enrollment->tipo_pago = 'Administrativo';
                    $enrollment->referencia = 'Inscripción agregada por administrador';
                    $enrollment->aceptado = 'si';
                    $enrollment->save();
                    $added++;
                }
            }

            return $added;
        });

        return back()->with('success', "Se agregaron {$added} alumnos exitosamente al curso.");
    }
}
