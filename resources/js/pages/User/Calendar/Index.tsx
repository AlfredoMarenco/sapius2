import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calendar as CalendarIcon, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    course_title: string;
    module_title: string;
}

interface CalendarProps {
    events: CalendarEvent[];
}

export default function CalendarIndex({ events = [] }: CalendarProps) {
    return (
        <>
            <Head title="Calendario de Actividades" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Calendario de Actividades
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Consulta la programación y periodos de apertura de tus módulos y lecciones.
                    </p>
                </div>

                <div className="space-y-4">
                    {events.length === 0 ? (
                        <Card className="p-12 text-center text-neutral-400">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">No hay fechas programadas</h3>
                            <p className="text-xs text-neutral-400 mt-1">Tus cursos activos no tienen fechas límite asignadas actualmente.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {events.map((event) => (
                                <Card key={event.id} className="p-5 border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:border-blue-300 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                                                {event.course_title}
                                            </Badge>
                                            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                                                {event.module_title}
                                            </h3>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                                        <span>Inicio: {event.start}</span>
                                        <span>Cierre: {event.end}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

CalendarIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Alumno', href: '/alumno' },
        { title: 'Calendario', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
