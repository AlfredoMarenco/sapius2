import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Lightbulb, Award, Eye } from 'lucide-react';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import MathHtml from '@/components/MathHtml';

interface CriteriaRow {
    label: string;
    value: string;
    max?: string;
    badge?: string;
}

interface CriteriaTable {
    title: string;
    subtitle: string;
    columns: string[];
    rows: CriteriaRow[];
}

interface FeedbackProps {
    exam: any;
    feedback: any[];
    questions: any[];
    timeLeft?: number;
    scheduled_course_id?: number | null;
    examCriteria?: Record<string, CriteriaTable>;
}

function resolveQuestionImageUrl(img?: string | null): string | null {
    if (!img) return null;
    const trimmed = String(img).trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return trimmed;
    }
    const filename = trimmed.split('/').pop() || trimmed;
    return `/alumno/preguntas/imagen/${encodeURIComponent(filename)}`;
}

export default function Feedback({
    exam,
    feedback,
    questions,
    timeLeft: initialTimeLeft,
    scheduled_course_id,
    examCriteria = {},
}: FeedbackProps) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';

    // Activar feedbackMode: true (100 pts bloqueo inmediato)
    const antiCheatConfig = {
        enabled: true,
        watermarkText: userEmail,
        feedbackMode: true,
        onBlocked: (redirectUrl?: string) => {
            router.visit(redirectUrl || '/alumno/cuenta-bloqueada');
        },
    };
    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat(antiCheatConfig);

    const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft ? Math.max(0, Math.floor(initialTimeLeft)) : 0);
    const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});

    const courseIdForReturn =
        scheduled_course_id ||
        exam.enrollment?.scheduled_course_id ||
        exam.enrollment?.curso_programado_id ||
        exam.inscripcion?.curso_programado_id;

    useEffect(() => {
        if (!initialTimeLeft || initialTimeLeft <= 0) return;

        if (timeLeft <= 0) {
            router.visit(courseIdForReturn ? `/alumno/curso/${courseIdForReturn}` : '/alumno');
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, initialTimeLeft, courseIdForReturn]);

    const formatTime = (seconds: number) => {
        const validSeconds = Math.max(0, Math.floor(seconds));
        const h = Math.floor(validSeconds / 3600)
            .toString()
            .padStart(2, '0');
        const m = Math.floor((validSeconds % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const s = (validSeconds % 60).toString().padStart(2, '0');
        return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
    };

    const totalQuestions = Number(exam.total_preguntas || questions.length || 0);
    const totalCorrect = Number(exam.total_correctas || 0);
    const totalIncorrect = Math.max(0, totalQuestions - totalCorrect);
    const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const rawQuizType = (exam.quiz?.type || exam.quiz?.tipo || 'EGEL').toString().toUpperCase();
    const normalizedType = rawQuizType.includes('EXANI')
        ? 'EXANI'
        : rawQuizType.includes('ENARM')
          ? 'ENARM'
          : 'EGEL';

    const scoreValue = Number(exam.score ?? exam.score_total ?? 0);

    // Escala CENEVAL (>=1000) o porcentaje ENARM (>=60%)
    const isPassing = normalizedType === 'ENARM' ? accuracyPercent >= 60 : scoreValue >= 1000;

    const criteriaTable = examCriteria[normalizedType] || examCriteria['EGEL'];

    return (
        <>
            <Head title="Resultados y Retroalimentación del Examen" />
            <StrikeAlert />
            <Watermark />

            <div
                className={`py-8 bg-gray-50 min-h-screen select-none ${isBlurred ? 'blur-xl pointer-events-none' : ''}`}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Header con temporizador de vigencia de retroalimentación */}
                    {initialTimeLeft && initialTimeLeft > 0 ? (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl shadow-sm sticky top-4 z-10 border border-gray-200">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                                    Retroalimentación — {exam.quiz?.title || 'Evaluación'}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Por seguridad del contenido, al concluir el tiempo esta ventana se cerrará automáticamente.
                                </p>
                            </div>
                            <div className="flex items-center text-rose-600 font-bold bg-rose-50 px-4 py-2 rounded-full border border-rose-200 shadow-xs shrink-0">
                                <Clock className="w-4 h-4 mr-2 animate-pulse" />
                                <span className="text-xs uppercase tracking-wider mr-2">Cierra en:</span>
                                <span className="font-mono text-base">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    ) : null}

                    {/* Resumen de Resultados + Tabla de Referencia */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <Card className="lg:col-span-7 shadow-md overflow-hidden border-neutral-200/80 flex flex-col justify-between">
                            <div className={`h-2.5 ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <CardHeader className="text-center pb-2">
                                <Badge
                                    variant="outline"
                                    className="mx-auto mb-2 uppercase tracking-widest text-[11px] font-bold px-3 py-0.5 border-indigo-200 text-indigo-700 bg-indigo-50"
                                >
                                    Escala {normalizedType}
                                </Badge>
                                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                                    Tus Resultados
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    {isPassing ? (
                                        <CheckCircle className="w-16 h-16 text-emerald-500" />
                                    ) : (
                                        <XCircle className="w-16 h-16 text-rose-500" />
                                    )}

                                    <div className="text-center">
                                        <div className="text-5xl font-black text-gray-900 tracking-tight flex items-baseline justify-center gap-2">
                                            {scoreValue}
                                            <span className="text-xl text-gray-500 font-semibold tracking-normal">
                                                Puntos
                                            </span>
                                        </div>
                                        {normalizedType !== 'ENARM' && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Escala CENEVAL (700 puntos base + puntos por reactivos acertados; satisfactorio &ge; 1000)
                                            </p>
                                        )}
                                    </div>

                                    <div className="w-full max-w-md pt-2 space-y-2">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-emerald-700">
                                                Aciertos: {totalCorrect} ({accuracyPercent}%)
                                            </span>
                                            <span className="text-rose-600">
                                                Incorrectas / Sin responder: {totalIncorrect} ({100 - accuracyPercent}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-3.5 rounded-full bg-rose-100 overflow-hidden flex border border-gray-200">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-500"
                                                style={{ width: `${accuracyPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-center text-sm text-gray-700 font-medium pt-1">
                                            Respondiste correctamente <span className="font-bold text-gray-900">{totalCorrect}</span> de un total de <span className="font-bold text-gray-900">{totalQuestions}</span> reactivos.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-center gap-3 bg-gray-50 p-4 border-t">
                                <Link href="/alumno">
                                    <Button variant="outline">Volver al inicio</Button>
                                </Link>
                                <Link href={courseIdForReturn ? `/alumno/curso/${courseIdForReturn}` : '/alumno'}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        Regresar al curso
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {criteriaTable && (
                            <Card className="lg:col-span-5 shadow-md border-neutral-200/80 flex flex-col">
                                <CardHeader className="pb-3 bg-slate-900 text-white rounded-t-xl">
                                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                                        <Award className="w-4 h-4" /> Tabla de Referencia
                                    </div>
                                    <CardTitle className="text-base font-bold leading-snug text-white">
                                        {criteriaTable.title}
                                    </CardTitle>
                                    {criteriaTable.subtitle && (
                                        <CardDescription className="text-xs text-slate-300">
                                            {criteriaTable.subtitle}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0 flex-1 overflow-y-auto max-h-[340px]">
                                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                        <thead>
                                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                                                <th className="py-2.5 px-4">{criteriaTable.columns?.[0] || 'Nivel / Área'}</th>
                                                {normalizedType === 'ENARM' && (
                                                    <th className="py-2.5 px-3 text-center">{criteriaTable.columns?.[1] || 'Máximo'}</th>
                                                )}
                                                <th className="py-2.5 px-4 text-right">
                                                    {normalizedType === 'ENARM'
                                                        ? criteriaTable.columns?.[2] || 'Mínimo'
                                                        : criteriaTable.columns?.[1] || 'Puntaje'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(criteriaTable.rows || []).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/80">
                                                    <td className="py-2.5 px-4 font-semibold text-slate-800">{row.label}</td>
                                                    {normalizedType === 'ENARM' && (
                                                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">{row.max}</td>
                                                    )}
                                                    <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-700">
                                                        {row.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Revisión Detallada con hover-to-reveal por tarjeta */}
                    {feedback && feedback.length > 0 && (
                        <Card className="shadow-md border-neutral-200/80">
                            <CardHeader className="border-b border-neutral-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-xl font-bold flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-indigo-600" />
                                    Revisión del Examen y Retroalimentación
                                </CardTitle>
                                <span className="text-xs text-slate-500 hidden sm:inline">
                                    Pasa el cursor sobre cada tarjeta para visualizar el detalle
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                {feedback.map((item, index) => {
                                    const questionId =
                                        item.correct_answer?.question_id ||
                                        item.correct_answer?.pregunta_id ||
                                        item.user_answer?.name;
                                    const question =
                                        questions.find((q) => Number(q.id) === Number(questionId)) ||
                                        item.correct_answer?.question;

                                    if (!question) return null;

                                    const userAnswerObj = question.answers?.find(
                                        (a: any) => Number(a.id) === Number(item.user_answer?.value),
                                    );
                                    const explanationHtml = question.explanation || question.opciones || null;
                                    const qImageUrl = resolveQuestionImageUrl(question.image || question.imagen);

                                    const isCorrect = item.status === 'correct';
                                    const isUnanswered = item.status === 'unanswered';
                                    const isRevealed = Boolean(revealedCards[index]);

                                    const containerClass = isCorrect
                                        ? 'p-5 rounded-xl border border-emerald-200 bg-emerald-50/70 group relative transition-all'
                                        : isUnanswered
                                          ? 'p-5 rounded-xl border border-amber-200 bg-amber-50/70 group relative transition-all'
                                          : 'p-5 rounded-xl border border-rose-200 bg-rose-50/70 group relative transition-all';

                                    const iconColor = isCorrect
                                        ? 'text-emerald-600'
                                        : isUnanswered
                                          ? 'text-amber-600'
                                          : 'text-rose-600';
                                    const textColor = isCorrect
                                        ? 'text-emerald-800'
                                        : isUnanswered
                                          ? 'text-amber-800'
                                          : 'text-rose-800';

                                    return (
                                        <div
                                            key={index}
                                            className={containerClass}
                                            onClick={() =>
                                                setRevealedCards((prev) => ({
                                                    ...prev,
                                                    [index]: !prev[index],
                                                }))
                                            }
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-white font-bold text-xs text-gray-700 border shadow-2xs">
                                                    Reactivo #{index + 1}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-full border transition-opacity ${
                                                        isRevealed ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                                                    }`}
                                                >
                                                    <Eye className="w-3 h-3" /> Pasa el cursor para revelar
                                                </span>
                                            </div>

                                            <div
                                                className={`transition-all duration-200 ${
                                                    isRevealed
                                                        ? 'blur-none opacity-100'
                                                        : 'blur-[5px] opacity-65 group-hover:blur-none group-hover:opacity-100'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <MathHtml
                                                        html={question.text || question.pregunta || ''}
                                                        className="font-semibold text-gray-900 prose prose-sm max-w-none"
                                                    />
                                                </div>

                                                {qImageUrl && (
                                                    <div className="my-3 flex justify-center bg-white/80 p-2 rounded-lg border">
                                                        <img
                                                            src={qImageUrl}
                                                            alt={`Reactivo ${index + 1}`}
                                                            className="max-h-64 object-contain rounded"
                                                            draggable={false}
                                                            onContextMenu={(e) => e.preventDefault()}
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-3 space-y-2.5 text-sm">
                                                    <div className="flex items-start">
                                                        {isCorrect ? (
                                                            <CheckCircle className={`w-5 h-5 ${iconColor} mr-2 shrink-0 mt-0.5`} />
                                                        ) : (
                                                            <XCircle className={`w-5 h-5 ${iconColor} mr-2 shrink-0 mt-0.5`} />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <span className={`font-bold ${textColor} block`}>Tu respuesta:</span>
                                                            {userAnswerObj ? (
                                                                <MathHtml
                                                                    html={userAnswerObj.text || userAnswerObj.respuesta || ''}
                                                                    className="text-gray-800 prose prose-sm max-w-none"
                                                                />
                                                            ) : (
                                                                <span className="italic text-gray-600">No respondida</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!isCorrect && item.correct_answer && (
                                                        <div
                                                            className={`flex items-start pt-2.5 border-t ${
                                                                isUnanswered ? 'border-amber-200/80' : 'border-rose-200/80'
                                                            }`}
                                                        >
                                                            <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-bold text-emerald-800 block">
                                                                    Respuesta correcta:
                                                                </span>
                                                                <MathHtml
                                                                    html={item.correct_answer.text || item.correct_answer.respuesta || ''}
                                                                    className="text-gray-800 prose prose-sm max-w-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {explanationHtml && (
                                                        <div className="mt-3 pt-3 border-t border-indigo-200/60 bg-white/90 rounded-lg p-3.5 shadow-2xs">
                                                            <div className="flex items-start gap-2.5">
                                                                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                                <div className="space-y-1 min-w-0 flex-1">
                                                                    <span className="font-bold text-indigo-950 text-xs uppercase tracking-wider block">
                                                                        Explicación / Justificación:
                                                                    </span>
                                                                    <MathHtml
                                                                        html={explanationHtml}
                                                                        className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
