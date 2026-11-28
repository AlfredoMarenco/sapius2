import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    CalendarDays, 
    Plus, 
    Users, 
    CheckCircle2, 
    XCircle, 
    Search, 
    BookOpen, 
    Clock, 
    DollarSign, 
    X, 
    Save,
    Video 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Schedule {
    id: number;
    course_id: number;
    course_title: string;
    course_image: string | null;
    internal_id: string | null;
    instructor_name: string;
    start_date: string | null;
    end_date: string | null;
    price: number;
    students_count: number;
    zoom_classes_count?: number;
    is_active: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface SchedulesIndexProps {
    schedules: {
        data: Schedule[];
        links: PaginationLink[];
        total: number;
        current_page?: number;
        last_page?: number;
    };
    courses: Array<{ id: number; title: string }>;
    instructors: Array<{ id: number; name: string }>;
    selectedCourseId: number | null;
    filters?: {
        search?: string;
        curso_id?: number | null;
        status?: 'all' | 'active' | 'inactive';
        instructor_id?: number | null;
    };
}

export default function SchedulesIndex({
    schedules,
    courses = [],
    instructors = [],
    selectedCourseId = null,
    filters = {},
}: SchedulesIndexProps) {
    const [searchText, setSearchText] = useState(filters.search ?? '');
    const [courseFilter, setCourseFilter] = useState<string>(
        filters.curso_id ? String(filters.curso_id) : selectedCourseId ? String(selectedCourseId) : '',
    );
    const [statusFilter, setStatusFilter] = useState<string>(filters.status ?? 'all');
    const [instructorFilter, setInstructorFilter] = useState<string>(
        filters.instructor_id ? String(filters.instructor_id) : '',
    );

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        course_id: selectedCourseId || (courses[0]?.id ?? ''),
        instructor_id: instructors[0]?.id ?? '',
        start_date: '',
        end_date: '',
        price: 0,
        internal_id: '',
        is_active: true,
    });

    const applyFilters = (overrides?: {
        search?: string;
        curso_id?: string;
        status?: string;
        instructor_id?: string;
    }) => {
        const nextSearch = overrides?.search !== undefined ? overrides.search : searchText;
        const nextCourse = overrides?.curso_id !== undefined ? overrides.curso_id : courseFilter;
        const nextStatus = overrides?.status !== undefined ? overrides.status : statusFilter;
        const nextInstructor =
            overrides?.instructor_id !== undefined ? overrides.instructor_id : instructorFilter;

        const params: Record<string, string> = {};
        if (nextSearch.trim() !== '') params.search = nextSearch.trim();
        if (nextCourse !== '') params.curso_id = nextCourse;
        if (nextStatus !== '' && nextStatus !== 'all') params.status = nextStatus;
        if (nextInstructor !== '') params.instructor_id = nextInstructor;

        router.get('/admin/registro/programacion', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilters = () => {
        setSearchText('');
        setCourseFilter('');
        setStatusFilter('all');
        setInstructorFilter('');
        router.get('/admin/registro/programacion', {}, { preserveState: true });
    };

    const hasActiveFilters =
        searchText.trim() !== '' ||
        courseFilter !== '' ||
        (statusFilter !== '' && statusFilter !== 'all') ||
        instructorFilter !== '';

    const handleToggleActive = (id: number) => {
        router.patch(`/admin/schedules/${id}/toggle`);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/courses/${createForm.course_id}/schedules`, createForm, {
            onSuccess: () => {
                setIsCreateOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Programación de Cursos" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100 flex items-center gap-2">
                            <CalendarDays className="w-6 h-6 text-blue-600 shrink-0" /> Programación de Cursos
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Gestión de cohortes y calendarios de venta ({schedules.total} registros).
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white px-4 text-xs sm:text-sm font-semibold gap-2 shadow-xs self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" /> Programar Cohorte
                    </Button>
                </div>

                {/* Barra de Filtros Completa */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        applyFilters();
                    }}
                    className="grid grid-cols-1 gap-2.5 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-xs sm:grid-cols-2 lg:grid-cols-12 dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div className="relative flex items-center lg:col-span-4">
                        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Buscar por curso, generación (ej. diciembre), instructor o #ID..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="h-9 pl-9 pr-8 text-xs"
                        />
                        {searchText !== '' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchText('');
                                    applyFilters({ search: '' });
                                }}
                                className="absolute right-2.5 text-neutral-400 hover:text-neutral-600"
                                title="Limpiar búsqueda"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-3">
                        <BookOpen className="h-4 w-4 shrink-0 text-neutral-400" />
                        <select
                            className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent px-2.5 text-xs dark:border-neutral-700"
                            value={courseFilter}
                            onChange={(e) => {
                                setCourseFilter(e.target.value);
                                applyFilters({ curso_id: e.target.value });
                            }}
                        >
                            <option value="">Todos los cursos</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="lg:col-span-2">
                        <select
                            className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent px-2.5 text-xs dark:border-neutral-700"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                        >
                            <option value="all">Todos los estatus</option>
                            <option value="active">Solo activos</option>
                            <option value="inactive">Solo inactivos</option>
                        </select>
                    </div>

                    <div className="lg:col-span-2">
                        <select
                            className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent px-2.5 text-xs dark:border-neutral-700"
                            value={instructorFilter}
                            onChange={(e) => {
                                setInstructorFilter(e.target.value);
                                applyFilters({ instructor_id: e.target.value });
                            }}
                        >
                            <option value="">Todos los instructores</option>
                            {instructors.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 lg:col-span-1 lg:justify-end">
                        <Button type="submit" size="sm" variant="secondary" className="h-9 flex-1 text-xs lg:flex-initial">
                            Filtrar
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={handleResetFilters}
                                className="h-9 px-2 text-xs text-neutral-500 hover:text-neutral-800"
                                title="Limpiar todos los filtros"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </form>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                    {schedules.data.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                            No hay programaciones registradas para los criterios seleccionados.
                        </div>
                    ) : (
                        schedules.data.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-3 dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="font-mono text-[11px] text-neutral-400">#{item.id}</span>
                                            <Badge variant="outline" className="font-mono text-[11px]">
                                                {item.internal_id || 'Sin ID'}
                                            </Badge>
                                        </div>
                                        <h3 className="font-semibold text-sm text-[#101E33] dark:text-neutral-100">
                                            {item.course_title}
                                        </h3>
                                    </div>
                                    <Badge
                                        variant={item.is_active ? 'outline' : 'destructive'}
                                        className={item.is_active ? 'border-emerald-300 text-emerald-700 text-[11px]' : 'text-[11px]'}
                                    >
                                        {item.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                                    <span>Instructor: {item.instructor_name}</span>
                                    <span>
                                        {item.start_date && item.end_date ? `${item.start_date} - ${item.end_date}` : 'Sin fechas'}
                                    </span>
                                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                                        {item.students_count} alumnos
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <Button asChild size="sm" variant="outline" className="h-8 rounded-lg px-2.5 text-xs text-amber-600 border-amber-200">
                                        <Link href={`/admin/registro/contenido?cp_id=${item.id}`}>
                                            <BookOpen className="w-3.5 h-3.5 mr-1" /> Contenido
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline" className="h-8 rounded-lg px-2.5 text-xs text-indigo-600 border-indigo-200">
                                        <Link href={`/admin/schedules/${item.id}/zoom-classes`}>
                                            <Video className="w-3.5 h-3.5 mr-1" /> Zoom
                                            {item.zoom_classes_count && item.zoom_classes_count > 0 ? ` (${item.zoom_classes_count})` : ''}
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline" className="h-8 rounded-lg px-2.5 text-xs text-blue-600 border-blue-200">
                                        <Link href={`/admin/curso/${item.id}`}>
                                            <Users className="w-3.5 h-3.5 mr-1" /> Alumnos
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={`h-8 rounded-lg px-2.5 text-xs ${item.is_active ? 'text-neutral-600' : 'text-emerald-600 border-emerald-200'}`}
                                        onClick={() => handleToggleActive(item.id)}
                                    >
                                        {item.is_active ? 'Desactivar' : 'Activar'}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop & Laptop Compact Table (5 columns - Zero Horizontal Overflow) */}
                <Card className="hidden md:block rounded-xl border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow className="bg-neutral-50/70 dark:bg-neutral-900/50">
                                <TableHead className="w-[36%]">Curso y Generación</TableHead>
                                <TableHead className="w-[15%]">Vigencia</TableHead>
                                <TableHead className="w-[10%] text-center">Alumnos</TableHead>
                                <TableHead className="w-[11%] text-center">Estatus</TableHead>
                                <TableHead className="w-[28%] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-neutral-400 text-sm">
                                        No hay programaciones registradas para los criterios seleccionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schedules.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="max-w-0">
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-mono text-[11px] text-neutral-400 shrink-0">#{item.id}</span>
                                                    <span className="font-semibold text-sm text-[#101E33] dark:text-neutral-100 truncate" title={item.course_title}>
                                                        {item.course_title}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                                                    <Badge variant="outline" className="font-mono text-[11px] font-medium max-w-[200px] truncate" title={item.internal_id || 'Sin ID'}>
                                                        {item.internal_id || 'Sin ID'}
                                                    </Badge>
                                                    <span className="truncate max-w-[160px]" title={item.instructor_name}>
                                                        · {item.instructor_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                            {item.start_date && item.end_date ? (
                                                <div className="leading-tight space-y-0.5">
                                                    <div>{item.start_date}</div>
                                                    <div className="text-neutral-400">{item.end_date}</div>
                                                </div>
                                            ) : (
                                                <span className="italic text-neutral-400">Sin fechas</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                                                {item.students_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            <Badge
                                                variant={item.is_active ? 'outline' : 'destructive'}
                                                className={item.is_active ? 'border-emerald-300 text-emerald-700 text-[11px]' : 'text-[11px]'}
                                            >
                                                {item.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 text-xs rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                                                    title="Programar fechas de contenido del curso"
                                                >
                                                    <Link href={`/admin/registro/contenido?cp_id=${item.id}`}>
                                                        <BookOpen className="w-3.5 h-3.5 xl:mr-1" />
                                                        <span className="hidden xl:inline">Contenido</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 text-xs rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                                                    title="Gestionar clases en vivo Zoom"
                                                >
                                                    <Link href={`/admin/schedules/${item.id}/zoom-classes`}>
                                                        <Video className="w-3.5 h-3.5 xl:mr-1" />
                                                        <span className="hidden xl:inline">
                                                            Zoom{item.zoom_classes_count && item.zoom_classes_count > 0 ? ` (${item.zoom_classes_count})` : ''}
                                                        </span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 text-xs rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                                    title="Ver alumnos inscritos"
                                                >
                                                    <Link href={`/admin/curso/${item.id}`}>
                                                        <Users className="w-3.5 h-3.5 xl:mr-1" />
                                                        <span className="hidden xl:inline">Alumnos</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={`h-8 w-8 p-0 rounded-lg ${item.is_active ? 'text-neutral-400 hover:text-red-600' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                    onClick={() => handleToggleActive(item.id)}
                                                    title={item.is_active ? 'Desactivar cohorte' : 'Activar cohorte'}
                                                >
                                                    {item.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Paginación */}
                {schedules.links && schedules.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <p className="text-xs text-neutral-500">
                            Total: <strong>{schedules.total}</strong> cohortes
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                            {schedules.links.map((link, idx) => {
                                const cleanLabel = link.label
                                    .replace(/&laquo;/g, '«')
                                    .replace(/&raquo;/g, '»')
                                    .replace(/Previous/i, 'Anterior')
                                    .replace(/Next/i, 'Siguiente');

                                if (!link.url) {
                                    return (
                                        <span
                                            key={idx}
                                            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-400 dark:border-neutral-800"
                                        >
                                            {cleanLabel}
                                        </span>
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                                            link.active
                                                ? 'border-blue-600 bg-blue-600 font-semibold text-white'
                                                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
                                        }`}
                                    >
                                        {cleanLabel}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Programar Nueva Cohorte</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Curso Base</Label>
                                    <select
                                        required
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent p-2"
                                        value={createForm.course_id}
                                        onChange={(e) => setCreateForm({ ...createForm, course_id: Number(e.target.value) })}
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Identificador / Generación</Label>
                                        <Input
                                            placeholder="Ej: GEN-2026-A"
                                            value={createForm.internal_id}
                                            onChange={(e) => setCreateForm({ ...createForm, internal_id: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Instructor</Label>
                                        <select
                                            required
                                            className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent p-2"
                                            value={createForm.instructor_id}
                                            onChange={(e) => setCreateForm({ ...createForm, instructor_id: Number(e.target.value) })}
                                        >
                                            {instructors.map((i) => (
                                                <option key={i.id} value={i.id}>
                                                    {i.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Fecha Inicio</Label>
                                        <Input
                                            type="date"
                                            required
                                            value={createForm.start_date}
                                            onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Fecha Fin</Label>
                                        <Input
                                            type="date"
                                            required
                                            value={createForm.end_date}
                                            onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Precio de Venta ($ MXN)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm.price}
                                        onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" size="sm" className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white font-semibold">
                                        <Save className="w-4 h-4 mr-1.5" /> Guardar Programación
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

SchedulesIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Programación de Cursos', href: '/admin/registro/programacion' },
    ]}>
        {page}
    </AppLayout>
);
