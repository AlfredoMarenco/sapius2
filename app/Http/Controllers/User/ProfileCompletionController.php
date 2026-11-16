<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
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
                'foto' => $user->foto,
                'documento_identificacion' => $user->documento_identificacion,
                'pase_ingreso' => $user->pase_ingreso,
                'avatar' => $user->foto ? '/alumno/users/image/'.basename($user->foto) : null,
            ],
            'role' => $role,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->id != $id && ! $user->hasRole('admin')) {
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
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'documento_identificacion' => 'nullable|file|mimes:pdf|max:10240',
            'pase_ingreso' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $targetUser->nombre = strip_tags($request->nombre);
        $targetUser->apellido = strip_tags($request->apellido);
        $targetUser->telefono = $request->telefono !== null ? strip_tags($request->telefono) : null;
        $targetUser->folio = $request->folio !== null ? strip_tags($request->folio) : null;
        $targetUser->universidad_procedencia = $request->universidad_procedencia !== null ? strip_tags($request->universidad_procedencia) : null;
        $targetUser->especialidad = $request->especialidad !== null ? strip_tags($request->especialidad) : null;
        if (Schema::hasColumn('users', 'fecha_sustentacion')) {
            $targetUser->fecha_sustentacion = $request->fecha_sustentacion ?: null;
        }

        if ($request->hasFile('foto')) {
            $targetUser->foto = $this->storePrivateUpload(
                $request->file('foto'),
                storage_path('app/images/usuarios'),
                'jpg'
            );
        }

        if ($request->hasFile('documento_identificacion')) {
            $targetUser->documento_identificacion = $this->storePrivateUpload(
                $request->file('documento_identificacion'),
                storage_path('app/documentos/identificaciones'),
                'pdf'
            );
        }

        if ($request->hasFile('pase_ingreso')) {
            $targetUser->pase_ingreso = $this->storePrivateUpload(
                $request->file('pase_ingreso'),
                storage_path('app/documentos/pases'),
                'pdf'
            );
        }

        $targetUser->save();

        return redirect()->route('alumno.home')->with('success', 'Perfil completado exitosamente.');
    }

    public function userPicture($file)
    {
        return $this->serveOwnedFile('foto', [
            storage_path('app/images/usuarios'),
            storage_path('app/public/images/usuarios'),
        ], $file, false);
    }

    public function documento($file)
    {
        return $this->serveOwnedFile('documento_identificacion', [
            storage_path('app/documentos/identificaciones'),
        ], $file, true);
    }

    public function pase($file)
    {
        return $this->serveOwnedFile('pase_ingreso', [
            storage_path('app/documentos/pases'),
        ], $file, true);
    }

    private function storePrivateUpload(UploadedFile $file, string $destDir, string $fallbackExt): string
    {
        if (! is_dir($destDir)) {
            mkdir($destDir, 0750, true);
        }

        $ext = strtolower((string) ($file->guessExtension() ?: $file->getClientOriginalExtension() ?: $fallbackExt));
        $filename = Str::random(40).'.'.$ext;
        $file->move($destDir, $filename);

        return basename($filename);
    }

    private function serveOwnedFile(string $column, array $directories, string $file, bool $download)
    {
        $user = Auth::user();
        if (! $user) {
            abort(403);
        }

        $safeFilename = basename($file);
        if ($safeFilename === '' || $safeFilename === '.' || $safeFilename === '..') {
            abort(404);
        }

        $ownedFile = $user->{$column} ? basename((string) $user->{$column}) : '';
        if ($ownedFile === '' || ! hash_equals($ownedFile, $safeFilename)) {
            abort(403, 'No tienes autorización para acceder a este archivo.');
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
