<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AccountUnlockedEmail;
use App\Mail\RegistroEmail;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request, $activo = 'enable')
    {
        $query = User::with('roles');

        if ($activo == 'enable') {
            $query->where('activo', 'si');
        } elseif ($activo == 'disable') {
            $query->where('activo', 'no');
        } elseif ($activo == 'blocked') {
            $query->where('is_blocked', 1);
        } elseif ($activo == 'v2_pilot') {
            $pilotIds = \App\Services\V2PilotUserService::getPilotUserIds();
            $query->whereIn('id', $pilotIds !== [] ? $pilotIds : [0]);
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('apellido', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('folio', 'like', "%{$search}%");
            });
        }

        $pilotLookup = array_flip(\App\Services\V2PilotUserService::getPilotUserIds());

        $users = $query->orderBy('id', 'desc')->paginate(20)->withQueryString()->through(function ($u) use ($pilotLookup) {
            $role = $u->roles->first();

            return [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'role' => $role ? strtolower($role->slug ?? $role->name) : 'alumno',
                'is_active' => $u->activo === 'si',
                'is_validated' => $u->validado === 'si',
                'is_blocked' => (bool) $u->is_blocked,
                'is_v2_pilot' => isset($pilotLookup[$u->id]),
                'strikes' => $u->strikes ?? 0,
                'mac_address' => $u->mac_address,
                'pending_mac_address' => $u->pending_mac_address,
                'created_at' => $u->created_at ? $u->created_at->format('d/m/Y') : null,
            ];
        });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'activeFilter' => $activo,
            'searchTerm' => $request->input('search', ''),
            'v2PilotCount' => count($pilotLookup),
        ]);
    }

    public function show($id)
    {
        $user = User::with('roles')->findOrFail($id);

        $enrollments = Enrollment::with('scheduledCourse.course')
            ->where('user_id', $id)
            ->get()
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'course_title' => $e->scheduledCourse && $e->scheduledCourse->course ? $e->scheduledCourse->course->title : 'Curso',
                    'status' => $e->aceptado,
                    'created_at' => $e->created_at ? $e->created_at->format('d/m/Y H:i') : null,
                ];
            });

        $firstRole = $user->roles->first();

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->telefono,
                'folio' => $user->folio,
                'university' => $user->universidad_procedencia,
                'specialty' => $user->especialidad,
                'role' => $firstRole ? strtolower($firstRole->slug ?? $firstRole->name) : 'alumno',
                'is_active' => $user->activo === 'si',
                'is_validated' => $user->validado === 'si',
                'is_blocked' => (bool) $user->is_blocked,
                'is_v2_pilot' => \App\Services\V2PilotUserService::isPilotUser((int) $user->id),
                'strikes' => $user->strikes ?? 0,
                'mac_address' => $user->mac_address,
                'pending_mac_address' => $user->pending_mac_address,
                'created_at' => $user->created_at ? $user->created_at->format('d/m/Y') : null,
            ],
            'enrollments' => $enrollments,
        ]);
    }

    public function verify($id)
    {
        $user = User::with('roles')->findOrFail($id);
        $firstRole = $user->roles->first();

        return Inertia::render('Admin/Users/Verify', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $firstRole ? strtolower($firstRole->slug ?? $firstRole->name) : 'alumno',
                'phone' => $user->telefono,
                'fecha_sustentacion' => $user->fecha_sustentacion,
                'folio' => $user->folio,
                'university' => $user->universidad_procedencia,
                'specialty' => $user->especialidad,
                'is_validated' => $user->validado === 'si',
                'is_active' => $user->activo === 'si',
                'is_blocked' => (bool) $user->is_blocked,
                'strikes' => $user->strikes ?? 0,
                'foto' => $user->foto,
                'documento_identificacion' => $user->documento_identificacion,
                'pase_ingreso' => $user->pase_ingreso,
                'mac_address' => $user->mac_address,
                'pending_mac_address' => $user->pending_mac_address,
                'created_at' => $user->created_at ? $user->created_at->format('d/m/Y') : null,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:8',
            'rol_id' => 'required|exists:roles,id',
            'validado' => 'nullable|in:si,no',
            'activo' => 'nullable|in:si,no',
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = new User;
            $user->nombre = strip_tags($validated['nombre']);
            $user->apellido = strip_tags($validated['apellido']);
            $user->username = strip_tags($validated['username']);
            $user->email = strip_tags($validated['email']);
            $user->password = Hash::make($validated['password'] ?? Str::password(12));
            $user->activo = $validated['activo'] ?? 'si';
            $user->validado = $validated['validado'] ?? 'si';
            $user->save();

            $now = now();
            $user->roles()->sync([
                (int) $validated['rol_id'] => [
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);

            return $user;
        });

        try {
            Mail::to($user->email)
                ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                ->send(new RegistroEmail($user));
        } catch (\Throwable $e) {
            Log::warning("Error enviando RegistroEmail desde Admin::UserController::store a {$user->email}: {$e->getMessage()}");
        }

        return redirect()->route('admin.users.index')->with('success', 'Usuario creado correctamente.');
    }

    public function edit($id)
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = DB::table('roles')->get();

        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'username' => $user->username,
                'email' => $user->email,
                'rol_id' => $user->roles->first() ? $user->roles->first()->id : null,
            ],
            'roles' => $roles,
        ]);
    }

    public function toggleV2Pilot($id)
    {
        $user = User::findOrFail($id);
        $enabled = \App\Services\V2PilotUserService::togglePilotUser((int) $user->id);
        $msg = $enabled
            ? "Alumno {$user->name} asignado a la Nueva Versión (v2.sapius.com.mx)."
            : "Alumno {$user->name} regresado a la versión clásica (sapius.com.mx).";

        return redirect()->back()->with('success', $msg);
    }

    public function approve(Request $request)
    {
        $id = $request->id ?: $request->user_id;
        $user = User::findOrFail($id);
        $user->validado = 'si';
        $user->save();

        return redirect()->back()->with('success', 'Usuario validado correctamente.');
    }

    public function unapprove(Request $request)
    {
        $id = $request->id ?: $request->user_id;
        $user = User::findOrFail($id);
        $user->validado = 'no';
        $user->save();

        return redirect()->back()->with('success', 'Validación revocada.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->activo = ($user->activo == 'si') ? 'no' : 'si';

        if ($user->activo === 'no') {
            if (Schema::hasColumn('users', 'api_token')) {
                $user->api_token = null;
            }
            if (Schema::hasColumn('users', 'session_id')) {
                if (! empty($user->session_id)) {
                    try {
                        Session::getHandler()->destroy($user->session_id);
                    } catch (\Throwable $e) {
                        // Ignorar si la sesión ya expiró
                    }
                }
                $user->session_id = null;
            }
        }

        $user->save();

        $status = $user->activo == 'si' ? 'activado' : 'desactivado';

        return redirect()->back()->with('success', 'El usuario ha sido '.$status.'.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,'.$id,
            'email' => 'required|email|max:255|unique:users,email,'.$id,
            'rol_id' => 'required|exists:roles,id',
            'password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->nombre = strip_tags($validated['nombre']);
            $user->apellido = strip_tags($validated['apellido']);
            $user->username = strip_tags($validated['username']);
            $user->email = strip_tags($validated['email']);
            if (! empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
            $user->save();

            $now = now();
            $user->roles()->sync([
                (int) $validated['rol_id'] => [
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
            $user->unsetRelation('roles');
        });

        return redirect()->route('admin.users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function unlock($id)
    {
        $user = User::findOrFail($id);
        $user->is_blocked = 0;
        $user->strikes = 0;
        $user->save();

        try {
            Mail::to($user->email)
                ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                ->send(new AccountUnlockedEmail($user));
        } catch (\Throwable $e) {
            Log::warning("Error enviando AccountUnlockedEmail a {$user->email}: {$e->getMessage()}");
        }

        return redirect()->back()->with('success', 'El usuario ha sido desbloqueado exitosamente.');
    }

    public function clearMac($id)
    {
        if (! Schema::hasColumn('users', 'mac_address')) {
            return redirect()->back()->with('error', 'La base de datos actual no cuenta con las columnas de control MAC.');
        }

        $user = User::findOrFail($id);
        $user->mac_address = null;
        $user->save();

        return redirect()->back()->with('success', 'La dirección MAC ha sido desvinculada exitosamente.');
    }

    public function approveMac($id)
    {
        if (! Schema::hasColumn('users', 'mac_address') || ! Schema::hasColumn('users', 'pending_mac_address')) {
            return redirect()->back()->with('error', 'La base de datos actual no cuenta con las columnas de control MAC.');
        }

        $user = User::findOrFail($id);

        if ($user->pending_mac_address) {
            if ($user->mac_address) {
                $user->mac_address = $user->mac_address.', '.$user->pending_mac_address;
            } else {
                $user->mac_address = $user->pending_mac_address;
            }
            $user->pending_mac_address = null;
            $user->save();

            return redirect()->back()->with('success', 'Nueva dirección MAC aprobada exitosamente.');
        }

        return redirect()->back()->with('error', 'No hay ninguna solicitud de dispositivo pendiente.');
    }

    public function rejectMac($id)
    {
        if (! Schema::hasColumn('users', 'pending_mac_address')) {
            return redirect()->back()->with('error', 'La base de datos actual no cuenta con las columnas de control MAC.');
        }

        $user = User::findOrFail($id);
        $user->pending_mac_address = null;
        $user->save();

        return redirect()->back()->with('success', 'Solicitud de dirección MAC rechazada.');
    }

    public function search(Request $request)
    {
        $query = $request->input('q');

        if (empty($query)) {
            return response()->json([]);
        }

        $users = User::where('nombre', 'LIKE', "%{$query}%")
            ->orWhere('apellido', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get(['id', 'nombre', 'apellido', 'email', 'telefono', 'username']);

        $results = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => trim($user->nombre.' '.$user->apellido) ?: $user->username,
                'email' => $user->email,
                'phone' => $user->telefono ?? '',
            ];
        });

        return response()->json($results);
    }

    public function userPicture($file)
    {
        return $this->servePrivateFile([
            storage_path('app/images/usuarios'),
            storage_path('app/public/images/usuarios'),
        ], $file, false);
    }

    public function documento($file)
    {
        return $this->servePrivateFile([
            storage_path('app/documentos/identificaciones'),
        ], $file, true);
    }

    public function pase($file)
    {
        return $this->servePrivateFile([
            storage_path('app/documentos/pases'),
        ], $file, true);
    }

    private function servePrivateFile(array $directories, string $file, bool $download)
    {
        $safeFilename = basename($file);
        if ($safeFilename === '' || $safeFilename === '.' || $safeFilename === '..') {
            abort(404);
        }

        foreach ($directories as $dir) {
            $baseDir = realpath($dir);
            if ($baseDir === false) {
                continue;
            }

            $candidatePath = realpath($baseDir.DIRECTORY_SEPARATOR.$safeFilename);
            if (
                $candidatePath !== false
                && is_file($candidatePath)
                && str_starts_with($candidatePath, $baseDir.DIRECTORY_SEPARATOR)
            ) {
                $headers = [
                    'X-Content-Type-Options' => 'nosniff',
                ];

                return $download
                    ? response()->download($candidatePath, $safeFilename, $headers)
                    : response()->file($candidatePath, $headers);
            }
        }

        abort(404);
    }
}
