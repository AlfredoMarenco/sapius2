import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Circle,
    PlayCircle,
    LayoutGrid,
    List,
    Image as ImageIcon,
    ArrowRight,
    X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LessonItem {
    id: number;
    title: string;
    is_completed: boolean;
    url: string;
}

interface CalendarEvent {
    id: string;
    scheduled_id?: number;
    course_id?: number;
    title: string;
    start: string;
    end: string;
    start_iso?: string;
    end_iso?: string;
    course_title: string;
    identifier?: string;
    module_title: string;
    total_lessons?: number;
    completed_lessons?: number;
    progress?: number;
    lessons?: LessonItem[];
    course_url?: string;
}

interface CourseSummary {
    scheduled_id: number;
    course_id: number;
    title: string;
    identifier?: string;
    instructor: string;
    start_date: string;
    end_date: string;
    start_iso: string;
    end_iso: string;
    progress: number;
    total_lessons: number;
    completed_lessons: number;
    course_url: string;
}

interface WeeklyCalendarItem {
    id: number;
    course_id: number;
    group_name?: string | null;
    image_url: string;
    start_date?: string | null;
    end_date?: string | null;
}

interface CalendarProps {
    events: CalendarEvent[];
    courses?: CourseSummary[];
    weeklyCalendars?: WeeklyCalendarItem[];
}

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarIndex({
    events = [],
    courses = [],
    weeklyCalendars = [],
}: CalendarProps) {
    const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(events[0] || null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const initialDate = useMemo(() => {
        const firstIso = events.find((e) => e.start_iso)?.start_iso;
        if (firstIso) {
            const parts = firstIso.split('-').map(Number);
            if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                return new Date(parts[0], parts[1] - 1, 1);
            }
        }
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }, [events]);

    const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);

    const filteredEvents = useMemo(() => {
        if (selectedCourseFilter === 'all') return events;
        return events.filter((ev) => String(ev.scheduled_id) === selectedCourseFilter || ev.course_title === selectedCourseFilter);
    }, [events, selectedCourseFilter]);

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Monday = 0 ... Sunday = 6
        const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
        const totalDays = lastDayOfMonth.getDate();

        const cells: Array<{ dateStr: string; dayNumber: number; isCurrentMonth: boolean; dayEvents: CalendarEvent[] }> = [];

        for (let i = 0; i < startOffset; i++) {
            const d = new Date(year, month, -startOffset + i + 1);
            const iso = d.toISOString().slice(0, 10);
            cells.push({ dateStr: iso, dayNumber: d.getDate(), isCurrentMonth: false, dayEvents: [] });
        }

        for (let day = 1; day <= totalDays; day++) {
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const iso = `${year}-${mm}-${dd}`;
            const dayEvents = filteredEvents.filter((ev) => {
                const s = ev.start_iso || '';
                const e = ev.end_iso || s;
                return s && iso >= s && iso <= e;
            });
            cells.push({ dateStr: iso, dayNumber: day, isCurrentMonth: true, dayEvents });
        }

        while (cells.length % 7 !== 0) {
            const nextIdx = cells.length - (startOffset + totalDays) + 1;
            const d = new Date(year, month + 1, nextIdx);
            const iso = d.toISOString().slice(0, 10);
            cells.push({ dateStr: iso, dayNumber: d.getDate(), isCurrentMonth: false, dayEvents: [] });
        }

        return cells;
    }, [currentMonth, filteredEvents]);

    return (
        <>
            <Head title="Calendario de Actividades" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                            <CalendarIcon className="w-8 h-8 text-blue-600" />
                            Calendario de Actividades
                        </h1>
                        <p className="text-neutral-500 text-sm mt-1">
                            Consulta la programación, fechas de inicio/cierre y avance de lecciones de todos tus cursos inscritos.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {courses.length > 1 && (
                            <select
                                value={selectedCourseFilter}
                                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                                className="h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-xs font-semibold text-neutral-700 dark:text-neutral-200"
                            >
                                <option value="all">Todos mis cursos ({courses.length})</option>
                                {courses.map((c) => (
                                    <option key={c.scheduled_id} value={String(c.scheduled_id)}>
                                        {c.title} {c.identifier ? `(${c.identifier})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="inline-flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
                            <Button
                                type="button"
                                size="sm"
                                variant={viewMode === 'agenda' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('agenda')}
                                className={viewMode === 'agenda' ? 'bg-blue-600 text-white h-8 px-3 text-xs' : 'h-8 px-3 text-xs'}
                            >
                                <List className="w-3.5 h-3.5 mr-1.5" /> Módulos y Clases
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={viewMode === 'month' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('month')}
                                className={viewMode === 'month' ? 'bg-blue-600 text-white h-8 px-3 text-xs' : 'h-8 px-3 text-xs'}
                            >
                                <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> Calendario Mensual
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Resumen de Cursos Inscritos */}
                {courses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map((course) => (
                            <Card key={course.scheduled_id} className="border-neutral-200/80 dark:border-neutral-800 shadow-xs">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            {course.identifier && (
                                                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 mb-1">
                                                    {course.identifier}
                                                </Badge>
                                            )}
                                            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs text-neutral-500">Instructor: {course.instructor}</p>
                                        </div>
                                        <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs shrink-0">
                                            <Link href={course.course_url}>
                                                Ir al curso <ArrowRight className="w-3 h-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] text-neutral-500">
                                            <span>Avance: {course.completed_lessons}/{course.total_lessons} lecciones</span>
                                            <span className="font-bold text-blue-600">{course.progress}%</span>
                                        </div>
                                        <Progress value={course.progress} className="h-1.5" />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <span>Inicio: <strong>{course.start_date}</strong></span>
                                        <span>Cierre: <strong>{course.end_date}</strong></span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Vista Principal: Agenda interactiva con Detalle de Lecciones o Cuadrícula Mensual */}
                {filteredEvents.length === 0 ? (
                    <Card className="p-12 text-center text-neutral-400">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                        <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">No hay fechas programadas</h3>
                        <p className="text-xs text-neutral-400 mt-1">Tus cursos activos aparecerán aquí en cuanto tengan módulos asignados.</p>
                    </Card>
                ) : viewMode === 'agenda' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Lista de Módulos */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredEvents.map((event) => {
                                const isSelected = selectedEvent?.id === event.id;
                                return (
                                    <Card
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`p-5 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                                                : 'border-neutral-200/80 dark:border-neutral-800 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 min-w-0">
                                                <Badge variant="outline" className="text-blue-600 border-blue-200 text-[11px] truncate max-w-full">
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

                                        {typeof event.total_lessons === 'number' && event.total_lessons > 0 && (
                                            <div className="mt-3 space-y-1">
                                                <div className="flex justify-between text-[11px] text-neutral-500">
                                                    <span>{event.completed_lessons || 0} de {event.total_lessons} clases</span>
                                                    <span className="font-semibold text-blue-600">{event.progress || 0}%</span>
                                                </div>
                                                <Progress value={event.progress || 0} className="h-1.5" />
                                            </div>
                                        )}

                                        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                            <span>Inicio: <strong>{event.start}</strong></span>
                                            <span>Cierre: <strong>{event.end}</strong></span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Panel Lateral: Detalle de Lecciones del Módulo Seleccionado */}
                        <div className="lg:col-span-5 sticky top-6">
                            {selectedEvent ? (
                                <Card className="border-neutral-200 dark:border-neutral-800 shadow-md overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-slate-900 to-blue-950 text-white">
                                        <Badge className="w-fit bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px]">
                                            {selectedEvent.course_title}
                                        </Badge>
                                        <CardTitle className="text-lg font-bold text-white mt-1">
                                            {selectedEvent.module_title}
                                        </CardTitle>
                                        <CardDescription className="text-blue-200 text-xs flex items-center gap-3 pt-1">
                                            <span>Inicio: {selectedEvent.start}</span>
                                            <span>•</span>
                                            <span>Cierre: {selectedEvent.end}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                                Lecciones del Módulo ({selectedEvent.lessons?.length || 0})
                                            </h4>
                                            {selectedEvent.course_url && (
                                                <Link
                                                    href={selectedEvent.course_url}
                                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                                >
                                                    Ver temario completo
                                                </Link>
                                            )}
                                        </div>

                                        {!selectedEvent.lessons || selectedEvent.lessons.length === 0 ? (
                                            <p className="text-sm text-neutral-400 italic py-4 text-center">
                                                Este módulo aún no tiene clases publicadas.
                                            </p>
                                        ) : (
                                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                                {selectedEvent.lessons.map((lesson, idx) => (
                                                    <Link
                                                        key={lesson.id}
                                                        href={lesson.url}
                                                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800 hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {lesson.is_completed ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                            ) : (
                                                                <PlayCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                                            )}
                                                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-blue-600">
                                                                {idx + 1}. {lesson.title}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-blue-600 shrink-0 ml-2">
                                                            Abrir →
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="p-8 text-center text-neutral-400">
                                    Selecciona un módulo para ver el detalle de sus lecciones.
                                </Card>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Vista de Cuadrícula Mensual Interactiva */
                    <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 dark:border-neutral-800 py-4">
                            <CardTitle className="text-lg font-bold">
                                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                        const now = new Date();
                                        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                                    }}
                                >
                                    Hoy
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                                {WEEKDAYS.map((day) => (
                                    <div key={day} className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100 dark:divide-neutral-800">
                                {calendarDays.map((cell) => (
                                    <div
                                        key={cell.dateStr}
                                        className={`min-h-[100px] p-2 transition-colors ${
                                            cell.isCurrentMonth ? 'bg-white dark:bg-neutral-950' : 'bg-neutral-50/60 dark:bg-neutral-900/40 text-neutral-400'
                                        }`}
                                    >
                                        <div className="text-xs font-semibold mb-1">{cell.dayNumber}</div>
                                        <div className="space-y-1">
                                            {cell.dayEvents.slice(0, 3).map((ev) => (
                                                <button
                                                    key={ev.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEvent(ev);
                                                        setViewMode('agenda');
                                                    }}
                                                    className="w-full text-left truncate text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
                                                    title={`${ev.course_title} — ${ev.module_title} (${ev.start} al ${ev.end})`}
                                                >
                                                    {ev.module_title}
                                                </button>
                                            ))}
                                            {cell.dayEvents.length > 3 && (
                                                <div className="text-[10px] text-neutral-400 pl-1">
                                                    +{cell.dayEvents.length - 3} más
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Calendarios Semanales Gráficos (si el curso tiene imágenes subidas) */}
                {weeklyCalendars.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                            Calendarios Semanales Oficiales
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {weeklyCalendars.map((cal) => (
                                <Card key={cal.id} className="overflow-hidden border-neutral-200/80 dark:border-neutral-800">
                                    <CardHeader className="py-3 px-4 bg-neutral-50 dark:bg-neutral-900 border-b">
                                        <CardTitle className="text-sm font-bold">
                                            {cal.group_name || 'Calendario Semanal'}
                                        </CardTitle>
                                        {(cal.start_date || cal.end_date) && (
                                            <CardDescription className="text-xs">
                                                Vigencia: {cal.start_date} — {cal.end_date}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-4 text-center">
                                        <img
                                            src={cal.image_url}
                                            alt={cal.group_name || 'Calendario Semanal'}
                                            onClick={() => setPreviewImage(cal.image_url)}
                                            className="w-full h-auto rounded-lg cursor-zoom-in hover:opacity-95 transition-opacity"
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div className="relative max-w-5xl w-full">
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-300"
                            >
                                <X className="w-7 h-7" />
                            </button>
                            <img src={previewImage} alt="Calendario Semanal" className="w-full h-auto rounded-xl shadow-2xl" />
                        </div>
                    </div>
                )}
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
