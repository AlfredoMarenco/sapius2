<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use PhpOffice\PhpSpreadsheet\IOFactory;

class QuizImportController extends Controller
{
    public function import(Request $request, Quiz $quiz)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB Max
        ]);

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            if (count($rows) < 2) {
                return back()->with('error', 'El archivo parece estar vacío o no tiene la cabecera correcta.');
            }

            $header = array_map('strtolower', array_map('trim', $rows[0]));
            
            // Buscar índices de las columnas especiales al final
            $correctaIdx = array_search('correcta', $header);
            $scoreIdx = array_search('score', $header);
            $imagenIdx = array_search('imagen', $header);

            if ($correctaIdx === false || $scoreIdx === false) {
                return back()->with('error', 'El archivo no tiene el formato correcto. Faltan las columnas "correcta" o "score".');
            }

            $importedCount = 0;

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];

                $preguntaText = trim($row[1] ?? '');
                
                // Ignorar filas donde no haya pregunta
                if (empty($preguntaText)) {
                    continue;
                }

                $slug = trim($row[0] ?? '');
                $retro = trim($row[2] ?? '');
                $correctaVal = trim($row[$correctaIdx] ?? '1');
                $score = floatval(trim($row[$scoreIdx] ?? '1'));
                $imagen = $imagenIdx !== false ? trim($row[$imagenIdx] ?? '') : null;

                // Crear la pregunta
                $question = Question::create([
                    'quiz_id' => $quiz->id,
                    'text' => $preguntaText,
                    'explanation' => $retro,
                    'points' => $score,
                    'image' => $imagen,
                    'is_active' => 'si'
                ]);

                // Procesar las respuestas
                // Empiezan en índice 3 y terminan en $correctaIdx - 1
                $answerIndex = 1;
                for ($j = 3; $j < $correctaIdx; $j++) {
                    $respuestaText = trim($row[$j] ?? '');
                    if (!empty($respuestaText)) {
                        $isCorrect = (intval($correctaVal) === $answerIndex);
                        
                        Answer::create([
                            'question_id' => $question->id,
                            'text' => $respuestaText,
                            'is_correct' => $isCorrect
                        ]);
                    }
                    $answerIndex++;
                }

                $importedCount++;
            }

            return back()->with('success', "Se han importado {$importedCount} preguntas correctamente.");

        } catch (\Exception $e) {
            \Log::error('Error importando preguntas: ' . $e->getMessage());
            return back()->with('error', 'Hubo un error procesando el archivo. Por favor revisa el formato. Detalles: ' . $e->getMessage());
        }
    }
}
