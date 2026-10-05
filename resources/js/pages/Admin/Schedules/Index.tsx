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
    Save 
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
    is_active: boolean;
}

interface SchedulesIndexProps {
    schedules: {
        data: Schedule[];
        links: any[];
        total: number;
    };
    courses: Array<{ id: number; title: string }>;
    instructors: Array<{ id: number; name: string }>;
    selectedCourseId: number | null;
}

export default function SchedulesIndex({
    schedules,
    courses = [],
    instructors = [],
    selectedCourseId = null,
}: SchedulesIndexProps) {
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

    const handleCourseFilter = (courseId: string) => {
        if (courseId) {
            router.get('/admin/registro/programacion', { curso_id: courseId });
        } else {
            router.get('/admin/registro/programacion');
        }
    };

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

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <CalendarDays className="w-8 h-8 text-blue-600" /> Programación de Cursos
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Gestión de cohortes y calendarios de venta ({schedules.total} registros).
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Programar Cohorte
                    </Button>
                </div>

                {/* Filter by course */}
                <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm max-w-md">
                    <BookOpen className="w-4 h-4 text-neutral-400 shrink-0" />
                    <Label className="text-xs font-semibold shrink-0">Filtrar por Curso:</Label>
                    <select
                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent p-1.5"
                        value={selectedCourseId || ''}
                        onChange={(e) => handleCourseFilter(e.target.value)}
                    >
                        <option value="">Todos los cursos</option>
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/50 dark:bg-neutral-900/50">
                                <TableHead className="w-16">ID</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Generación / Identificador</TableHead>
                                <TableHead>Vigencia</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Alumnos</TableHead>
                                <TableHead>Estatus</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-neutral-400 text-sm">
                                        No hay programaciones registradas para los criterios seleccionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schedules.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs text-neutral-500">
                                            #{item.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                                {item.course_title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs font-semibold">
                                                {item.internal_id || 'Sin ID'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-neutral-600 dark:text-neutral-400">
                                            {item.start_date && item.end_date ? (
                                                <span>{item.start_date} - {item.end_date}</span>
                                            ) : (
                                                <span className="italic text-neutral-400">Sin fechas</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-neutral-600 dark:text-neutral-400">
                                            {item.instructor_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                                                {item.students_count} alumnos
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={item.is_active ? 'outline' : 'destructive'}
                                                className={item.is_active ? 'border-emerald-300 text-emerald-700' : ''}
                                            >
                                                {item.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                    title="Programar fechas de contenido del curso"
                                                >
                                                    <Link href={`/admin/registro/contenido?cp_id=${item.id}`}>
                                                        <BookOpen className="w-3.5 h-3.5 mr-1" /> Contenido
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Link href={`/admin/curso/${item.id}`}>
                                                        <Users className="w-3.5 h-3.5 mr-1" /> Alumnos
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={item.is_active ? 'text-neutral-400 hover:text-red-600 h-8 px-2' : 'text-emerald-600 h-8 px-2'}
                                                    onClick={() => handleToggleActive(item.id)}
                                                    title={item.is_active ? 'Desactivar cohorte' : 'Activar cohorte'}
                                                >
                                                    {item.is_active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

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
                                        onChange={(e) => setCreateForm({ ...createForm, course_id: e.target.value })}
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
                                            onChange={(e) => setCreateForm({ ...createForm, instructor_id: e.target.value })}
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
                                    <Button type="submit" size="sm" className="bg-blue-600 text-white">
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
