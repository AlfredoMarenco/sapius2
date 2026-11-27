import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, Lock, XCircle, Award } from 'lucide-react';
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

interface PreviewProps {
    quiz: any;
    enrollment_id: number;
    scheduled_course_id?: number;
    attemptsCount: number;
    hasActiveAttempt?: boolean;
    isScheduleAvailable?: boolean;
    exams: any[];
    examCriteria?: Record<string, CriteriaTable>;
    vigencia_formatted?: string | null;
}

function formatTimeLimitHms(quiz: any): string {
    if (quiz.time_limit_formatted) {
        return quiz.time_limit_formatted;
    }

    const totalSec = Number(quiz.time_limit_seconds || 0);
    if (totalSec > 0) {
        const h = Math.floor(totalSec / 3600)
            .toString()
            .padStart(2, '0');
        const m = Math.floor((totalSec % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const s = (totalSec % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    const raw = quiz.time_limit;
    if (!raw || raw === '0' || raw === '00:00:00') {
        return 'Sin límite de tiempo';
    }

    const str = String(raw).trim();
    if (/^\d{1,3}:\d{2}:\d{2}$/.test(str)) {
        const [hh, mm, ss] = str.split(':');
        return `${hh.padStart(2, '0')}:${mm}:${ss}`;
    }
    if (/^\d+$/.test(str)) {
        const mins = parseInt(str, 10);
        if (mins <= 0) return 'Sin límite de tiempo';
        const h = Math.floor(mins / 60)
            .toString()
            .padStart(2, '0');
        const m = (mins % 60).toString().padStart(2, '0');
        return `${h}:${m}:00`;
    }

    return str;
}

export default function Preview({
    quiz,
    enrollment_id,
    scheduled_course_id,
    attemptsCount,
    hasActiveAttempt = false,
    isScheduleAvailable = true,
    exams = [],
    examCriteria = {},
    vigencia_formatted = null,
}: PreviewProps) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';
    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
    });

    const attemptsAllowed = Number(quiz.attempts_allowed ?? 1);
    const attemptsLeft = Math.max(0, attemptsAllowed - attemptsCount);
    const canTake = isScheduleAvailable && (hasActiveAttempt || attemptsAllowed <= 0 || attemptsLeft > 0);

    const backHref =
        quiz.lesson_id && scheduled_course_id
            ? `/alumno/modulo/${quiz.lesson_id}/${scheduled_course_id}`
            : scheduled_course_id
              ? `/alumno/curso/${scheduled_course_id}`
              : '/alumno';

    return (
        <>
            <Head title={`Examen: ${quiz.title}`} />
            <StrikeAlert />
            <Watermark />

            <div
                className={`py-10 px-4 select-none ${isBlurred ? 'blur-xl pointer-events-none' : ''}`}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-lg border-t-4 border-t-indigo-500">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline" className="text-indigo-700 border-indigo-200 bg-indigo-50">
                                    {quiz.type || 'Evaluación'}
                                </Badge>
                                {typeof quiz.questions_count === 'number' && (
                                    <span className="text-xs font-semibold text-gray-500">
                                        {quiz.questions_count} reactivos
                                    </span>
                                )}
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800 mt-2">{quiz.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {quiz.description && (
                                <MathHtml
                                    html={quiz.description}
                                    className="prose max-w-none text-gray-600"
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <Clock className="w-6 h-6 text-indigo-500 mr-3 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Tiempo límite</p>
                                        <p className="text-base font-bold font-mono text-gray-800">{formatTimeLimitHms(quiz)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <CheckCircle className="w-6 h-6 text-indigo-500 mr-3 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Intentos permitidos</p>
                                        <p className="text-base font-bold text-gray-800">{attemptsAllowed}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <AlertTriangle className="w-6 h-6 text-indigo-500 mr-3 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Intentos realizados</p>
                                        <p className="text-base font-bold text-gray-800">{attemptsCount}</p>
                                    </div>
                                </div>
                            </div>

                            {exams.length > 0 && (() => {
                                const latestExam = exams[0];
                                const totalQuestions = Number(latestExam.total_preguntas || quiz.questions_count || 0);
                                const totalCorrect = Number(latestExam.total_correctas || 0);
                                const totalIncorrect = Math.max(0, totalQuestions - totalCorrect);
                                const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                                const rawQuizType = (quiz.type || 'EGEL').toString().toUpperCase();
                                const normalizedType = rawQuizType.includes('EXANI')
                                    ? 'EXANI'
                                    : rawQuizType.includes('ENARM')
                                      ? 'ENARM'
                                      : 'EGEL';
                                const scoreValue = Number(latestExam.score ?? latestExam.score_total ?? 0);
                                const isPassing = normalizedType === 'ENARM' ? accuracyPercent >= 60 : scoreValue >= 1000;
                                const criteriaTable = examCriteria[normalizedType] || examCriteria['EGEL'];

                                return (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                                        <Card className="lg:col-span-7 shadow-sm overflow-hidden border-neutral-200/80 flex flex-col justify-between">
                                            <div className={`h-2 ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <CardHeader className="text-center pb-2">
                                                <Badge
                                                    variant="outline"
                                                    className="mx-auto mb-1 uppercase tracking-widest text-[11px] font-bold px-3 py-0.5 border-indigo-200 text-indigo-700 bg-indigo-50"
                                                >
                                                    Escala {normalizedType}
                                                </Badge>
                                                <CardTitle className="text-xl font-extrabold text-gray-900">
                                                    Tu Último Resultado
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    {isPassing ? (
                                                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="w-12 h-12 text-rose-500" />
                                                    )}
                                                    <div className="text-center">
                                                        <div className="text-4xl font-black text-gray-900 tracking-tight flex items-baseline justify-center gap-2">
                                                            {scoreValue}
                                                            <span className="text-base text-gray-500 font-semibold">Puntos</span>
                                                        </div>
                                                        {normalizedType !== 'ENARM' && (
                                                            <p className="text-[11px] text-gray-500 mt-1">
                                                                Escala CENEVAL (satisfactorio &ge; 1000)
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="w-full max-w-md pt-2 space-y-1.5">
                                                        <div className="flex justify-between text-xs font-semibold">
                                                            <span className="text-emerald-700">
                                                                Aciertos: {totalCorrect} ({accuracyPercent}%)
                                                            </span>
                                                            <span className="text-rose-600">
                                                                Incorrectas: {totalIncorrect} ({100 - accuracyPercent}%)
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-3 rounded-full bg-rose-100 overflow-hidden flex border border-gray-200">
                                                            <div
                                                                className="bg-emerald-500 h-full transition-all duration-500"
                                                                style={{ width: `${accuracyPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t flex flex-col items-center gap-2 text-center">
                                                    {latestExam.feedback_available ? (
                                                        <>
                                                            <Link href={`/alumno/exams/${latestExam.id}/feedback`}>
                                                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                                                    {latestExam.feedback_status === 'in_progress'
                                                                        ? 'Continuar Retroalimentación'
                                                                        : 'Ver Retroalimentación'}
                                                                </Button>
                                                            </Link>
                                                            <p className="text-[11px] text-gray-500">
                                                                {latestExam.feedback_status === 'in_progress'
                                                                    ? 'Tu sesión de revisión sigue activa.'
                                                                    : vigencia_formatted
                                                                      ? `Al abrirla tendrás ${vigencia_formatted} para revisar tus reactivos.`
                                                                      : 'Solo podrás visualizar la retroalimentación una vez.'}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                                            <Lock className="w-3.5 h-3.5" />
                                                            {latestExam.feedback_status === 'expired'
                                                                ? 'Vigencia de retroalimentación concluida'
                                                                : 'Retroalimentación ya visualizada'}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {criteriaTable && (
                                            <Card className="lg:col-span-5 shadow-sm border-neutral-200/80 flex flex-col">
                                                <CardHeader className="pb-3 bg-slate-900 text-white rounded-t-xl">
                                                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                                                        <Award className="w-4 h-4" /> Tabla de Referencia
                                                    </div>
                                                    <CardTitle className="text-sm font-bold leading-snug text-white">
                                                        {criteriaTable.title}
                                                    </CardTitle>
                                                    {criteriaTable.subtitle && (
                                                        <CardDescription className="text-xs text-slate-300">
                                                            {criteriaTable.subtitle}
                                                        </CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="p-0 flex-1 overflow-y-auto max-h-[280px]">
                                                    <table className="w-full text-left border-collapse text-xs">
                                                        <thead>
                                                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                                                                <th className="py-2 px-3">{criteriaTable.columns?.[0] || 'Nivel / Área'}</th>
                                                                {normalizedType === 'ENARM' && (
                                                                    <th className="py-2 px-2 text-center">{criteriaTable.columns?.[1] || 'Máximo'}</th>
                                                                )}
                                                                <th className="py-2 px-3 text-right">
                                                                    {normalizedType === 'ENARM'
                                                                        ? criteriaTable.columns?.[2] || 'Mínimo'
                                                                        : criteriaTable.columns?.[1] || 'Puntaje'}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {(criteriaTable.rows || []).map((row, idx) => (
                                                                <tr key={idx} className="hover:bg-slate-50/80">
                                                                    <td className="py-2 px-3 font-semibold text-slate-800">{row.label}</td>
                                                                    {normalizedType === 'ENARM' && (
                                                                        <td className="py-2 px-2 text-center font-mono text-slate-600">{row.max}</td>
                                                                    )}
                                                                    <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">
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
                                );
                            })()}

                            {exams.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold mb-4">Tus Intentos Previos</h3>
                                    <div className="overflow-x-auto border rounded-xl">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 border-b">
                                                    <th className="p-3 text-xs font-bold uppercase text-gray-600">Fecha</th>
                                                    <th className="p-3 text-xs font-bold uppercase text-gray-600">Aciertos</th>
                                                    <th className="p-3 text-xs font-bold uppercase text-gray-600">Puntaje</th>
                                                    <th className="p-3 text-xs font-bold uppercase text-gray-600">Retroalimentación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.map((exam) => {
                                                    const scoreVal = exam.score ?? exam.score_total ?? 0;
                                                    const dateVal = exam.finished_at || exam.updated_at;
                                                    const canViewFeedback = Boolean(exam.feedback_available);

                                                    return (
                                                        <tr key={exam.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                                            <td className="p-3 text-sm text-gray-800">
                                                                {dateVal ? new Date(dateVal).toLocaleString() : 'N/A'}
                                                            </td>
                                                            <td className="p-3 text-sm text-gray-800">
                                                                {exam.total_correctas} / {exam.total_preguntas}
                                                            </td>
                                                            <td className="p-3 text-sm font-bold text-gray-900">
                                                                {scoreVal} pts
                                                            </td>
                                                            <td className="p-3 text-sm">
                                                                {canViewFeedback ? (
                                                                    <Link
                                                                        href={`/alumno/exams/${exam.id}/feedback`}
                                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold underline"
                                                                    >
                                                                        Ver Retroalimentación
                                                                    </Link>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                                                        <Lock className="w-3 h-3" />
                                                                        {exam.feedback_status === 'expired'
                                                                            ? 'Vigencia concluida'
                                                                            : 'Ya visualizada / bloqueada'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between mt-4 border-t pt-5">
                            <Link href={backHref}>
                                <Button variant="outline">Volver</Button>
                            </Link>
                            {!isScheduleAvailable ? (
                                <p className="text-amber-700 font-semibold text-sm flex items-center gap-1.5">
                                    <Lock className="w-4 h-4" /> Evaluación fuera de periodo programado.
                                </p>
                            ) : canTake ? (
                                <Link href={`/alumno/exams/${quiz.id}/take/${enrollment_id}`}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {hasActiveAttempt ? 'Retomar Examen' : 'Comenzar Examen'}
                                    </Button>
                                </Link>
                            ) : (
                                <p className="text-red-500 font-semibold text-sm">Has agotado tus intentos para este examen.</p>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}

Preview.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Inicio', href: '/alumno' },
            { title: 'Previa de Evaluación', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
