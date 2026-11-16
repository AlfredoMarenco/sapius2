import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Download, Award, CheckCircle2, Clock, Lock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExamRow {
    id: number;
    quiz_id: number;
    quiz_title: string;
    quiz_type: string;
    score: number;
    min_score: number;
    max_score: number;
    total_correctas: number;
    total_preguntas: number;
    finalizado: string;
    retro_visualizado: string;
    feedback_available: boolean;
    is_late: boolean;
    created_at: string | null;
    updated_at: string | null;
}

interface PendingQuiz {
    id: number;
    title: string;
    type: string;
}

interface Props {
    enrollment: {
        id: number;
        cohort_id: number | null;
        cohort_identifier: string;
        course_title: string;
    };
    exams: ExamRow[];
    pendingQuizzes: PendingQuiz[];
}

export default function Results({ enrollment, exams = [], pendingQuizzes = [] }: Props) {
    const finishedExams = exams.filter((e) => e.finalizado === 'si');
    const passedCount = finishedExams.filter((e) => Number(e.score) >= Number(e.min_score)).length;
    const avgScore =
        finishedExams.length > 0
            ? (finishedExams.reduce((sum, e) => sum + Number(e.score), 0) / finishedExams.length).toFixed(1)
            : '0.0';

    return (
        <>
            <Head title={`Mis Calificaciones - ${enrollment.course_title}`} />

            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={enrollment.cohort_id ? `/alumno/curso/${enrollment.cohort_id}` : '/alumno'}
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="size-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                {enrollment.cohort_identifier && (
                                    <span className="rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                                        {enrollment.cohort_identifier}
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">{enrollment.course_title}</span>
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                Mis Resultados de Evaluación
                            </h1>
                        </div>
                    </div>

                    <a
                        href={`/alumno/exportCalificaciones/${enrollment.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all"
                    >
                        <Download className="size-4 text-rose-600" />
                        Descargar Boleta (PDF)
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Evaluaciones Finalizadas</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{finishedExams.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Satisfactorias / Aprobadas</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{passedCount}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Promedio General</p>
                        <p className="text-2xl font-bold text-brand-blue mt-1">{avgScore} pts</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3.5">Evaluación</th>
                                    <th className="px-5 py-3.5 text-center">Puntaje</th>
                                    <th className="px-5 py-3.5 text-center">Aciertos</th>
                                    <th className="px-5 py-3.5 text-center">Estado</th>
                                    <th className="px-5 py-3.5 text-center">Retroalimentación</th>
                                    <th className="px-5 py-3.5">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {exams.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-muted-foreground">
                                            Aún no has presentado ninguna evaluación en este curso.
                                        </td>
                                    </tr>
                                ) : (
                                    exams.map((exam) => {
                                        const isPassed = Number(exam.score) >= Number(exam.min_score);
                                        return (
                                            <tr key={exam.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue shrink-0">
                                                            <Award className="size-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground">{exam.quiz_title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {exam.quiz_type} · Mín. satisfactorio: {exam.min_score} pts
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            isPassed
                                                                ? 'bg-emerald-500/10 text-emerald-700'
                                                                : 'bg-rose-500/10 text-rose-700'
                                                        }`}
                                                    >
                                                        {exam.score} / {exam.max_score}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-center text-xs font-medium text-muted-foreground">
                                                    {exam.total_correctas} / {exam.total_preguntas}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    {exam.finalizado === 'si' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                            <CheckCircle2 className="size-3.5" /> Finalizado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                            <Clock className="size-3.5" /> En progreso
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    {exam.feedback_available ? (
                                                        <Link
                                                            href={`/alumno/exams/${exam.id}/feedback`}
                                                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                                                        >
                                                            <Eye className="size-3.5" /> Ver Retroalimentación
                                                        </Link>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Lock className="size-3.5" />
                                                            {exam.retro_visualizado === 'si' ? 'Consumida / Bloqueada' : 'No disponible'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                                    {exam.updated_at || exam.created_at || 'N/A'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {pendingQuizzes.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-foreground">Evaluaciones Activas Pendientes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {pendingQuizzes.map((qz) => (
                                <div key={qz.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{qz.title}</p>
                                        <Badge variant="outline" className="text-[10px] mt-1">{qz.type}</Badge>
                                    </div>
                                    <Link
                                        href={`/alumno/exams/${qz.id}/preview?enrollment_id=${enrollment.id}`}
                                        className="text-xs font-semibold text-brand-blue hover:underline"
                                    >
                                        Presentar
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Results.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Mis Cursos', href: '/alumno' },
            { title: 'Mis Calificaciones', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
