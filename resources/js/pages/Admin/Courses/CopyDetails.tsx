import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, CheckSquare, Square, Layers, BookOpen, Copy, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Lesson {
    id: number;
    title: string;
    leccion_id: number;
    position: number;
}

interface Module {
    id: number;
    title: string;
    leccion_id: number;
    position: number;
    lessons: Lesson[];
}

interface CourseWithTree {
    id: number;
    title: string;
    modules: Module[];
}

interface Props {
    course: CourseWithTree;
}

export default function CopyDetails({ course }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calcular todos los IDs disponibles (módulos y clases)
    const allIds: number[] = [];
    course.modules?.forEach((mod) => {
        allIds.push(mod.id);
        mod.lessons?.forEach((lesson) => {
            allIds.push(lesson.id);
        });
    });

    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds([...allIds]);
        }
    };

    const handleToggleModule = (mod: Module) => {
        const modId = mod.id;
        const lessonIds = mod.lessons ? mod.lessons.map((l) => l.id) : [];
        const isModuleSelected = selectedIds.includes(modId);

        if (isModuleSelected) {
            // Deseleccionar módulo y sus clases
            setSelectedIds(selectedIds.filter((id) => id !== modId && !lessonIds.includes(id)));
        } else {
            // Seleccionar módulo y todas sus clases
            const toAdd = [modId, ...lessonIds.filter((lid) => !selectedIds.includes(lid))];
            setSelectedIds([...selectedIds, ...toAdd]);
        }
    };

    const handleToggleLesson = (lessonId: number, parentModuleId: number) => {
        if (selectedIds.includes(lessonId)) {
            setSelectedIds(selectedIds.filter((id) => id !== lessonId));
        } else {
            // Si seleccionamos una clase y su módulo no está seleccionado, seleccionamos también el módulo
            const toAdd = [lessonId];
            if (!selectedIds.includes(parentModuleId)) {
                toAdd.push(parentModuleId);
            }
            setSelectedIds([...selectedIds, ...toAdd]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0) return;

        setIsSubmitting(true);
        router.post('/admin/curso/copy-details/coping', {
            curso_id: course.id,
            items: selectedIds,
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title={`Clonación Selectiva - ${course.title}`} />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/cursos/copy"
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="size-5" />
                        </Link>
                        <div>
                            <span className="rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                                Selección Granular de Contenido
                            </span>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                {course.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
                        >
                            {isAllSelected ? (
                                <>
                                    <Square className="size-4 text-brand-blue" />
                                    Deseleccionar Todo
                                </>
                            ) : (
                                <>
                                    <CheckSquare className="size-4 text-brand-blue" />
                                    Seleccionar Todo
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Formulario y árbol de contenidos */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm divide-y divide-border">
                        {course.modules?.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                Este curso no contiene módulos ni clases para clonar.
                            </div>
                        ) : (
                            course.modules?.map((modulo) => {
                                const isModChecked = selectedIds.includes(modulo.id);
                                return (
                                    <div key={modulo.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                                        {/* Fila del Módulo */}
                                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                            <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isModChecked}
                                                    onChange={() => handleToggleModule(modulo)}
                                                    className="size-4 rounded border-border text-brand-blue focus:ring-brand-blue"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Layers className="size-4 text-brand-blue" />
                                                    <span className="font-bold text-sm text-foreground">
                                                        {modulo.title}
                                                    </span>
                                                </div>
                                            </label>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {modulo.lessons?.length || 0} clases
                                            </span>
                                        </div>

                                        {/* Clases hijas del módulo */}
                                        {modulo.lessons && modulo.lessons.length > 0 && (
                                            <div className="pl-8 space-y-2">
                                                {modulo.lessons.map((clase) => {
                                                    const isLessonChecked = selectedIds.includes(clase.id);
                                                    return (
                                                        <label
                                                            key={clase.id}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 cursor-pointer select-none text-xs"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isLessonChecked}
                                                                onChange={() => handleToggleLesson(clase.id, modulo.id)}
                                                                className="size-3.5 rounded border-border text-brand-blue focus:ring-brand-blue"
                                                            />
                                                            <BookOpen className="size-3.5 text-muted-foreground" />
                                                            <span className="font-medium text-foreground">
                                                                {clase.title}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Barra fija o inferior de acción */}
                    <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-lg">
                        <div className="text-xs">
                            <span className="font-bold text-foreground">{selectedIds.length}</span> elementos seleccionados para clonar
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/admin/cursos/copy"
                                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                Volver
                            </Link>
                            <button
                                type="submit"
                                disabled={selectedIds.length === 0 || isSubmitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-blue/90 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? (
                                    'Clonando contenidos...'
                                ) : (
                                    <>
                                        <Copy className="size-3.5" />
                                        <span>Clonar Seleccionados</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

CopyDetails.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Cursos', href: '/admin/cursos' }, { title: 'Selección de Copiado', href: '#' }]}>
        {page}
    </AppLayout>
);
