<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = Auth::user();
        if (! $user) {
            return redirect('login');
        }

        // Verificar que la cuenta esté activa (paridad con Global Scope Activos de ../Sapius)
        if (($user->activo ?? 'si') !== 'si') {
            Auth::logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return redirect('login')->withErrors(['username' => 'Tu cuenta se encuentra desactivada.']);
        }

        // Permitir acceso supervisor si el usuario tiene rol de administrador
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return $next($request);
        }

        $allowedRoles = [];
        foreach ($roles as $roleGroup) {
            foreach (explode('|', $roleGroup) as $r) {
                $trimmed = strtolower(trim($r));
                if ($trimmed !== '') {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        if (method_exists($user, 'hasRole')) {
            $userRoles = $user->relationLoaded('roles') ? $user->getRelation('roles') : $user->roles()->get();
            if ($userRoles->isEmpty()) {
                abort(403, 'Tu cuenta no tiene un rol asignado.');
            }

            foreach ($allowedRoles as $role) {
                if ($user->hasRole($role)) {
                    return $next($request);
                }
            }

            return redirect()->route('dashboard');
        }

        if (isset($user->role) && in_array(strtolower((string) $user->role), $allowedRoles, true)) {
            return $next($request);
        }

        abort(403, 'No tienes permisos suficientes para acceder a esta sección.');
    }
}
