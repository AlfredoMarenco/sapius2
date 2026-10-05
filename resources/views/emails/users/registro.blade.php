<x-mail::message>
# ¡Bienvenido a la familia SAPIUS!

Hola **{{ $user->nombre ?? $user['nombre'] }} {{ $user->apellido ?? $user['apellido'] }}**,

Nos alegra mucho que te unas a nuestra plataforma. Aquí encontrarás las herramientas necesarias para tu preparación médica.

<x-mail::button :url="config('app.url') . '/login'">
Acceder a mi cuenta
</x-mail::button>

Gracias por confiar en nosotros,<br>
{{ config('app.name') }}
</x-mail::message>
