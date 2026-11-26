import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import MathHtml from '@/components/MathHtml';

interface TakeProps {
    quiz: any;
    exam: any;
    questions: any[];
    savedAnswers: any[];
    timeLeft: number | null;
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

export default function Take({ quiz, exam, questions = [], savedAnswers = [], timeLeft: initialTimeLeft }: TakeProps) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';

    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
        onBlocked: (redirectUrl) => {
            router.visit(redirectUrl || '/alumno/cuenta-bloqueada');
        },
    });

    const hasTimeLimit = initialTimeLeft !== null && initialTimeLeft !== undefined;
    const [timeLeft, setTimeLeft] = useState<number | null>(
        hasTimeLimit ? Math.max(0, Math.floor(Number(initialTimeLeft))) : null,
    );

    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [revealedQuestionIds, setRevealedQuestionIds] = useState<Record<number, boolean>>({});
    const [navFilter, setNavFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const answersRef = useRef<Record<number, number>>(answers);
    const isSubmittingRef = useRef(false);
    const lastEventAtRef = useRef(0);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        const initialAnswers: Record<number, number> = {};
        if (Array.isArray(savedAnswers)) {
            savedAnswers.forEach((ans) => {
                if (ans && ans.name && ans.value) {
                    initialAnswers[Number(ans.name)] = Number(ans.value);
                }
            });
        }
        setAnswers(initialAnswers);
    }, [savedAnswers]);

    // Agrupar preguntas consecutivas que compartan slug no vacío (casos clínicos seriados)
    const questionGroups = useMemo(() => {
        const groups: { slug: string; questions: { question: any; globalIndex: number }[] }[] = [];

        questions.forEach((q, idx) => {
            const slug = String(q.slug || '').trim();
            const lastGroup = groups[groups.length - 1];

            if (slug !== '' && lastGroup && lastGroup.slug === slug) {
                lastGroup.questions.push({ question: q, globalIndex: idx });
            } else {
                groups.push({
                    slug: slug !== '' ? slug : `__single_${q.id}`,
                    questions: [{ question: q, globalIndex: idx }],
                });
            }
        });

        return groups;
    }, [questions]);

    const questionToGroupMap = useMemo(() => {
        const map: Record<number, number> = {};
        questionGroups.forEach((grp, gIdx) => {
            grp.questions.forEach((item) => {
                map[item.question.id] = gIdx;
            });
        });
        return map;
    }, [questionGroups]);

    const submitExam = useCallback(() => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setShowConfirmModal(false);

        const formattedAnswers = Object.keys(answersRef.current).map((qId) => ({
            name: parseInt(qId, 10),
            value: answersRef.current[parseInt(qId, 10)],
        }));

        router.post(`/alumno/exams/${exam.id}/finish`, {
            answers: formattedAnswers,
        });
    }, [exam.id]);

    // Temporizador: solo corre si timeLeft !== null
    useEffect(() => {
        if (!hasTimeLimit || timeLeft === null) return;

        if (timeLeft <= 0) {
            submitExam();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
        }, 1000);

        return () => clearInterval(timerId);
    }, [hasTimeLimit, timeLeft, submitExam]);

    // Auto-save en pagehide y registro de visibilitychange + window.blur en /events
    useEffect(() => {
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

        const reportEvent = (observacion: string) => {
            if (isSubmittingRef.current) return;
            const now = Date.now();
            if (now - lastEventAtRef.current < 1500) return;
            lastEventAtRef.current = now;

            fetch(`/alumno/exams/${exam.id}/events`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    observacion,
                    lugar: 'Pantalla de Examen',
                }),
            }).catch((e) => console.error(e));
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                reportEvent('El alumno cambió de pestaña o minimizó el navegador');
            }
        };

        const handleWindowBlur = () => {
            reportEvent('Pérdida de foco de la ventana del examen (window.blur)');
        };

        const handlePageHide = () => {
            if (isSubmittingRef.current) return;
            const currentAnswers = Object.keys(answersRef.current).map((qId) => ({
                name: parseInt(qId, 10),
                value: answersRef.current[parseInt(qId, 10)],
            }));
            if (currentAnswers.length === 0) return;

            fetch(`/alumno/exams/${exam.id}/save-answer`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    answers: currentAnswers,
                }),
            }).catch(() => {});
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [exam.id]);

    const formatTime = (seconds: number) => {
        const validSeconds = Math.max(0, Math.floor(seconds));
        const h = Math.floor(validSeconds / 3600)
            .toString()
            .padStart(2, '0');
        const m = Math.floor((validSeconds % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const s = (validSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleSelectAnswer = (questionId: number, answerId: number) => {
        const updatedAnswers = { ...answers, [questionId]: answerId };
        setAnswers(updatedAnswers);

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
        fetch(`/alumno/exams/${exam.id}/save-answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                answers: [{ name: questionId, value: answerId }],
            }),
        }).catch((err) => console.error('Error auto-saving', err));
    };

    const currentGroup = questionGroups[currentGroupIndex];
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = Math.max(0, questions.length - answeredCount);

    if (!currentGroup) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
                No hay preguntas activas registradas para este examen.
            </main>
        );
    }

    const isSerialGroup = currentGroup.questions.length > 1;
    const firstGlobal = currentGroup.questions[0].globalIndex + 1;
    const lastGlobal = currentGroup.questions[currentGroup.questions.length - 1].globalIndex + 1;

    return (
        <>
            <Head title={`Examen: ${quiz.title}`} />
            <StrikeAlert />
            <Watermark />

            <main
                className={`py-6 bg-slate-50 min-h-screen select-none ${isBlurred ? 'blur-xl pointer-events-none' : ''}`}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm mb-6 sticky top-4 z-20 border border-slate-200">
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-indigo-200 text-indigo-700 bg-indigo-50">
                                    {quiz.type || 'Evaluación'}
                                </Badge>
                                <span className="text-xs text-slate-500 font-medium">
                                    {answeredCount} / {questions.length} respondidas
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{quiz.title}</h2>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            {hasTimeLimit && timeLeft !== null ? (
                                <div
                                    className={`flex items-center font-mono font-bold px-3.5 py-1.5 rounded-full border ${
                                        timeLeft <= 300
                                            ? 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse'
                                            : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                    }`}
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    {formatTime(timeLeft)}
                                </div>
                            ) : (
                                <div className="flex items-center text-slate-600 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    Sin límite de tiempo
                                </div>
                            )}
                            <Button
                                onClick={() => setShowConfirmModal(true)}
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Finalizar Examen
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Question / Clinical Case Group Area */}
                        <div className="lg:col-span-3 space-y-5">
                            {isSerialGroup && (
                                <div className="bg-indigo-950 text-white px-5 py-3 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        <Layers className="w-4 h-4 text-indigo-300" />
                                        Caso Clínico / Serie de Reactivos ({firstGlobal} - {lastGlobal} de {questions.length})
                                    </div>
                                    <span className="text-xs text-indigo-200">
                                        {currentGroup.questions.length} reactivos vinculados
                                    </span>
                                </div>
                            )}

                            {currentGroup.questions.map(({ question, globalIndex }) => {
                                const qImageUrl = resolveQuestionImageUrl(question.image);
                                const isExplicitRevealed = Boolean(revealedQuestionIds[question.id]);

                                return (
                                    <Card
                                        key={question.id}
                                        className="shadow-md border-slate-200/80 group relative overflow-hidden"
                                        onClick={() =>
                                            setRevealedQuestionIds((prev) => ({
                                                ...prev,
                                                [question.id]: true,
                                            }))
                                        }
                                    >
                                        <CardContent className="p-6 sm:p-8">
                                            <div className="mb-5 flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    Pregunta {globalIndex + 1} de {questions.length}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full transition-opacity ${
                                                        isExplicitRevealed ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                                                    }`}
                                                >
                                                    <Eye className="w-3 h-3" /> Pasa el cursor para revelar
                                                </span>
                                            </div>

                                            {/* Hover-to-reveal content wrapper */}
                                            <div
                                                className={`transition-all duration-200 ${
                                                    isExplicitRevealed
                                                        ? 'blur-none opacity-100'
                                                        : 'blur-[5px] opacity-60 group-hover:blur-none group-hover:opacity-100 group-focus-within:blur-none group-focus-within:opacity-100'
                                                }`}
                                            >
                                                <MathHtml
                                                    html={question.text}
                                                    className="prose max-w-none text-base sm:text-lg text-slate-800 mb-6"
                                                />

                                                {qImageUrl && (
                                                    <div className="mb-6 flex justify-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                        <img
                                                            src={qImageUrl}
                                                            alt={`Imagen pregunta ${globalIndex + 1}`}
                                                            className="max-h-80 object-contain rounded-lg"
                                                            draggable={false}
                                                            onContextMenu={(e) => e.preventDefault()}
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {(question.answers || []).map((ans: any) => {
                                                        const ansImgUrl = resolveQuestionImageUrl(ans.image);
                                                        const isSelected = Number(answers[question.id]) === Number(ans.id);

                                                        return (
                                                            <label
                                                                key={ans.id}
                                                                className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors duration-150 ${
                                                                    isSelected
                                                                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                                                        : 'border-slate-200 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`question_${question.id}`}
                                                                    className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 shrink-0"
                                                                    checked={isSelected}
                                                                    onChange={() => handleSelectAnswer(question.id, ans.id)}
                                                                />
                                                                <div className="ml-3 flex-1 min-w-0 space-y-2">
                                                                    <MathHtml
                                                                        html={ans.text}
                                                                        className="text-slate-700 prose prose-sm max-w-none"
                                                                    />
                                                                    {ansImgUrl && (
                                                                        <img
                                                                            src={ansImgUrl}
                                                                            alt="Opción"
                                                                            className="max-h-40 object-contain rounded border"
                                                                            draggable={false}
                                                                            onContextMenu={(e) => e.preventDefault()}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            <div className="flex justify-between pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setCurrentGroupIndex((prev) => Math.max(0, prev - 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={currentGroupIndex === 0}
                                >
                                    Anterior
                                </Button>
                                {currentGroupIndex < questionGroups.length - 1 ? (
                                    <Button
                                        variant="default"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        onClick={() => {
                                            setCurrentGroupIndex((prev) => Math.min(questionGroups.length - 1, prev + 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        Siguiente
                                    </Button>
                                ) : (
                                    <Button
                                        variant="default"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => setShowConfirmModal(true)}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Finalizar Examen
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Navigation Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-md sticky top-24 border-slate-200/80">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Navegación de Reactivos
                                        </h3>
                                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {answeredCount}/{questions.length}
                                        </span>
                                    </div>

                                    {questions.length > 15 && (
                                        <div className="grid grid-cols-3 gap-1 mb-3 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => setNavFilter('all')}
                                                className={`py-1 rounded-md transition-colors cursor-pointer ${
                                                    navFilter === 'all'
                                                        ? 'bg-white text-slate-900 shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                Todas
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNavFilter('unanswered')}
                                                className={`py-1 rounded-md transition-colors cursor-pointer ${
                                                    navFilter === 'unanswered'
                                                        ? 'bg-white text-amber-700 shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                Pend. ({unansweredCount})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNavFilter('answered')}
                                                className={`py-1 rounded-md transition-colors cursor-pointer ${
                                                    navFilter === 'answered'
                                                        ? 'bg-white text-indigo-700 shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                Resp. ({answeredCount})
                                            </button>
                                        </div>
                                    )}

                                    <div className="max-h-[42vh] overflow-y-auto pr-1">
                                        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-1.5">
                                            {questions.map((q, idx) => {
                                                const isAnswered = Boolean(answers[q.id]);
                                                if (navFilter === 'unanswered' && isAnswered) return null;
                                                if (navFilter === 'answered' && !isAnswered) return null;

                                                const targetGroupIdx = questionToGroupMap[q.id] ?? 0;
                                                const isCurrent = targetGroupIdx === currentGroupIndex;

                                                return (
                                                    <button
                                                        key={q.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCurrentGroupIndex(targetGroupIdx);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className={`h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                                                            isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                                                        } ${
                                                            isAnswered
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="mt-6 border-t border-slate-100 pt-4 space-y-2">
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2" />
                                            Respondidas ({answeredCount})
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <div className="w-3 h-3 rounded-full bg-slate-200 mr-2 border border-slate-300" />
                                            Sin responder ({unansweredCount})
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* In-page confirmation modal (avoids window.confirm firing window.blur) */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <AlertTriangle className="w-6 h-6 shrink-0" />
                            <h3 className="text-lg font-bold text-slate-900">¿Finalizar y enviar examen?</h3>
                        </div>
                        <p className="text-sm text-slate-600">
                            Has respondido <strong>{answeredCount}</strong> de <strong>{questions.length}</strong> preguntas.
                            {unansweredCount > 0 && (
                                <span className="block mt-1 text-amber-700 font-medium">
                                    Aún quedan {unansweredCount} reactivos sin responder.
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)}>
                                Seguir contestando
                            </Button>
                            <Button
                                type="button"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={submitExam}
                            >
                                Sí, Enviar Examen
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Layout limpio focalizado sin sidebar
Take.layout = (page: React.ReactNode) => <>{page}</>;
