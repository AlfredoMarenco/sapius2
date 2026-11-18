import { Head, Link, router } from '@inertiajs/react';
import { 
    ChevronLeft, 
    Calendar, 
    User as UserIcon, 
    DollarSign,
    MoreVertical,
    Plus,
    Trash2,
    Settings,
    Edit3,
    Layers,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Clock,
    Tag,
    BookOpen,
    Users,
    Percent,
    Ticket,
    CalendarDays
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import MathHtml from '@/components/MathHtml';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import ScheduleModal from './Partials/ScheduleModal';

interface Instructor {
    id: number;
    first_name: string;
    last_name: string;
}

interface ScheduledCourse {
    id: number;
    instructor_id: number;
    instructor?: {
        first_name: string;
        last_name: string;
    } | null;
    start_date: string;
    end_date: string;
    fecha_inicio_venta?: string | null;
    fecha_fin_venta?: string | null;
    price: number;
    internal_id: string | null;
    is_active: boolean;
}

interface Course {
    id: number;
    title: string;
    description?: string | null;
    image: string | null;
    category: {
        name: string;
    } | null;
    modules_count: number;
    scheduled_courses: ScheduledCourse[];
}

interface Props {
    course: Course;
    instructors: Instructor[];
}

export default function Show({ course, instructors }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduledCourse | null>(null);

    const handleToggle = (id: number) => {
        router.patch(`/admin/schedules/${id}/toggle`, {}, {
            onSuccess: () => {
                toast.success('Estado de programación actualizado');
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta programación?')) {
            router.delete(`/admin/schedules/${id}`, {
                onSuccess: () => {
                    toast.success('Programación eliminada');
                }
            });
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
            <Head title={`Admin: ${course.title}`} />

            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <Link
                        href="/admin/courses"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[#101E33] transition-colors dark:hover:text-neutral-200"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Regresar a Cursos
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                            {course.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Badge variant="outline" className="text-xs font-medium">
                                {course.category?.name || 'General'}
                            </Badge>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" />
                                {course.modules_count} módulos creados
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-lg px-3.5 text-xs font-medium gap-1.5">
                        <Link href={`/admin/courses/${course.id}/builder`}>
                            <Settings className="w-4 h-4" />
                            Contenido
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-lg px-3.5 text-xs font-medium gap-1.5">
                        <Link href={`/admin/courses/${course.id}/edit`}>
                            <Edit3 className="w-4 h-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-lg px-3.5 text-xs font-medium gap-1.5">
                        <Link href={`/admin/courses/${course.id}/calendars`}>
                            <CalendarDays className="w-4 h-4 text-blue-600" />
                            Calendarios
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingSchedule(null);
                            setIsModalOpen(true);
                        }}
                        className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white px-4 text-xs sm:text-sm font-semibold shadow-xs gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Programación
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Schedules (Programación) */}
                <div className="lg:col-span-2 space-y-5">
                    <Card className="rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden dark:border-neutral-800">
                        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50">
                            <div className="flex justify-between items-center gap-3">
                                <div>
                                    <CardTitle className="text-base sm:text-lg font-bold text-[#101E33] dark:text-neutral-100">
                                        Programación (Fechas y Horarios)
                                    </CardTitle>
                                    <CardDescription className="text-xs text-neutral-500 mt-0.5">
                                        Gestiona las cohortes activas del curso y sus fechas de apertura.
                                    </CardDescription>
                                </div>
                                <Calendar className="w-6 h-6 text-[#101E33]/25 dark:text-neutral-600 shrink-0" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {course.scheduled_courses.length > 0 ? (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {course.scheduled_courses.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="p-4 sm:p-5 flex flex-col gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-start gap-3.5">
                                                    <div
                                                        className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                                                            schedule.is_active
                                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                                                                : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                                                        }`}
                                                    >
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-semibold text-sm sm:text-base text-[#101E33] dark:text-neutral-100">
                                                                {schedule.internal_id || `Cohorte #${schedule.id}`}
                                                            </h4>
                                                            {schedule.is_active ? (
                                                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-[11px]">
                                                                    Activo
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-neutral-500 text-[11px]">
                                                                    Borrador
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <UserIcon className="w-3.5 h-3.5" />
                                                                {schedule.instructor ? `${schedule.instructor.first_name} ${schedule.instructor.last_name}` : 'Docente Asignado'}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[#101E33] font-semibold dark:text-neutral-200">
                                                                <DollarSign className="w-3.5 h-3.5" />
                                                                ${schedule.price} MXN
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg px-2.5 text-xs gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <Link href={`/admin/registro/contenido?cp_id=${schedule.id}`}>
                                                        <BookOpen className="w-3.5 h-3.5" /> Contenido
                                                    </Link>
                                                </Button>

                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg px-2.5 text-xs gap-1.5"
                                                >
                                                    <Link href={`/admin/curso/${schedule.id}`}>
                                                        <Users className="w-3.5 h-3.5" /> Alumnos
                                                    </Link>
                                                </Button>

                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg px-2.5 text-xs gap-1.5 text-orange-700 border-orange-200 hover:bg-orange-50"
                                                >
                                                    <Link href={`/admin/scheduled-courses/${schedule.id}/discounts`}>
                                                        <Ticket className="w-3.5 h-3.5" /> Descuentos
                                                    </Link>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg px-2.5 text-xs gap-1.5"
                                                    onClick={() => handleToggle(schedule.id)}
                                                >
                                                    {schedule.is_active ? (
                                                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pausar</>
                                                    ) : (
                                                        <><XCircle className="w-3.5 h-3.5 text-neutral-400" /> Activar</>
                                                    )}
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl p-1.5 w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/registro/contenido?cp_id=${schedule.id}`} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                                                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Programar Contenido
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/curso/${schedule.id}`} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                                                <Users className="w-3.5 h-3.5 text-neutral-600" /> Lista de Alumnos
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/scheduled-courses/${schedule.id}/discounts`} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                                                <Percent className="w-3.5 h-3.5 text-emerald-600" /> Códigos Descuento
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setEditingSchedule(schedule);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="text-xs font-medium cursor-pointer gap-2"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" /> Editar Datos
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(schedule.id)}
                                                            className="text-xs font-medium text-red-600 cursor-pointer gap-2"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Eliminar Permanente
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 px-4 text-center space-y-4">
                                    <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                                        <Clock className="w-7 h-7" />
                                    </div>
                                    <div className="max-w-xs mx-auto space-y-1">
                                        <h3 className="text-base font-bold text-[#101E33] dark:text-neutral-100">
                                            Sin Programación Activa
                                        </h3>
                                        <p className="text-xs text-neutral-500">
                                            Agrega una programación para que este curso sea visible para los alumnos.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        size="sm"
                                        className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white font-semibold text-xs"
                                    >
                                        Crear Primera Programación
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Course Overview & Media */}
                <div className="lg:col-span-1 space-y-5">
                    <Card className="rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden dark:border-neutral-800">
                        <div className="aspect-video bg-neutral-100 overflow-hidden relative">
                            <img
                                src={course.image ? (course.image.startsWith('http') ? course.image : `/media/stream/${course.image}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2070'}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-[#101E33] dark:text-neutral-100 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-[#FF6B52]" />
                                    Resumen del Curso
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500">Total Programaciones</span>
                                        <span className="font-semibold text-[#101E33] dark:text-neutral-100">{course.scheduled_courses.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500">Estado en Catálogo</span>
                                        {course.scheduled_courses.some(s => s.is_active) ? (
                                            <span className="font-semibold text-emerald-600">Visible</span>
                                        ) : (
                                            <span className="font-semibold text-neutral-500">Oculto</span>
                                        )}
                                    </div>
                                </div>
                                {course.description && (
                                    <MathHtml
                                        html={course.description}
                                        className="prose prose-xs max-w-none border-t border-neutral-100 pt-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
                                    />
                                )}
                            </div>

                            <Button asChild className="w-full h-9 rounded-lg bg-[#101E33] hover:bg-[#192B47] text-white text-xs sm:text-sm font-semibold">
                                <Link href={`/admin/courses/${course.id}/builder`}>
                                    Abrir Constructor de Curso
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 space-y-2 dark:border-amber-900/40 dark:bg-amber-950/20">
                        <h4 className="text-xs font-bold text-[#101E33] dark:text-amber-100">Guía rápida</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            Para que un curso sea visible por alumnos, debe tener al menos una <strong>Programación Activa</strong> con fechas y precio configurados.
                        </p>
                    </div>
                </div>
            </div>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSchedule(null);
                }}
                course={course}
                instructors={instructors}
                initialData={editingSchedule}
            />
        </div>
    );
}

Show.layout = (page: any) => <AppLayout breadcrumbs={[{ title: 'Cursos', href: '/admin/courses' }, { title: 'Ficha Técnica', href: '#' }]}>{page}</AppLayout>;
