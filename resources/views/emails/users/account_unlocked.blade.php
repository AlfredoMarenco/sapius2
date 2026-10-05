<x-mail::message>
# ¡Tu cuenta ha sido reactivada!

Hola **{{ $user->nombre ?? $user['nombre'] }}**,

Nos complace informarte que tu cuenta en Sapius ha sido desbloqueada exitosamente.

Se han restablecido tus permisos y ahora puedes acceder nuevamente a todo el contenido y funcionalidades de la plataforma.

<x-mail::button :url="config('app.url') . '/login'">
Acceder a mi cuenta
</x-mail::button>

Si tienes alguna duda, por favor contacta a soporte técnico respondiendo a este correo.

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
