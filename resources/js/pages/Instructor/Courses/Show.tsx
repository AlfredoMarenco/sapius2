import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Settings, ArrowLeft, Users, Calendar, Activity } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    modules: any[];
}

export default function Show({ course }: { course: Course }) {
    return (
        <>
            <Head title={`Curso: ${course.title}`} />
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/instructor/cursos" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
                    </div>
                    <p className="text-muted-foreground">Panel de detalles del curso y alumnos inscritos</p>
                </div>
                
                <Link
                    href={`/instructor/cursos/${course.id}/builder`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                >
                    <Settings className="h-4 w-4" />
                    Abrir Course Builder
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Alumnos Inscritos</p>
                        <h3 className="text-2xl font-bold">0</h3>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Grupos Activos</p>
                        <h3 className="text-2xl font-bold">0</h3>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Tasa de Aprobación</p>
                        <h3 className="text-2xl font-bold">--%</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Alumnos del Curso</h3>
                    <p className="text-sm text-muted-foreground">Aquí podrás ver las calificaciones y avance de tus alumnos.</p>
                </div>
                <div className="p-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>La lista de alumnos se mostrará aquí próximamente.</p>
                </div>
            </div>
        </>
    );
}

Show.layout = (page: React.ReactNode, { course }: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/instructor' },
        { title: 'Mis Cursos', href: '/instructor/cursos' },
        { title: course?.title || 'Curso', href: `/instructor/cursos/${course?.id}/view` }
    ]}>
        {page}
    </AppLayout>
);
