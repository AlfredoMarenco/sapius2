<?php

namespace App\Http\Middleware;

use App\Services\MiniTestConfigService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $sharedUser = null;

        if ($user) {
            $role = $user->role;
            $foto = $user->foto;
            $avatarUrl = null;

            if ($foto) {
                $cleanFoto = ltrim((string) $foto, '/');
                if (str_starts_with($cleanFoto, 'http://') || str_starts_with($cleanFoto, 'https://')) {
                    $avatarUrl = $cleanFoto;
                } elseif ($role === 'admin') {
                    $avatarUrl = '/admin/users/image/'.basename($cleanFoto);
                } elseif ($role === 'alumno') {
                    $avatarUrl = '/alumno/users/image/'.basename($cleanFoto);
                }
            }

            $profileIncomplete = false;
            if ($role === 'alumno') {
                $requiredFields = [
                    $user->telefono,
                    $user->foto,
                    $user->folio,
                    $user->universidad_procedencia,
                    $user->documento_identificacion,
                    $user->pase_ingreso,
                    $user->especialidad,
                ];
                if (Schema::hasColumn('users', 'fecha_sustentacion')) {
                    $requiredFields[] = $user->fecha_sustentacion;
                }
                foreach ($requiredFields as $field) {
                    if ($field === null || trim((string) $field) === '') {
                        $profileIncomplete = true;
                        break;
                    }
                }
            }

            $sharedUser = [
                'id' => $user->id,
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'nombre_completo' => $user->nombre_completo,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $role,
                'avatar' => $avatarUrl,
                'email_verified_at' => $user->email_verified_at,
                'strikes' => (int) ($user->strikes ?? 0),
                'is_blocked' => (bool) $user->is_blocked || ((int) ($user->strikes ?? 0) >= 100),
                'is_validated' => $user->validado === 'si',
                'profile_incomplete' => $profileIncomplete,
            ];
        }

        if ($sharedUser && ($sharedUser['role'] ?? null) === 'admin') {
            Cookie::queue('qa_admin_active', '1', 60 * 24 * 7);
        } elseif ($request->hasCookie('qa_admin_active')) {
            Cookie::queue(Cookie::forget('qa_admin_active'));
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $sharedUser,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'recaptcha_site_key' => config('elearning.captcha_data_sitekey'),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'miniTestConfig' => fn (): array => app(MiniTestConfigService::class)->getConfig(),
        ];
    }
}
