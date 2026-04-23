import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, Users, GraduationCap, BarChart3 } from 'lucide-react';

const stats = [
    { name: 'Cursos Activos', value: '12', icon: BookOpen, color: 'text-brand-blue' },
    { name: 'Estudiantes Totales', value: '1,234', icon: Users, color: 'text-brand-orange' },
    { name: 'Inscripciones Mes', value: '45', icon: GraduationCap, color: 'text-brand-cyan' },
    { name: 'Promedio Evaluación', value: '8.5', icon: BarChart3, color: 'text-green-500' },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.name} className="relative overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-card p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className={`rounded-lg bg-muted p-2 ${stat.color}`}>
                                    <stat.icon className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                    <div className="col-span-1 rounded-xl border border-sidebar-border bg-sidebar-card p-6 lg:col-span-4">
                        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 border-b border-sidebar-border pb-4 last:border-0 last:pb-0">
                                    <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                        <Users className="size-5 text-brand-blue" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Nuevo estudiante registrado</p>
                                        <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="col-span-1 rounded-xl border border-sidebar-border bg-sidebar-card p-6 lg:col-span-3">
                        <h3 className="text-lg font-semibold mb-4">Cursos Populares</h3>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-12 w-20 rounded bg-muted overflow-hidden">
                                        <div className="bg-brand-blue size-full opacity-20" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium truncate">Curso de Medicina Interna {i}</p>
                                        <p className="text-xs text-brand-orange">85 inscritos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: any) => (
    <AppLayout breadcrumbs={[{ title: 'Panel de Control', href: '/admin/dashboard' }]}>
        {page}
    </AppLayout>
);
