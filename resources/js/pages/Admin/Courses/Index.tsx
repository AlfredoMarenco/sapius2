import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
    Edit3, 
    Eye, 
    Plus, 
    Trash2, 
    Calendar, 
    Layers,
    Layout,
    ArrowRight,
    Search,
    MoreVertical,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Tag
} from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Course {
    id: number;
    title: string;
    description: string;
    is_active: boolean;
    category?: { name: string };
    modules_count?: number;
    scheduled_courses_count?: number;
}

interface Props {
    courses: Course[];
}

export default function Index({ courses }: Props) {
    const handleToggleCourse = (id: number) => {
        router.patch(`/admin/courses/${id}/toggle`, {}, {
            onSuccess: () => {
                toast.success('Estado del curso maestro actualizado');
            },
            preserveScroll: true
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este curso y todo su contenido?')) {
            router.delete(`/admin/courses/${id}`, {
                onSuccess: () => {
                    toast.success('Curso eliminado permanentemente');
                }
            });
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
            <Head title="Admin: Gestión de Cursos" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">Gestión de Cursos</h1>
                    <p className="text-muted-foreground font-medium italic">Control central de contenidos y activaciones en marketplace.</p>
                </div>

                <Link href="/admin/courses/create">
                    <Button className="rounded-2xl bg-brand-navy hover:bg-brand-blue font-black uppercase tracking-widest text-[10px] h-14 px-8 gap-2 shadow-xl shadow-brand-navy/20 group">
                        <Plus className="w-4 h-4" />
                        Nuevo Curso Maestro
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            {/* Courses Table Card */}
            <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50 border-b-2 border-gray-100">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy">Curso / Categoría</TableHead>
                            <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy">Estructura</TableHead>
                            <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy">Schedules</TableHead>
                            <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy">Estado</TableHead>
                            <TableHead className="text-right py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-32 text-center">
                                    <div className="space-y-4">
                                        <div className="h-20 w-20 rounded-full bg-brand-navy/5 flex items-center justify-center mx-auto text-brand-navy/20">
                                            <Search className="w-10 h-10" />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No se encontraron cursos registrados</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 group">
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-navy/5 flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-all duration-500">
                                                <Tag className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <Link href={`/admin/courses/${course.id}`} className="font-black text-brand-navy uppercase tracking-tight text-lg hover:text-brand-blue transition-colors">
                                                    {course.title}
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="rounded-full bg-brand-blue/5 text-brand-blue border-brand-blue/20 text-[8px] uppercase font-black px-2">
                                                        {course.category?.name || 'General'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-lg font-black text-brand-navy">{course.modules_count || 0}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Módulos</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-navy/5 text-brand-navy font-black text-xs">
                                            {course.scheduled_courses_count || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Switch 
                                                checked={course.is_active} 
                                                onCheckedChange={() => handleToggleCourse(course.id)} 
                                            />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                                                {course.is_active ? 'Visible' : 'Borrador'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/courses/${course.id}`}>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-brand-navy hover:text-white border border-gray-100" title="Ver Detalles y Programación">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-gray-100">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-[1.5rem] border-2 p-2 w-56">
                                                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 gap-3" asChild>
                                                        <Link href={`/admin/courses/${course.id}/builder`}>
                                                            <Layout className="w-4 h-4 text-brand-blue" />
                                                            Constructor de Contenido
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 gap-3" asChild>
                                                        <Link href={`/admin/courses/${course.id}/edit`}>
                                                            <Edit3 className="w-4 h-4 text-brand-orange" />
                                                            Editar Información
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(course.id)}
                                                        className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 gap-3 text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Eliminar Curso
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

Index.layout = (page: any) => <AppLayout breadcrumbs={[{ title: 'Cursos', href: '/admin/courses' }]}>{page}</AppLayout>;
