import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    HelpCircle,
    Calendar,
    Clock,
    Layers,
    Settings,
    Eye,
    GraduationCap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

interface CohortCourse {
    id: number;
    title: string;
    slug?: string;
    image?: string | null;
    description?: string | null;
    category?: { id?: number; name: string } | null;
}

interface AssignedCohort {
    id: number;
    course_id?: number;
    internal_id?: string | null;
    identificador?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    enrollments_count?: number;
    active_students_count?: number;
    course?: CohortCourse | null;
}

interface AssignedCourse {
    id: number;
    title: string;
    image?: string | null;
    description?: string | null;
    category?: { id?: number; name: string } | null;
    cohorts_count?: number;
    students_count?: number;
}

interface InstructorStats {
    assigned_courses?: number;
    total_courses?: number;
    active_cohorts?: number;
    total_cohorts?: number;
    total_students?: number;
    students_count?: number;
    active_students?: number;
}

interface InstructorDashboardProps {
    cohorts?: AssignedCohort[];
    courses?: AssignedCourse[];
    stats?: InstructorStats;
}

function resolveCourseImage(img?: string | null): string | null {
    if (!img) {
return null;
}

    if (img.startsWith('http') || img.startsWith('/')) {
return img;
}

    return `/media/stream/${img}`;
}

export default function Dashboard({
    cohorts = [],
    courses = [],
    stats = {},
}: InstructorDashboardProps) {
    const uniqueCourseIds = new Set<number>();
    cohorts.forEach((c) => {
        const cid = c.course?.id ?? c.course_id;

        if (cid) {
uniqueCourseIds.add(cid);
}
    });
    courses.forEach((c) => uniqueCourseIds.add(c.id));

    const totalCourses =
        stats.assigned_courses ?? stats.total_courses ?? uniqueCourseIds.size;
    const activeCohorts =
        stats.active_cohorts ?? stats.total_cohorts ?? cohorts.length;
    const totalStudents =
        stats.total_students ??
        stats.students_count ??
        stats.active_students ??
        cohorts.reduce(
            (sum, c) => sum + Number(c.enrollments_count ?? c.active_students_count ?? 0),
            0,
        );

    const metrics = [
        {
            label: 'Cursos Asignados',
            value: totalCourses,
            icon: BookOpen,
            color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
            href: '/instructor/cursos',
        },
        {
            label: 'Cohortes Activas',
            value: activeCohorts,
            icon: Layers,
            color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20',
            href: '/instructor/cursos',
        },
        {
            label: 'Alumnos Inscritos',
            value: totalStudents,
            icon: Users,
            color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
            href: '/instructor/cursos',
        },
        {
            label: 'Soporte Académico',
            value: 'Disponible',
            icon: HelpCircle,
            color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
            href: '/instructor/soporte',
        },
    ];

    return (
        <>
            <Head title="Panel de Instructor" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Panel de Instructor
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona tus cursos asignados, revisa el avance de tus cohortes y
                            atiende el seguimiento de alumnos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/instructor/soporte">
                                <HelpCircle className="mr-1.5 h-4 w-4" />
                                Soporte Técnico
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="sm"
                            className="bg-brand-blue text-white hover:bg-brand-blue/90"
                        >
                            <Link href="/instructor/cursos">
                                <BookOpen className="mr-1.5 h-4 w-4" />
                                Ver Mis Cursos
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Métricas del Instructor */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric) => (
                        <Link
                            key={metric.label}
                            href={metric.href}
                            className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`rounded-xl border p-3 ${metric.color}`}>
                                    <metric.icon className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {metric.label}
                                    </p>
                                    <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
                                        {typeof metric.value === 'number'
                                            ? metric.value.toLocaleString()
                                            : metric.value}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Cohortes Asignadas */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                Tus Cohortes y Cursos Asignados
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Accede directamente al constructor de contenido o al seguimiento de
                                alumnos por cohorte.
                            </p>
                        </div>
                        <Link
                            href="/instructor/cursos"
                            className="text-xs font-semibold text-brand-blue hover:underline"
                        >
                            Ver todos los cursos &rarr;
                        </Link>
                    </div>

                    {cohorts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {cohorts.map((cohort) => {
                                const courseId = cohort.course?.id ?? cohort.course_id;
                                const courseTitle =
                                    cohort.course?.title || 'Curso Asignado';
                                const imageSrc = resolveCourseImage(cohort.course?.image);
                                const studentsCount =
                                    cohort.enrollments_count ??
                                    cohort.active_students_count ??
                                    0;
                                const identifier =
                                    cohort.internal_id ||
                                    cohort.identificador ||
                                    `Cohorte #${cohort.id}`;
                                const startDate =
                                    cohort.start_date || cohort.fecha_inicio || 'N/A';
                                const endDate =
                                    cohort.end_date || cohort.fecha_fin || 'N/A';

                                return (
                                    <div
                                        key={cohort.id}
                                        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={courseTitle}
                                                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src =
                                                            '/img/brand2026/card-simuladores.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-cyan/20 text-brand-blue">
                                                    <BookOpen className="size-12 opacity-60" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <Badge className="bg-black/60 text-white backdrop-blur-md">
                                                    {identifier}
                                                </Badge>
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-brand-blue text-white">
                                                    {studentsCount} alumno
                                                    {studentsCount === 1 ? '' : 's'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col p-5">
                                            {cohort.course?.category?.name && (
                                                <span className="mb-1 text-[11px] font-semibold tracking-wider text-brand-blue uppercase">
                                                    {cohort.course.category.name}
                                                </span>
                                            )}
                                            <h3 className="line-clamp-1 text-base font-bold text-foreground">
                                                {courseTitle}
                                            </h3>

                                            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="size-3.5 text-brand-blue" />
                                                    <span>{startDate}</span>
                                                </div>
                                                <span>al</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="size-3.5 text-brand-orange" />
                                                    <span>{endDate}</span>
                                                </div>
                                            </div>

                                            {courseId && (
                                                <div className="mt-4 flex items-center gap-2">
                                                    <Link
                                                        href={`/instructor/cursos/${courseId}/builder`}
                                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
                                                    >
                                                        <Settings className="size-3.5" />
                                                        Builder
                                                    </Link>
                                                    <Link
                                                        href={`/instructor/cursos/${courseId}/view?cohort_id=${cohort.id}`}
                                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Alumnos
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => {
                                const imageSrc = resolveCourseImage(course.image);

                                return (
                                    <div
                                        key={course.id}
                                        className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                                    >
                                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={course.title}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                                    <BookOpen className="size-10 opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <h3 className="line-clamp-2 text-base font-bold text-foreground">
                                                {course.title}
                                            </h3>
                                            <div className="mt-auto flex gap-2 pt-4">
                                                <Link
                                                    href={`/instructor/cursos/${course.id}/builder`}
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
                                                >
                                                    <Settings className="size-3.5" />
                                                    Builder
                                                </Link>
                                                <Link
                                                    href={`/instructor/cursos/${course.id}/view`}
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
                                                >
                                                    <Eye className="size-3.5" />
                                                    Detalles
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
                            <GraduationCap className="mx-auto mb-3 size-12 opacity-40" />
                            <p className="font-semibold text-foreground">
                                No tienes cohortes activas asignadas por el momento
                            </p>
                            <p className="mt-1 text-xs">
                                Cuando un administrador te asigne un grupo o curso, aparecerá
                                aquí automáticamente.
                            </p>
                            <div className="mt-4 flex justify-center gap-3">
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/instructor/cursos">Explorar Mis Cursos</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/instructor' }]}>
        {page}
    </AppLayout>
);
