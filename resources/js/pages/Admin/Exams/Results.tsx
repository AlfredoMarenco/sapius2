import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Award,
    ChevronLeft,
    Download,
    RotateCcw,
    Eye,
    EyeOff,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ShieldAlert,
    X,
} from 'lucide-react';

interface ExamEventItem {
    fecha_hora?: string;
    observacion?: string;
    tecla?: string;
    lugar?: string;
}

interface ExamItem {
    id: number;
    quiz_id: number;
    quiz_title: string;
    quiz_description: string;
    quiz_type?: string;
    min_score: number;
    max_score: number;
    duration: number | string;
    score: number;
    correct_answers: number;
    total_questions: number;
    finished: string;
    feedback_viewed: string;
    feedback_status?: string;
    is_best_attempt?: boolean;
    is_late?: boolean;
    eventos?: ExamEventItem[];
    created_at: string | null;
    updated_at: string | null;
}

interface NotPresentedQuiz {
    id: number;
    title: string;
    type: string;
    min_score: number;
    max_score: number;
}

interface EnrollmentInfo {
    id: number;
    user_id: number;
    student_name: string;
    student_email: string;
    accepted: string;
    cohort_id: number;
    cohort_internal_id: string;
    course_title: string;
}

interface Props {
    enrollment: EnrollmentInfo;
    exams: ExamItem[];
    notPresentedQuizzes?: NotPresentedQuiz[];
}

