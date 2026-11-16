<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckStrikes
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if ($user) {
            $isBlocked = $user->is_blocked === 'si'
                || $user->is_blocked === 1
                || $user->is_blocked === true
                || (int) ($user->strikes ?? 0) >= 100;

            if ($isBlocked) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'Tu cuenta ha sido bloqueada por exceder el límite de advertencias (strikes).',
                        'redirect' => route('alumno.blocked'),
                    ], 403);
                }

                return redirect()->route('alumno.blocked');
            }
        }

        return $next($request);
    }
}
