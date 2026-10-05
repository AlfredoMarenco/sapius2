import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Settings, Edit, Eye } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    image_url: string;
    category: {
        id: number;
        name: string;
    };
}

export default function Index({ courses }: { courses: Course[] }) {
    return (
        <>
            <Head title="Mis Cursos - Instructor" />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mis Cursos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona el contenido de los cursos que tienes asignados
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map(course => (
                    <div key={course.id} className="group relative rounded-xl border border-sidebar-border bg-card text-card-foreground shadow overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                        <div className="aspect-video w-full overflow-hidden bg-muted relative">
                            {course.image_url ? (
                                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <BookOpen className="h-10 w-10 opacity-20" />
                                </div>
                            )}
                            {course.category && (
                                <span className="absolute top-2 left-2 bg-background/90 text-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-sm">
                                    {course.category.name}
                                </span>
                            )}
                        </div>
                        
                        <div className="p-5 flex flex-col flex-grow">
                            <h3 className="font-semibold text-lg line-clamp-2 mb-2 leading-tight">
                                {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 flex-grow mb-4">
                                {course.description}
                            </p>
                            
                            <div className="flex gap-2 mt-auto">
                                <Link
                                    href={`/instructor/cursos/${course.id}/builder`}
                                    className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    Builder
                                </Link>
                                <Link
                                    href={`/instructor/cursos/${course.id}/view`}
                                    className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Detalles
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full py-12 text-center rounded-xl border border-dashed">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium">No hay cursos asignados</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Aún no se te ha asignado ningún curso para administrar.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/instructor' },
        { title: 'Mis Cursos', href: '/instructor/cursos' }
    ]}>
        {page}
    </AppLayout>
);
