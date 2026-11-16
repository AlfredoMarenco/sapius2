<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MiniTestConfigService
{
    public const CONFIG_PATH = 'config/mini_test.json';

    /**
     * Valid exam areas for filtering recommendation cards.
     *
     * @var array<int, string>
     */
    public const VALID_AREAS = ['nutricion', 'medicina', 'otro', 'general'];

    /**
     * Valid CTA modes for recommendation cards.
     *
     * @var array<int, string>
     */
    public const VALID_PURCHASE_MODES = ['buy', 'presale', 'waitlist', 'whatsapp'];

    public static function getDefaultConfig(): array
    {
        return [
            'header' => [
                'badge' => 'Mini-Test Vocacional Sapius',
                'title' => 'Encuentra tu opción ideal',
                'resultSubtitle' => 'Resultado personalizado según tus objetivos',
            ],
            'questions' => [
                [
                    'id' => 'exam',
                    'title' => '¿Qué examen vas a presentar?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'nutricion',
                            'label' => 'EGEL Nutrición',
                            'helper' => 'Preparación integral para EGEL Plus en Nutrición.',
                            'areaFilter' => 'nutricion',
                            'weights' => [],
                        ],
                        [
                            'id' => 'medicina',
                            'label' => 'EGEL Medicina',
                            'helper' => 'Preparación integral para EGEL Plus en Medicina General.',
                            'areaFilter' => 'medicina',
                            'weights' => [],
                        ],
                        [
                            'id' => 'otro',
                            'label' => 'Otro CENEVAL',
                            'helper' => 'EXANI-I, EXANI-II, EXANI-III u otra evaluación.',
                            'areaFilter' => 'otro',
                            'weights' => [
                                'otro_ceneval' => 10,
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'timing',
                    'title' => '¿Cuándo presentas tu examen?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'menos_1m',
                            'label' => 'En menos de 1 mes',
                            'helper' => 'Necesitas práctica intensiva y repaso puntual.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_simulador_compacto' => 4,
                                'nutricion_duo_guia_simuladores' => 3,
                                'nutricion_guia_digital' => 1,
                                'medicina_simulador_individual' => 4,
                                'medicina_paquete_5_simuladores' => 3,
                                'medicina_guia_digital' => 1,
                            ],
                        ],
                        [
                            'id' => '2_4m',
                            'label' => 'En 2 a 4 meses',
                            'helper' => 'Tiempo ideal para el programa estructurado de 10 semanas.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_premium' => 3,
                                'nutricion_curso_asincronico' => 3,
                                'nutricion_duo_guia_simuladores' => 2,
                                'nutricion_guia_digital' => 2,
                                'medicina_curso_completo' => 3,
                                'medicina_paquete_5_simuladores' => 2,
                                'medicina_duo_2027' => 1,
                                'medicina_guia_digital' => 2,
                            ],
                        ],
                        [
                            'id' => 'mas_4m',
                            'label' => 'En más de 4 meses o 2027',
                            'helper' => 'Excelente anticipación o acceso en preventa 2027.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_premium' => 3,
                                'nutricion_curso_asincronico' => 2,
                                'nutricion_guia_digital' => 2,
                                'medicina_curso_completo' => 3,
                                'medicina_duo_2027' => 4,
                                'medicina_guia_digital' => 2,
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'hours',
                    'title' => '¿Cuántas horas al día puedes dedicar al estudio?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'menos_1h',
                            'label' => 'Menos de 1 hora',
                            'helper' => 'Avance concreto con reactivos y lecturas dirigidas.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_simulador_compacto' => 2,
                                'nutricion_guia_digital' => 2,
                                'nutricion_duo_guia_simuladores' => 1,
                                'medicina_simulador_individual' => 2,
                                'medicina_guia_digital' => 2,
                                'medicina_paquete_5_simuladores' => 1,
                            ],
                        ],
                        [
                            'id' => '1_2h',
                            'label' => '1 a 2 horas diarias',
                            'helper' => 'Ritmo equilibrado para videoclases y simuladores diarios.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_asincronico' => 2,
                                'nutricion_duo_guia_simuladores' => 2,
                                'nutricion_guia_digital' => 1,
                                'nutricion_curso_premium' => 1,
                                'medicina_curso_completo' => 2,
                                'medicina_paquete_5_simuladores' => 2,
                                'medicina_duo_2027' => 1,
                                'medicina_guia_digital' => 1,
                            ],
                        ],
                        [
                            'id' => 'mas_2h',
                            'label' => 'Más de 2 horas',
                            'helper' => 'Dedicación completa con clases, lecturas y asesorías.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_premium' => 3,
                                'nutricion_curso_asincronico' => 2,
                                'medicina_curso_completo' => 3,
                                'medicina_duo_2027' => 2,
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'style',
                    'title' => '¿Cómo prefieres estudiar?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'en_vivo',
                            'label' => 'Con asesorías dominicales en vivo y acompañamiento',
                            'helper' => 'Resolución de dudas en vivo con docentes expertos y garantía.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_premium' => 5,
                                'medicina_curso_completo' => 5,
                            ],
                        ],
                        [
                            'id' => 'asincronico',
                            'label' => 'A mi propio ritmo 100% asincrónico',
                            'helper' => 'Videoclases grabadas, tareas y exámenes disponibles 24/7.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_asincronico' => 5,
                                'nutricion_duo_guia_simuladores' => 1,
                                'medicina_curso_completo' => 3,
                                'medicina_duo_2027' => 2,
                            ],
                        ],
                        [
                            'id' => 'practica',
                            'label' => 'Solo practicar con reactivos y lectura',
                            'helper' => 'Guía digital y simuladores independientes tipo CENEVAL.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_duo_guia_simuladores' => 4,
                                'nutricion_simulador_compacto' => 3,
                                'nutricion_guia_digital' => 3,
                                'medicina_paquete_5_simuladores' => 4,
                                'medicina_simulador_individual' => 3,
                                'medicina_duo_2027' => 3,
                                'medicina_guia_digital' => 2,
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'physical',
                    'title' => '¿Te gustaría recibir guía impresa y kit físico de estudio?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'impreso',
                            'label' => 'Sí, quiero guía digital + impresa',
                            'helper' => 'Incluye manual físico, kit de estudio SAPIUS y acceso digital.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_premium' => 4,
                                'medicina_curso_completo' => 2,
                            ],
                        ],
                        [
                            'id' => 'digital',
                            'label' => 'Prefiero todo 100% digital',
                            'helper' => 'Acceso inmediato en plataforma desde tus dispositivos.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_asincronico' => 3,
                                'nutricion_duo_guia_simuladores' => 2,
                                'nutricion_guia_digital' => 2,
                                'nutricion_simulador_compacto' => 2,
                                'medicina_duo_2027' => 2,
                                'medicina_paquete_5_simuladores' => 2,
                                'medicina_guia_digital' => 2,
                                'medicina_simulador_individual' => 2,
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'budget',
                    'title' => '¿Qué rango de inversión buscas?',
                    'active' => true,
                    'options' => [
                        [
                            'id' => 'bajo',
                            'label' => 'Hasta $1,000 MXN',
                            'helper' => 'Opciones puntuales como Guía Digital o Simulador Individual/Compacto.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_guia_digital' => 15,
                                'nutricion_simulador_compacto' => 14,
                                'medicina_guia_digital' => 15,
                                'medicina_simulador_individual' => 14,
                            ],
                        ],
                        [
                            'id' => 'medio',
                            'label' => '$1,500 a $3,000 MXN',
                            'helper' => 'Paquetes combinados de Guía Digital + Simuladores.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_duo_guia_simuladores' => 14,
                                'medicina_paquete_5_simuladores' => 14,
                                'medicina_duo_2027' => 14,
                            ],
                        ],
                        [
                            'id' => 'completo',
                            'label' => 'Curso completo $4,499 a $5,999 MXN',
                            'helper' => 'Programa integral de 10 semanas con Método SUMA.',
                            'areaFilter' => null,
                            'weights' => [
                                'nutricion_curso_premium' => 10,
                                'nutricion_curso_asincronico' => 10,
                                'medicina_curso_completo' => 10,
                            ],
                        ],
                    ],
                ],
            ],
            'recommendations' => [
                [
                    'id' => 'nutricion_curso_premium',
                    'area' => 'nutricion',
                    'priority' => 1,
                    'active' => true,
                    'badge' => 'EGEL Nutrición · Promoción Destacada',
                    'title' => 'Curso Completo Premium — EGEL Nutrición',
                    'price' => '$5,999 MXN',
                    'oldPrice' => '$6,750 MXN',
                    'paymentNote' => 'Opciones de pago',
                    'summary' => 'La experiencia máxima Sapius: 10 semanas con Método SUMA, asesorías dominicales en vivo, guía impresa y garantía condicionada.',
                    'includes' => [
                        '10 semanas de videoclases, lecturas, tareas y exámenes diarios',
                        'Guía digital e impresa + Kit de estudio SAPIUS',
                        'Simuladores digitales, simulador compacto y asesorías en vivo dominicales y finales',
                        'Garantía condicionada Sapius',
                    ],
                    'coursePageHref' => '/egel-plus-nutricion#paquetes',
                    'keywords' => ['premium', 'nutricion'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me recomendó el Curso Completo Premium de EGEL Nutrición ($5,999 MXN).',
                ],
                [
                    'id' => 'nutricion_curso_asincronico',
                    'area' => 'nutricion',
                    'priority' => 2,
                    'active' => true,
                    'badge' => 'EGEL Nutrición · 100% a tu ritmo',
                    'title' => 'Curso Completo Asincrónico — EGEL Nutrición',
                    'price' => '$4,499 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Opciones de pago',
                    'summary' => '10 semanas de preparación estructurada con el Método SUMA para avanzar en tus propios horarios sin perder profundidad.',
                    'includes' => [
                        '10 semanas con videoclases, lecturas, tareas y exámenes diarios',
                        'Retroalimentación académica continua',
                        'Guía digital y Simuladores digitales incluidos',
                    ],
                    'coursePageHref' => '/egel-plus-nutricion#paquetes',
                    'keywords' => ['asincronico', 'nutricion'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me recomendó el Curso Completo Asincrónico de EGEL Nutrición ($4,499 MXN).',
                ],
                [
                    'id' => 'nutricion_duo_guia_simuladores',
                    'area' => 'nutricion',
                    'priority' => 3,
                    'active' => true,
                    'badge' => 'EGEL Nutrición · Dúo estratégico',
                    'title' => 'Guía Digital + Simuladores — EGEL Nutrición',
                    'price' => '$1,999 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Un solo pago',
                    'summary' => 'Combina el libro digital de repaso con nuestra batería de simuladores para practicar bajo condiciones reales.',
                    'includes' => [
                        'Libro digital de repaso en la plataforma',
                        'Batería de simuladores con preguntas, tiempo e intentos',
                        'Retroalimentación detallada según instrumento',
                    ],
                    'coursePageHref' => '/egel-plus-nutricion#paquetes',
                    'keywords' => ['guia', 'simulador', 'nutricion'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me recomendó el paquete Guía Digital + Simuladores de EGEL Nutrición ($1,999 MXN).',
                ],
                [
                    'id' => 'nutricion_guia_digital',
                    'area' => 'nutricion',
                    'priority' => 4,
                    'active' => true,
                    'badge' => 'EGEL Nutrición · Más popular',
                    'title' => 'Guía Digital — EGEL Nutrición',
                    'price' => '$999 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Un solo pago',
                    'summary' => 'Libro digital de repaso en la plataforma para estudiar de forma enfocada y ordenada todos los temas clave.',
                    'includes' => [
                        'Libro digital de repaso en la plataforma Sapius',
                        'Lectura clara estructurada bajo el temario EGEL Nutrición',
                        'Ideal para estudio independiente en cualquier horario',
                    ],
                    'coursePageHref' => '/egel-plus-nutricion#paquetes',
                    'keywords' => ['guia', 'nutricion'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me recomendó la Guía Digital de EGEL Nutrición ($999 MXN).',
                ],
                [
                    'id' => 'nutricion_simulador_compacto',
                    'area' => 'nutricion',
                    'priority' => 5,
                    'active' => true,
                    'badge' => 'EGEL Nutrición · Diagnóstico rápido',
                    'title' => 'Simulador Compacto — EGEL Nutrición',
                    'price' => '$299 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Un solo pago',
                    'summary' => 'Perfecto para comenzar hoy mismo y medir tu dominio con preguntas cronometradas de nutrición.',
                    'includes' => [
                        '30 reactivos seleccionados tipo CENEVAL',
                        '60 segundos por reactivo y 2 intentos',
                        'Retroalimentación inmediata en plataforma',
                    ],
                    'coursePageHref' => '/egel-plus-nutricion#paquetes',
                    'keywords' => ['compacto', 'nutricion'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me recomendó el Simulador Compacto de EGEL Nutrición ($299 MXN).',
                ],
                [
                    'id' => 'medicina_curso_completo',
                    'area' => 'medicina',
                    'priority' => 1,
                    'active' => true,
                    'badge' => 'EGEL Medicina · Cursos 2027',
                    'title' => 'Curso Completo EGEL Medicina (Preventa 2027)',
                    'price' => 'Preventa 2027',
                    'oldPrice' => '',
                    'paymentNote' => 'Opciones de pago',
                    'summary' => 'Nuestro programa integral de 10 semanas con Método SUMA para EGEL Medicina con acompañamiento experto.',
                    'includes' => [
                        '10 semanas de preparación con videoclases y lecturas',
                        'Tareas, exámenes diarios y simuladores tipo CENEVAL',
                        'Modalidades Premium (con asesorías en vivo) o Asincrónico',
                    ],
                    'coursePageHref' => '/egel-plus-medicina',
                    'keywords' => ['curso', 'medicina'],
                    'purchaseMode' => 'presale',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me interesa inscribirme en preventa al Curso Completo EGEL Medicina 2027.',
                ],
                [
                    'id' => 'medicina_paquete_5_simuladores',
                    'area' => 'medicina',
                    'priority' => 2,
                    'active' => true,
                    'badge' => 'EGEL Medicina · Práctica intensiva',
                    'title' => 'Paquete de 5 Simuladores — EGEL Medicina',
                    'price' => '$2,495 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Un solo pago',
                    'summary' => 'Entrena resistencia, velocidad diagnóstica y manejo del tiempo con el conjunto completo de simuladores.',
                    'includes' => [
                        '703 reactivos en conjunto (base de conteos comunicada)',
                        'Condiciones reales de tiempo e intentos',
                        'Retroalimentación detallada por instrumento',
                    ],
                    'coursePageHref' => '/egel-plus-medicina#paquetes',
                    'keywords' => ['paquete', 'simulador', 'medicina'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me recomendó el Paquete de 5 Simuladores de EGEL Medicina ($2,495 MXN).',
                ],
                [
                    'id' => 'medicina_duo_2027',
                    'area' => 'medicina',
                    'priority' => 3,
                    'active' => true,
                    'badge' => 'EGEL Medicina · Promoción 2027',
                    'title' => 'Guía Digital + Paquete de 5 Simuladores',
                    'price' => '$2,999 MXN',
                    'oldPrice' => '$3,494 MXN',
                    'paymentNote' => 'Un solo pago',
                    'summary' => 'La combinación más completa de lectura estructurada y batería de 5 simuladores para dominar el EGEL Medicina.',
                    'includes' => [
                        'Guía digital de repaso en plataforma',
                        'Paquete completo de 5 simuladores Medicina',
                        'Precio especial de preventa 2027',
                    ],
                    'coursePageHref' => '/egel-plus-medicina#paquetes',
                    'keywords' => ['paquete', 'medicina'],
                    'purchaseMode' => 'presale',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me interesa la preventa de Guía Digital + Paquete de 5 Simuladores EGEL Medicina ($2,999 MXN).',
                ],
                [
                    'id' => 'medicina_guia_digital',
                    'area' => 'medicina',
                    'priority' => 4,
                    'active' => true,
                    'badge' => 'EGEL Medicina · Muy pronto',
                    'title' => 'Guía Digital — EGEL Medicina',
                    'price' => '$999 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Un solo pago',
                    'summary' => 'Libro digital estructurado con los temas esenciales de EGEL Medicina para estudio autónomo.',
                    'includes' => [
                        'Libro digital de repaso en la plataforma',
                        'Temario organizado por áreas clínicas clave',
                        'Acceso prioritario en lista de espera',
                    ],
                    'coursePageHref' => '/egel-plus-medicina#paquetes',
                    'keywords' => ['guia', 'medicina'],
                    'purchaseMode' => 'waitlist',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y quiero anotarme en la lista de espera de la Guía Digital EGEL Medicina ($999 MXN).',
                ],
                [
                    'id' => 'medicina_simulador_individual',
                    'area' => 'medicina',
                    'priority' => 5,
                    'active' => true,
                    'badge' => 'EGEL Medicina · Práctica rápida',
                    'title' => 'Simulador Individual — EGEL Medicina',
                    'price' => '$499 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Un solo pago',
                    'summary' => 'Ideal para medir tu nivel actual en Medicina con reactivos cronometrados y retroalimentación puntual.',
                    'includes' => [
                        '5 instrumentos diferentes disponibles para elegir',
                        'Preguntas tipo CENEVAL con límite de tiempo',
                        'Retroalimentación inmediata en plataforma',
                    ],
                    'coursePageHref' => '/egel-plus-medicina#paquetes',
                    'keywords' => ['simulador', 'medicina'],
                    'purchaseMode' => 'buy',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, hice el Mini-Test y me recomendó el Simulador Individual de EGEL Medicina ($499 MXN).',
                ],
                [
                    'id' => 'otro_ceneval',
                    'area' => 'otro',
                    'priority' => 1,
                    'active' => true,
                    'badge' => 'Orientación Personalizada Sapius',
                    'title' => 'Ruta Académica CENEVAL a tu Medida',
                    'price' => 'Desde $299 MXN',
                    'oldPrice' => '',
                    'paymentNote' => 'Según programa',
                    'summary' => 'Contamos con programas, guías y simuladores especializados. Nuestro equipo académico te orientará según tu licenciatura o examen.',
                    'includes' => [
                        'Diagnóstico de fecha de aplicación y temario oficial',
                        'Acceso a plataforma interactiva Sapius',
                        'Opciones asincrónicas o con acompañamiento docente',
                    ],
                    'coursePageHref' => '/cursos',
                    'keywords' => ['egel'],
                    'purchaseMode' => 'presale',
                    'scheduledCourseId' => null,
                    'whatsappMessage' => 'Hola Sapius, realicé el Mini-Test para otro examen CENEVAL y me gustaría recibir orientación sobre el curso ideal para mí.',
                ],
            ],
        ];
    }

    public function getConfig(): array
    {
        $defaults = self::getDefaultConfig();

        try {
            if (Storage::disk('local')->exists(self::CONFIG_PATH)) {
                $content = Storage::disk('local')->get(self::CONFIG_PATH);
                $decoded = json_decode((string) $content, true);

                if (
                    is_array($decoded)
                    && ! empty($decoded['questions'])
                    && ! empty($decoded['recommendations'])
                ) {
                    return $this->sanitizeConfig($decoded, $defaults);
                }
            }
        } catch (\Throwable) {
            // Fall back cleanly to defaults if the JSON file is unreadable or corrupt.
        }

        return $defaults;
    }

    public function saveConfig(array $payload): array
    {
        $sanitized = $this->sanitizeConfig($payload, self::getDefaultConfig());

        Storage::disk('local')->put(
            self::CONFIG_PATH,
            json_encode($sanitized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        );

        return $sanitized;
    }

    public function resetToDefaults(): array
    {
        $defaults = self::getDefaultConfig();

        Storage::disk('local')->put(
            self::CONFIG_PATH,
            json_encode($defaults, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        );

        return $defaults;
    }

    protected function sanitizeConfig(array $raw, array $defaults): array
    {
        $rawHeader = is_array($raw['header'] ?? null) ? $raw['header'] : [];
        $header = [
            'badge' => $this->cleanText($rawHeader['badge'] ?? null, $defaults['header']['badge']),
            'title' => $this->cleanText($rawHeader['title'] ?? null, $defaults['header']['title']),
            'resultSubtitle' => $this->cleanText($rawHeader['resultSubtitle'] ?? null, $defaults['header']['resultSubtitle']),
        ];

        $recommendations = [];
        $usedRecIds = [];

        foreach (($raw['recommendations'] ?? []) as $index => $rec) {
            if (! is_array($rec)) {
                continue;
            }

            $id = $this->uniqueSlug($rec['id'] ?? null, 'rec_'.($index + 1), $usedRecIds);
            $area = in_array($rec['area'] ?? '', self::VALID_AREAS, true) ? $rec['area'] : 'general';
            $purchaseMode = in_array($rec['purchaseMode'] ?? '', self::VALID_PURCHASE_MODES, true)
                ? $rec['purchaseMode']
                : 'buy';

            $includes = collect($rec['includes'] ?? [])
                ->map(fn ($item) => trim(strip_tags((string) $item)))
                ->filter(fn (string $item) => $item !== '')
                ->values()
                ->all();

            $keywords = collect($rec['keywords'] ?? [])
                ->map(fn ($kw) => trim(strip_tags((string) $kw)))
                ->filter(fn (string $kw) => $kw !== '')
                ->values()
                ->all();

            $scheduledId = $rec['scheduledCourseId'] ?? null;
            $scheduledCourseId = is_numeric($scheduledId) && (int) $scheduledId > 0 ? (int) $scheduledId : null;

            $courseHref = trim(strip_tags((string) ($rec['coursePageHref'] ?? '/cursos')));
            if ($courseHref === '' || (! str_starts_with($courseHref, '/') && ! str_starts_with($courseHref, 'https://') && ! str_starts_with($courseHref, 'http://'))) {
                $courseHref = '/cursos';
            }

            $recommendations[] = [
                'id' => $id,
                'area' => $area,
                'priority' => max(1, (int) ($rec['priority'] ?? ($index + 1))),
                'active' => (bool) ($rec['active'] ?? true),
                'badge' => $this->cleanText($rec['badge'] ?? null, 'Recomendación Sapius'),
                'title' => $this->cleanText($rec['title'] ?? null, 'Programa Sapius'),
                'price' => $this->cleanText($rec['price'] ?? null, 'Consultar precio'),
                'oldPrice' => trim(strip_tags((string) ($rec['oldPrice'] ?? ''))),
                'paymentNote' => $this->cleanText($rec['paymentNote'] ?? null, 'Opciones de pago'),
                'summary' => $this->cleanText($rec['summary'] ?? null, 'Programa personalizado según tu perfil.'),
                'includes' => $includes,
                'coursePageHref' => $courseHref,
                'keywords' => $keywords,
                'purchaseMode' => $purchaseMode,
                'scheduledCourseId' => $scheduledCourseId,
                'whatsappMessage' => $this->cleanText(
                    $rec['whatsappMessage'] ?? null,
                    'Hola Sapius, hice el Mini-Test y me gustaría recibir información sobre este programa.',
                ),
            ];
        }

        if ($recommendations === []) {
            $recommendations = $defaults['recommendations'];
        }

        $validRecIds = array_column($recommendations, 'id');
        $questions = [];
        $usedQuestionIds = [];

        foreach (($raw['questions'] ?? []) as $qIndex => $q) {
            if (! is_array($q)) {
                continue;
            }

            $qId = $this->uniqueSlug($q['id'] ?? null, 'q_'.($qIndex + 1), $usedQuestionIds);
            $options = [];
            $usedOptionIds = [];

            foreach (($q['options'] ?? []) as $oIndex => $opt) {
                if (! is_array($opt)) {
                    continue;
                }

                $optId = $this->uniqueSlug($opt['id'] ?? null, 'opt_'.($oIndex + 1), $usedOptionIds);
                $areaFilterRaw = $opt['areaFilter'] ?? null;
                $areaFilter = in_array($areaFilterRaw, ['nutricion', 'medicina', 'otro'], true)
                    ? $areaFilterRaw
                    : null;

                $weights = [];
                if (is_array($opt['weights'] ?? null)) {
                    foreach ($opt['weights'] as $recKey => $weightVal) {
                        if (in_array((string) $recKey, $validRecIds, true) && is_numeric($weightVal)) {
                            $intWeight = max(0, min(50, (int) $weightVal));
                            if ($intWeight > 0) {
                                $weights[(string) $recKey] = $intWeight;
                            }
                        }
                    }
                }

                $options[] = [
                    'id' => $optId,
                    'label' => $this->cleanText($opt['label'] ?? null, 'Opción '.($oIndex + 1)),
                    'helper' => trim(strip_tags((string) ($opt['helper'] ?? ''))),
                    'areaFilter' => $areaFilter,
                    'weights' => $weights,
                ];
            }

            if ($options === []) {
                continue;
            }

            $questions[] = [
                'id' => $qId,
                'title' => $this->cleanText($q['title'] ?? null, 'Pregunta '.($qIndex + 1)),
                'active' => (bool) ($q['active'] ?? true),
                'options' => $options,
            ];
        }

        if ($questions === []) {
            $questions = $defaults['questions'];
        }

        return [
            'header' => $header,
            'questions' => $questions,
            'recommendations' => $recommendations,
        ];
    }

    protected function cleanText(mixed $value, string $fallback): string
    {
        $clean = trim(strip_tags((string) ($value ?? '')));

        return $clean !== '' ? $clean : $fallback;
    }

    /**
     * @param  array<int, string>  $usedIds
     */
    protected function uniqueSlug(mixed $rawId, string $fallback, array &$usedIds): string
    {
        $base = Str::slug(trim((string) ($rawId ?? '')), '_');
        if ($base === '') {
            $base = $fallback;
        }

        $candidate = $base;
        $counter = 2;
        while (in_array($candidate, $usedIds, true)) {
            $candidate = $base.'_'.$counter;
            $counter++;
        }

        $usedIds[] = $candidate;

        return $candidate;
    }
}
