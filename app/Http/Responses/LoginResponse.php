<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        if ($user && config('elearning.enforce_single_session', true)) {
            $currentSessionId = $request->hasSession() ? $request->session()->getId() : Session::getId();
            $previousSession = $user->session_id ?? null;

            if ($previousSession && $previousSession !== $currentSessionId) {
                try {
                    Session::getHandler()->destroy($previousSession);
                } catch (\Throwable $e) {
                    // Ignorar si el handler o sesión previa ya no existen
                }
            }

            if (Schema::hasColumn('users', 'session_id')) {
                $user->session_id = $currentSessionId;
            }

            if (Schema::hasColumn('users', 'api_token')) {
                $user->api_token = null;
            }

            if ($user->isDirty()) {
                $user->save();
            }
        }

        if ($user && $user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        if ($user && $user->hasRole('instructor')) {
            return redirect()->route('instructor.dashboard');
        }

        if ($user && $user->hasRole('alumno')) {
            if (
                config('elearning.v2_pilot_restriction_enabled', false)
                && ! $user->hasRole('admin')
                && ! $user->hasRole('instructor')
                && ! \App\Services\V2PilotUserService::isPilotUser((int) $user->id)
            ) {
                \Illuminate\Support\Facades\Auth::logout();
                if ($request->hasSession()) {
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                }

                return redirect()->away(rtrim((string) config('elearning.production_site_url', 'https://sapius.com.mx'), '/').'/login');
            }

            $intended = (string) session('url.intended', '');
            if ($intended !== '' && str_contains($intended, 'checkout')) {
                return redirect()->intended(route('alumno.home'));
            }

            $requiredFields = [
                'telefono',
                'foto',
                'folio',
                'universidad_procedencia',
                'documento_identificacion',
                'pase_ingreso',
                'especialidad',
            ];

            if (Schema::hasColumn('users', 'fecha_sustentacion')) {
                array_unshift($requiredFields, 'fecha_sustentacion');
            }

            foreach ($requiredFields as $field) {
                $value = $user->{$field};
                if ($value === null || trim((string) $value) === '') {
                    return redirect()->route('alumno.complete', ['role' => 'alumno']);
                }
            }

            return redirect()->intended(route('alumno.home'));
        }

        return redirect()->intended(route('dashboard'));
    }
}
