import { Head, Link } from '@inertiajs/react';
import { BookOpen, Settings, Eye } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { stripHtml } from '@/lib/utils';

interface Course {
    id: number;
    title: string;
    description: string | null;
    image?: string | null;
    image_url?: string | null;
    category?: {
        id: number;
        name: string;
    } | null;
}

function getCourseImageUrl(course: Course): string | null {
    const raw = course.image || course.image_url;

    if (!raw) {
return null;
}

    if (raw.startsWith('http') || raw.startsWith('/')) {
return raw;
}

    return `/media/stream/${raw}`;
}

export default function Index({ courses = [] }: { courses: Course[] }) {
    return (
        <>
            <Head title="Mis Cursos - Instructor" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Mis Cursos</h1>
                        <p className="mt-1 text-muted-foreground">
                            Gestiona el contenido de los cursos que tienes asignados
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => {
                        const imageSrc = getCourseImageUrl(course);

                        return (
                            <div
                                key={course.id}
                                className="group relative flex flex-col overflow-hidden rounded-xl border border-sidebar-border bg-card text-card-foreground shadow transition-colors hover:border-primary/50"
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={course.title}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    '/img/brand2026/card-simuladores.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            <BookOpen className="h-10 w-10 opacity-20" />
                                        </div>
                                    )}
                                    {course.category && (
                                        <span className="absolute top-2 left-2 rounded-full border bg-background/90 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm">
                                            {course.category.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-grow flex-col p-5">
                                    <h3 className="mb-2 line-clamp-2 text-lg leading-tight font-semibold">
                                        {course.title}
                                    </h3>
                                    <p className="mb-4 line-clamp-2 flex-grow text-sm text-muted-foreground">
                                        {stripHtml(course.description) ||
                                            'Sin descripción disponible.'}
                                    </p>

                                    <div className="mt-auto flex gap-2">
                                        <Link
                                            href={`/instructor/cursos/${course.id}/builder`}
                                            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Builder
                                        </Link>
                                        <Link
                                            href={`/instructor/cursos/${course.id}/view`}
                                            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Detalles
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {courses.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed py-12 text-center">
                            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium">
                                No hay cursos asignados
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Aún no se te ha asignado ningún curso para administrar.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/instructor' },
            { title: 'Mis Cursos', href: '/instructor/cursos' },
        ]}
    >
        {page}
    </AppLayout>
);
