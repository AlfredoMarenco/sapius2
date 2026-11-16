@php
    $resolvedScheduled = $scheduledCourse ?? null;
    if (! $resolvedScheduled && isset($inscripcion)) {
        try {
            $resolvedScheduled = method_exists($inscripcion, 'scheduledCourse')
                ? $inscripcion->scheduledCourse
                : (method_exists($inscripcion, 'CursoProgramado') ? $inscripcion->CursoProgramado : null);
        } catch (\Throwable) {
            $resolvedScheduled = null;
        }
    }

    $resolvedCourse = $courseModel ?? null;
    if (! $resolvedCourse && $resolvedScheduled) {
        try {
            $resolvedCourse = method_exists($resolvedScheduled, 'course')
                ? $resolvedScheduled->course
                : (method_exists($resolvedScheduled, 'Curso') ? $resolvedScheduled->Curso : null);
        } catch (\Throwable) {
            $resolvedCourse = null;
        }
    }

    $resolvedUser = $studentUser ?? null;
    if (! $resolvedUser && isset($inscripcion)) {
        try {
            $resolvedUser = method_exists($inscripcion, 'user')
                ? $inscripcion->user
                : (method_exists($inscripcion, 'User') ? $inscripcion->User : null);
        } catch (\Throwable) {
            $resolvedUser = null;
        }
    }

    $resolvedTitle = $courseTitle
        ?? $resolvedCourse?->title
        ?? $resolvedCourse?->titulo
        ?? $resolvedScheduled?->identificador
        ?? $resolvedScheduled?->internal_id
        ?? 'SAPIUS';

    $studentName = $resolvedUser?->nombre_completo
        ?: ($resolvedUser?->nombre ?? $resolvedUser?->name ?? 'Estudiante');

    $studentUsername = $resolvedUser?->username ?? '';

    $categoryName = strtolower((string) ($resolvedScheduled?->category?->name ?? ''));
    $isGuide = str_contains($categoryName, 'guia') || str_contains($categoryName, 'guía');
    $isSim = str_contains($categoryName, 'simulador');

    $fechaInicio = $resolvedScheduled?->fecha_inicio ?? $resolvedScheduled?->start_date ?? null;
    $fechaFin = $resolvedScheduled?->fecha_fin ?? $resolvedScheduled?->end_date ?? null;
@endphp
<x-mail::message>
# Curso {{ $resolvedTitle }}
<div style="text-align: center; color: #cc0000; font-size: 16px; margin-bottom: 20px;">
**Nosotros sabemos el enorme esfuerzo y compromiso dedicado a tu preparación.**
</div>

¡Buenos días, **{{ $studentName }}**!

Confirmamos la recepción de tu pago o validación de inscripción, por el cual ya cuentas con acceso al curso.

**Usuario:** {{ $studentUsername }}

@if($isGuide)
*Esta guía se encuentra disponible para su descarga y consulta inmediata en tu panel de alumno.*<br>
Te recomendamos leer cuidadosamente las instrucciones para ingresar a la plataforma y descargar tu guía. En caso de que presentes alguna duda, comunícate a **Sapius Soporte vía WhatsApp al 999 364 8594**.
@elseif($isSim)
*Estos simuladores se encuentran divididos en áreas y cada examen incluye intentos con su respectiva retroalimentación.*<br>
Te compartimos las instrucciones para ingresar a la plataforma y al apartado de simuladores. En caso de que presentes alguna duda, comunícate a **Sapius Soporte vía WhatsApp al 999 364 8594**.
@else
*Ya puedes acceder a todas las lecciones, videos y material complementario de tu curso.*<br>
Te compartimos las instrucciones para ingresar a la plataforma y comenzar tus clases. En caso de que presentes alguna duda, comunícate a **Sapius Soporte vía WhatsApp al 999 364 8594**.
@endif

@if($fechaInicio && $fechaFin)
<x-mail::panel>
**Nota:** El acceso se abre el **{{ \Carbon\Carbon::parse($fechaInicio)->translatedFormat('d \d\e F') }}** y se cierra el **{{ \Carbon\Carbon::parse($fechaFin)->translatedFormat('d \d\e F') }} a las 11:59 pm.**
</x-mail::panel>
@endif

### 📌 Factura
Si requieres factura, favor de enviarnos tu Constancia de Situación Fiscal antes del día 25 del mes en curso.

---

### 🔒 Normas importantes de la plataforma:
- No debe abrirse en dispositivos móviles (tabletas o smartphones). En caso contrario, se negará el acceso de manera permanente.
- Solo se permite un acceso por usuario y dispositivo. Compartir contraseña o permitir acceso a terceros ocasionará la suspensión definitiva.
- Durante la presentación del simulador no se debe tener abierta ninguna otra página ni aplicación, incluyendo servicios de mensajería como WhatsApp.
- Está prohibido realizar capturas de pantalla, grabaciones, fotografías, impresiones o copias del material. El incumplimiento implica la cancelación inmediata del acceso.

<br>

**Contacto:**<br>
Correo: [sapius.com.mx@gmail.com](mailto:sapius.com.mx@gmail.com)<br>
Móvil: 9992-98-87-44

<x-mail::button :url="config('app.url') . '/login'">
Acceder a SAPIUS
</x-mail::button>

🌟 ¡Te deseamos mucho éxito!<br>
Recuerda que en Sapius… “Tu formación, nuestra pasión”
</x-mail::message>
