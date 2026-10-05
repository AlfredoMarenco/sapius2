<x-mail::message>
# Soporte Técnico

Hola,

{{ $datos['mensaje'] ?? 'Mensaje de soporte técnico.' }}

<br>
Si tienes más dudas, responde a este correo.

Atentamente,<br>
**{{ config('app.name') }}**
</x-mail::message>
