<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;

class ValidRecaptcha implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $secretKey = config('elearning.captcha_secret_key');

        if (!$secretKey) {
            return;
        }

        if (empty($value)) {
            $fail('Selecciona la casilla "No soy un robot".');
            return;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $value,
                'remoteip' => request()->ip(),
            ]);

            if (!$response->successful() || !$response->json('success')) {
                $fail('La verificación de reCAPTCHA ha fallado. Por favor, intenta de nuevo.');
            }
        } catch (\Throwable $e) {
            $fail('Error al conectar con el servicio de reCAPTCHA.');
        }
    }
}
