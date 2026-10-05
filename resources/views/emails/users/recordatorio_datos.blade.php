<x-mail::message>
# ¡Hola {{ $usuario->nombre ?? $usuario['nombre'] ?? 'usuario' }}!

Te recordamos que para completar y validar tu perfil necesitamos que subas los documentos solicitados.

@php
    $faltantes = [];
    if (empty($usuario->documento_identificacion)) {
        $faltantes[] = 'Documento de identidad';
    }
    if (empty($usuario->pase_ingreso)) {
        $faltantes[] = 'Pase de ingreso / ficha de pago';
    }
@endphp

@if (count($faltantes) > 0)
<x-mail::panel>
### ⚠️ Acción requerida

Para validar tu perfil necesitamos que completes la siguiente información:

@foreach ($faltantes as $item)
- {{ $item }}
@endforeach
</x-mail::panel>

<x-mail::button :url="config('app.url') . '/alumno'">
Subir documentos ahora
</x-mail::button>

Una vez subidos, revisaremos y te notificaremos cuando tu perfil esté validado. Si ya subiste alguno de estos archivos y consideras que hay un error, responde a este correo.
@else
<x-mail::panel>
**Estado de documentos:** Completos. Tu perfil está validado. Gracias por enviar la documentación.
</x-mail::panel>
@endif

Recuerda: tu perfil será validado una vez que los documentos sean revisados. Si necesitas ayuda, responde a este correo.

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
