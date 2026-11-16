<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class QuizImportController extends Controller
{
    public function import(Request $request, Quiz $quiz)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            if (count($rows) < 2) {
                return back()->with('error', 'El archivo parece estar vacío o no tiene la cabecera correcta.');
            }

            $header = array_map(fn ($h) => mb_strtolower(trim((string) $h)), $rows[0]);

            $slugIdx = $this->findColumnIndex($header, ['slug', 'caso', 'grupo', 'caso_clinico']);
            $preguntaIdx = $this->findColumnIndex($header, ['pregunta', 'reactivo', 'text', 'question']);
            $retroIdx = $this->findColumnIndex($header, ['retroalimentacion', 'retroalimentación', 'retro', 'explicacion', 'explicación', 'opciones', 'explanation', 'justificacion', 'justificación']);
            $correctaIdx = $this->findColumnIndex($header, ['correcta', 'respuesta_correcta', 'correct']);
            $scoreIdx = $this->findColumnIndex($header, ['score', 'puntos', 'points', 'puntaje', 'valor']);
            $imagenIdx = $this->findColumnIndex($header, ['imagen', 'image', 'img']);

            if ($preguntaIdx === false || $correctaIdx === false || $scoreIdx === false) {
                return back()->with('error', 'El archivo no tiene el formato correcto. Faltan columnas requeridas ("pregunta", "correcta" o "score").');
            }

            // Resolver dinámicamente columnas de respuestas
            $reserved = array_filter(
                [$slugIdx, $preguntaIdx, $retroIdx, $correctaIdx, $scoreIdx, $imagenIdx],
                fn ($v) => $v !== false
            );

            $answerColumnIndices = [];
            foreach ($header as $idx => $colName) {
                if (in_array($idx, $reserved, true)) {
                    continue;
                }
                if (preg_match('/^(respuesta|opcion|opción|answer|alternativa|op)[_\s\-]?\d*$/i', $colName) || in_array($colName, ['a', 'b', 'c', 'd', 'e', 'f'], true)) {
                    $answerColumnIndices[] = $idx;
                }
            }

            // Fallback posicional para hojas sin cabeceras estándar en respuestas (entre retro/pregunta y correcta)
            if (empty($answerColumnIndices)) {
                $startAnswerIdx = max(array_filter([$slugIdx, $preguntaIdx, $retroIdx], fn ($v) => $v !== false)) + 1;
                for ($col = $startAnswerIdx; $col < $correctaIdx; $col++) {
                    if (! in_array($col, $reserved, true)) {
                        $answerColumnIndices[] = $col;
                    }
                }
            }

            if (empty($answerColumnIndices)) {
                return back()->with('error', 'No se encontraron columnas de respuestas en el archivo.');
            }

            // Extraer imágenes incrustadas (DrawingCollection) hacia storage/app/images/preguntas/
            $extractedDrawingsByRow = $this->extractWorksheetDrawings($worksheet, $quiz->id);

            $importedCount = DB::transaction(function () use (
                $rows,
                $quiz,
                $slugIdx,
                $preguntaIdx,
                $retroIdx,
                $correctaIdx,
                $scoreIdx,
                $imagenIdx,
                $answerColumnIndices,
                $extractedDrawingsByRow
            ) {
                $count = 0;

                for ($i = 1; $i < count($rows); $i++) {
                    $row = $rows[$i];
                    $excelRowNumber = $i + 1;

                    $preguntaText = trim((string) ($row[$preguntaIdx] ?? ''));
                    if ($preguntaText === '') {
                        continue;
                    }

                    $slug = $slugIdx !== false ? trim((string) ($row[$slugIdx] ?? '')) : '';
                    $retro = $retroIdx !== false ? trim((string) ($row[$retroIdx] ?? '')) : '';
                    $correctaRaw = trim((string) ($row[$correctaIdx] ?? '1'));
                    $correctaNumber = $this->parseCorrectAnswerIndex($correctaRaw);
                    $scoreRaw = trim((string) ($row[$scoreIdx] ?? '1'));
                    $score = is_numeric($scoreRaw) ? (float) $scoreRaw : 1.0;

                    $imagen = $extractedDrawingsByRow[$excelRowNumber] ?? null;
                    if (! $imagen && $imagenIdx !== false) {
                        $cellImg = trim((string) ($row[$imagenIdx] ?? ''));
                        $imagen = $cellImg !== '' ? basename($cellImg) : null;
                    }

                    $questionData = [
                        'quiz_id' => $quiz->id,
                        'text' => $preguntaText,
                        'explanation' => $retro !== '' ? $retro : null,
                        'points' => $score,
                        'image' => $imagen,
                        'is_active' => 'si',
                    ];
                    if ($slug !== '') {
                        $questionData['slug'] = $slug;
                    }

                    $question = Question::create($questionData);

                    $answerPosition = 1;
                    foreach ($answerColumnIndices as $colIdx) {
                        $respuestaText = trim((string) ($row[$colIdx] ?? ''));
                        if ($respuestaText !== '') {
                            Answer::create([
                                'question_id' => $question->id,
                                'text' => $respuestaText,
                                'is_correct' => ($correctaNumber === $answerPosition),
                                'position' => $answerPosition,
                                'is_active' => 'si',
                            ]);
                        }
                        $answerPosition++;
                    }

                    $count++;
                }

                return $count;
            });

            return back()->with('success', "Se han importado {$importedCount} preguntas correctamente.");
        } catch (\Throwable $e) {
            Log::error('Error importando preguntas: '.$e->getMessage());

            return back()->with('error', 'Hubo un error procesando el archivo. Por favor revisa el formato. Detalles: '.$e->getMessage());
        }
    }

    /**
     * Exporta el banco de preguntas de un quiz en formato .xlsx compatible con import().
     */
    public function export(Quiz $quiz)
    {
        $quiz->load(['questions' => function ($q) {
            $q->where('activo', 'si')
                ->orderBy('id', 'asc')
                ->with(['answers' => function ($a) {
                    $a->where('activo', 'si')
                        ->orderBy('posicion', 'asc')
                        ->orderBy('id', 'asc');
                }]);
        }]);

        $maxAnswers = 4;
        foreach ($quiz->questions as $question) {
            $maxAnswers = max($maxAnswers, $question->answers->count());
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Preguntas');

        $headers = ['slug', 'pregunta', 'retroalimentacion'];
        for ($n = 1; $n <= $maxAnswers; $n++) {
            $headers[] = "respuesta_{$n}";
        }
        $headers[] = 'correcta';
        $headers[] = 'score';
        $headers[] = 'imagen';

        foreach ($headers as $idx => $title) {
            $coord = Coordinate::stringFromColumnIndex($idx + 1).'1';
            $sheet->setCellValue($coord, $title);
        }

        $lastColLetter = Coordinate::stringFromColumnIndex(count($headers));
        $sheet->getStyle("A1:{$lastColLetter}1")->getFont()->setBold(true)->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle("A1:{$lastColLetter}1")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF002146');
        $sheet->getStyle("A1:{$lastColLetter}1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $rowIdx = 2;
        foreach ($quiz->questions as $question) {
            $sheet->setCellValue("A{$rowIdx}", $question->slug ?? '');
            $sheet->setCellValue("B{$rowIdx}", $question->pregunta ?? $question->text ?? '');
            $sheet->setCellValue("C{$rowIdx}", $question->opciones ?? $question->explanation ?? '');

            $correctIndex = 1;
            $answers = $question->answers->values();
            for ($a = 0; $a < $maxAnswers; $a++) {
                $colCoord = Coordinate::stringFromColumnIndex(4 + $a).$rowIdx;
                $ans = $answers->get($a);
                if ($ans) {
                    $sheet->setCellValue($colCoord, $ans->respuesta ?? $ans->text ?? '');
                    if ((int) ($ans->correcto ?? 0) === 1 || $ans->is_correct === true) {
                        $correctIndex = $a + 1;
                    }
                } else {
                    $sheet->setCellValue($colCoord, '');
                }
            }

            $correctaCol = Coordinate::stringFromColumnIndex(4 + $maxAnswers).$rowIdx;
            $scoreCol = Coordinate::stringFromColumnIndex(5 + $maxAnswers).$rowIdx;
            $imagenColIdx = 6 + $maxAnswers;
            $imagenCol = Coordinate::stringFromColumnIndex($imagenColIdx).$rowIdx;

            $sheet->setCellValue($correctaCol, $correctIndex);
            $sheet->setCellValue($scoreCol, (float) ($question->score ?? 1));

            $imageFilename = $question->imagen ?? $question->image ?? '';
            $sheet->setCellValue($imagenCol, $imageFilename);

            if ($imageFilename !== '') {
                $fullImagePath = storage_path('app/images/preguntas/'.basename($imageFilename));
                $ext = strtolower(pathinfo($fullImagePath, PATHINFO_EXTENSION));
                if (is_file($fullImagePath) && in_array($ext, ['jpg', 'jpeg', 'png', 'gif'], true)) {
                    $drawing = new Drawing;
                    $drawing->setPath($fullImagePath);
                    $drawing->setCoordinates($imagenCol);
                    $drawing->setHeight(48);
                    $drawing->setWorksheet($sheet);
                    $sheet->getRowDimension($rowIdx)->setRowHeight(40);
                }
            }

            $rowIdx++;
        }

        for ($i = 1; $i <= count($headers); $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $cleanTitle = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $quiz->titulo ?? $quiz->title ?? 'Quiz_'.$quiz->id);
        $filename = "Banco_Preguntas_{$cleanTitle}.xlsx";
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * @param  array<int, string>  $header
     * @param  array<int, string>  $aliases
     */
    protected function findColumnIndex(array $header, array $aliases): int|false
    {
        foreach ($aliases as $alias) {
            $idx = array_search($alias, $header, true);
            if ($idx !== false) {
                return $idx;
            }
        }

        return false;
    }

    protected function parseCorrectAnswerIndex(string $raw): int
    {
        $clean = strtoupper(trim($raw));
        if (is_numeric($clean)) {
            return max(1, (int) $clean);
        }
        if (preg_match('/^[A-Z]$/', $clean)) {
            return (ord($clean) - ord('A')) + 1;
        }

        return 1;
    }

    /**
     * Extrae imágenes incrustadas de PhpSpreadsheet hacia storage/app/images/preguntas/.
     *
     * @return array<int, string> Mapa [excelRowNumber => filename]
     */
    protected function extractWorksheetDrawings($worksheet, int $quizId): array
    {
        $map = [];
        $drawings = $worksheet->getDrawingCollection();
        if (! $drawings || count($drawings) === 0) {
            return $map;
        }

        $destDir = storage_path('app/images/preguntas');
        if (! is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        foreach ($drawings as $drawing) {
            try {
                $coords = $drawing->getCoordinates();
                if (! $coords) {
                    continue;
                }
                [, $rowNumber] = Coordinate::coordinateFromString($coords);
                $rowInt = (int) $rowNumber;

                if ($drawing instanceof MemoryDrawing) {
                    $mime = $drawing->getMimeType();
                    $ext = match ($mime) {
                        MemoryDrawing::MIMETYPE_JPEG => 'jpg',
                        MemoryDrawing::MIMETYPE_GIF => 'gif',
                        default => 'png',
                    };
                    $renderingFn = $drawing->getRenderingFunction();
                    $resource = $drawing->getImageResource();
                    if (! $resource || ! is_callable($renderingFn)) {
                        continue;
                    }
                    ob_start();
                    call_user_func($renderingFn, $resource);
                    $contents = ob_get_clean();
                    if (! $contents) {
                        continue;
                    }
                    $filename = 'preg_'.$quizId.'_'.$rowInt.'_'.Str::random(8).'.'.$ext;
                    file_put_contents($destDir.DIRECTORY_SEPARATOR.$filename, $contents);
                    $map[$rowInt] = $filename;
                } elseif ($drawing instanceof Drawing) {
                    $sourcePath = $drawing->getPath();
                    if (! $sourcePath) {
                        continue;
                    }
                    $contents = @file_get_contents($sourcePath);
                    if ($contents === false) {
                        continue;
                    }
                    $ext = strtolower($drawing->getExtension() ?: 'png');
                    if (! in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                        $ext = 'png';
                    }
                    $filename = 'preg_'.$quizId.'_'.$rowInt.'_'.Str::random(8).'.'.$ext;
                    file_put_contents($destDir.DIRECTORY_SEPARATOR.$filename, $contents);
                    $map[$rowInt] = $filename;
                }
            } catch (\Throwable $e) {
                Log::warning('No se pudo extraer imagen incrustada del Excel: '.$e->getMessage());
            }
        }

        return $map;
    }
}
