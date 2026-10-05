import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Layers } from 'lucide-react';

interface Lesson {
    id: number;
    title: string;
}

interface Module {
    id: number;
    title: string;
    lessons: Lesson[];
}

interface Props {
    cohort: {
        id: number;
        internal_id: string;
        course_title: string;
    };
    student: {
        id: number;
        name: string;
        email: string;
    };
    modules: Module[];
    homeworks: Record<string, { id: number; is_late: number; created_at: string }>;
    unlocks: Record<string, { id: number; until_date: string | null }>;
}

export default function HomeworkTracking({ cohort, student, modules, homeworks, unlocks }: Props) {
    let totalLessonsWithHomework = 0;
    let submittedCount = 0;

    modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
            totalLessonsWithHomework++;
            if (homeworks[l.id]) submittedCount++;
        });
    });

    const completionPercent = totalLessonsWithHomework > 0 
        ? Math.round((submittedCount / totalLessonsWithHomework) * 100) 
        : 0;

    return (
        <>
            <Head title={`Seguimiento de Tareas - ${student.name}`} />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/curso/${cohort.id}`}
                        className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="size-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                                {cohort.internal_id}
                            </span>
                            <span className="text-xs text-muted-foreground">{cohort.course_title}</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                            Seguimiento de Tareas: {student.name}
                        </h1>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                </div>

                {/* Resumen de entregas */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progreso de Entregas</p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                            {submittedCount} de {totalLessonsWithHomework} tareas entregadas ({completionPercent}%)
                        </p>
                    </div>
                    <div className="w-full sm:w-48 bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-green-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                </div>

                {/* Listado por Módulos y Clases */}
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
                                    modulo.lessons.map((lesson) => {
                                        const hw = homeworks[lesson.id];
                                        const unlock = unlocks[lesson.id];
                                        return (
                                            <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="size-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium text-xs text-foreground">{lesson.title}</p>
                                                        {unlock && (
                                                            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                                                                🔓 Desbloqueo manual activo
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {hw ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                                <CheckCircle2 className="size-3.5" />
                                                                Entregada
                                                            </span>
                                                            {hw.is_late === 1 && (
                                                                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                                    Fuera de tiempo
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                            <XCircle className="size-3.5" />
                                                            Sin entregar
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
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
    <AppLayout breadcrumbs={[{ title: 'Panel de Control', href: '/admin' }, { title: 'Tareas', href: '#' }]}>
        {page}
    </AppLayout>
);
