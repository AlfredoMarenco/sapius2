<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWebOrElectron
{
    /**
     * Allow access via active web session OR Electron Bearer api_token.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user && ($token = $request->bearerToken()) && Schema::hasColumn('users', 'api_token')) {
            $user = User::where('api_token', $token)
                ->where('activo', 'si')
                ->first();

            if ($user) {
                $request->setUserResolver(fn () => $user);
                Auth::setUser($user);
            }
        }

        if (! $user) {
            if ($request->expectsJson() || $request->bearerToken()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->guest(route('login'));
        }

        if (($user->activo ?? 'si') !== 'si') {
            return response()->json(['message' => 'Cuenta desactivada.'], 403);
        }

        $isBlocked = $user->is_blocked === 'si'
            || $user->is_blocked === 1
            || $user->is_blocked === true
            || (int) ($user->strikes ?? 0) >= 100;

        if ($isBlocked && ! $user->hasRole('admin')) {
            if ($request->expectsJson() || $request->bearerToken()) {
                return response()->json([
                    'success' => false,
                    'is_blocked' => true,
                    'message' => 'Cuenta bloqueada por seguridad.',
                ], 403);
            }

            return redirect()->route('alumno.blocked');
        }

        if (! $user->hasRole('alumno') && ! $user->hasRole('instructor') && ! $user->hasRole('admin')) {
            abort(403);
        }

        return $next($request);
    }
}
