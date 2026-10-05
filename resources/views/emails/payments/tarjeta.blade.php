<x-mail::message>
# ¡Hola {{ $datos['name_alumno'] }}!

Has adquirido exitosamente el curso. <br>
¡Gracias por tu compra!

<x-mail::panel>
**Curso:** {{ $datos['identificador'] }}<br>
**Monto:** ${{ number_format($datos['precio'], 2) }} MXN<br>
**Id Transacción:** {{ $datos['id_carge'] }}
</x-mail::panel>

Si tienes alguna duda, responde a este correo y te ayudaremos.

> **Nota:** Debes esperar la aprobación de tu pago para poder acceder al contenido del curso.

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
