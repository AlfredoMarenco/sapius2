<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class ApiTokenAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = null;
        if (Schema::hasColumn('users', 'api_token')) {
            $user = User::where('api_token', $token)
                ->where('activo', 'si')
                ->first();
        } else {
            // Fallback para entornos donde users no tiene api_token (congelamiento de BD)
            $cachedUserId = \Illuminate\Support\Facades\Cache::get('electron_api_token:'.$token);
            if ($cachedUserId) {
                $user = User::where('id', $cachedUserId)
                    ->where('activo', 'si')
                    ->first();
            }
        }

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated. Invalid token.'], 401);
        }

        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        // Usar setUser() sin estado de sesión en rutas API stateless
        Auth::setUser($user);

        return $next($request);
    }
}
