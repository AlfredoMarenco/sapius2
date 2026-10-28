<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Resultados de Exámenes</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            background-color: #ffffff;
            color: #333333;
            margin: 0;
            padding: 0;
        }

        .watermark {
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            opacity: 0.08;
            font-size: 7.5em;
            font-weight: bold;
            color: #002146;
            pointer-events: none;
            z-index: -1;
            white-space: nowrap;
        }

        header {
            background-color: #002146;
            color: #ffffff;
            padding: 16px 20px;
            text-align: center;
            margin-bottom: 15px;
        }

        .header-title {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            color: #ffffff;
            font-size: 11px;
            margin-top: 8px;
        }

        .meta-table td {
            border: none;
            padding: 3px 6px;
            text-align: left;
            vertical-align: top;
        }

        .meta-table strong {
            color: #b0c4de;
        }

        .legend-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin-bottom: 12px;
            font-size: 10px;
        }

        .legend-table td {
            padding: 5px 8px;
            border-radius: 4px;
            text-align: center;
            font-weight: 600;
        }

        .legend-nopresentado {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }

        .legend-bajo {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .legend-alto {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        table.results {
            border-collapse: collapse;
            width: 100%;
            margin-top: 5px;
        }

        table.results th,
        table.results td {
            border: 1px solid #cccccc;
            padding: 6px 8px;
            text-align: center;
        }

        table.results th {
            background-color: #002146;
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
        }

        tr.bajo {
            background-color: #f8d7da;
            color: #721c24;
        }

        tr.alto {
            background-color: #d4edda;
            color: #155724;
        }

        tr.nopresentado {
            background-color: #fff3cd;
            color: #856404;
        }

        tr.cerrado {
            background-color: #e2e3e5;
            color: #383d41;
        }

        .nota-cerrado {
            font-size: 9px;
            color: #721c24;
            display: block;
            margin-top: 2px;
            font-style: italic;
        }

        footer {
            margin-top: 25px;
            text-align: center;
            font-size: 10px;
            color: #777777;
            border-top: 1px solid #eeeeee;
            padding-top: 8px;
        }
    </style>
</head>

<body>
    <div class="watermark">SAPIUS</div>

    @php
        $user = $inscripcion->user ?? $inscripcion->User;
        $studentName = $user ? trim(($user->first_name ?? $user->name ?? '') . ' ' . ($user->last_name ?? $user->apellido ?? '')) : 'Alumno';
        if (empty($studentName)) {
            $studentName = $user->name ?? $user->email ?? 'Alumno';
        }
        $folio = $user ? ($user->id_folio ?? $user->folio ?? $user->id) : 'N/A';
        $university = $user ? ($user->university ?? $user->universidad_procedencia ?? 'N/A') : 'N/A';
        $course = $inscripcion->scheduledCourse->course ?? ($inscripcion->CursoProgramado->Curso ?? null);
        $courseTitle = $course->title ?? $course->titulo ?? 'Curso';
        $cohortIdentifier = $inscripcion->scheduledCourse->identificador ?? ($inscripcion->CursoProgramado->identificador ?? ('Cohorte #' . $inscripcion->curso_programado_id));
    @endphp

    <header>
        <div class="header-title">Reporte Individual de Evaluación</div>
        <table class="meta-table">
            <tr>
                <td style="width: 50%;"><strong>Alumno:</strong> {{ $studentName }}</td>
                <td style="width: 50%;"><strong>Curso:</strong> {{ $courseTitle }}</td>
            </tr>
            <tr>
                <td><strong>Folio:</strong> {{ $folio }}</td>
                <td><strong>Cohorte / Grupo:</strong> {{ $cohortIdentifier }}</td>
            </tr>
            <tr>
                <td><strong>Universidad:</strong> {{ $university }}</td>
                <td><strong>Fecha de Emisión:</strong> {{ date('d/m/Y H:i:s') }}</td>
            </tr>
        </table>
    </header>

    <table class="legend-table">
        <tr>
            <td class="legend-nopresentado">No presentado: Examen pendiente o no contestado</td>
            <td class="legend-bajo">Puntaje bajo: Requiere reforzamiento del tema</td>
            <td class="legend-alto">Puntaje satisfactorio: Demuestra dominio del contenido</td>
        </tr>
    </table>

    <table class="results">
        <thead>
            <tr>
                <th style="width: 45%; text-align: left;">Evaluación / Examen</th>
                <th style="width: 15%;">Tipo</th>
                <th style="width: 12%;">Total Preguntas</th>
                <th style="width: 12%;">Aciertos</th>
                <th style="width: 16%;">Puntaje Final</th>
            </tr>
        </thead>
        <tbody>
            @php $renderedCount = 0; @endphp
            @if(isset($lecciones) && count($lecciones) > 0)
                @foreach ($lecciones as $leccion)
                    @php $pruebas = $leccion->pruebas ?? $leccion->quizzes ?? collect(); @endphp
                    @foreach ($pruebas as $prueba)
                        @if (($prueba->activo ?? 'si') === 'si')
                            @php
                                $renderedCount++;
                                $examen = $examenes->firstWhere('prueba_id', $prueba->id);
                                $score = $examen ? ($examen->score_total ?? $examen->score ?? $examen->calificacion ?? 0) : 0;
                                $minScore = $prueba->min_score ?? 60;
                            @endphp
                            @if ($examen)
                                <tr class="{{ ($examen->eventos ?? false) ? 'cerrado' : ($score < $minScore ? 'bajo' : 'alto') }}">
                                    <td style="text-align: left;">{{ $prueba->titulo ?? $prueba->title ?? 'Evaluación' }}</td>
                                    <td>{{ $prueba->tipo ?? 'Quiz' }}</td>
                                    <td>{{ $examen->total_preguntas ?? $examen->aciertos ?? 0 }}</td>
                                    <td>{{ $examen->total_correctas ?? $examen->aciertos ?? 0 }}</td>
                                    <td>
                                        <strong>{{ is_numeric($score) ? number_format($score, 1) : $score }}</strong>
                                        @if($examen->eventos ?? false)
                                            <span class="nota-cerrado">Cerrado por normas del sitio</span>
                                        @endif
                                    </td>
                                </tr>
                            @else
                                <tr class="nopresentado">
                                    <td style="text-align: left;">{{ $prueba->titulo ?? $prueba->title ?? 'Evaluación' }}</td>
                                    <td>{{ $prueba->tipo ?? 'Quiz' }}</td>
                                    <td colspan="3"><em>No Presentado</em></td>
                                </tr>
                            @endif
                        @endif
                    @endforeach
                @endforeach
            @endif

            @if($renderedCount === 0 && isset($examenes) && count($examenes) > 0)
                {{-- Fallback si lecciones no traen pruebas explícitas: iterar exámenes directamente --}}
                @foreach($examenes as $examen)
                    @php
                        $quiz = $examen->quiz ?? $examen->Prueba;
                        $score = $examen->score_total ?? $examen->score ?? $examen->calificacion ?? 0;
                        $minScore = $quiz->min_score ?? 60;
                    @endphp
                    <tr class="{{ ($examen->eventos ?? false) ? 'cerrado' : ($score < $minScore ? 'bajo' : 'alto') }}">
                        <td style="text-align: left;">{{ $quiz->title ?? $quiz->titulo ?? ('Evaluación #' . $examen->prueba_id) }}</td>
                        <td>{{ $quiz->type ?? $quiz->tipo ?? 'Quiz' }}</td>
                        <td>{{ $examen->total_preguntas ?? 0 }}</td>
                        <td>{{ $examen->total_correctas ?? $examen->aciertos ?? 0 }}</td>
                        <td>
                            <strong>{{ is_numeric($score) ? number_format($score, 1) : $score }}</strong>
                        </td>
                    </tr>
                @endforeach
            @elseif($renderedCount === 0)
                <tr>
                    <td colspan="5" style="padding: 15px; color: #777777;"><em>No se registraron evaluaciones para este curso.</em></td>
                </tr>
            @endif
        </tbody>
    </table>

    <footer>
        Documento oficial generado automáticamente por la plataforma educativa Sapius.
    </footer>
</body>

</html>
