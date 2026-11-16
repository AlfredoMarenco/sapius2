import { Link } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
    resolvePurchaseTarget,
    WHATSAPP_PHONE
    
} from './PricingCard';
import type {ScheduledCourseCandidate} from './PricingCard';
import { SapiusIsotype } from './SapiusLogo';

export const MINI_TEST_OPEN_EVENT = 'sapius:open-mini-test';

/**
 * Dispara la apertura global del Mini-Test de 6 preguntas desde cualquier botón público.
 */
export function openMiniTest(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(MINI_TEST_OPEN_EVENT));
    }
}

export interface MiniTestModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    scheduledCourses?: ScheduledCourseCandidate[];
    listenToGlobalEvent?: boolean;
}

interface QuestionOption {
    id: string;
    label: string;
    helper: string;
}

interface TestQuestion {
    id: 'exam' | 'timing' | 'hours' | 'style' | 'physical' | 'budget';
    title: string;
    options: QuestionOption[];
}

interface RecommendationResult {
    badge: string;
    title: string;
    price: string;
    oldPrice?: string;
    paymentNote: string;
    summary: string;
    includes: string[];
    coursePageHref: string;
    keywords: string[];
    purchaseMode: 'buy' | 'waitlist' | 'presale';
    whatsappMessage: string;
}

const QUESTIONS: TestQuestion[] = [
    {
        id: 'exam',
        title: '¿Qué examen vas a presentar?',
        options: [
            {
                id: 'nutricion',
                label: 'EGEL Nutrición',
                helper: 'Preparación integral para EGEL Plus en Nutrición.',
            },
            {
                id: 'medicina',
                label: 'EGEL Medicina',
                helper: 'Preparación integral para EGEL Plus en Medicina General.',
            },
            {
                id: 'otro',
                label: 'Otro CENEVAL',
                helper: 'EXANI-I, EXANI-II, EXANI-III u otra evaluación.',
            },
        ],
    },
    {
        id: 'timing',
        title: '¿Cuándo presentas tu examen?',
        options: [
            {
                id: 'menos_1m',
                label: 'En menos de 1 mes',
                helper: 'Necesitas práctica intensiva y repaso puntual.',
            },
            {
                id: '2_4m',
                label: 'En 2 a 4 meses',
                helper: 'Tiempo ideal para el programa estructurado de 10 semanas.',
            },
            {
                id: 'mas_4m',
                label: 'En más de 4 meses o 2027',
                helper: 'Excelente anticipación o acceso en preventa 2027.',
            },
        ],
    },
    {
        id: 'hours',
        title: '¿Cuántas horas al día puedes dedicar al estudio?',
        options: [
            {
                id: 'menos_1h',
                label: 'Menos de 1 hora',
                helper: 'Avance concreto con reactivos y lecturas dirigidas.',
            },
            {
                id: '1_2h',
                label: '1 a 2 horas diarias',
                helper: 'Ritmo equilibrado para videoclases y simuladores diarios.',
            },
            {
                id: 'mas_2h',
                label: 'Más de 2 horas',
                helper: 'Dedicación completa con clases, lecturas y asesorías.',
            },
        ],
    },
    {
        id: 'style',
        title: '¿Cómo prefieres estudiar?',
        options: [
            {
                id: 'en_vivo',
                label: 'Con asesorías dominicales en vivo y acompañamiento',
                helper: 'Resolución de dudas en vivo con docentes expertos y garantía.',
            },
            {
                id: 'asincronico',
                label: 'A mi propio ritmo 100% asincrónico',
                helper: 'Videoclases grabadas, tareas y exámenes disponibles 24/7.',
            },
            {
                id: 'practica',
                label: 'Solo practicar con reactivos y lectura',
                helper: 'Guía digital y simuladores independientes tipo CENEVAL.',
            },
        ],
    },
    {
        id: 'physical',
        title: '¿Te gustaría recibir guía impresa y kit físico de estudio?',
        options: [
            {
                id: 'impreso',
                label: 'Sí, quiero guía digital + impresa',
                helper: 'Incluye manual físico, kit de estudio SAPIUS y acceso digital.',
            },
            {
                id: 'digital',
                label: 'Prefiero todo 100% digital',
                helper: 'Acceso inmediato en plataforma desde tus dispositivos.',
            },
        ],
    },
    {
        id: 'budget',
        title: '¿Qué rango de inversión buscas?',
        options: [
            {
                id: 'bajo',
                label: 'Hasta $1,000 MXN',
                helper: 'Opciones puntuales como Guía Digital o Simulador Individual/Compacto.',
            },
            {
                id: 'medio',
                label: '$1,500 a $3,000 MXN',
                helper: 'Paquetes combinados de Guía Digital + Simuladores.',
            },
            {
                id: 'completo',
                label: 'Curso completo $4,499 a $5,999 MXN',
                helper: 'Programa integral de 10 semanas con Método SUMA.',
            },
        ],
    },
];

