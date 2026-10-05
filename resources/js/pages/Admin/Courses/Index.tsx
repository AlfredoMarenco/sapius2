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
    Tag,
    Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

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
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredCourses = courses.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.category?.name && c.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
            <Head title="Admin: Gestión de Cursos" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">Gestión de Cursos</h1>
                    <p className="text-muted-foreground font-medium italic">Control central de contenidos y activaciones en marketplace.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/admin/cursos/copy">
                        <Button variant="outline" className="rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 shadow-sm group">
                            <Copy className="w-4 h-4 text-brand-blue" />
                            Copiar Curso
                        </Button>
                    </Link>

                    <Link href="/admin/cursos/create">
                        <Button className="rounded-2xl bg-brand-navy hover:bg-brand-blue font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 shadow-xl shadow-brand-navy/20 group">
                            <Plus className="w-4 h-4" />
                            Nuevo Curso Maestro
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Buscador */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar curso por título o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue shadow-sm"
                />
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
                        {filteredCourses.length === 0 ? (
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
                            filteredCourses.map((course) => (
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
                                            <Button asChild variant="outline" size="sm" className="h-9 px-3 gap-2 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/10">
                                                <Link href={`/admin/courses/${course.id}/builder`} title="Constructor de Contenido">
                                                    <Layout className="w-4 h-4" />
                                                    <span className="hidden xl:inline font-bold text-[10px] uppercase tracking-widest">Contenido</span>
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="h-9 px-3 gap-2 text-brand-orange border-brand-orange/20 hover:bg-brand-orange/10">
                                                <Link href={`/admin/courses/${course.id}/edit`} title="Editar Información">
                                                    <Edit3 className="w-4 h-4" />
                                                    <span className="hidden xl:inline font-bold text-[10px] uppercase tracking-widest">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="h-9 px-3 gap-2 text-brand-navy border-brand-navy/20 hover:bg-brand-navy/10">
                                                <Link href={`/admin/courses/${course.id}`} title="Ver y Programar Cohortes">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="hidden xl:inline font-bold text-[10px] uppercase tracking-widest">Programar</span>
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleDelete(course.id)}
                                                className="h-9 px-3 gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                                                title="Eliminar Curso"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden xl:inline font-bold text-[10px] uppercase tracking-widest">Eliminar</span>
                                            </Button>
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
