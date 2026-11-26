<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserSession
{
    /**
     * Enforce active account status and single web session (mutual exclusion with Electron).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            if (($user->activo ?? 'si') !== 'si') {
                Auth::logout();
                if ($request->hasSession()) {
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                }

                return redirect()->route('login')->withErrors([
                    'username' => 'Tu cuenta se encuentra desactivada.',
                ]);
            }

            if (
                ! app()->runningUnitTests()
                && config('elearning.enforce_single_session', true)
                && $request->hasSession()
                && ! empty($user->session_id)
                && $user->session_id !== $request->session()->getId()
            ) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->with(
                    'status',
                    'Tu sesión fue cerrada porque se inició sesión en otro dispositivo o en la aplicación de escritorio.'
                );
            }
        }

        return $next($request);
    }
}
