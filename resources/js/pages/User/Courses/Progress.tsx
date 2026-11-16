import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    CheckCircle2,
    Clock,
    Lock,
    Unlock,
    Award,
    Layers,
    Activity,
    FileSpreadsheet,
} from 'lucide-react';

interface QuizProgress {
    id: number;
    title: string;
    type: string;
    exam: {
        id: number;
        score: number;
        total_correctas: number;
        total_preguntas: number;
        finalizado: string;
    } | null;
}

interface LessonProgress {
    id: number;
    title: string;
    is_completed: boolean;
    is_available: boolean;
    is_unlocked: boolean;
    quizzes: QuizProgress[];
}

interface ModuleProgress {
    id: number;
    title: string;
    is_available: boolean;
    quizzes: QuizProgress[];
    lessons: LessonProgress[];
}

interface Props {
    scheduled: {
        id: number;
        identifier: string;
        title: string;
    };
    enrollment_id: number;
    modules: ModuleProgress[];
    completedLessons: number[];
}

export default function Progress({ scheduled, enrollment_id, modules = [], completedLessons = [] }: Props) {
    let totalLessons = 0;
    let completedCount = 0;

    modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
            totalLessons++;
            if (l.is_completed || completedLessons.includes(l.id)) {
                completedCount++;
            }
        });
    });

    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return (
        <>
            <Head title={`Mi Progreso - ${scheduled.title}`} />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/alumno/curso/${scheduled.id}`}
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="size-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                {scheduled.identifier && (
                                    <span className="rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                                        {scheduled.identifier}
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">{scheduled.title}</span>
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                Mi Progreso Académico
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/alumno/exportCalificaciones/${enrollment_id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:bg-brand-blue/90 transition-colors shadow-sm"
                        >
                            <Award className="size-4" />
                            Boleta PDF
                        </a>
                        <Link
                            href={`/alumno/evaluaciones/resultados/${enrollment_id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
                        >
                            <FileSpreadsheet className="size-4 text-brand-blue" />
                            Mis Calificaciones
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avance Global del Curso</p>
                        <p className="text-3xl font-black text-foreground mt-1">
                            {progressPercent}%{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                ({completedCount} de {totalLessons} lecciones completadas)
                            </span>
                        </p>
                    </div>
                    <div className="w-full sm:w-64 bg-muted rounded-full h-3.5 overflow-hidden">
                        <div
                            className="bg-brand-blue h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {modules.map((modulo) => (
                        <div key={modulo.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                            <div className="bg-muted/40 p-4 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Layers className="size-4 text-brand-blue" />
                                    <h3 className="font-bold text-sm text-foreground">{modulo.title}</h3>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {modulo.lessons.length} lecciones
                                </span>
                            </div>

                            {modulo.quizzes && modulo.quizzes.length > 0 && (
                                <div className="bg-indigo-50/40 border-b border-border px-4 py-3 space-y-2">
                                    {modulo.quizzes.map((qz) => (
                                        <div key={qz.id} className="flex items-center justify-between py-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="size-4 text-indigo-600" />
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">{qz.title}</p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {qz.exam
                                                            ? `${qz.exam.finalizado === 'si' ? 'Finalizado' : 'En progreso'} · ${qz.exam.score} pts (${qz.exam.total_correctas}/${qz.exam.total_preguntas})`
                                                            : 'Sin presentar'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/alumno/exams/${qz.id}/preview?enrollment_id=${enrollment_id}`}
                                                className="text-xs font-semibold text-indigo-600 hover:underline"
                                            >
                                                Ver evaluación
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="divide-y divide-border">
                                {modulo.lessons.length === 0 ? (
                                    <p className="p-4 text-xs text-muted-foreground">Sin lecciones en este módulo.</p>
                                ) : (
                                    modulo.lessons.map((lesson) => (
                                        <div key={lesson.id} className="flex flex-col">
                                            <div className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    {lesson.is_completed ? (
                                                        <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                                                    ) : lesson.is_available ? (
                                                        <Clock className="size-5 text-muted-foreground/60 shrink-0" />
                                                    ) : (
                                                        <Lock className="size-5 text-muted-foreground/50 shrink-0" />
                                                    )}
                                                    <div>
                                                        {lesson.is_available ? (
                                                            <Link
                                                                href={`/alumno/modulo/${lesson.id}/${scheduled.id}`}
                                                                className="font-medium text-xs text-foreground hover:text-brand-blue hover:underline"
                                                            >
                                                                {lesson.title}
                                                            </Link>
                                                        ) : (
                                                            <p className="font-medium text-xs text-muted-foreground">{lesson.title}</p>
                                                        )}
                                                        {lesson.is_unlocked && (
                                                            <p className="text-[11px] text-amber-600 font-medium inline-flex items-center gap-1 mt-0.5">
                                                                <Unlock className="size-3" /> Desbloqueo activo
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    {lesson.is_completed ? (
                                                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                            Completada
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                            Pendiente
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                <div className="bg-muted/10 border-t border-border px-4 py-2.5 space-y-2">
                                                    {lesson.quizzes.map((qz) => (
                                                        <div key={qz.id} className="flex items-center justify-between pl-8 py-1 border-l-2 border-brand-blue/30">
                                                            <div className="flex items-center gap-2">
                                                                <Activity className="size-4 text-brand-blue/70" />
                                                                <div>
                                                                    <p className="text-xs font-medium text-foreground">{qz.title}</p>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        {qz.exam
                                                                            ? `${qz.exam.finalizado === 'si' ? 'Finalizado' : 'En progreso'} · ${qz.exam.score} pts`
                                                                            : 'No presentado'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {lesson.is_available && (
                                                                <Link
                                                                    href={`/alumno/exams/${qz.id}/preview?enrollment_id=${enrollment_id}`}
                                                                    className="text-xs font-semibold text-brand-blue hover:underline"
                                                                >
                                                                    Abrir
                                                                </Link>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

Progress.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Mis Cursos', href: '/alumno' },
            { title: 'Mi Progreso', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
