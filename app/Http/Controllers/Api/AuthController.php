<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserStrikeHistory;
use App\Services\StrikeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Authenticate user from Electron app.
     *
     * @return JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas.',
            ], 401);
        }

        if ($user->activo !== 'si') {
            return response()->json([
                'message' => 'Tu cuenta se encuentra desactivada. Por favor contacta a soporte.',
            ], 403);
        }

        // Destroy existing web session if any to enforce single active session
        if (Schema::hasColumn('users', 'session_id')) {
            $previous_session = $user->session_id;
            if ($previous_session) {
                try {
                    Session::getHandler()->destroy($previous_session);
                } catch (\Throwable $e) {
                    // Ignore if session handler store is not persistent (e.g. array driver in tests)
                }
                $user->session_id = null;
            }
        }

        // Generate a new API token every time a new login occurs from Electron to invalidate previous Electron instances
        $generatedToken = Str::random(80);
        if (Schema::hasColumn('users', 'api_token')) {
            $user->api_token = $generatedToken;
            $user->save();
        } else {
            // Soporte fallback sin alterar la tabla users (Cache de token por 30 días)
            \Illuminate\Support\Facades\Cache::put('electron_api_token:'.$generatedToken, $user->id, now()->addDays(30));
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol, // Roles handled via User::getRolAttribute()
            ],
            'api_token' => $generatedToken,
        ]);
    }

    /**
     * Validate or link MAC address.
     *
     * @return JsonResponse
     */
    public function validateMac(Request $request)
    {
        $request->validate([
            'mac_address' => 'required|string',
        ]);

        $user = $request->user();

        if ((bool) $user->is_blocked || ($user->strikes ?? 0) >= 100) {
            return response()->json([
                'success' => false,
                'message' => 'Tu cuenta ha sido bloqueada temporalmente por políticas de seguridad.',
                'is_blocked' => true,
            ], 403);
        }

        // Check if user has "alumno" role
        if (! $user->hasRole('alumno')) {
            return response()->json([
                'success' => true,
                'message' => 'Acceso libre para administradores/soporte.',
            ]);
        }

        $normalizedMac = strtolower(trim((string) $request->mac_address));
        if ($normalizedMac === '') {
            return response()->json([
                'success' => false,
                'message' => 'Dirección MAC inválida.',
                'is_blocked' => false,
            ], 422);
        }

        $macs = [];
        if (Schema::hasColumn('users', 'mac_address')) {
            if (! $user->mac_address) {
                // Link MAC address for the first time
                $user->mac_address = $normalizedMac;
                $user->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Dirección MAC vinculada con éxito.',
                ]);
            }
            $macs = array_filter(array_map(fn ($mac) => strtolower(trim($mac)), explode(',', (string) $user->mac_address)));
        } else {
            // Soporte fallback sin alterar la tabla users (Cache de MAC vinculado al usuario)
            $cachedMac = \Illuminate\Support\Facades\Cache::get('user_mac_address:'.$user->id);
            if (! $cachedMac) {
                \Illuminate\Support\Facades\Cache::forever('user_mac_address:'.$user->id, $normalizedMac);
                return response()->json([
                    'success' => true,
                    'message' => 'Dirección MAC vinculada con éxito.',
                ]);
            }
            $macs = array_filter(array_map(fn ($mac) => strtolower(trim($mac)), explode(',', (string) $cachedMac)));
        }

        if (! in_array($normalizedMac, $macs, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Este dispositivo no está autorizado para esta cuenta. Por favor contacta a soporte.',
                'pending_request' => true,
                'is_blocked' => false,
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo validado.',
        ]);
    }

    /**
     * Request authorization for a new MAC address.
     *
     * @return JsonResponse
     */
    public function requestMacAuth(Request $request)
    {
        $request->validate([
            'mac_address' => 'required|string',
        ]);

        $user = $request->user();
        if ((bool) $user->is_blocked || ($user->strikes ?? 0) >= 100) {
            return response()->json([
                'success' => false,
                'message' => 'Tu cuenta ha sido bloqueada temporalmente por políticas de seguridad.',
                'is_blocked' => true,
            ], 403);
        }

        $normalizedMac = strtolower(trim((string) $request->mac_address));
        if ($user->hasRole('alumno') && Schema::hasColumn('users', 'pending_mac_address')) {
            $user->pending_mac_address = $normalizedMac;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Solicitud de autorización enviada al administrador.',
        ]);
    }

    /**
     * Register a security strike for the authenticated user from Electron.
     *
     * @return JsonResponse
     */
    public function registerStrike(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['status' => 'error'], 401);
        }

        $action = (string) $request->input('action', 'Unknown');
        $details = (string) $request->input('details', 'Electron App');

        $result = app(StrikeService::class)->register($user, $action, $details);

        return response()->json(array_merge($result, [
            'is_blocked' => $result['blocked'],
        ]));
    }

    /**
     * Get recent strikes and severity metrics for the locked view.
     *
     * @return JsonResponse
     */
    public function getLockedDetails(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 401);
        }

        $history = UserStrikeHistory::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        $recentHistory = UserStrikeHistory::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        $totalSeverity = 0;
        $itemsCount = 0;

        foreach ($recentHistory as $h) {
            $act = $h->action;
            $pts = 10; // BASE

            if (in_array($act, ['Copy', 'Cut', 'Paste', 'PrintScreen', 'Save', 'View Source', 'DevTools', 'F12'])) {
                $pts = 100;
            } elseif ($act === 'Right Click') {
                $pts = 50;
            } elseif (in_array($act, ['Shift', 'Restricted Key / Modifier'])) {
                $pts = 10;
            } elseif (strpos($act, 'Volume') !== false) {
                $pts = 0;
            }

            $totalSeverity += $pts;
            $itemsCount++;
        }

        $avgSeverity = $itemsCount > 0 ? $totalSeverity / $itemsCount : 0;

        $isGraveBlock = $recentHistory->contains(function ($h) {
            return strpos($h->details, 'retro') !== false && strpos($h->details, 'grabe') !== false;
        });

        if ($isGraveBlock) {
            $avgSeverity = 100;
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'nombre_completo' => $user->nombre_completo,
                'is_blocked' => $user->is_blocked,
                'strikes' => $user->strikes,
            ],
            'avg_severity' => $avgSeverity,
            'is_grave_block' => $isGraveBlock,
            'history' => $history,
        ]);
    }
}
