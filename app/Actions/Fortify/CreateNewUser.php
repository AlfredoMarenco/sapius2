<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
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

        // Validar reCAPTCHA si está configurado
        if (config('elearning.captcha_secret_key')) {
            $rules['g-recaptcha-response'] = [new \App\Rules\ValidRecaptcha()];
        }

        Validator::make($input, $rules, [
            'g-recaptcha-response.required' => 'Por favor, marca la casilla "No soy un robot".',
        ])->validate();

        return DB::transaction(function () use ($input) {
            $firstName = trim($input['first_name'] ?? '');
            $lastName = trim($input['last_name'] ?? '');
            $fullName = trim($input['name'] ?? '');

            if (!$firstName && $fullName) {
                $nameParts = preg_split('/\s+/', $fullName, 2);
                $firstName = $nameParts[0] ?? $fullName;
                $lastName = $nameParts[1] ?? '';
            } elseif (!$fullName && ($firstName || $lastName)) {
                $fullName = trim("{$firstName} {$lastName}");
            }

            // Obtener username ingresado o generar uno único seguro
            $rawUsername = trim($input['username'] ?? '');
            if (!empty($rawUsername)) {
                $username = $rawUsername;
            } else {
                $baseUsername = strtolower(explode('@', $input['email'])[0]);
                $baseUsername = preg_replace('/[^a-z0-9_]/', '', $baseUsername) ?: 'user';
                $username = $baseUsername;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }
            }

            $user = User::create([
                'name' => $fullName,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'username' => $username,
                'email' => $input['email'],
                'password' => $input['password'],
                'activo' => 'si',
                'validado' => 'no',
            ]);

            // Asignar rol de Alumno (ID 3 en Sapius)
            if (Schema::hasTable('role_user')) {
                DB::table('role_user')->insertOrIgnore([
                    'user_id' => $user->id,
                    'role_id' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return $user;
        });
    }
}
