import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import AppLayout from '@/layouts/app-layout';
import type { Auth } from '@/types';

interface EnrolledCourse {
    enrollment_id: number;
    status: string; // 'si' | 'no'
    scheduled_id: number;
    identifier: string;
    course_id: number;
    title: string;
    category: string;
    category_slug: string;
    description: string;
    image: string | null;
    instructor: string;
    progress: number;
    total_lessons: number;
    completed_lessons: number;
    next_lesson_id?: number | null;
    is_available: boolean;
    start_date: string | null;
    end_date: string | null;
}

interface DashboardProps {
    enrolledCourses: EnrolledCourse[];
}

export default function Dashboard({ enrolledCourses = [] }: DashboardProps) {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';

    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
        allowTextInputs: true,
    });

    return (
        <>
            <Head title="Mi Panel de Aprendizaje" />
            <StrikeAlert />
            <Watermark />

            <div
                className={`mx-auto max-w-7xl space-y-8 p-6 select-none ${
                    isBlurred ? 'pointer-events-none blur-xl' : ''
                }`}
            >
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
                    <div className="relative z-10 max-w-2xl space-y-3">
                        <Badge
                            variant="secondary"
                            className="border-none bg-white/10 text-white backdrop-blur-md"
                        >
                            <Sparkles className="mr-1 h-3.5 w-3.5 text-yellow-400" />{' '}
                            Plataforma Alumno
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            ¡Bienvenido a tu espacio de estudio!
                        </h1>
                        <p className="text-sm leading-relaxed text-blue-100/80 sm:text-base">
                            Aquí tienes acceso directo a tus cursos activos, simuladores y
                            material de preparación para tus evaluaciones.
                        </p>
                    </div>
                    <div className="pointer-events-none absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10">
                        <BookOpen size={300} />
                    </div>
                </div>

                {/* Courses Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Tus Cursos Activos
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Cursos y programas en los que te encuentras inscrito
                                actualmente
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/alumno/cursos">
                                Explorar más cursos{' '}
                                <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 px-4 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                No cuentas con ningún curso adquirido todavía
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                                Explora nuestro catálogo con los mejores cursos de preparación,
                                guías de estudio y simuladores.
                            </p>
                            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                                <Link href="/alumno/cursos">Ver Cursos Disponibles</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {enrolledCourses.map((item) => (
                                <Card
                                    key={item.enrollment_id}
                                    className="flex flex-col overflow-hidden border-neutral-200/80 shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-800"
                                >
                                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                        {item.image ? (
                                            <img
                                                src={
                                                    item.image.startsWith('http')
                                                        ? item.image
                                                        : `/media/stream/${item.image}`
                                                }
                                                alt={item.title}
                                                draggable={false}
                                                className="h-full w-full object-cover select-none"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.onerror = null;
                                                    target.src =
                                                        '/img/brand2026/card-simuladores.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-800 dark:to-neutral-900">
                                                <BookOpen className="h-12 w-12 text-blue-500/40" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <Badge className="bg-blue-600/90 text-white shadow-sm backdrop-blur-sm hover:bg-blue-600">
                                                {item.category}
                                            </Badge>
                                            {item.identifier && (
                                                <Badge
                                                    variant="secondary"
                                                    className="border-none bg-black/60 text-white backdrop-blur-sm"
                                                >
                                                    {item.identifier}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <CardHeader className="p-5 pb-3">
                                        <CardTitle className="line-clamp-1 text-lg font-bold group-hover:text-blue-600">
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs text-neutral-500">
                                            Instructor: {item.instructor}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-grow space-y-4 px-5 py-2">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-neutral-500">
                                                    Progreso general
                                                </span>
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    {item.progress}%
                                                </span>
                                            </div>
                                            <Progress value={item.progress} className="h-2" />
                                            <div className="flex justify-between text-[11px] text-neutral-400">
                                                <span>
                                                    {item.completed_lessons} de{' '}
                                                    {item.total_lessons} lecciones
                                                </span>
                                                {item.start_date && (
                                                    <span>Inicia: {item.start_date}</span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="border-t border-neutral-100 bg-neutral-50/50 p-5 pt-3 dark:border-neutral-800/60 dark:bg-neutral-900/30">
                                        {item.status === 'no' ? (
                                            <Button
                                                disabled
                                                variant="outline"
                                                className="w-full border-yellow-200 bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30"
                                            >
                                                <Clock className="mr-2 h-4 w-4" /> Aprobación
                                                Pendiente
                                            </Button>
                                        ) : !item.is_available ? (
                                            <Button
                                                disabled
                                                variant="outline"
                                                className="w-full text-neutral-500"
                                            >
                                                <Clock className="mr-2 h-4 w-4" /> Disponible el{' '}
                                                {item.start_date}
                                            </Button>
                                        ) : (
                                            <Button
                                                asChild
                                                className="w-full bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                                            >
                                                <Link
                                                    href={
                                                        item.next_lesson_id
                                                            ? `/alumno/modulo/${item.next_lesson_id}/${item.scheduled_id}`
                                                            : `/alumno/curso/${item.scheduled_id}`
                                                    }
                                                >
                                                    {item.progress > 0 && item.progress < 100 ? (
                                                        <>
                                                            Continuar Aprendiendo{' '}
                                                            <ArrowRight className="ml-1.5 h-4 w-4" />
                                                        </>
                                                    ) : item.progress === 100 ? (
                                                        <>
                                                            Repasar Curso{' '}
                                                            <ArrowRight className="ml-1.5 h-4 w-4" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            Comenzar Curso{' '}
                                                            <ArrowRight className="ml-1.5 h-4 w-4" />
                                                        </>
                                                    )}
                                                </Link>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Mi Panel de Aprendizaje', href: '/alumno' }]}>
        {page}
    </AppLayout>
);
