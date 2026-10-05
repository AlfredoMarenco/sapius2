<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

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

        $users = $query->orderBy('id', 'desc')->paginate(20)->withQueryString()->through(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'role' => $u->roles->first() ? $u->roles->first()->name : 'alumno',
                'is_active' => $u->activo === 'si',
                'is_validated' => $u->validado === 'si',
                'is_blocked' => (bool)$u->is_blocked,
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
                'role' => $user->roles->first() ? $user->roles->first()->name : 'alumno',
                'is_active' => $user->activo === 'si',
                'is_validated' => $user->validado === 'si',
                'is_blocked' => (bool)$user->is_blocked,
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

        return Inertia::render('Admin/Users/Verify', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->roles->first() ? $user->roles->first()->name : 'alumno',
                'phone' => $user->telefono,
                'fecha_sustentacion' => $user->fecha_sustentacion,
                'folio' => $user->folio,
                'university' => $user->universidad_procedencia,
                'specialty' => $user->especialidad,
                'is_validated' => $user->validado === 'si',
                'is_active' => $user->activo === 'si',
                'is_blocked' => (bool)$user->is_blocked,
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
        $user->save();

        $status = $user->activo == 'si' ? 'activado' : 'desactivado';
        return redirect()->back()->with('success', 'El usuario ha sido ' . $status . '.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'rol_id' => 'required|exists:roles,id',
        ]);

        $user->nombre = strip_tags($request->nombre);
        $user->apellido = strip_tags($request->apellido);
        $user->username = strip_tags($request->username);
        $user->email = strip_tags($request->email);
        $user->save();

        DB::table('role_user')->where('user_id', $user->id)->delete();
        DB::table('role_user')->insert([
            'role_id' => $request->rol_id,
            'user_id' => $user->id,
        ]);

        return redirect()->route('users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function unlock($id)
    {
        $user = User::findOrFail($id);
        $user->is_blocked = 0;
        $user->strikes = 0;
        $user->save();

        // Enviar correo de desbloqueo
        \Illuminate\Support\Facades\Mail::to($user->email)
            ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
            ->send(new \App\Mail\AccountUnlockedEmail($user));

        return redirect()->back()->with('success', 'El usuario ha sido desbloqueado exitosamente.');
    }

    public function clearMac($id)
    {
        $user = User::findOrFail($id);
        $user->mac_address = null;
        $user->save();

        return redirect()->back()->with('success', 'La dirección MAC ha sido desvinculada exitosamente.');
    }

    public function approveMac($id)
    {
        $user = User::findOrFail($id);

        if ($user->pending_mac_address) {
            if ($user->mac_address) {
                $user->mac_address = $user->mac_address . ', ' . $user->pending_mac_address;
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

        $results = $users->map(function($user) {
            return [
                'id' => $user->id,
                'name' => trim($user->nombre . ' ' . $user->apellido) ?: $user->username,
                'email' => $user->email,
                'phone' => $user->telefono ?? '',
            ];
        });

        return response()->json($results);
    }

    public function userPicture($file)
    {
        $storagePath = storage_path('app/images/usuarios/' . $file);
        if (!file_exists($storagePath)) {
            $storagePath = storage_path('app/public/images/usuarios/' . $file);
        }
        if (file_exists($storagePath)) {
            return response()->file($storagePath);
        }
        return abort(404);
    }

    public function documento($file)
    {
        $storagePath = storage_path('app/documentos/identificaciones/' . $file);
        if (file_exists($storagePath)) {
            return response()->download($storagePath);
        }
        return abort(404);
    }

    public function pase($file)
    {
        $storagePath = storage_path('app/documentos/pases/' . $file);
        if (file_exists($storagePath)) {
            return response()->download($storagePath);
        }
        return abort(404);
    }
}
