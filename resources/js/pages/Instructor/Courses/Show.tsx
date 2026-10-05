import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Settings, ArrowLeft, Users, Calendar, Activity, GraduationCap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Student {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    cohort: string;
    enrolled_at: string;
    status: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    modules: any[];
}

export default function Show({ course, students = [], total_cohorts = 0 }: { course: Course, students?: Student[], total_cohorts?: number }) {
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
                        <h3 className="text-2xl font-bold">{students.length}</h3>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Grupos Activos</p>
                        <h3 className="text-2xl font-bold">{total_cohorts}</h3>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Calificaciones</p>
                        <h3 className="text-2xl font-bold text-green-600">Activo</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-brand-blue" />
                        Lista de Alumnos ({students.length})
                    </h3>
                    <p className="text-sm text-muted-foreground">Alumnos inscritos en todas las cohortes de este curso.</p>
                </div>
                {students.length > 0 ? (
                    <div className="w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Alumno</TableHead>
                                    <TableHead>Cohorte / Grupo</TableHead>
                                    <TableHead>Fecha de Inscripción</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={`${student.id}-${student.cohort}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    {student.avatar && <AvatarImage src={`/storage/${student.avatar}`} alt={student.name} />}
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {student.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{student.name}</span>
                                                    <span className="text-xs text-muted-foreground">{student.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{student.cohort}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(student.enrolled_at).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {student.status === 'si' ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aceptado</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pendiente</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-xs text-muted-foreground cursor-not-allowed">
                                                Progreso
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Aún no hay alumnos inscritos en este curso.</p>
                    </div>
                )}
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
