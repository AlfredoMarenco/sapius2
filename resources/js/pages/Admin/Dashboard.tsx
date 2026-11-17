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
            
            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                            Panel de Control
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Supervisión general del sistema, cohortes activas y gestión académica.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                            href="/admin/cursos/create"
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#FF6B52] px-4 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#F0563C] transition-colors"
                        >
                            <BookOpen className="size-4" />
                            Nuevo Curso Base
                        </Link>
                    </div>
                </div>

                {/* Tarjetas de Métricas Reales */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    {statsItems.map((stat) => (
                        <div
                            key={stat.name}
                            className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className={`rounded-lg border p-2.5 ${stat.color}`}>
                                    <stat.icon className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-neutral-500 truncate">{stat.name}</p>
                                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100 mt-0.5">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sección de Cursos Activos / Generaciones en Curso (Réplica de admin.home) */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-[#101E33] dark:text-neutral-100">Cursos y Generaciones Activas</h2>
                            <p className="text-xs text-neutral-500">
                                Cohortes con inscripciones o clases en curso en la plataforma.
                            </p>
                        </div>
                        <Link
                            href="/admin/cursos"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline self-start sm:self-auto"
                        >
                            Ver todos los cursos <ChevronRight className="size-3.5" />
                        </Link>
                    </div>

                    {cohorts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-10 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                            <GraduationCap className="mx-auto size-10 opacity-40 mb-2.5" />
                            <p className="text-sm font-semibold text-[#101E33] dark:text-neutral-100">No hay cohortes activas en este momento</p>
                            <p className="text-xs mt-1">Crea una nueva programación en el módulo de Cursos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {cohorts.map((cohort) => (
                                <div
                                    key={cohort.id}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    {/* Portada del curso */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                        {cohort.course?.image ? (
                                            <img
                                                src={cohort.course.image.startsWith('http') ? cohort.course.image : `/media/stream/${cohort.course.image}`}
                                                alt={cohort.course.title}
                                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    const target = e.currentTarget as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = '/img/brand2026/card-simuladores.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                                                <BookOpen className="size-10 opacity-60" />
                                            </div>
                                        )}
                                        <div className="absolute top-2.5 left-2.5">
                                            <span className="rounded-md bg-[#101E33]/80 backdrop-blur-sm px-2 py-0.5 text-[11px] font-semibold text-white shadow">
                                                Cohorte #{cohort.id}
                                            </span>
                                        </div>
                                        <div className="absolute top-2.5 right-2.5">
                                            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">
                                                {cohort.enrollments_count} alumnos
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido de la tarjeta */}
                                    <div className="flex flex-1 flex-col p-4">
                                        <div className="mb-1.5">
                                            <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 truncate max-w-full dark:bg-neutral-800 dark:text-neutral-300">
                                                {cohort.internal_id}
                                            </span>
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold text-[#101E33] line-clamp-1 group-hover:text-[#FF6B52] transition-colors dark:text-neutral-100">
                                            {cohort.course?.title || 'Curso Programado'}
                                        </h3>
                                        {cohort.course?.description && (
                                            <div
                                                className="mt-1.5 text-xs text-neutral-500 line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: cohort.course.description }}
                                            />
                                        )}

                                        {/* Fechas de inicio y fin */}
                                        <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="size-3.5 text-blue-600" />
                                                <span>{cohort.start_date || 'N/A'}</span>
                                            </div>
                                            <span>al</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="size-3.5 text-[#FF6B52]" />
                                                <span>{cohort.end_date || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Botones de acción directa */}
                                        <div className="mt-3.5 flex items-center gap-2">
                                            <Link
                                                href={`/admin/curso/${cohort.id}`}
                                                className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#101E33] px-3 text-xs font-semibold text-white hover:bg-[#192B47] transition-colors shadow-xs"
                                            >
                                                <Users className="size-3.5" />
                                                Gestión de Alumnos
                                            </Link>
                                            <a
                                                href={`/admin/exportAllResults/${cohort.id}`}
                                                className="inline-flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-emerald-600 transition-colors shadow-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
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
