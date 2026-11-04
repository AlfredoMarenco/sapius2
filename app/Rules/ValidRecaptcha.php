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

            \Illuminate\Support\Facades\Log::info('reCAPTCHA verification response:', [
                'success' => $response->json('success'),
                'errors' => $response->json('error-codes'),
                'hostname' => $response->json('hostname'),
            ]);

            if (!$response->successful() || !$response->json('success')) {
                $errorCodes = $response->json('error-codes') ?? [];
                // Si el error es únicamente porque el dominio test.sapius.com.mx no está añadido a la lista blanca de Google reCAPTCHA del dominio sapius.com.mx
                if (in_array('bad-request', $errorCodes) || in_array('hostname-mismatch', $errorCodes) || in_array('invalid-input-response', $errorCodes)) {
                    \Illuminate\Support\Facades\Log::warning('reCAPTCHA falló por código: ' . json_encode($errorCodes));
                }

                $fail('La verificación de reCAPTCHA ha fallado. Por favor, intenta de nuevo.');
            }
        } catch (\Throwable $e) {
            $fail('Error al conectar con el servicio de reCAPTCHA.');
        }
    }
}
