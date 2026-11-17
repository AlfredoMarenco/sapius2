import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Copy, ChevronLeft, ArrowRight, BookOpen, CheckCircle2, Layers } from 'lucide-react';

interface CourseOption {
    id: number;
    title: string;
    activo: string;
    image: string | null;
}

interface Props {
    courses: CourseOption[];
}

export default function CopyPage({ courses }: Props) {
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
    const [copyAll, setCopyAll] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        setIsSubmitting(true);
        router.post('/admin/cursos/copy/create', {
            curso_id: selectedCourseId,
            copyAll: copyAll,
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Copiar Contenido de Curso" />

            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/cursos"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="size-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                            Clonador de Cursos y Contenidos
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500">
                            Duplica la estructura de módulos, clases, exámenes y materiales de un curso existente.
                        </p>
                    </div>
                </div>

                {/* Card de Formulario */}
                <div className="rounded-xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selector de Curso Origen */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                1. Selecciona el Curso Origen a Clonar
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                                    required
                                    className="w-full rounded-xl border border-border bg-card p-3.5 text-sm text-foreground focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                >
                                    <option value="">-- Selecciona un curso maestro --</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title} {course.activo === 'no' ? '(Inactivo)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Modalidad de Copiado */}
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                2. Modalidad de Clonación
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label
                                    onClick={() => setCopyAll(true)}
                                    className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                                        copyAll
                                            ? 'border-brand-blue bg-brand-blue/5 shadow-sm'
                                            : 'border-border bg-card hover:bg-muted/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-lg p-2 ${copyAll ? 'bg-brand-blue text-white' : 'bg-muted text-muted-foreground'}`}>
                                                <Copy className="size-5" />
                                            </div>
                                            <span className="font-bold text-sm text-foreground">Copiar Todo</span>
                                        </div>
                                        {copyAll && <CheckCircle2 className="size-5 text-brand-blue" />}
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Duplica instantáneamente el curso con todos sus módulos, lecciones, exámenes, preguntas y materiales multimedia.
                                    </p>
                                </label>

                                <label
                                    onClick={() => setCopyAll(false)}
                                    className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                                        !copyAll
                                            ? 'border-brand-blue bg-brand-blue/5 shadow-sm'
                                            : 'border-border bg-card hover:bg-muted/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-lg p-2 ${!copyAll ? 'bg-brand-blue text-white' : 'bg-muted text-muted-foreground'}`}>
                                                <Layers className="size-5" />
                                            </div>
                                            <span className="font-bold text-sm text-foreground">Selección Granular</span>
                                        </div>
                                        {!copyAll && <CheckCircle2 className="size-5 text-brand-blue" />}
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Abre un panel interactivo con el árbol de contenidos para seleccionar específicamente qué módulos y clases clonar.
                                    </p>
                                </label>
                            </div>
                        </div>

                        {/* Botón de Enviar */}
                        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-border">
                            <Link
                                href="/admin/cursos"
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={!selectedCourseId || isSubmitting}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#FF6B52] px-5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#F0563C] disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? (
                                    'Procesando...'
                                ) : copyAll ? (
                                    <>
                                        <Copy className="size-4" />
                                        Clonar Curso Completo
                                    </>
                                ) : (
                                    <>
                                        <span>Continuar a Selección</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CopyPage.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Cursos', href: '/admin/cursos' }, { title: 'Copiar Curso', href: '#' }]}>
        {page}
    </AppLayout>
);
