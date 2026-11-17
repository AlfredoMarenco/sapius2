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
        <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
            <Head title="Admin: Gestión de Cursos" />

            {/* Header Section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                        Gestión de Cursos
                    </h1>
                    <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                        Control central de cursos maestros, estructura de módulos y activaciones ({courses.length} en total).
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-lg px-3.5 text-xs sm:text-sm font-medium gap-2">
                        <Link href="/admin/cursos/copy">
                            <Copy className="w-4 h-4 text-[#101E33] dark:text-neutral-200" />
                            Copiar Curso
                        </Link>
                    </Button>

                    <Button asChild size="sm" className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white px-4 text-xs sm:text-sm font-semibold shadow-xs gap-2">
                        <Link href="/admin/cursos/create">
                            <Plus className="w-4 h-4" />
                            Nuevo Curso Maestro
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Buscador */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Buscar curso por título o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-xs focus:border-[#101E33] focus:outline-none focus:ring-1 focus:ring-[#101E33] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                />
            </div>

            {/* Mobile Cards View */}
            <div className="space-y-3 md:hidden">
                {filteredCourses.length === 0 ? (
                    <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                        No se encontraron cursos registrados.
                    </div>
                ) : (
                    filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-3 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                    <Link
                                        href={`/admin/courses/${course.id}`}
                                        className="block text-sm font-semibold text-[#101E33] hover:text-[#FF6B52] transition-colors dark:text-neutral-100"
                                    >
                                        {course.title}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Badge variant="outline" className="text-[11px] font-medium">
                                            {course.category?.name || 'General'}
                                        </Badge>
                                        <span className="text-[11px] text-neutral-500">
                                            {course.modules_count || 0} módulos · {course.scheduled_courses_count || 0} cohortes
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <Switch
                                        checked={course.is_active}
                                        onCheckedChange={() => handleToggleCourse(course.id)}
                                    />
                                    <span className="text-[10px] font-medium text-neutral-500">
                                        {course.is_active ? 'Visible' : 'Borrador'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs justify-start gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50">
                                    <Link href={`/admin/courses/${course.id}/builder`}>
                                        <Layout className="w-3.5 h-3.5" />
                                        Contenido
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs justify-start gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50">
                                    <Link href={`/admin/courses/${course.id}/edit`}>
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Editar
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs justify-start gap-1.5 text-[#101E33] border-neutral-200 hover:bg-neutral-50 dark:text-neutral-200">
                                    <Link href={`/admin/courses/${course.id}`}>
                                        <Calendar className="w-3.5 h-3.5" />
                                        Programar
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(course.id)}
                                    className="h-8 rounded-lg text-xs justify-start gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop & Laptop Compact Table View */}
            <div className="hidden md:block rounded-xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-neutral-50/70 dark:bg-neutral-800/50">
                            <TableHead>Curso / Categoría</TableHead>
                            <TableHead className="text-center">Módulos</TableHead>
                            <TableHead className="text-center">Cohortes</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-neutral-400 text-sm">
                                    No se encontraron cursos registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => (
                                <TableRow key={course.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 shrink-0 rounded-lg bg-[#101E33]/5 flex items-center justify-center text-[#101E33] dark:bg-neutral-800 dark:text-neutral-200">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/admin/courses/${course.id}`}
                                                    className="block font-semibold text-sm text-[#101E33] hover:text-[#FF6B52] transition-colors truncate dark:text-neutral-100"
                                                >
                                                    {course.title}
                                                </Link>
                                                <Badge variant="outline" className="mt-0.5 text-[11px] font-medium">
                                                    {course.category?.name || 'General'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-[#101E33] dark:bg-neutral-800 dark:text-neutral-200">
                                            {course.modules_count || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                            {course.scheduled_courses_count || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex flex-col items-center gap-1">
                                            <Switch
                                                checked={course.is_active}
                                                onCheckedChange={() => handleToggleCourse(course.id)}
                                            />
                                            <span className="text-[10px] font-medium text-neutral-500">
                                                {course.is_active ? 'Visible' : 'Borrador'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 rounded-lg text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                                                <Link href={`/admin/courses/${course.id}/builder`} title="Constructor de Contenido">
                                                    <Layout className="w-3.5 h-3.5" />
                                                    <span className="hidden lg:inline">Contenido</span>
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 rounded-lg text-xs text-orange-600 border-orange-200 hover:bg-orange-50">
                                                <Link href={`/admin/courses/${course.id}/edit`} title="Editar Información">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span className="hidden lg:inline">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 rounded-lg text-xs text-[#101E33] border-neutral-200 hover:bg-neutral-50 dark:text-neutral-200">
                                                <Link href={`/admin/courses/${course.id}`} title="Ver y Programar Cohortes">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="hidden lg:inline">Programar</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(course.id)}
                                                className="h-8 px-2.5 gap-1.5 rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                title="Eliminar Curso"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span className="hidden xl:inline">Eliminar</span>
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
