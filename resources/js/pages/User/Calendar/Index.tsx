import { Head, Link, usePage } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    PlayCircle,
    LayoutGrid,
    List,
    Image as ImageIcon,
    ArrowRight,
    X,
    Video,
    Radio,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import AppLayout from '@/layouts/app-layout';
import type { Auth } from '@/types';

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

interface ZoomClassItem {
    id: number;
    scheduled_id: number;
    course_title: string;
    identifier?: string | null;
    title: string;
    scheduled_date_formatted: string;
    scheduled_time_formatted: string;
    ends_time_formatted: string;
    status: string;
    is_joinable: boolean;
    room_url: string;
}

interface CalendarProps {
    events: CalendarEvent[];
    courses?: CourseSummary[];
    weeklyCalendars?: WeeklyCalendarItem[];
    zoomClasses?: ZoomClassItem[];
}

const MONTH_NAMES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarIndex({
    events = [],
    courses = [],
    weeklyCalendars = [],
    zoomClasses = [],
}: CalendarProps) {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';

    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
        allowTextInputs: true,
    });

    const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        events[0] || null,
    );
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
        if (selectedCourseFilter === 'all') {
return events;
}

        return events.filter(
            (ev) =>
                String(ev.scheduled_id) === selectedCourseFilter ||
                ev.course_title === selectedCourseFilter,
        );
    }, [events, selectedCourseFilter]);

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
        const totalDays = lastDayOfMonth.getDate();

        const cells: Array<{
            dateStr: string;
            dayNumber: number;
            isCurrentMonth: boolean;
            dayEvents: CalendarEvent[];
        }> = [];

        for (let i = 0; i < startOffset; i++) {
            const d = new Date(year, month, -startOffset + i + 1);
            const iso = d.toISOString().slice(0, 10);
            cells.push({
                dateStr: iso,
                dayNumber: d.getDate(),
                isCurrentMonth: false,
                dayEvents: [],
            });
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
            cells.push({
                dateStr: iso,
                dayNumber: day,
                isCurrentMonth: true,
                dayEvents,
            });
        }

        while (cells.length % 7 !== 0) {
            const nextIdx = cells.length - (startOffset + totalDays) + 1;
            const d = new Date(year, month + 1, nextIdx);
            const iso = d.toISOString().slice(0, 10);
            cells.push({
                dateStr: iso,
                dayNumber: d.getDate(),
                isCurrentMonth: false,
                dayEvents: [],
            });
        }

        return cells;
    }, [currentMonth, filteredEvents]);

    return (
        <>
            <Head title="Calendario de Actividades" />
            <StrikeAlert />
            <Watermark />

            <div
                className={`mx-auto max-w-7xl space-y-8 px-4 py-8 select-none sm:px-6 lg:px-8 ${
                    isBlurred ? 'pointer-events-none blur-xl' : ''
                }`}
            >
                {/* Header & Controls */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            <CalendarIcon className="h-8 w-8 text-blue-600" />
                            Calendario de Actividades
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Consulta la programación, fechas de inicio/cierre y avance de
                            lecciones de todos tus cursos inscritos.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {courses.length > 1 && (
                            <select
                                value={selectedCourseFilter}
                                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                                className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                <option value="all">
                                    Todos mis cursos ({courses.length})
                                </option>
                                {courses.map((c) => (
                                    <option
                                        key={c.scheduled_id}
                                        value={String(c.scheduled_id)}
                                    >
                                        {c.title} {c.identifier ? `(${c.identifier})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
                            <Button
                                type="button"
                                size="sm"
                                variant={viewMode === 'agenda' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('agenda')}
                                className={
                                    viewMode === 'agenda'
                                        ? 'h-8 bg-blue-600 px-3 text-xs text-white'
                                        : 'h-8 px-3 text-xs'
                                }
                            >
                                <List className="mr-1.5 h-3.5 w-3.5" /> Módulos y Clases
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={viewMode === 'month' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('month')}
                                className={
                                    viewMode === 'month'
                                        ? 'h-8 bg-blue-600 px-3 text-xs text-white'
                                        : 'h-8 px-3 text-xs'
                                }
                            >
                                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" /> Calendario
                                Mensual
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Clases en Vivo Zoom */}
                {zoomClasses.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            <Video className="h-5 w-5 text-blue-600" />
                            Clases en Vivo (Zoom)
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {zoomClasses.map((zc) => (
                                <Card key={zc.id} className="border-blue-200/80 shadow-xs dark:border-blue-900/50">
                                    <CardContent className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <Badge variant="outline" className="mb-1 border-blue-200 text-[10px] text-blue-700">
                                                    {zc.course_title}
                                                </Badge>
                                                <h3 className="line-clamp-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                                    {zc.title}
                                                </h3>
                                            </div>
                                            {zc.status === 'live' ? (
                                                <Badge className="shrink-0 animate-pulse bg-red-600 text-[10px] text-white">
                                                    <Radio className="mr-1 h-3 w-3" /> EN VIVO
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="shrink-0 text-[10px]">
                                                    {zc.status === 'ended' ? 'Finalizada' : 'Programada'}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-neutral-500">
                                            <span>{zc.scheduled_date_formatted}</span>
                                            <span>
                                                {zc.scheduled_time_formatted} - {zc.ends_time_formatted}
                                            </span>
                                        </div>
                                        <Button asChild size="sm" className="w-full bg-blue-600 text-xs text-white hover:bg-blue-700">
                                            <Link href={zc.room_url}>
                                                <Video className="mr-1.5 h-3.5 w-3.5" /> Entrar a Sala en Vivo
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resumen de Cursos Inscritos */}
                {courses.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card
                                key={course.scheduled_id}
                                className="border-neutral-200/80 shadow-xs dark:border-neutral-800"
                            >
                                <CardContent className="space-y-3 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            {course.identifier && (
                                                <Badge
                                                    variant="outline"
                                                    className="mb-1 border-blue-200 text-[10px] text-blue-600"
                                                >
                                                    {course.identifier}
                                                </Badge>
                                            )}
                                            <h3 className="line-clamp-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs text-neutral-500">
                                                Instructor: {course.instructor}
                                            </p>
                                        </div>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="h-7 shrink-0 px-2.5 text-xs"
                                        >
                                            <Link href={course.course_url}>
                                                Ir al curso{' '}
                                                <ArrowRight className="ml-1 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] text-neutral-500">
                                            <span>
                                                Avance: {course.completed_lessons}/
                                                {course.total_lessons} lecciones
                                            </span>
                                            <span className="font-bold text-blue-600">
                                                {course.progress}%
                                            </span>
                                        </div>
                                        <Progress value={course.progress} className="h-1.5" />
                                    </div>
                                    <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-xs text-neutral-500 dark:border-neutral-800">
                                        <span>
                                            Inicio: <strong>{course.start_date}</strong>
                                        </span>
                                        <span>
                                            Cierre: <strong>{course.end_date}</strong>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Vista Principal */}
                {filteredEvents.length === 0 ? (
                    <Card className="p-12 text-center text-neutral-400">
                        <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                        <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">
                            No hay fechas programadas
                        </h3>
                        <p className="mt-1 text-xs text-neutral-400">
                            Tus cursos activos aparecerán aquí en cuanto tengan módulos
                            asignados.
                        </p>
                    </Card>
                ) : viewMode === 'agenda' ? (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        {/* Lista de Módulos */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
                            {filteredEvents.map((event) => {
                                const isSelected = selectedEvent?.id === event.id;

                                return (
                                    <Card
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`cursor-pointer p-5 transition-all ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 dark:bg-blue-950/20'
                                                : 'border-neutral-200/80 hover:border-blue-300 dark:border-neutral-800'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 space-y-1">
                                                <Badge
                                                    variant="outline"
                                                    className="max-w-full truncate border-blue-200 text-[11px] text-blue-600"
                                                >
                                                    {event.course_title}
                                                </Badge>
                                                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                                    {event.module_title}
                                                </h3>
                                            </div>
                                            <div className="shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                        </div>

                                        {typeof event.total_lessons === 'number' &&
                                            event.total_lessons > 0 && (
                                                <div className="mt-3 space-y-1">
                                                    <div className="flex justify-between text-[11px] text-neutral-500">
                                                        <span>
                                                            {event.completed_lessons || 0}{' '}
                                                            de {event.total_lessons} clases
                                                        </span>
                                                        <span className="font-semibold text-blue-600">
                                                            {event.progress || 0}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={event.progress || 0}
                                                        className="h-1.5"
                                                    />
                                                </div>
                                            )}

                                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                                            <span>
                                                Inicio: <strong>{event.start}</strong>
                                            </span>
                                            <span>
                                                Cierre: <strong>{event.end}</strong>
                                            </span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Panel Lateral: Detalle de Lecciones del Módulo Seleccionado */}
                        <div className="sticky top-6 lg:col-span-5">
                            {selectedEvent ? (
                                <Card className="overflow-hidden border-neutral-200 shadow-md dark:border-neutral-800">
                                    <CardHeader className="bg-gradient-to-r from-slate-900 to-blue-950 text-white">
                                        <Badge className="w-fit border border-blue-400/30 bg-blue-500/20 text-[10px] text-blue-200">
                                            {selectedEvent.course_title}
                                        </Badge>
                                        <CardTitle className="mt-1 text-lg font-bold text-white">
                                            {selectedEvent.module_title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-3 pt-1 text-xs text-blue-200">
                                            <span>Inicio: {selectedEvent.start}</span>
                                            <span>•</span>
                                            <span>Cierre: {selectedEvent.end}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-5">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                                Lecciones del Módulo (
                                                {selectedEvent.lessons?.length || 0})
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

                                        {!selectedEvent.lessons ||
                                        selectedEvent.lessons.length === 0 ? (
                                            <p className="py-4 text-center text-sm text-neutral-400 italic">
                                                Este módulo aún no tiene clases publicadas.
                                            </p>
                                        ) : (
                                            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                                                {selectedEvent.lessons.map((lesson, idx) => (
                                                    <Link
                                                        key={lesson.id}
                                                        href={lesson.url}
                                                        className="group flex items-center justify-between rounded-xl border border-neutral-200/70 p-3 transition-all hover:border-blue-300 hover:bg-blue-50/40 dark:border-neutral-800 dark:hover:bg-blue-950/20"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            {lesson.is_completed ? (
                                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                                            ) : (
                                                                <PlayCircle className="h-4 w-4 shrink-0 text-blue-500" />
                                                            )}
                                                            <span className="truncate text-sm font-medium text-neutral-800 group-hover:text-blue-600 dark:text-neutral-200">
                                                                {idx + 1}. {lesson.title}
                                                            </span>
                                                        </div>
                                                        <span className="ml-2 shrink-0 text-[11px] font-semibold text-blue-600">
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
                                    Selecciona un módulo para ver el detalle de sus
                                    lecciones.
                                </Card>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Vista de Cuadrícula Mensual Interactiva */
                    <Card className="overflow-hidden border-neutral-200/80 shadow-sm dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 py-4 dark:border-neutral-800">
                            <CardTitle className="text-lg font-bold">
                                {MONTH_NAMES[currentMonth.getMonth()]}{' '}
                                {currentMonth.getFullYear()}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                        setCurrentMonth(
                                            new Date(
                                                currentMonth.getFullYear(),
                                                currentMonth.getMonth() - 1,
                                                1,
                                            ),
                                        )
                                    }
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                        const now = new Date();
                                        setCurrentMonth(
                                            new Date(now.getFullYear(), now.getMonth(), 1),
                                        );
                                    }}
                                >
                                    Hoy
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                        setCurrentMonth(
                                            new Date(
                                                currentMonth.getFullYear(),
                                                currentMonth.getMonth() + 1,
                                                1,
                                            ),
                                        )
                                    }
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                                {WEEKDAYS.map((day) => (
                                    <div
                                        key={day}
                                        className="py-2.5 text-center text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100 dark:divide-neutral-800">
                                {calendarDays.map((cell) => (
                                    <div
                                        key={cell.dateStr}
                                        className={`min-h-[100px] p-2 transition-colors ${
                                            cell.isCurrentMonth
                                                ? 'bg-white dark:bg-neutral-950'
                                                : 'bg-neutral-50/60 text-neutral-400 dark:bg-neutral-900/40'
                                        }`}
                                    >
                                        <div className="mb-1 text-xs font-semibold">
                                            {cell.dayNumber}
                                        </div>
                                        <div className="space-y-1">
                                            {cell.dayEvents.slice(0, 3).map((ev) => (
                                                <button
                                                    key={ev.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEvent(ev);
                                                        setViewMode('agenda');
                                                    }}
                                                    className="w-full truncate rounded border border-blue-200/60 bg-blue-50 px-1.5 py-0.5 text-left text-[10px] font-medium text-blue-700 hover:bg-blue-100"
                                                    title={`${ev.course_title} — ${ev.module_title} (${ev.start} al ${ev.end})`}
                                                >
                                                    {ev.module_title}
                                                </button>
                                            ))}
                                            {cell.dayEvents.length > 3 && (
                                                <div className="pl-1 text-[10px] text-neutral-400">
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

                {/* Calendarios Semanales Gráficos (Protegidos contra clic derecho, arrastre y descarga) */}
                {weeklyCalendars.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            <ImageIcon className="h-5 w-5 text-blue-600" />
                            Calendarios Semanales Oficiales
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {weeklyCalendars.map((cal) => (
                                <Card
                                    key={cal.id}
                                    className="overflow-hidden border-neutral-200/80 dark:border-neutral-800"
                                >
                                    <CardHeader className="border-b bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
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
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setPreviewImage(cal.image_url)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    setPreviewImage(cal.image_url);
                                                }
                                            }}
                                            onContextMenu={(e) => e.preventDefault()}
                                            onDragStart={(e) => e.preventDefault()}
                                            className="relative cursor-zoom-in overflow-hidden rounded-lg select-none"
                                        >
                                            <img
                                                src={cal.image_url}
                                                alt={cal.group_name || 'Calendario Semanal'}
                                                draggable={false}
                                                onContextMenu={(e) => e.preventDefault()}
                                                onDragStart={(e) => e.preventDefault()}
                                                className="pointer-events-none h-auto w-full rounded-lg transition-opacity select-none hover:opacity-95"
                                            />
                                            {/* Capa protectora invisible contra clic derecho / guardar imagen */}
                                            <div
                                                className="absolute inset-0 z-10"
                                                onContextMenu={(e) => e.preventDefault()}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none"
                        onClick={() => setPreviewImage(null)}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <div
                            className="relative w-full max-w-5xl"
                            onClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-300"
                                aria-label="Cerrar vista ampliada"
                            >
                                <X className="h-7 w-7" />
                            </button>
                            <div className="relative overflow-hidden rounded-xl shadow-2xl">
                                <img
                                    src={previewImage}
                                    alt="Calendario Semanal"
                                    draggable={false}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                    className="pointer-events-none h-auto w-full rounded-xl select-none"
                                />
                                <div
                                    className="absolute inset-0 z-10"
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

CalendarIndex.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Panel de Alumno', href: '/alumno' },
            { title: 'Calendario', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
