<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        if (!$user) {
            return redirect('login');
        }

        // Si el usuario tiene el trait HasShinobiRoles o similar, usamos hasRole.
        // Si no, verificamos manualmente si hay un campo "role" o equivalente.
        if (method_exists($user, 'hasRole')) {
            if (!$user->hasRole($role)) {
                return redirect()->route('dashboard'); // El dashboard redirige al rol correcto
            }
        } elseif (isset($user->role) && $user->role !== $role) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