export default function Results({ enrollment, exams = [], notPresentedQuizzes = [] }: Props) {
    const [confirmModalId, setConfirmModalId] = useState<number | null>(null);
    const [eventsModalExam, setEventsModalExam] = useState<ExamItem | null>(null);

    const handleToggleFinished = (examId: number) => {
        router.post('/admin/examen/finalizar', { id: examId }, { preserveScroll: true });
    };

    const handleToggleRetro = (examId: number) => {
        router.post('/admin/examen/retro', { id: examId }, { preserveScroll: true });
    };

    const handleResetExam = (examId: number) => {
        router.post(
            '/admin/examen/reiniciar',
            { id: examId },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmModalId(null),
            },
        );
    };

    // Priorizar mejor intento finalizado para métricas resumen
    const bestFinishedExams = exams.filter((e) => e.finished === 'si' && (e.is_best_attempt ?? true));
    const metricSource = bestFinishedExams.length > 0 ? bestFinishedExams : exams;
    const passedCount = metricSource.filter((e) => Number(e.score) >= Number(e.min_score)).length;
    const avgScore =
        metricSource.length > 0
            ? (metricSource.reduce((acc, curr) => acc + Number(curr.score), 0) / metricSource.length).toFixed(1)
            : '0.0';

    const allEvents = exams.flatMap((ex) =>
        (ex.eventos || []).map((ev) => ({
            ...ev,
            exam_id: ex.id,
            quiz_title: ex.quiz_title,
        })),
    );

    return (
        <>
            <Head title={`Calificaciones - ${enrollment.student_name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/admin/curso/${enrollment.cohort_id}`}
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="size-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                                    {enrollment.cohort_internal_id}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {enrollment.course_title}
                                </span>
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                Resultados de Exámenes: {enrollment.student_name}
                            </h1>
                            <p className="text-xs text-muted-foreground">{enrollment.student_email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`/admin/exportCalificaciones/${enrollment.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all"
                        >
                            <Download className="size-4 text-rose-600" />
                            Descargar Calificaciones (PDF)
                        </a>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Intentos Registrados</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{exams.length}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Satisfactorios (Mejor Intento)</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{passedCount}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Promedio (Mejor Intento)</p>
                        <p className="text-2xl font-bold text-brand-blue mt-1">{avgScore} pts</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Incidencias Anti-Trampa</p>
                        <p className={`text-2xl font-bold mt-1 ${allEvents.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {allEvents.length}
                        </p>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Examen / Evaluación</th>
                                    <th className="px-6 py-4 text-center">Calificación</th>
                                    <th className="px-6 py-4 text-center">Aciertos</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-center">Retroalimentación</th>
                                    <th className="px-6 py-4 text-center">Eventos</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {exams.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                            Este alumno aún no ha presentado ninguna evaluación en esta cohorte.
                                        </td>
                                    </tr>
                                ) : (
                                    exams.map((exam) => {
                                        const isPassed = Number(exam.score) >= Number(exam.min_score);
                                        const isFeedbackEnabled = exam.feedback_viewed === 'no';
                                        const eventsCount = exam.eventos ? exam.eventos.length : 0;

                                        return (
                                            <tr key={exam.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue shrink-0">
                                                            <Award className="size-4" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-foreground">{exam.quiz_title}</p>
                                                                {exam.is_best_attempt && (
                                                                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                                                                        Mejor intento
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {exam.quiz_type || 'EXANI'} · Mín. satisfactorio: {exam.min_score} pts
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            isPassed
                                                                ? 'bg-green-500/10 text-green-700'
                                                                : 'bg-red-500/10 text-red-700'
                                                        }`}
                                                    >
                                                        {exam.score} / {exam.max_score}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap text-xs text-muted-foreground font-medium">
                                                    {exam.correct_answers} de {exam.total_questions} reactivos
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleFinished(exam.id)}
                                                        title="Clic para cambiar estado de finalizado"
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                                                            exam.finished === 'si'
                                                                ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20'
                                                                : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20'
                                                        }`}
                                                    >
                                                        {exam.finished === 'si' ? (
                                                            <>
                                                                <CheckCircle2 className="size-3.5" /> Finalizado
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="size-3.5" /> En Progreso
                                                            </>
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleRetro(exam.id)}
                                                        title={
                                                            isFeedbackEnabled
                                                                ? 'Habilitada: el alumno puede ver la retroalimentación. Clic para marcar como Consumida.'
                                                                : 'Consumida/bloqueada: el alumno ya no puede abrir la retroalimentación. Clic para volver a Habilitar.'
                                                        }
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                                                            isFeedbackEnabled
                                                                ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                                                                : 'bg-amber-500/10 text-amber-800 hover:bg-amber-500/20'
                                                        }`}
                                                    >
                                                        {isFeedbackEnabled ? (
                                                            <>
                                                                <Eye className="size-3.5" /> Habilitada
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff className="size-3.5" /> Consumida
                                                            </>
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    {eventsCount > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setEventsModalExam(exam)}
                                                            className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-500/20 transition-colors"
                                                        >
                                                            <ShieldAlert className="size-3.5" /> {eventsCount}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">0</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                    {exam.created_at || 'N/A'}
                                                </td>

                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => setConfirmModalId(exam.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm"
                                                        title="Reiniciar intento de examen para el alumno"
                                                    >
                                                        <RotateCcw className="size-3.5" />
                                                        Reiniciar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Evaluaciones Activas No Presentadas */}
                {notPresentedQuizzes.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-foreground">
                            Evaluaciones Activas No Presentadas ({notPresentedQuizzes.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {notPresentedQuizzes.map((qz) => (
                                <div key={qz.id} className="rounded-lg border border-amber-200/70 bg-amber-50/40 p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{qz.title}</p>
                                        <p className="text-xs text-muted-foreground">{qz.type} · Mín: {qz.min_score} pts</p>
                                    </div>
                                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                        NP
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabla de Eventos Anti-Trampa */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="size-5 text-rose-600" />
                            <h3 className="text-base font-bold text-foreground">
                                Registro de Eventos Anti-Trampa ({allEvents.length})
                            </h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3">Examen</th>
                                    <th className="px-6 py-3">Fecha / Hora</th>
                                    <th className="px-6 py-3">Observación</th>
                                    <th className="px-6 py-3">Tecla</th>
                                    <th className="px-6 py-3">Origen / Lugar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {allEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                                            No se han registrado eventos sospechosos en las evaluaciones de este alumno.
                                        </td>
                                    </tr>
                                ) : (
                                    allEvents.map((ev, idx) => (
                                        <tr key={idx} className="hover:bg-muted/20">
                                            <td className="px-6 py-3 font-medium text-foreground text-xs">{ev.quiz_title}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                                                {ev.fecha_hora || 'N/A'}
                                            </td>
                                            <td className="px-6 py-3 text-xs text-rose-700 font-medium">{ev.observacion || 'Evento registrado'}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{ev.tecla || '-'}</td>
                                            <td className="px-6 py-3 text-xs text-muted-foreground">{ev.lugar || 'Navegador Web'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación para Reiniciar Examen */}
            {confirmModalId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
                        <div className="flex items-center gap-3 text-red-600 mb-3">
                            <AlertTriangle className="size-6" />
                            <h3 className="text-lg font-bold text-foreground">¿Reiniciar este Examen?</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Esta acción eliminará las respuestas y calificación registrada de este intento, permitiendo que el alumno presente la prueba nuevamente desde cero.
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setConfirmModalId(null)}
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleResetExam(confirmModalId)}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
                            >
                                Sí, Reiniciar Examen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal detalle de eventos por examen */}
            {eventsModalExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="size-5 text-rose-600" />
                                <h3 className="text-lg font-bold text-foreground">
                                    Incidencias: {eventsModalExam.quiz_title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setEventsModalExam(null)}
                                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-border">
                            {(eventsModalExam.eventos || []).map((ev, i) => (
                                <div key={i} className="py-2.5 text-xs space-y-0.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-rose-700">{ev.observacion}</span>
                                        <span className="font-mono text-muted-foreground">{ev.fecha_hora}</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        Lugar: {ev.lugar || 'Web'} {ev.tecla ? `· Tecla: ${ev.tecla}` : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Results.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Panel de Control', href: '/admin' }, { title: 'Resultados', href: '#' }]}>
        {page}
    </AppLayout>
);
