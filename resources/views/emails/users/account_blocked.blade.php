<x-mail::message>
# Aviso de Seguridad: Cuenta Bloqueada

Hola **{{ $user->nombre ?? $user['nombre'] ?? 'Alumno' }}**,

El sistema de monitoreo antiplagio de **Sapius** ha bloqueado temporalmente tu cuenta tras alcanzar **{{ $strikes }} / 100 puntos** de advertencia.

**Último motivo registrado:** {{ $reason }}

Para solicitar la revisión y desbloqueo de tu acceso, comunícate con nuestro equipo de soporte vía WhatsApp enviando una fotografía sosteniendo tu identificación oficial.

<x-mail::button :url="'https://wa.me/' . config('elearning.unlock_whatsapp', '529993648594')">
Contactar a Soporte por WhatsApp
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
