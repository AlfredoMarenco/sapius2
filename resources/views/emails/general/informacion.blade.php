<x-mail::message>
# Solicitud de Información

Has recibido una nueva solicitud de información desde la página de contacto de Sapius:

<x-mail::panel>
**Nombre:** {{ $datos['nombre'] ?? 'No proporcionado' }}<br>
**Correo electrónico:** {{ $datos['email'] ?? 'No proporcionado' }}<br>
**Teléfono / WhatsApp:** {{ $datos['telefono'] ?? 'No proporcionado' }}
</x-mail::panel>

**Mensaje:**

{{ $datos['mensaje'] ?? 'Sin mensaje' }}

Gracias,<br>
**{{ config('app.name') }}**
</x-mail::message>