function computeRecommendation(
    answers: Record<string, string>,
): RecommendationResult {
    const exam = answers.exam ?? 'nutricion';
    const timing = answers.timing ?? '2_4m';
    const style = answers.style ?? 'en_vivo';
    const physical = answers.physical ?? 'impreso';
    const budget = answers.budget ?? 'completo';

    // Caso Medicina
    if (exam === 'medicina') {
        if (budget === 'bajo') {
            if (style === 'practica' && timing === 'menos_1m') {
                return {
                    badge: 'EGEL Medicina · Práctica rápida',
                    title: 'Simulador Individual — EGEL Medicina',
                    price: '$499 MXN',
                    paymentNote: 'Un solo pago',
                    summary:
                        'Ideal para medir tu nivel actual en Medicina con reactivos cronometrados y retroalimentación puntual.',
                    includes: [
                        '5 instrumentos diferentes disponibles para elegir',
                        'Preguntas tipo CENEVAL con límite de tiempo',
                        'Retroalimentación inmediata en plataforma',
                    ],
                    coursePageHref: '/egel-plus-medicina#paquetes',
                    keywords: ['simulador', 'medicina'],
                    purchaseMode: 'buy',
                    whatsappMessage:
                        'Hola Sapius, hice el Mini-Test y me recomendó el Simulador Individual de EGEL Medicina ($499 MXN).',
                };
            }

            return {
                badge: 'EGEL Medicina · Muy pronto',
                title: 'Guía Digital — EGEL Medicina',
                price: '$999 MXN',
                paymentNote: 'Un solo pago',
                summary:
                    'Libro digital estructurado con los temas esenciales de EGEL Medicina para estudio autónomo.',
                includes: [
                    'Libro digital de repaso en la plataforma',
                    'Temario organizado por áreas clínicas clave',
                    'Acceso prioritario en lista de espera',
                ],
                coursePageHref: '/egel-plus-medicina#paquetes',
                keywords: ['guia', 'medicina'],
                purchaseMode: 'waitlist',
                whatsappMessage:
                    'Hola Sapius, hice el Mini-Test y quiero anotarme en la lista de espera de la Guía Digital EGEL Medicina ($999 MXN).',
            };
        }

        if (budget === 'medio' || style === 'practica' || timing === 'menos_1m') {
            if (timing === 'mas_4m') {
                return {
                    badge: 'EGEL Medicina · Promoción 2027',
                    title: 'Guía Digital + Paquete de 5 Simuladores',
                    price: '$2,999 MXN',
                    oldPrice: '$3,494 MXN',
                    paymentNote: 'Un solo pago',
                    summary:
                        'La combinación más completa de lectura estructurada y batería de 5 simuladores para dominar el EGEL Medicina.',
                    includes: [
                        'Guía digital de repaso en plataforma',
                        'Paquete completo de 5 simuladores Medicina',
                        'Precio especial de preventa 2027',
                    ],
                    coursePageHref: '/egel-plus-medicina#paquetes',
                    keywords: ['paquete', 'medicina'],
                    purchaseMode: 'presale',
                    whatsappMessage:
                        'Hola Sapius, hice el Mini-Test y me interesa la preventa de Guía Digital + Paquete de 5 Simuladores EGEL Medicina ($2,999 MXN).',
                };
            }

            return {
                badge: 'EGEL Medicina · Práctica intensiva',
                title: 'Paquete de 5 Simuladores — EGEL Medicina',
                price: '$2,495 MXN',
                paymentNote: 'Un solo pago',
                summary:
                    'Entrena resistencia, velocidad diagnóstica y manejo del tiempo con el conjunto completo de simuladores.',
                includes: [
                    '703 reactivos en conjunto (base de conteos comunicada)',
                    'Condiciones reales de tiempo e intentos',
                    'Retroalimentación detallada por instrumento',
                ],
                coursePageHref: '/egel-plus-medicina#paquetes',
                keywords: ['paquete', 'simulador', 'medicina'],
                purchaseMode: 'buy',
                whatsappMessage:
                    'Hola Sapius, hice el Mini-Test y me recomendó el Paquete de 5 Simuladores de EGEL Medicina ($2,495 MXN).',
            };
        }

        return {
            badge: 'EGEL Medicina · Cursos 2027',
            title: 'Curso Completo EGEL Medicina (Preventa 2027)',
            price: 'Preventa 2027',
            paymentNote: 'Opciones de pago',
            summary:
                'Nuestro programa integral de 10 semanas con Método SUMA para EGEL Medicina con acompañamiento experto.',
            includes: [
                '10 semanas de preparación con videoclases y lecturas',
                'Tareas, exámenes diarios y simuladores tipo CENEVAL',
                'Modalidades Premium (con asesorías en vivo) o Asincrónico',
            ],
            coursePageHref: '/egel-plus-medicina',
            keywords: ['curso', 'medicina'],
            purchaseMode: 'presale',
            whatsappMessage:
                'Hola Sapius, hice el Mini-Test y me interesa inscribirme en preventa al Curso Completo EGEL Medicina 2027.',
        };
    }

    // Caso Otro CENEVAL
    if (exam === 'otro') {
        return {
            badge: 'Orientación Personalizada Sapius',
            title: 'Ruta Académica CENEVAL a tu Medida',
            price: 'Desde $299 MXN',
            paymentNote: 'Según programa',
            summary:
                'Contamos con programas, guías y simuladores especializados. Nuestro equipo académico te orientará según tu licenciatura o examen.',
            includes: [
                'Diagnóstico de fecha de aplicación y temario oficial',
                'Acceso a plataforma interactiva Sapius',
                'Opciones asincrónicas o con acompañamiento docente',
            ],
            coursePageHref: '/cursos',
            keywords: ['egel'],
            purchaseMode: 'presale',
            whatsappMessage:
                'Hola Sapius, realicé el Mini-Test para otro examen CENEVAL y me gustaría recibir orientación sobre el curso ideal para mí.',
        };
    }

    // Caso EGEL Nutrición (principal)
    if (budget === 'bajo') {
        if (timing === 'menos_1m' && style === 'practica') {
            return {
                badge: 'EGEL Nutrición · Diagnóstico rápido',
                title: 'Simulador Compacto — EGEL Nutrición',
                price: '$299 MXN',
                paymentNote: 'Un solo pago',
                summary:
                    'Perfecto para comenzar hoy mismo y medir tu dominio con preguntas cronometradas de nutrición.',
                includes: [
                    '30 reactivos seleccionados tipo CENEVAL',
                    '60 segundos por reactivo y 2 intentos',
                    'Retroalimentación inmediata en plataforma',
                ],
                coursePageHref: '/egel-plus-nutricion#paquetes',
                keywords: ['compacto', 'nutricion'],
                purchaseMode: 'buy',
                whatsappMessage:
                    'Hola Sapius, hice el Mini-Test y me recomendó el Simulador Compacto de EGEL Nutrición ($299 MXN).',
            };
        }

        return {
            badge: 'EGEL Nutrición · Más popular',
            title: 'Guía Digital — EGEL Nutrición',
            price: '$999 MXN',
            paymentNote: 'Un solo pago',
            summary:
                'Libro digital de repaso en la plataforma para estudiar de forma enfocada y ordenada todos los temas clave.',
            includes: [
                'Libro digital de repaso en la plataforma Sapius',
                'Lectura clara estructurada bajo el temario EGEL Nutrición',
                'Ideal para estudio independiente en cualquier horario',
            ],
            coursePageHref: '/egel-plus-nutricion#paquetes',
            keywords: ['guia', 'nutricion'],
            purchaseMode: 'buy',
            whatsappMessage:
                'Hola Sapius, hice el Mini-Test y me recomendó la Guía Digital de EGEL Nutrición ($999 MXN).',
        };
    }

    if (budget === 'medio' || timing === 'menos_1m' || style === 'practica') {
        return {
            badge: 'EGEL Nutrición · Dúo estratégico',
            title: 'Guía Digital + Simuladores — EGEL Nutrición',
            price: '$1,999 MXN',
            paymentNote: 'Un solo pago',
            summary:
                'Combina el libro digital de repaso con nuestra batería de simuladores para practicar bajo condiciones reales.',
            includes: [
                'Libro digital de repaso en la plataforma',
                'Batería de simuladores con preguntas, tiempo e intentos',
                'Retroalimentación detallada según instrumento',
            ],
            coursePageHref: '/egel-plus-nutricion#paquetes',
            keywords: ['guia', 'simulador', 'nutricion'],
            purchaseMode: 'buy',
            whatsappMessage:
                'Hola Sapius, hice el Mini-Test y me recomendó el paquete Guía Digital + Simuladores de EGEL Nutrición ($1,999 MXN).',
        };
    }

    if (style === 'asincronico' && physical === 'digital') {
        return {
            badge: 'EGEL Nutrición · 100% a tu ritmo',
            title: 'Curso Completo Asincrónico — EGEL Nutrición',
            price: '$4,499 MXN',
            paymentNote: 'Opciones de pago',
            summary:
                '10 semanas de preparación estructurada con el Método SUMA para avanzar en tus propios horarios sin perder profundidad.',
            includes: [
                '10 semanas con videoclases, lecturas, tareas y exámenes diarios',
                'Retroalimentación académica continua',
                'Guía digital y Simuladores digitales incluidos',
            ],
            coursePageHref: '/egel-plus-nutricion#paquetes',
            keywords: ['asincronico', 'nutricion'],
            purchaseMode: 'buy',
            whatsappMessage:
                'Hola Sapius, hice el Mini-Test y me recomendó el Curso Completo Asincrónico de EGEL Nutrición ($4,499 MXN).',
        };
    }

    return {
        badge: 'EGEL Nutrición · Promoción Destacada',
        title: 'Curso Completo Premium — EGEL Nutrición',
        price: '$5,999 MXN',
        oldPrice: '$6,750 MXN',
        paymentNote: 'Opciones de pago',
        summary:
            'La experiencia máxima Sapius: 10 semanas con Método SUMA, asesorías dominicales en vivo, guía impresa y garantía condicionada.',
        includes: [
            '10 semanas de videoclases, lecturas, tareas y exámenes diarios',
            'Guía digital e impresa + Kit de estudio SAPIUS',
            'Simuladores digitales, simulador compacto y asesorías en vivo dominicales y finales',
            'Garantía condicionada Sapius',
        ],
        coursePageHref: '/egel-plus-nutricion#paquetes',
        keywords: ['premium', 'nutricion'],
        purchaseMode: 'buy',
        whatsappMessage:
            'Hola Sapius, hice el Mini-Test y me recomendó el Curso Completo Premium de EGEL Nutrición ($5,999 MXN).',
    };
}

