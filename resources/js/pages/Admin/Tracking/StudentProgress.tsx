import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ChevronLeft, 
    CheckCircle2, 
    Clock, 
    Lock, 
    Unlock, 
    Award, 
    Layers, 
    BookOpen, 
    X, 
    Calendar,
    Eye,
    EyeOff,
    Trash2,
    HelpCircle,
    Activity
} from 'lucide-react';

interface LessonItem {
    id: number;
    title: string;
    quizzes: { id: number; title: string }[];
}

interface ModuleItem {
    id: number;
    title: string;
    quizzes: { id: number; title: string }[];
    lessons: LessonItem[];
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
    enrollmentId: number | null;
    modules: ModuleItem[];
    completedLessons: number[];
    homeworks: Record<string, any>;
    exams: Record<string, { id: number; calificacion: number; finalizado: string; feedback_enabled: string }>;
    unlocks: Record<string, { until_date: string | null }>;
}

export default function StudentProgress({ 
    cohort, 
    student, 
    enrollmentId, 
    modules, 
    completedLessons, 
    exams, 
    unlocks 
}: Props) {
    const [unlockModalOpen, setUnlockModalOpen] = useState(false);
    const [activeLesson, setActiveLesson] = useState<{ id: number; title: string } | null>(null);
    const [untilDate, setUntilDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    let totalLessons = 0;
    let completedCount = 0;

    modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
            totalLessons++;
            if (completedLessons.includes(l.id)) {
                completedCount++;
            }
        });
    });

    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const handleOpenUnlockModal = (lesson: { id: number; title: string }) => {
        setActiveLesson(lesson);
        const existingUnlock = unlocks[lesson.id];
        setUntilDate(existingUnlock?.until_date ? existingUnlock.until_date.split(' ')[0] : '');
        setUnlockModalOpen(true);
    };

    const handleToggleLock = (lessonId: number, isCurrentlyUnlocked: boolean) => {
        if (isCurrentlyUnlocked) {
            router.post('/admin/curso/lesson/unlock', {
                user_id: student.id,
                curso_programado_id: cohort.id,
                leccion_id: lessonId,
                action: 'lock',
            }, { preserveScroll: true });
        } else {
            handleOpenUnlockModal({ id: lessonId, title: 'Lección' });
        }
    };

    const handleSaveUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson) return;

        setIsSubmitting(true);
        router.post('/admin/curso/lesson/unlock', {
            user_id: student.id,
            curso_programado_id: cohort.id,
            leccion_id: activeLesson.id,
            until_date: untilDate || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setUnlockModalOpen(false);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const handleResetExam = (examId: number) => {
        if (confirm('¿Estás seguro de reiniciar este examen? El alumno perderá su calificación y tendrá que volver a presentarlo.')) {
            router.delete(`/admin/tracking/exams/${examId}/reset`, {
                preserveScroll: true
            });
        }
    };

    const handleToggleFeedback = (examId: number) => {
        router.patch(`/admin/tracking/exams/${examId}/feedback`, {}, {
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title={`Progreso del Alumno - ${student.name}`} />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
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
                                Progreso Académico: {student.name}
                            </h1>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                    </div>

                    {enrollmentId && (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <a
                                href={`/admin/tracking/${enrollmentId}/exams-report`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:bg-brand-blue/90 transition-colors shadow-sm"
                            >
                                <Award className="size-4" />
                                Reporte PDF
                            </a>
                            <Link
                                href={`/admin/evaluacion/resultados/${enrollmentId}`}
                                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
                            >
                                <Layers className="size-4 text-brand-blue" />
                                Calificaciones Históricas
                            </Link>
                        </div>
                    )}
                </div>

                {/* Tarjeta de Progreso Global */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progreso Global del Curso</p>
                        <p className="text-3xl font-black text-foreground mt-1">
                            {progressPercent}% <span className="text-xs font-normal text-muted-foreground">({completedCount} de {totalLessons} lecciones completadas)</span>
                        </p>
                    </div>
                    <div className="w-full sm:w-64 bg-muted rounded-full h-3.5 overflow-hidden">
                        <div 
                            className="bg-brand-blue h-full rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Módulos y Lecciones */}
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
                                        const isCompleted = completedLessons.includes(lesson.id);
                                        const isUnlocked = !!unlocks[lesson.id];
                                        return (
                                            <div key={lesson.id} className="flex flex-col">
                                                <div className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="size-5 text-green-600" />
                                                        ) : (
                                                            <Clock className="size-5 text-muted-foreground/60" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-xs text-foreground">{lesson.title}</p>
                                                            {isUnlocked && (
                                                                <p className="text-[11px] text-amber-600 font-medium">
                                                                    🔓 Desbloqueo forzado activo {unlocks[lesson.id]?.until_date && `hasta ${unlocks[lesson.id].until_date}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isCompleted ? (
                                                            <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                                                                Completada
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                                Pendiente
                                                            </span>
                                                        )}

                                                        {/* Botón de desbloqueo manual */}
                                                        <button
                                                            onClick={() => handleToggleLock(lesson.id, isUnlocked)}
                                                            title={isUnlocked ? 'Bloquear lección' : 'Desbloquear lección manualmente para este alumno'}
                                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                                                isUnlocked
                                                                    ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                                                            }`}
                                                        >
                                                            {isUnlocked ? (
                                                                <>
                                                                    <Unlock className="size-3.5 text-amber-600" />
                                                                    <span>Desbloqueada</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Lock className="size-3.5" />
                                                                    <span>Desbloquear</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Exámenes de la Lección */}
                                                {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                    <div className="bg-muted/10 border-t border-border px-4 py-3 space-y-2">
                                                        {lesson.quizzes.map((quiz) => {
                                                            const exam = exams[quiz.id];
                                                            return (
                                                                <div key={quiz.id} className="flex items-center justify-between pl-8 py-2 border-l-2 border-brand-blue/30">
                                                                    <div className="flex items-center gap-2">
                                                                        <Activity className="size-4 text-brand-blue/70" />
                                                                        <div>
                                                                            <p className="text-xs font-medium text-foreground">{quiz.title}</p>
                                                                            {exam ? (
                                                                                <p className="text-[11px] text-muted-foreground">
                                                                                    {exam.finalizado === 'si' ? 'Finalizado' : 'En progreso'} • Calificación: <span className="font-bold text-foreground">{exam.calificacion}</span>
                                                                                </p>
                                                                            ) : (
                                                                                <p className="text-[11px] text-muted-foreground">No presentado</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {exam && (
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => handleToggleFeedback(exam.id)}
                                                                                title={exam.feedback_enabled === 'si' ? 'Ocultar Retroalimentación' : 'Mostrar Retroalimentación'}
                                                                                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                                                                                    exam.feedback_enabled === 'si' 
                                                                                    ? 'border-brand-blue/30 bg-brand-blue/10 text-brand-blue'
                                                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                                                                                }`}
                                                                            >
                                                                                {exam.feedback_enabled === 'si' ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                                                                                Retroalimentación
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleResetExam(exam.id)}
                                                                                title="Reiniciar Examen"
                                                                                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
                                                                            >
                                                                                <Trash2 className="size-3.5" />
                                                                                Reiniciar
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para configurar fecha de desbloqueo */}
            {unlockModalOpen && activeLesson && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-bold text-base text-foreground">Desbloquear Lección</h3>
                            <button 
                                onClick={() => setUnlockModalOpen(false)}
                                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUnlock} className="mt-4 space-y-4">
                            <p className="text-xs text-muted-foreground">
                                Desbloquea <strong className="text-foreground">{activeLesson.title}</strong> para este estudiante de manera extraordinaria sin importar las restricciones de fecha.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Fecha límite de acceso (Opcional)
                                </label>
                                <input
                                    type="date"
                                    value={untilDate}
                                    onChange={(e) => setUntilDate(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-card p-2 text-sm text-foreground focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    Si se deja en blanco, el acceso será permanente.
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setUnlockModalOpen(false)}
                                    className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-brand-blue px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-blue/90 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Confirmar Desbloqueo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

StudentProgress.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Panel de Control', href: '/admin' }, { title: 'Progreso', href: '#' }]}>
        {page}
    </AppLayout>
);
