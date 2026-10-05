<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
        $user = \Illuminate\Support\Facades\Auth::user();
        if ($user) {
            if ($user->is_blocked === 'si' || $user->is_blocked === 1 || $user->is_blocked === true || $user->strikes >= 3) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'Tu cuenta ha sido bloqueada por exceder el límite de advertencias (strikes).',
                        'redirect' => route('alumno.blocked')
                    ], 403);
                }
                
                return redirect()->route('alumno.blocked');
            }
        }
        return $next($request);
    }
}
