import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    Activity,
    Video,
    FileText,
    ListChecks,
    Ticket,
    CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import ScheduleModal from './Partials/ScheduleModal';
import { toast } from 'sonner';

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
    price: number;
    internal_id: string | null;
    is_active: boolean;
}

interface Course {
    id: number;
    title: string;
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
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
            <Head title={`Admin: ${course.title}`} />

            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <Link 
                        href="/admin/courses" 
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-navy transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Regresar a Cursos
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">{course.title}</h1>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="rounded-full bg-brand-blue/5 text-brand-blue border-brand-blue/20 text-[10px] uppercase font-black px-3">
                                {course.category?.name || 'General'}
                            </Badge>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" />
                                {course.modules_count} Módulos creados
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/courses/${course.id}/builder`}>
                        <Button variant="outline" className="rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] h-12 gap-2 hover:bg-brand-navy hover:text-white transition-all shadow-lg shadow-gray-200">
                            <Settings className="w-4 h-4" />
                            Gestionar Contenido
                        </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button variant="outline" className="rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] h-12 gap-2 hover:bg-brand-navy hover:text-white transition-all shadow-lg shadow-gray-200">
                            <Edit3 className="w-4 h-4" />
                            Editar Información
                        </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}/calendars`}>
                        <Button variant="outline" className="rounded-2xl border-2 border-brand-cyan text-brand-cyan font-black uppercase tracking-widest text-[10px] h-12 gap-2 hover:bg-brand-cyan hover:text-white transition-all shadow-lg shadow-brand-cyan/20">
                            <CalendarDays className="w-4 h-4" />
                            Calendarios
                        </Button>
                    </Link>
                    <Button 
                        onClick={() => {
                            setEditingSchedule(null);
                            setIsModalOpen(true);
                        }}
                        className="rounded-2xl bg-brand-navy hover:bg-brand-blue font-black uppercase tracking-widest text-[10px] h-12 gap-2 shadow-xl shadow-brand-navy/20"
                    >
                        <Plus className="w-4 h-4" />
                        Activar Nueva Programación
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Main Content: Schedules (Programación) */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-2 border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl font-black text-brand-navy uppercase tracking-tight">Programación (Fechas y Horarios)</CardTitle>
                                    <CardDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">
                                        Gestiona las activaciones del curso en el marketplace.
                                    </CardDescription>
                                </div>
                                <Calendar className="w-8 h-8 text-brand-blue/20" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {course.scheduled_courses.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {course.scheduled_courses.map((schedule) => (
                                        <div key={schedule.id} className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 hover:bg-gray-50/30 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${schedule.is_active ? 'bg-brand-blue/10 text-brand-blue rotate-3 shadow-lg shadow-brand-blue/10' : 'bg-gray-100 text-gray-400 grayscale'}`}>
                                                    <Tag className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-brand-navy uppercase tracking-tight text-lg leading-none">
                                                            {schedule.internal_id || `ID: ${schedule.id}`}
                                                        </h4>
                                                        {schedule.is_active ? (
                                                            <Badge className="rounded-full bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/20 border-none text-[8px] font-black uppercase px-2 py-0.5">Activo</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="rounded-full text-gray-400 text-[8px] font-black uppercase px-2 py-0.5 border-gray-200">Borrador</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                                                        <span className="flex items-center gap-1.5 pt-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 pt-1">
                                                            <UserIcon className="w-3.5 h-3.5" />
                                                            {schedule.instructor ? `${schedule.instructor.first_name} ${schedule.instructor.last_name}` : 'Docente Asignado'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 pt-1 text-brand-navy font-black">
                                                            <DollarSign className="w-3.5 h-3.5" />
                                                            ${schedule.price} MXN
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                                <Link href={`/admin/registro/contenido?cp_id=${schedule.id}`}>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="rounded-xl px-3 font-black uppercase text-[10px] tracking-widest gap-1.5 h-10 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all"
                                                        title="Programar calendario y apertura de clases"
                                                    >
                                                        <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Contenido
                                                    </Button>
                                                </Link>

                                                <Link href={`/admin/curso/${schedule.id}`}>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="rounded-xl px-3 font-black uppercase text-[10px] tracking-widest gap-1.5 h-10 border-gray-200 text-gray-700 hover:bg-gray-100 transition-all"
                                                        title="Ver alumnos inscritos en esta cohorte"
                                                    >
                                                        <Users className="w-3.5 h-3.5 text-gray-600" /> Alumnos
                                                    </Button>
                                                </Link>

                                                <Link href={`/admin/scheduled-courses/${schedule.id}/discounts`}>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="rounded-xl px-3 font-black uppercase text-[10px] tracking-widest gap-1.5 h-10 border-orange-200 text-orange-700 hover:bg-orange-50 transition-all"
                                                        title="Gestionar cupones de descuento"
                                                    >
                                                        <Ticket className="w-3.5 h-3.5 text-orange-600" /> Descuentos
                                                    </Button>
                                                </Link>

                                                <Button 
                                                    variant="ghost" 
                                                    className={`rounded-xl px-3 font-black uppercase text-[10px] tracking-widest gap-1.5 h-10 border transition-all ${schedule.is_active ? 'border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/5' : 'border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                                                    onClick={() => handleToggle(schedule.id)}
                                                >
                                                    {schedule.is_active ? (
                                                        <><CheckCircle2 className="w-3.5 h-3.5" /> Pausar</>
                                                    ) : (
                                                        <><XCircle className="w-3.5 h-3.5" /> Activar</>
                                                    )}
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-gray-100">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-2xl border-2 p-2 w-52">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/registro/contenido?cp_id=${schedule.id}`} className="flex items-center gap-2 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer">
                                                                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Programar Contenido
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/curso/${schedule.id}`} className="flex items-center gap-2 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer">
                                                                <Users className="w-3.5 h-3.5 text-gray-600" /> Lista de Alumnos
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/registro/descuentos?cp_id=${schedule.id}`} className="flex items-center gap-2 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer">
                                                                <Percent className="w-3.5 h-3.5 text-emerald-600" /> Códigos Descuento
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                setEditingSchedule(schedule);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer gap-2"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" /> Editar Datos
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(schedule.id)}
                                                            className="rounded-xl font-bold text-xs uppercase tracking-widest text-destructive cursor-pointer gap-2"
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
                                <div className="py-24 text-center space-y-8">
                                    <div className="h-24 w-24 rounded-full bg-brand-navy/5 flex items-center justify-center mx-auto">
                                        <Clock className="w-10 h-10 text-brand-navy/20" />
                                    </div>
                                    <div className="max-w-xs mx-auto space-y-2">
                                        <h3 className="text-xl font-black text-brand-navy uppercase">Sin Programación Activa</h3>
                                        <p className="text-gray-400 text-sm font-medium italic">Agrega una programación para que este curso sea visible para los alumnos en el catálogo.</p>
                                    </div>
                                    <Button 
                                        onClick={() => setIsModalOpen(true)}
                                        variant="outline" 
                                        className="rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] h-12"
                                    >
                                        Crear Primera Programación
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Course Overview & Media */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="rounded-[2.5rem] border-2 border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <div className="aspect-video bg-gray-100 overflow-hidden relative">
                            <img 
                                src={course.image ? (course.image.startsWith('http') ? course.image : `/media/stream/${course.image}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2070'} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-brand-navy/10" />
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-brand-blue" />
                                    Resumen del Curso
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-400">Total Programaciones</span>
                                        <span className="text-brand-navy">{course.scheduled_courses.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-400">Estado Marketplace</span>
                                        {course.scheduled_courses.some(s => s.is_active) ? (
                                            <span className="text-brand-cyan">Visible</span>
                                        ) : (
                                            <span className="text-destructive">Invisible</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link href={`/admin/courses/${course.id}/builder`} className="block">
                                <Button className="w-full h-14 rounded-2xl bg-brand-navy hover:bg-brand-blue text-white font-black uppercase tracking-widest text-[10px] group shadow-xl shadow-brand-navy/10">
                                    Abrir Constructor de Curso
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="bg-brand-coral/5 rounded-[2.5rem] p-8 border-2 border-brand-coral/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-brand-coral/10 text-brand-coral flex items-center justify-center font-black">?</div>
                            <h4 className="text-xs font-black text-brand-navy uppercase tracking-tight italic">Guía Sapius 2.0</h4>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed tracking-widest">
                            Para que un curso sea visible por alumnos, debe tener al menos una <span className="text-brand-navy">Programación Activa</span>. Cada programación puede tener su propio precio y fechas.
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
