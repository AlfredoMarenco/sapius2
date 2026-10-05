<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileCompletionController extends Controller
{
    public function index($role = 'alumno')
    {
        $user = Auth::user();

        return Inertia::render('User/Profile/CompleteProfile', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name ?? $user->nombre,
                'last_name' => $user->last_name ?? $user->apellido,
                'phone' => $user->telefono,
                'folio' => $user->folio,
                'university' => $user->universidad_procedencia,
                'specialty' => $user->especialidad,
                'sustentation_date' => $user->fecha_sustentacion,
            ],
            'role' => $role,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->id != $id && !$user->hasRole('admin')) {
            abort(403);
        }

        $targetUser = User::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'folio' => 'nullable|string|max:100',
            'universidad_procedencia' => 'nullable|string|max:255',
            'especialidad' => 'nullable|string|max:255',
            'fecha_sustentacion' => 'nullable|date',
            'foto' => 'nullable|image|max:2048',
        ]);

        $targetUser->nombre = strip_tags($request->nombre);
        $targetUser->apellido = strip_tags($request->apellido);
        $targetUser->telefono = strip_tags($request->telefono);
        $targetUser->folio = strip_tags($request->folio);
        $targetUser->universidad_procedencia = strip_tags($request->universidad_procedencia);
        $targetUser->especialidad = strip_tags($request->especialidad);
        $targetUser->fecha_sustentacion = $request->fecha_sustentacion;

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('users', 'public');
            $targetUser->foto = $path;
        }

        $targetUser->save();

        return redirect()->route('alumno.home')->with('success', 'Perfil completado exitosamente.');
    }
}
