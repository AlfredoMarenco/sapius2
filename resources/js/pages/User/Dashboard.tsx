import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle, Clock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

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
    return (
        <>
            <Head title="Mi Panel de Aprendizaje" />

            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
                    <div className="relative z-10 max-w-2xl space-y-3">
                        <Badge variant="secondary" className="bg-white/10 text-white border-none backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-yellow-400" /> Plataforma Alumno
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            ¡Bienvenido a tu espacio de estudio!
                        </h1>
                        <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed">
                            Aquí tienes acceso directo a tus cursos activos, simuladores y material de preparación para tus evaluaciones.
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
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
                                Cursos y programas en los que te encuentras inscrito actualmente
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/alumno/cursos">
                                Explorar más cursos <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Link>
                        </Button>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-4">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                                No cuentas con ningún curso adquirido todavía
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md mx-auto mb-6">
                                Explora nuestro catálogo con los mejores cursos de preparación, guías de estudio y simuladores.
                            </p>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Link href="/alumno/cursos">
                                    Ver Cursos Disponibles
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledCourses.map((item) => (
                                <Card key={item.enrollment_id} className="flex flex-col overflow-hidden border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                        {item.image ? (
                                            <img
                                                src={item.image.startsWith('http') ? item.image : `/media/stream/${item.image}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-800 dark:to-neutral-900">
                                                <BookOpen className="w-12 h-12 text-blue-500/40" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <Badge className="bg-blue-600/90 hover:bg-blue-600 text-white backdrop-blur-sm shadow-sm">
                                                {item.category}
                                            </Badge>
                                            {item.identifier && (
                                                <Badge variant="secondary" className="bg-black/60 text-white border-none backdrop-blur-sm">
                                                    {item.identifier}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <CardHeader className="p-5 pb-3">
                                        <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-blue-600">
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs text-neutral-500">
                                            Instructor: {item.instructor}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="px-5 py-2 flex-grow space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-neutral-500">Progreso general</span>
                                                <span className="text-blue-600 dark:text-blue-400">{item.progress}%</span>
                                            </div>
                                            <Progress value={item.progress} className="h-2" />
                                            <div className="flex justify-between text-[11px] text-neutral-400">
                                                <span>{item.completed_lessons} de {item.total_lessons} lecciones</span>
                                                {item.start_date && (
                                                    <span>Inicia: {item.start_date}</span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30">
                                        {item.status === 'no' ? (
                                            <Button disabled variant="outline" className="w-full text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
                                                <Clock className="w-4 h-4 mr-2" /> Aprobación Pendiente
                                            </Button>
                                        ) : !item.is_available ? (
                                            <Button disabled variant="outline" className="w-full text-neutral-500">
                                                <Clock className="w-4 h-4 mr-2" /> Disponible el {item.start_date}
                                            </Button>
                                        ) : (
                                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                                <Link href={item.next_lesson_id ? `/alumno/modulo/${item.next_lesson_id}/${item.scheduled_id}` : `/alumno/curso/${item.scheduled_id}`}>
                                                    {item.progress > 0 && item.progress < 100 ? (
                                                        <>Continuar Aprendiendo <ArrowRight className="w-4 h-4 ml-1.5" /></>
                                                    ) : item.progress === 100 ? (
                                                        <>Repasar Curso <ArrowRight className="w-4 h-4 ml-1.5" /></>
                                                    ) : (
                                                        <>Comenzar Curso <ArrowRight className="w-4 h-4 ml-1.5" /></>
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

Dashboard.layout = (page: any) => (
    <AppLayout breadcrumbs={[{ title: 'Mi Panel de Aprendizaje', href: '/alumno' }]}>
        {page}
    </AppLayout>
);
