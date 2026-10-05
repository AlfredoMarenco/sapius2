<x-mail::message>
# Solicitud de Información

Has recibido una nueva solicitud de información de un prospecto o alumno:

<x-mail::panel>
**Detalles del mensaje:**<br>
{{ $datos['mensaje'] ?? 'Sin mensaje' }}
</x-mail::panel>

Gracias,<br>
**{{ config('app.name') }}**
</x-mail::message>