export function MiniTestModal({
    open: controlledOpen,
    onOpenChange,
    scheduledCourses,
    listenToGlobalEvent = false,
}: MiniTestModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const setOpen = (next: boolean) => {
        if (!isControlled) {
            setInternalOpen(next);
        }

        onOpenChange?.(next);
    };

    useEffect(() => {
        if (!listenToGlobalEvent) {
return;
}

        const handler = () => {
            setStep(0);
            setAnswers({});
            setOpen(true);
        };
        window.addEventListener(MINI_TEST_OPEN_EVENT, handler);

        return () => window.removeEventListener(MINI_TEST_OPEN_EVENT, handler);
    }, [listenToGlobalEvent]);

    const isCompleted = step >= QUESTIONS.length;
    const currentQuestion = QUESTIONS[step];
    const progressPercent = isCompleted
        ? 100
        : Math.round(((step + 1) / QUESTIONS.length) * 100);

    const recommendation = useMemo(
        () => computeRecommendation(answers),
        [answers],
    );

    const purchaseTarget = useMemo(
        () =>
            resolvePurchaseTarget(
                scheduledCourses,
                recommendation.keywords,
                recommendation.purchaseMode,
                recommendation.title,
            ),
        [scheduledCourses, recommendation],
    );

    const handleSelectOption = (optionId: string) => {
        if (!currentQuestion) {
return;
}

        const updated = { ...answers, [currentQuestion.id]: optionId };
        setAnswers(updated);
        setStep((prev) => prev + 1);
    };

    const handleRestart = () => {
        setAnswers({});
        setStep(0);
    };

    const whatsappHref = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
        recommendation.whatsappMessage,
    )}`;

    return (
        <Dialog.Root open={isOpen} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[90] bg-[#101E33]/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    style={{ colorScheme: 'light' }}
                    className="fixed top-1/2 left-1/2 z-[100] max-h-[92vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[#FF6B52]/35 bg-white p-6 font-display text-[#101E33] shadow-2xl focus:outline-none sm:p-8"
                >
                    {/* Cabecera */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFD9CE]/60">
                                <SapiusIsotype variant="dark" size="sm" />
                            </div>
                            <div>
                                <Dialog.Title className="text-lg font-extrabold tracking-tight text-[#101E33] sm:text-xl">
                                    Encuentra tu opción ideal
                                </Dialog.Title>
                                <Dialog.Description className="text-xs font-medium text-[#101E33]/65">
                                    {isCompleted
                                        ? 'Resultado personalizado según tus objetivos'
                                        : `Pregunta ${step + 1} de ${QUESTIONS.length}`}
                                </Dialog.Description>
                            </div>
                        </div>

                        <Dialog.Close
                            type="button"
                            aria-label="Cerrar test"
                            className="rounded-full p-2 text-[#101E33]/60 transition-colors hover:bg-[#101E33]/5 hover:text-[#101E33]"
                        >
                            <X className="h-5 w-5" />
                        </Dialog.Close>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-5">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#101E33]/10">
                            <motion.div
                                initial={false}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="h-full rounded-full bg-[#FF6B52]"
                            />
                        </div>
                    </div>

                    {/* Cuerpo dinámico */}
                    <div className="mt-6">
                        <AnimatePresence mode="wait">
                            {!isCompleted && currentQuestion ? (
                                <motion.div
                                    key={currentQuestion.id}
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.22 }}
                                >
                                    <h3 className="text-xl leading-snug font-extrabold text-[#101E33] sm:text-2xl">
                                        {currentQuestion.title}
                                    </h3>

                                    <div className="mt-5 space-y-3">
                                        {currentQuestion.options.map((option) => {
                                            const selected =
                                                answers[currentQuestion.id] === option.id;

                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectOption(option.id)
                                                    }
                                                    className={`group flex w-full flex-col rounded-2xl border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 ${
                                                        selected
                                                            ? 'border-[#FF6B52] bg-[#FFD9CE]/30 shadow-sm'
                                                            : 'border-[#101E33]/15 bg-white hover:border-[#FF6B52]/65 hover:bg-[#CFE4FF]/20'
                                                    }`}
                                                >
                                                    <span className="text-sm font-bold text-[#101E33] sm:text-base">
                                                        {option.label}
                                                    </span>
                                                    <span className="mt-1 text-xs text-[#101E33]/70">
                                                        {option.helper}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {step > 0 && (
                                        <div className="mt-5 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep((prev) => Math.max(0, prev - 1))
                                                }
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101E33]/70 transition-colors hover:text-[#101E33]"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Pregunta anterior
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -14 }}
                                    transition={{ duration: 0.28 }}
                                >
                                    <div className="rounded-2xl border border-[#FF6B52]/45 bg-gradient-to-br from-[#CFE4FF]/35 via-white to-[#FFD9CE]/35 p-5 sm:p-6">
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B52]/15 px-3 py-1 text-[11px] font-extrabold tracking-wide text-[#FF6B52] uppercase">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            {recommendation.badge}
                                        </div>

                                        <h3 className="mt-3 text-xl font-extrabold text-[#101E33] sm:text-2xl">
                                            {recommendation.title}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
                                            <span className="text-2xl font-extrabold text-[#101E33] sm:text-3xl">
                                                {recommendation.price}
                                            </span>
                                            {recommendation.oldPrice && (
                                                <span className="text-sm font-bold text-[#FF6B52]/80 line-through">
                                                    {recommendation.oldPrice}
                                                </span>
                                            )}
                                            <span className="text-xs font-semibold text-[#FF6B52]">
                                                · {recommendation.paymentNote}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm leading-relaxed text-[#101E33]/80">
                                            {recommendation.summary}
                                        </p>

                                        <div className="mt-4 border-t border-[#101E33]/10 pt-4">
                                            <div className="text-xs font-extrabold tracking-wider text-[#101E33]/70 uppercase">
                                                ¿Qué incluye?
                                            </div>
                                            <ul className="mt-2.5 space-y-2">
                                                {recommendation.includes.map((item, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start gap-2 text-xs font-medium text-[#101E33]/85 sm:text-sm"
                                                    >
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B52]" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Botones de conversión */}
                                        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                                            {purchaseTarget.isExternal ? (
                                                <a
                                                    href={purchaseTarget.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#FF6B52] px-6 py-3 text-center text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F0563C] sm:text-sm"
                                                >
                                                    {recommendation.purchaseMode === 'waitlist'
                                                        ? 'Anotarme en lista de espera'
                                                        : 'Solicitar preventa'}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={purchaseTarget.href}
                                                    onClick={() => setOpen(false)}
                                                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#FF6B52] px-6 py-3 text-center text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F0563C] sm:text-sm"
                                                >
                                                    Inscribirme ahora
                                                </Link>
                                            )}

                                            <Link
                                                href={recommendation.coursePageHref}
                                                onClick={() => setOpen(false)}
                                                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#101E33] px-6 py-3 text-center text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#192B47] sm:text-sm"
                                            >
                                                Ver detalles del programa
                                            </Link>
                                        </div>

                                        <div className="mt-3">
                                            <a
                                                href={whatsappHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex w-full items-center justify-center rounded-full bg-[#06C156] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#05A84B] sm:text-sm"
                                            >
                                                Hablar con un asesor por WhatsApp
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={handleRestart}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101E33]/70 transition-colors hover:text-[#FF6B52]"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Volver a realizar el test
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default MiniTestModal;
