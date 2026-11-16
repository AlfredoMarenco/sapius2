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

        $resolveBestAttempt = function ($examenesCollection, $pruebaId) {
            $group = $examenesCollection->where('prueba_id', $pruebaId);
            if ($group->isEmpty()) {
                return null;
            }
            $finished = $group->where('finalizado', 'si');
            if ($finished->isNotEmpty()) {
                return $finished->sortByDesc(fn ($e) => (float) ($e->score_total ?? $e->score ?? $e->calificacion ?? 0))->first();
            }
            return $group->sortByDesc('id')->first();
        };

        $resolveMinScore = function ($prueba) {
            $tipo = strtoupper((string) ($prueba->tipo ?? $prueba->type ?? 'EXANI'));
            if (str_contains($tipo, 'ENARM')) {
                return (float) ($prueba->min_score ?? 60);
            }
            return (isset($prueba->min_score) && (float) $prueba->min_score >= 700)
                ? (float) $prueba->min_score
                : 1000.0;
        };

        $hasEventos = function ($examen) {
            $raw = $examen->eventos ?? null;
            if (is_bool($raw)) {
                return $raw;
            }
            if (is_string($raw)) {
                $decoded = json_decode($raw, true);
                return is_array($decoded) && count($decoded) > 0;
            }
            return is_array($raw) && count($raw) > 0;
        };
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
            <td class="legend-bajo">Puntaje bajo: Requiere reforzamiento (CENEVAL &lt; 1000)</td>
            <td class="legend-alto">Puntaje satisfactorio: Demuestra dominio (CENEVAL &ge; 1000)</td>
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
                                $examen = $resolveBestAttempt($examenes, $prueba->id);
                                $score = $examen ? (float) ($examen->score_total ?? $examen->score ?? $examen->calificacion ?? 0) : 0.0;
                                $minScore = $resolveMinScore($prueba);
                                $tieneEventos = $examen ? $hasEventos($examen) : false;
                            @endphp
                            @if ($examen)
                                <tr class="{{ $tieneEventos ? 'cerrado' : ($score < $minScore ? 'bajo' : 'alto') }}">
                                    <td style="text-align: left;">{{ $prueba->titulo ?? $prueba->title ?? 'Evaluación' }}</td>
                                    <td>{{ $prueba->tipo ?? $prueba->type ?? 'Quiz' }}</td>
                                    <td>{{ $examen->total_preguntas ?? 0 }}</td>
                                    <td>{{ $examen->total_correctas ?? $examen->aciertos ?? 0 }}</td>
                                    <td>
                                        <strong>{{ number_format($score, 1) }}</strong>
                                        @if($tieneEventos)
                                            <span class="nota-cerrado">Con incidencias / normas del sitio</span>
                                        @endif
                                    </td>
                                </tr>
                            @else
                                <tr class="nopresentado">
                                    <td style="text-align: left;">{{ $prueba->titulo ?? $prueba->title ?? 'Evaluación' }}</td>
                                    <td>{{ $prueba->tipo ?? $prueba->type ?? 'Quiz' }}</td>
                                    <td colspan="3"><em>No Presentado</em></td>
                                </tr>
                            @endif
                        @endif
                    @endforeach
                @endforeach
            @endif

            @if($renderedCount === 0 && isset($examenes) && count($examenes) > 0)
                @foreach($examenes->groupBy('prueba_id') as $pruebaId => $grupo)
                    @php
                        $examen = $resolveBestAttempt($examenes, $pruebaId);
                        $quiz = $examen->quiz ?? $examen->Prueba;
                        $score = (float) ($examen->score_total ?? $examen->score ?? $examen->calificacion ?? 0);
                        $minScore = $resolveMinScore($quiz);
                        $tieneEventos = $hasEventos($examen);
                    @endphp
                    <tr class="{{ $tieneEventos ? 'cerrado' : ($score < $minScore ? 'bajo' : 'alto') }}">
                        <td style="text-align: left;">{{ $quiz->title ?? $quiz->titulo ?? ('Evaluación #' . $examen->prueba_id) }}</td>
                        <td>{{ $quiz->type ?? $quiz->tipo ?? 'Quiz' }}</td>
                        <td>{{ $examen->total_preguntas ?? 0 }}</td>
                        <td>{{ $examen->total_correctas ?? $examen->aciertos ?? 0 }}</td>
                        <td>
                            <strong>{{ number_format($score, 1) }}</strong>
                            @if($tieneEventos)
                                <span class="nota-cerrado">Con incidencias / normas del sitio</span>
                            @endif
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
