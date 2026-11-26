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
            $sessionsFile = storage_path('app/electron-auth/sessions.json');
            $sessions = ['tokens' => [], 'macs' => []];
            if (is_file($sessionsFile)) {
                $decoded = json_decode((string) @file_get_contents($sessionsFile), true);
                if (is_array($decoded)) {
                    $sessions['tokens'] = is_array($decoded['tokens'] ?? null) ? $decoded['tokens'] : [];
                    $sessions['macs'] = is_array($decoded['macs'] ?? null) ? $decoded['macs'] : [];
                }
            }

            if (! $cachedUserId && isset($sessions['tokens'][$token])) {
                $cachedUserId = (int) $sessions['tokens'][$token];
                \Illuminate\Support\Facades\Cache::put('electron_api_token:'.$token, $cachedUserId, now()->addDays(30));
            }

            if (! $cachedUserId) {
                $headerMac = strtolower(trim((string) $request->header('X-Sapius-MAC', '')));
                if ($headerMac !== '') {
                    foreach ($sessions['macs'] as $uid => $storedMac) {
                        $macList = array_filter(array_map(fn ($m) => strtolower(trim($m)), explode(',', (string) $storedMac)));
                        if (in_array($headerMac, $macList, true)) {
                            $cachedUserId = (int) $uid;
                            $sessions['tokens'][$token] = $cachedUserId;
                            @mkdir(dirname($sessionsFile), 0775, true);
                            @file_put_contents($sessionsFile, json_encode($sessions, JSON_PRETTY_PRINT), LOCK_EX);
                            \Illuminate\Support\Facades\Cache::put('electron_api_token:'.$token, $cachedUserId, now()->addDays(30));
                            break;
                        }
                    }
                }
            }

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
