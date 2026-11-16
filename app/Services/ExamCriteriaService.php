<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class ExamCriteriaService
{
    protected static string $filePath = 'config/exam_criteria.json';

    public static function getDefaults(): array
    {
        return [
            'EGEL' => [
                'title' => 'Criterios CENEVAL EGEL Plus para determinar los niveles de desempeño',
                'subtitle' => 'Escala oficial CENEVAL (700 a 1300 puntos)',
                'columns' => ['Nivel de Desempeño', 'Rango de Puntaje'],
                'rows' => [
                    ['label' => 'Aún no satisfactorio', 'value' => '700 - 999', 'badge' => 'danger'],
                    ['label' => 'Satisfactorio', 'value' => '1000 - 1149', 'badge' => 'success'],
                    ['label' => 'Sobresaliente', 'value' => '1150 - 1300', 'badge' => 'excellent'],
                ],
            ],
            'EXANI' => [
                'title' => 'Puntajes de Referencia EXANI II por Licenciatura',
                'subtitle' => 'Puntaje mínimo referencial (Escala 700 a 1300 puntos)',
                'columns' => ['Licenciatura', 'Puntaje Mínimo'],
                'rows' => [
                    ['label' => 'Médico Cirujano', 'value' => '1200', 'badge' => 'info'],
                    ['label' => 'Odontología', 'value' => '1125', 'badge' => 'info'],
                    ['label' => 'Nutrición', 'value' => '1100', 'badge' => 'info'],
                    ['label' => 'Derecho', 'value' => '1005', 'badge' => 'info'],
                    ['label' => 'Administración de Empresas', 'value' => '950', 'badge' => 'info'],
                ],
            ],
            'ENARM' => [
                'title' => 'Puntajes de Referencia ENARM por Especialidad',
                'subtitle' => 'Puntaje máximo y mínimo histórico referencial',
                'columns' => ['Especialidad', 'Puntaje Máximo', 'Puntaje Mínimo'],
                'rows' => [
                    ['label' => 'Anatomía Patológica', 'max' => '77.111', 'value' => '65.778'],
                    ['label' => 'Anestesiología', 'max' => '79.778', 'value' => '67.111'],
                    ['label' => 'Audiología, Otoneurología y Foniatría', 'max' => '77.111', 'value' => '69.333'],
                    ['label' => 'Calidad de la Atención Clínica', 'max' => '80.889', 'value' => '64.444'],
                    ['label' => 'Cirugía General', 'max' => '85.778', 'value' => '72.889'],
                    ['label' => 'Epidemiología', 'max' => '75.778', 'value' => '61.556'],
                    ['label' => 'Genética Médica', 'max' => '80.000', 'value' => '68.889'],
                    ['label' => 'Geriatría', 'max' => '78.667', 'value' => '68.667'],
                    ['label' => 'Ginecología y Obstetricia', 'max' => '82.667', 'value' => '68.444'],
                    ['label' => 'Imagenología Diagnóstica y Terapéutica', 'max' => '79.556', 'value' => '66.000'],
                    ['label' => 'Medicina de la Actividad Física y Deportiva', 'max' => '78.444', 'value' => '71.778'],
                    ['label' => 'Medicina de Rehabilitación', 'max' => '76.667', 'value' => '66.222'],
                    ['label' => 'Medicina de Urgencias', 'max' => '77.778', 'value' => '60.000'],
                    ['label' => 'Medicina del Trabajo y Ambiental', 'max' => '77.556', 'value' => '64.000'],
                    ['label' => 'Medicina Familiar', 'max' => '79.778', 'value' => '52.000'],
                    ['label' => 'Medicina Interna', 'max' => '84.667', 'value' => '70.000'],
                    ['label' => 'Medicina Legal', 'max' => '71.333', 'value' => '66.667'],
                    ['label' => 'Medicina Nuclear e Imagenología Molecular', 'max' => '71.778', 'value' => '67.111'],
                    ['label' => 'Medicina Preventiva', 'max' => '77.778', 'value' => '67.556'],
                    ['label' => 'Neumología', 'max' => '78.000', 'value' => '70.667'],
                    ['label' => 'Oftalmología', 'max' => '82.444', 'value' => '73.333'],
                    ['label' => 'Otorrinolaringología y Cirugía de Cabeza y Cuello', 'max' => '82.444', 'value' => '73.111'],
                    ['label' => 'Patología Clínica', 'max' => '78.667', 'value' => '58.444'],
                    ['label' => 'Pediatría', 'max' => '89.111', 'value' => '68.444'],
                    ['label' => 'Psiquiatría', 'max' => '83.556', 'value' => '69.333'],
                    ['label' => 'Radio Oncología', 'max' => '75.778', 'value' => '68.222'],
                    ['label' => 'Traumatología y Ortopedia', 'max' => '90.000', 'value' => '71.333'],
                ],
            ],
        ];
    }

    public static function getAll(): array
    {
        $defaults = self::getDefaults();

        try {
            if (Storage::disk('local')->exists(self::$filePath)) {
                $content = Storage::disk('local')->get(self::$filePath);
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    return array_replace_recursive($defaults, $decoded);
                }
            }
        } catch (\Throwable $e) {
            // Fallback to defaults
        }

        return $defaults;
    }

    public static function save(array $criteria): void
    {
        Storage::disk('local')->put(self::$filePath, json_encode($criteria, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}
