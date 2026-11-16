import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    Circle,
    ChevronRight,
    Award,
    ArrowLeft,
    Lock,
    BarChart3,
    ClipboardCheck,
    FileSpreadsheet,
    FileText,
    Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import MathHtml from '@/components/MathHtml';

interface LessonItem {
    id: number;
    title: string;
    is_completed: boolean;
    is_available?: boolean;
    opens_at?: string | null;
    closes_at?: string | null;
}

interface ModuleItem {
    id: number;
    title: string;
    description: string | null;
    total_lessons: number;
    completed_lessons: number;
    progress: number;
    is_available: boolean;
    opens_at?: string | null;
    closes_at?: string | null;
    has_direct_content?: boolean;
    is_completed?: boolean;
    lessons: LessonItem[];
}

interface CourseDetailProps {
    scheduled: {
        id: number;
        identifier: string;
        title: string;
        description: string;
        category: string;
        image: string | null;
        instructor: string;
        start_date: string | null;
        end_date: string | null;
    };
    enrollment: {
        id: number;
        status: string;
    };
    is_guia?: boolean;
    guia?: {
        id: number;
        url: string;
        viewer_url: string;
    } | null;
    modules: ModuleItem[];
    completedLessonIds: number[];
    globalProgress: number;
}

export default function Detail({
    scheduled,
    enrollment,
    is_guia = false,
    guia = null,
    modules = [],
    completedLessonIds = [],
    globalProgress = 0,
}: CourseDetailProps) {
    return (
        <>
            <Head title={scheduled.title} />

            <div className="space-y-8 p-6 max-w-6xl mx-auto">
                {/* Back button & Self-tracking links */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost" size="sm" className="-ml-3 text-neutral-600 dark:text-neutral-400">
                        <Link href="/alumno">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Mis Cursos
                        </Link>
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                        {!is_guia && (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/alumno/curso/progress/${scheduled.id}`}>
                                        <BarChart3 className="w-4 h-4 mr-1.5 text-indigo-600" /> Mi Progreso
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/alumno/curso/homework-tracking/${scheduled.id}`}>
                                        <ClipboardCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> Mis Tareas
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/alumno/evaluaciones/resultados/${enrollment.id}`}>
                                        <FileSpreadsheet className="w-4 h-4 mr-1.5 text-amber-600" /> Calificaciones
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Course Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-8 text-white shadow-xl">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-blue-600 text-white hover:bg-blue-500">
                                    {scheduled.category}
                                </Badge>
                                {scheduled.identifier && (
                                    <Badge variant="outline" className="text-white/80 border-white/20">
                                        {scheduled.identifier}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                                {scheduled.title}
                            </h1>
                            {scheduled.description && (
                                <MathHtml
                                    html={scheduled.description}
                                    className="text-blue-100/90 text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5"
                                />
                            )}
                            <div className="flex items-center gap-4 text-xs text-blue-200/70 pt-2">
                                <span>Instructor: <strong>{scheduled.instructor}</strong></span>
                                {scheduled.start_date && (
                                    <span>• Inicio: {scheduled.start_date}</span>
                                )}
                            </div>
                        </div>

                        {!is_guia ? (
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                                        Tu Progreso
                                    </span>
                                    <span className="text-2xl font-bold text-white">
                                        {globalProgress}%
                                    </span>
                                </div>
                                <Progress value={globalProgress} className="h-3 bg-white/20" />
                                <div className="text-xs text-blue-100/80 flex items-center justify-between">
                                    <span>{completedLessonIds.length} lecciones completadas</span>
                                    <Award className="w-4 h-4 text-yellow-400" />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white space-y-4">
                                <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                                    <BookOpen className="w-4 h-4" /> Guía Digital Sapius
                                </div>
                                <p className="text-sm text-blue-100/90">
                                    Accede a tu guía oficial protegida directamente desde el visor de la plataforma.
                                </p>
                                {guia ? (
                                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                                        <Link href={guia.viewer_url}>
                                            <FileText className="w-4 h-4 mr-2" /> Abrir Guía de Estudio
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-amber-300">Archivo de guía pendiente de publicación.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Guía viewer callout when Guias category */}
                {is_guia ? (
                    <Card className="p-8 border-blue-200/80 bg-blue-50/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    Material de Estudio (Guía)
                                </h2>
                                <p className="text-sm text-neutral-600">
                                    Visualiza tu guía en nuestro lector seguro en línea.
                                </p>
                            </div>
                            {guia ? (
                                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Link href={guia.viewer_url}>
                                        Abrir Guía Digital
                                    </Link>
                                </Button>
                            ) : (
                                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                                    Guía no cargada aún
                                </Badge>
                            )}
                        </div>
                    </Card>
                ) : (
                    /* Modules & Lessons */
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Contenido del Curso
                            </h2>
                            <p className="text-sm text-neutral-500">
                                Explora los módulos y clases disponibles para tu preparación
                            </p>
                        </div>

                        {modules.length === 0 ? (
                            <Card className="p-8 text-center text-neutral-500">
                                No hay módulos programados para este curso por el momento.
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <Accordion type="multiple" defaultValue={modules.map((m) => `mod-${m.id}`)} className="space-y-4">
                                    {modules.map((modulo, idx) => (
                                        <AccordionItem
                                            key={modulo.id}
                                            value={`mod-${modulo.id}`}
                                            className="border border-neutral-200/80 dark:border-neutral-800 rounded-xl px-5 bg-white dark:bg-neutral-900 shadow-sm"
                                        >
                                            <AccordionTrigger className="hover:no-underline py-4">
                                                <div className="flex items-center gap-4 text-left flex-1 pr-3">
                                                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm shrink-0 ${
                                                        modulo.is_available
                                                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                                                            : 'bg-neutral-100 text-neutral-400'
                                                    }`}>
                                                        {modulo.is_available ? idx + 1 : <Lock className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                                                                {modulo.title}
                                                            </h3>
                                                            {!modulo.is_available && (
                                                                <Badge variant="outline" className="text-[11px] text-amber-700 border-amber-300 bg-amber-50">
                                                                    <Clock className="w-3 h-3 mr-1" /> Programado
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-0.5">
                                                            <span>{modulo.completed_lessons} de {modulo.total_lessons} completadas</span>
                                                            <span>•</span>
                                                            <span className="text-blue-600 dark:text-blue-400 font-medium">{modulo.progress}% avance</span>
                                                            {modulo.opens_at && (
                                                                <span className="text-neutral-400">({modulo.opens_at} - {modulo.closes_at || 'Abierto'})</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="pt-2 pb-5 border-t border-neutral-100 dark:border-neutral-800">
                                                {modulo.has_direct_content && (
                                                    <div className="mb-3">
                                                        {modulo.is_available ? (
                                                            <Link
                                                                href={`/alumno/modulo/${modulo.id}/${scheduled.id}`}
                                                                className="flex items-center justify-between p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                                                                    <span className="text-sm font-semibold text-indigo-950">
                                                                        Abrir contenido y evaluaciones del módulo
                                                                    </span>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-indigo-600" />
                                                            </Link>
                                                        ) : (
                                                            <div className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 bg-neutral-100/70 text-neutral-400">
                                                                <div className="flex items-center gap-3">
                                                                    <Lock className="w-4 h-4 shrink-0" />
                                                                    <span className="text-sm font-medium">
                                                                        Contenido del módulo bloqueado {modulo.opens_at ? `(Abre: ${modulo.opens_at})` : ''}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {modulo.lessons.length === 0 && !modulo.has_direct_content ? (
                                                    <p className="text-sm text-neutral-400 italic py-2">
                                                        Próximamente se publicarán las clases de este módulo.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2 mt-2">
                                                        {modulo.lessons.map((clase) => {
                                                            const isAvailable = clase.is_available !== false;
                                                            if (!isAvailable) {
                                                                return (
                                                                    <div
                                                                        key={clase.id}
                                                                        className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200/70 bg-neutral-100/60 text-neutral-400 cursor-not-allowed"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <Lock className="w-4 h-4 shrink-0" />
                                                                            <span className="text-sm font-medium">{clase.title}</span>
                                                                        </div>
                                                                        <span className="text-xs">
                                                                            {clase.opens_at ? `Abre: ${clase.opens_at}` : 'No disponible'}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <Link
                                                                    key={clase.id}
                                                                    href={`/alumno/modulo/${clase.id}/${scheduled.id}`}
                                                                    className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 hover:border-blue-200 transition-all duration-150 group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {clase.is_completed ? (
                                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                                        ) : (
                                                                            <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />
                                                                        )}
                                                                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600">
                                                                            {clase.title}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-neutral-400 group-hover:text-blue-600">
                                                                        <span>Abrir clase</span>
                                                                        <ChevronRight className="w-4 h-4" />
                                                                    </div>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

Detail.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Mis Cursos', href: '/alumno' },
            { title: 'Detalle del Curso', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
