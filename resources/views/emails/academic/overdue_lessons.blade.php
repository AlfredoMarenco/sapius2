<x-mail::message>
# Hola {{ $student->nombre ?? $student['nombre'] ?? 'Estudiante' }},

Hemos notado que te has atrasado en el contenido de tu curso. Mantener un ritmo constante es clave para completar tu formación con éxito.

### Lecciones pendientes de completar:

@foreach ($overdueLessons as $lesson)
<x-mail::panel>
**Módulo:** {{ $lesson['modulo'] }}<br>
**Lección:** {{ $lesson['titulo'] }}

**Fecha Límite:** {{ $lesson['fecha_final'] }} 
@if($lesson['is_expired'] ?? false)
<span style="color: #C53030;">**(CERRADA)**</span>
@else
<span style="color: #B7791F;">**(ATRASADA)**</span>
@endif
</x-mail::panel>
@endforeach

Te animamos a retomar tus clases lo antes posible para no perder el hilo del aprendizaje.

<x-mail::button :url="config('app.url') . '/alumno'">
Ir a mis cursos
</x-mail::button>

Si tienes alguna duda o necesitas apoyo técnico, no dudes en contactarnos.

Atentamente,<br>
**El equipo de {{ config('app.name') }}**
</x-mail::message>
