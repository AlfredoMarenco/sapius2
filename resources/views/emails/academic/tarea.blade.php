<x-mail::message>
# Nueva actividad registrada

Se ha registrado una nueva entrega o actualización de tarea en la plataforma.

<x-mail::panel>
**Alumno:** {{ $datos['nombre'] ?? '' }}<br>
**Lección:** {{ $datos['leccion'] ?? '' }}<br>
**Tarea:** {{ $datos['tarea'] ?? '' }}
</x-mail::panel>

<x-mail::button :url="config('app.url') . '/admin'">
Ir a la plataforma
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
