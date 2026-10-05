<x-mail::message>
# Resultados de Examen

Has finalizado la prueba con el siguiente puntaje:

<x-mail::table>
| Total preguntas | Respuestas correctas | Puntaje final |
|:---------------:|:--------------------:|:-------------:|
| {{ $examen->total_preguntas ?? $examen['total_preguntas'] ?? 0 }} | {{ $examen->total_correctas ?? $examen['total_correctas'] ?? 0 }} | **{{ $examen->score_total ?? $examen['score_total'] ?? 0 }}** |
</x-mail::table>

<x-mail::button :url="config('app.url') . '/alumno'">
Ver detalles en mi panel
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
