import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, FileText, CheckCircle2, XCircle, Layers, Lock, Unlock } from 'lucide-react';

interface LessonHw {
    id: number;
    title: string;
    is_available: boolean;
    closes_at: string | null;
    homework: {
        id: number;
        is_late: boolean;
        submitted_at: string | null;
    } | null;
    is_unlocked: boolean;
    unlock_until: string | null;
}

interface ModuleHw {
    id: number;
    title: string;
    lessons: LessonHw[];
}

interface Props {
    scheduled: {
        id: number;
        identifier: string;
        title: string;
    };
    modules: ModuleHw[];
}

export default function HomeworkTracking({ scheduled, modules = [] }: Props) {
    let totalLessons = 0;
    let submittedCount = 0;

    modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
            totalLessons++;
            if (l.homework) submittedCount++;
        });
    });

    const completionPercent = totalLessons > 0 ? Math.round((submittedCount / totalLessons) * 100) : 0;

    return (
        <>
            <Head title={`Mis Tareas - ${scheduled.title}`} />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
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
                            Seguimiento de Mis Tareas
                        </h1>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progreso de Entregas</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                            {submittedCount} de {totalLessons} tareas entregadas ({completionPercent}%)
                        </p>
                    </div>
                    <div className="w-full sm:w-48 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${completionPercent}%` }}
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

                            <div className="divide-y divide-border">
                                {modulo.lessons.length === 0 ? (
                                    <p className="p-4 text-xs text-muted-foreground">Sin lecciones en este módulo.</p>
                                ) : (
                                    modulo.lessons.map((lesson) => (
                                        <div key={lesson.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-sm text-foreground">{lesson.title}</p>
                                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                                        {lesson.closes_at && <span>Cierre: {lesson.closes_at}</span>}
                                                        {lesson.is_unlocked && (
                                                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                                                <Unlock className="size-3" /> Desbloqueo activo
                                                                {lesson.unlock_until ? ` hasta ${lesson.unlock_until}` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {lesson.homework ? (
                                                    <>
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                            <CheckCircle2 className="size-3.5" />
                                                            Entregada
                                                        </span>
                                                        {lesson.homework.is_late && (
                                                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                                Fuera de tiempo
                                                            </span>
                                                        )}
                                                    </>
                                                ) : lesson.is_available ? (
                                                    <Link
                                                        href={`/alumno/modulo/${lesson.id}/${scheduled.id}`}
                                                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                                    >
                                                        <XCircle className="size-3.5" /> Pendiente (Ir a entregar)
                                                    </Link>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                        <Lock className="size-3.5" /> Cerrada / Programada
                                                    </span>
                                                )}
                                            </div>
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

HomeworkTracking.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Mis Cursos', href: '/alumno' },
            { title: 'Seguimiento de Tareas', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
