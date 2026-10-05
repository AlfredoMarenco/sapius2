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
    XCircle, 
    Clock, 
    AlertTriangle, 
    FileText 
} from 'lucide-react';

interface ExamItem {
    id: number;
    quiz_id: number;
    quiz_title: string;
    quiz_description: string;
    min_score: number;
    max_score: number;
    duration: number;
    score: number;
    correct_answers: number;
    total_questions: number;
    finished: string;
    feedback_viewed: string;
    created_at: string | null;
    updated_at: string | null;
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
}

export default function Results({ enrollment, exams }: Props) {
    const [confirmModalId, setConfirmModalId] = useState<number | null>(null);

    const handleToggleFinished = (examId: number) => {
        router.post('/admin/examen/finalizar', { id: examId }, { preserveScroll: true });
    };

    const handleToggleRetro = (examId: number) => {
        router.post('/admin/examen/retro', { id: examId }, { preserveScroll: true });
    };

    const handleResetExam = (examId: number) => {
        router.post('/admin/examen/reiniciar', { id: examId }, {
            preserveScroll: true,
            onSuccess: () => setConfirmModalId(null),
        });
    };

    const passedCount = exams.filter((e) => Number(e.score) >= Number(e.min_score)).length;
    const avgScore = exams.length > 0
        ? (exams.reduce((acc, curr) => acc + Number(curr.score), 0) / exams.length).toFixed(1)
        : '0.0';

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
                            <Download className="size-4 text-green-600" />
                            Descargar Calificaciones (Excel)
                        </a>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Exámenes Presentados</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{exams.length}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Exámenes Aprobados</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{passedCount}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground">Promedio General</p>
                        <p className="text-2xl font-bold text-brand-blue mt-1">{avgScore} / 100</p>
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
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {exams.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            Este alumno aún no ha presentado ninguna evaluación en esta cohorte.
                                        </td>
                                    </tr>
                                ) : (
                                    exams.map((exam) => {
                                        const isPassed = Number(exam.score) >= Number(exam.min_score);
                                        return (
                                            <tr key={exam.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                                                            <Award className="size-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{exam.quiz_title}</p>
                                                            <p className="text-xs text-muted-foreground">Mín. aprobatorio: {exam.min_score} pts</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        isPassed 
                                                            ? 'bg-green-500/10 text-green-700' 
                                                            : 'bg-red-500/10 text-red-700'
                                                    }`}>
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
                                                        title="Clic para alternar visibilidad de retroalimentación"
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                                                            exam.feedback_viewed === 'si'
                                                                ? 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20'
                                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                        }`}
                                                    >
                                                        {exam.feedback_viewed === 'si' ? (
                                                            <>
                                                                <Eye className="size-3.5" /> Visible
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff className="size-3.5" /> Oculta
                                                            </>
                                                        )}
                                                    </button>
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
        </>
    );
}

Results.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Panel de Control', href: '/admin' }, { title: 'Resultados', href: '#' }]}>
        {page}
    </AppLayout>
);
