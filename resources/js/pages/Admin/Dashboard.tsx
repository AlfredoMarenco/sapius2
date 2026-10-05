import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Users, 
    GraduationCap, 
    Calendar, 
    UserCheck, 
    Layers, 
    BarChart3, 
    ArrowRight, 
    Download, 
    Clock, 
    Tag,
    ChevronRight,
    Award
} from 'lucide-react';

interface CohortCard {
    id: number;
    internal_id: string;
    price: string | number;
    start_date: string | null;
    end_date: string | null;
    sale_start_date: string | null;
    sale_end_date: string | null;
    enrollments_count: number;
    course: {
        id: number;
        title: string;
        slug: string;
        image: string | null;
        description: string | null;
        active: string;
    } | null;
}

interface StatsData {
    active_cohorts: number;
    total_students: number;
    active_courses: number;
    pending_validations: number;
}

interface Props {
    cohorts: CohortCard[];
    stats: StatsData;
}

export default function Dashboard({ cohorts, stats }: Props) {
    const statsItems = [
        { 
            name: 'Generaciones en Curso', 
            value: stats.active_cohorts.toString(), 
            icon: GraduationCap, 
            color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20' 
        },
        { 
            name: 'Estudiantes Registrados', 
            value: stats.total_students.toLocaleString(), 
            icon: Users, 
            color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20' 
        },
        { 
            name: 'Cursos Base Activos', 
            value: stats.active_courses.toString(), 
            icon: BookOpen, 
            color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20' 
        },
        { 
            name: 'Aspirantes por Validar', 
            value: stats.pending_validations.toString(), 
            icon: UserCheck, 
            color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' 
        },
    ];

    return (
        <>
            <Head title="Panel de Control - Administrador" />
            
            <div className="flex flex-col gap-6 p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Panel de Control
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Supervisión general del sistema, cohortes activas y gestión académica.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/cursos/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-blue/90 transition-all"
                        >
                            <BookOpen className="size-4" />
                            Nuevo Curso Base
                        </Link>
                    </div>
                </div>

                {/* Tarjetas de Métricas Reales */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statsItems.map((stat) => (
                        <div 
                            key={stat.name} 
                            className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl border p-3 ${stat.color}`}>
                                    <stat.icon className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{stat.name}</p>
                                    <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sección de Cursos Activos / Generaciones en Curso (Réplica de admin.home) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Cursos y Generaciones Activas</h2>
                            <p className="text-xs text-muted-foreground">
                                Cohortes con inscripciones o clases en curso en la plataforma.
                            </p>
                        </div>
                        <Link
                            href="/admin/cursos"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                        >
                            Ver todos los cursos <ChevronRight className="size-3.5" />
                        </Link>
                    </div>

                    {cohorts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
                            <GraduationCap className="mx-auto size-12 opacity-40 mb-3" />
                            <p className="font-semibold text-foreground">No hay cohortes activas en este momento</p>
                            <p className="text-xs mt-1">Crea una nueva programación en el módulo de Cursos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {cohorts.map((cohort) => (
                                <div 
                                    key={cohort.id} 
                                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    {/* Portada del curso */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        {cohort.course?.image ? (
                                            <img
                                                src={cohort.course.image.startsWith('http') ? cohort.course.image : `/media/stream/${cohort.course.image}`}
                                                alt={cohort.course.title}
                                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    // Fallback si la imagen no existe
                                                    (e.target as HTMLImageElement).src = '/vendor/adminmart/assets/images/big/cursos.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-cyan/20 text-brand-blue">
                                                <BookOpen className="size-12 opacity-60" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                                                Cohorte #{cohort.id}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className="rounded-md bg-brand-blue px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                                                {cohort.enrollments_count} alumnos
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido de la tarjeta */}
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="mb-2">
                                            <span className="inline-block rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground truncate max-w-full">
                                                {cohort.internal_id}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-brand-blue transition-colors">
                                            {cohort.course?.title || 'Curso Programado'}
                                        </h3>
                                        {cohort.course?.description && (
                                            <div 
                                                className="mt-2 text-xs text-muted-foreground line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: cohort.course.description }}
                                            />
                                        )}

                                        {/* Fechas de inicio y fin */}
                                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-3.5 text-brand-blue" />
                                                <span>{cohort.start_date || 'N/A'}</span>
                                            </div>
                                            <span>al</span>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-3.5 text-brand-orange" />
                                                <span>{cohort.end_date || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Botones de acción directa */}
                                        <div className="mt-4 flex items-center gap-2">
                                            <Link
                                                href={`/admin/curso/${cohort.id}`}
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background hover:bg-foreground/90 transition-all shadow-sm"
                                            >
                                                <Users className="size-3.5" />
                                                Gestión de Alumnos
                                            </Link>
                                            <a
                                                href={`/admin/exportAllResults/${cohort.id}`}
                                                className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-green-600 transition-colors shadow-sm"
                                                title="Exportar Calificaciones"
                                            >
                                                <Download className="size-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Panel de Control', href: '/admin' }]}>
        {page}
    </AppLayout>
);
