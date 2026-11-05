<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Http\Responses\LoginResponse;
use App\Http\Responses\RegisterResponse;
use App\Http\Responses\TwoFactorLoginResponse;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
        $this->app->singleton(RegisterResponseContract::class, RegisterResponse::class);
        $this->app->singleton(TwoFactorLoginResponseContract::class, TwoFactorLoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configureAuthentication();
    }

    /**
     * Configure custom Fortify authentication to validate reCAPTCHA and allow login via username or email.
     */
    private function configureAuthentication(): void
    {
        // 1. Validar reCAPTCHA antes de la autenticación
        Fortify::authenticateThrough(function (Request $request) {
            return array_filter([
                config('fortify.limiters.login') ? null : \Laravel\Fortify\Actions\EnsureLoginIsNotThrottled::class,
                \Laravel\Fortify\Actions\CanonicalizeUsername::class,
                new class {
                    public function handle($request, $next) {
                        $recaptchaSecret = config('elearning.captcha_secret_key');
                        if ($recaptchaSecret) {
                            $request->validate([
                                'g-recaptcha-response' => ['required', new \App\Rules\ValidRecaptcha()],
                            ], [
                                'g-recaptcha-response.required' => 'Por favor, marca la casilla "No soy un robot".',
                            ]);
                        }
                        return $next($request);
                    }
                },
                \Laravel\Fortify\Features::enabled(\Laravel\Fortify\Features::twoFactorAuthentication()) ? \Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable::class : null,
                \Laravel\Fortify\Actions\AttemptToAuthenticate::class,
                \Laravel\Fortify\Actions\PrepareAuthenticatedSession::class,
            ]);
        });

        // 2. Resolver usuario por username o email (sin revalidar reCAPTCHA para no duplicar el token de un solo uso)
        Fortify::authenticateUsing(function (Request $request) {
            $loginInput = $request->input('username') ?? $request->input('email');
            $password = $request->input('password');

            if (!$loginInput || !$password) {
                return null;
            }

            // Buscar por username o por email
            $user = \App\Models\User::where('username', $loginInput)
                ->orWhere('email', $loginInput)
                ->first();

            if ($user && \Illuminate\Support\Facades\Hash::check($password, $user->password)) {
                return $user;
            }

            return null;
        });
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
