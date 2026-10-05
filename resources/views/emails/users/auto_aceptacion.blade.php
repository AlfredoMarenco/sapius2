<x-mail::message>
# Curso {{ $inscripcion->course->title ?? $inscripcion->CursoProgramado->identificador ?? 'SAPIUS' }}
<div style="text-align: center; color: #cc0000; font-size: 16px; margin-bottom: 20px;">
**Nosotros sabemos el enorme esfuerzo y compromiso dedicado a tu preparación.**
</div>

¡Buenos días, **{{ $inscripcion->user->nombre ?? $inscripcion->User->nombre_completo ?? 'Estudiante' }}**!

Confirmamos la recepción de tu pago o validación de inscripción, por el cual ya cuentas con acceso al curso.

**Usuario:** {{ $inscripcion->user->username ?? $inscripcion->User->username ?? '' }}

@php
    // Manejo de compatibilidad con Sapius 2 y Sapius 1
    $isGuide = false;
    $isSim = false;
    $fechaInicio = $inscripcion->cohort->fecha_inicio ?? $inscripcion->CursoProgramado->fecha_inicio ?? null;
    $fechaFin = $inscripcion->cohort->fecha_fin ?? $inscripcion->CursoProgramado->fecha_fin ?? null;
@endphp

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
