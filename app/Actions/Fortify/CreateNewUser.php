<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Mail\RegistroEmail;
use App\Models\Role;
use App\Models\User;
use App\Rules\ValidRecaptcha;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $rules = [
            ...$this->profileRules(),
            'first_name' => ['required_without:name', 'nullable', 'string', 'max:255'],
            'last_name' => ['required_without:name', 'nullable', 'string', 'max:255'],
            'password' => $this->passwordRules(),
        ];

        // Validar reCAPTCHA si está configurado (en entorno testing sin secret no bloquear tests)
        if (config('elearning.captcha_secret_key')) {
            $rules['g-recaptcha-response'] = ['required', new ValidRecaptcha];
        }

        Validator::make($input, $rules, [
            'g-recaptcha-response.required' => 'Por favor, marca la casilla "No soy un robot".',
        ])->validate();

        $user = DB::transaction(function () use ($input) {
            $firstName = trim($input['first_name'] ?? '');
            $lastName = trim($input['last_name'] ?? '');
            $fullName = trim($input['name'] ?? '');

            if (! $firstName && $fullName) {
                $nameParts = preg_split('/\s+/', $fullName, 2);
                $firstName = $nameParts[0] ?? $fullName;
                $lastName = $nameParts[1] ?? '';
            }

            // Obtener username ingresado o generar uno único seguro
            $rawUsername = trim($input['username'] ?? '');
            if (! empty($rawUsername)) {
                $username = $rawUsername;
            } else {
                $baseUsername = strtolower(explode('@', $input['email'])[0]);
                $baseUsername = preg_replace('/[^a-z0-9_]/', '', $baseUsername) ?: 'user';
                $username = $baseUsername;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername.$counter;
                    $counter++;
                }
            }

            $user = User::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'username' => $username,
                'email' => $input['email'],
                'password' => $input['password'],
                'activo' => 'si',
                'validado' => 'no',
            ]);

            // Asignar rol de Alumno dinámicamente con timestamps
            if (Schema::hasTable('role_user')) {
                $alumnoRoleId = Schema::hasTable('roles')
                    ? (Role::where('slug', 'alumno')->value('id') ?? 3)
                    : 3;

                $now = now();
                $user->roles()->syncWithoutDetaching([
                    $alumnoRoleId => [
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                ]);
                $user->unsetRelation('roles');
            }

            return $user;
        });

        try {
            Mail::to($user->email)
                ->cc(config('mail.to_support', 'atencion@sapius.com.mx'))
                ->send(new RegistroEmail($user));
        } catch (\Throwable $e) {
            Log::warning("Error enviando RegistroEmail a {$user->email}: {$e->getMessage()}");
        }

        return $user;
    }
}
