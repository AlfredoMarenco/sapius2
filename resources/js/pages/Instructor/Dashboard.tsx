import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Users, HelpCircle } from 'lucide-react';

export default function Dashboard() {
    return (
        <>
            <Head title="Panel de Instructor" />
            
            <div className="flex flex-col gap-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/50 bg-sidebar/10 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Mis Cursos</h3>
                                <p className="text-sm text-muted-foreground">Gestiona el contenido de tus cursos</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link href="/instructor/cursos" className="text-sm font-medium text-primary hover:underline">
                                Ver cursos &rarr;
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/50 bg-sidebar/10 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-green-500/10 p-3 text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Mis Alumnos</h3>
                                <p className="text-sm text-muted-foreground">Revisa el progreso de tus grupos</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link href="/instructor/cursos" className="text-sm font-medium text-primary hover:underline">
                                Ver alumnos &rarr;
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/50 bg-sidebar/10 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600">
                                <HelpCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Soporte</h3>
                                <p className="text-sm text-muted-foreground">Contacta al equipo de administración</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link href="/instructor/soporte" className="text-sm font-medium text-primary hover:underline">
                                Ir a soporte &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/50 bg-sidebar/10 p-6 shadow-sm">
                    <h2 className="text-xl font-bold">¡Bienvenido al Panel de Instructor!</h2>
                    <p className="mt-2 text-muted-foreground">
                        Desde aquí podrás gestionar todo el contenido de los cursos que tienes asignados, revisar calificaciones, modificar lecciones, añadir material de apoyo y dar seguimiento al progreso de tus alumnos.
                    </p>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/instructor' }]}>
        {page}
    </AppLayout>
);
