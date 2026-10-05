import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    BookOpen, 
    CheckCircle2, 
    Circle, 
    PlayCircle, 
    Folder, 
    ChevronRight, 
    Clock, 
    Award,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface LessonItem {
    id: number;
    title: string;
    is_completed: boolean;
}

interface ModuleItem {
    id: number;
    title: string;
    description: string | null;
    total_lessons: number;
    completed_lessons: number;
    progress: number;
    is_available: boolean;
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
    modules: ModuleItem[];
    completedLessonIds: number[];
    globalProgress: number;
}

export default function Detail({
    scheduled,
    enrollment,
    modules = [],
    completedLessonIds = [],
    globalProgress = 0,
}: CourseDetailProps) {
    return (
        <>
            <Head title={scheduled.title} />

            <div className="space-y-8 p-6 max-w-6xl mx-auto">
                {/* Back button */}
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-3 text-neutral-600 dark:text-neutral-400">
                        <Link href="/alumno">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Mis Cursos
                        </Link>
                    </Button>
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
                            <p className="text-blue-100/80 text-sm leading-relaxed line-clamp-3">
                                {scheduled.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-blue-200/70 pt-2">
                                <span>Instructor: <strong>{scheduled.instructor}</strong></span>
                                {scheduled.start_date && (
                                    <span>• Inicio: {new Date(scheduled.start_date).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>

                        {/* Progress card */}
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
                    </div>
                </div>

                {/* Modules & Lessons */}
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
                            <Accordion type="multiple" defaultValue={modules.map(m => `mod-${m.id}`)} className="space-y-4">
                                {modules.map((modulo, idx) => (
                                    <AccordionItem
                                        key={modulo.id}
                                        value={`mod-${modulo.id}`}
                                        className="border border-neutral-200/80 dark:border-neutral-800 rounded-xl px-5 bg-white dark:bg-neutral-900 shadow-sm"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                                                        {modulo.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                                                        <span>{modulo.completed_lessons} de {modulo.total_lessons} completadas</span>
                                                        <span>•</span>
                                                        <span className="text-blue-600 dark:text-blue-400 font-medium">{modulo.progress}% avance</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="pt-2 pb-5 border-t border-neutral-100 dark:border-neutral-800">
                                            {modulo.lessons.length === 0 ? (
                                                <p className="text-sm text-neutral-400 italic py-2">
                                                    Próximamente se publicarán las clases de este módulo.
                                                </p>
                                            ) : (
                                                <div className="space-y-2 mt-2">
                                                    {modulo.lessons.map((clase) => (
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
                                                    ))}
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Detail.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Mis Cursos', href: '/alumno' },
        { title: 'Detalle del Curso', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
