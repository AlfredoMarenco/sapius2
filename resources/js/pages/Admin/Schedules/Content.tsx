import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Calendar, 
    Clock, 
    ChevronLeft, 
    ChevronDown, 
    ChevronUp, 
    Save, 
    Copy, 
    Layers, 
    BookOpen, 
    CheckCircle2, 
    Sparkles, 
    AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface LessonItem {
    id: number;
    title: string;
    position: number;
    fecha_inicial: string | null;
    fecha_final: string | null;
    hora_inicial: string;
    hora_final: string;
}

interface ModuleItem {
    id: number;
    title: string;
    position: number;
    fecha_inicial: string | null;
    fecha_final: string | null;
    hora_inicial: string;
    hora_final: string;
    lessons: LessonItem[];
}

interface Cohort {
    id: number;
    course_id: number;
    course_title: string;
    internal_id: string;
    instructor_name: string;
    start_date: string | null;
    end_date: string | null;
}

interface Props {
    cohort: Cohort;
    modules: ModuleItem[];
}

export default function ScheduleContent({ cohort, modules: initialModules }: Props) {
    const [modules, setModules] = useState<ModuleItem[]>(initialModules);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Toggle accordion
    const toggleCollapse = (moduleId: number) => {
        setCollapsed((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const expandAll = () => setCollapsed({});
    const collapseAll = () => {
        const allCollapsed: Record<number, boolean> = {};
        modules.forEach((m) => { allCollapsed[m.id] = true; });
        setCollapsed(allCollapsed);
    };

    // Update module field
    const handleModuleChange = (moduleId: number, field: keyof ModuleItem, value: any) => {
        setModules((prev) =>
            prev.map((m) => (m.id === moduleId ? { ...m, [field]: value } : m))
        );
    };

    // Update lesson field
    const handleLessonChange = (
        moduleId: number,
        lessonId: number,
        field: keyof LessonItem,
        value: any
    ) => {
        setModules((prev) =>
            prev.map((m) => {
                if (m.id !== moduleId) return m;
                return {
                    ...m,
                    lessons: m.lessons.map((l) =>
                        l.id === lessonId ? { ...l, [field]: value } : l
                    ),
                };
            })
        );
    };

    // Copy module dates & times to all its lessons
    const copyDatesToLessons = (module: ModuleItem) => {
        if (!module.fecha_inicial && !module.fecha_final) {
            toast.error('Define primero las fechas del módulo.');
            return;
        }

        setModules((prev) =>
            prev.map((m) => {
                if (m.id !== module.id) return m;
                return {
                    ...m,
                    lessons: m.lessons.map((l) => ({
                        ...l,
                        fecha_inicial: module.fecha_inicial,
                        fecha_final: module.fecha_final,
                        hora_inicial: module.hora_inicial,
                        hora_final: module.hora_final,
                    })),
                };
            })
        );
        toast.success(`Fechas aplicadas a las ${module.lessons.length} clases de "${module.title}".`);
    };

    // Form submission
    const handleSave = () => {
        setIsSaving(true);
        const items: any[] = [];

        modules.forEach((m) => {
            // Module entry
            items.push({
                id: m.id,
                orden: Number(m.position) || 0,
                fecha_inicial: m.fecha_inicial || null,
                fecha_final: m.fecha_final || null,
                hora_inicial: m.hora_inicial || '00:00',
                hora_final: m.hora_final || '23:59',
            });

            // Lesson entries
            m.lessons.forEach((l) => {
                items.push({
                    id: l.id,
                    orden: Number(l.position) || 0,
                    fecha_inicial: l.fecha_inicial || null,
                    fecha_final: l.fecha_final || null,
                    hora_inicial: l.hora_inicial || '00:00',
                    hora_final: l.hora_final || '23:59',
                });
            });
        });

        router.post(
            '/admin/registro/contenido/store',
            {
                curso_programado_id: cohort.id,
                items,
            },
            {
                onSuccess: () => {
                    toast.success('¡Programación de contenido guardada con éxito!');
                },
                onError: () => {
                    toast.error('Ocurrió un error al guardar la programación.');
                },
                onFinish: () => setIsSaving(false),
            }
        );
    };

    return (
        <>
            <Head title={`Programar Contenido - ${cohort.course_title}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <Link
                            href={`/admin/registro/programacion?curso_id=${cohort.course_id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Volver a Programación
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            Programar Contenido del Curso
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Establece las fechas de apertura, cierre y orden de cada módulo y clase para esta cohorte.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full md:w-auto shadow-md"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Guardando...' : 'Guardar Programación'}
                        </Button>
                    </div>
                </div>

                {/* Cohort Info Banner */}
                <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/40">
                    <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                                    {cohort.course_title}
                                </span>
                                <Badge variant="outline" className="bg-white dark:bg-neutral-900 font-mono text-xs">
                                    {cohort.internal_id}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                                <span><strong>Instructor:</strong> {cohort.instructor_name}</span>
                                {cohort.start_date && cohort.end_date && (
                                    <span><strong>Vigencia general:</strong> {cohort.start_date} al {cohort.end_date}</span>
                                )}
                                <span><strong>Módulos totales:</strong> {modules.length}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <Button variant="ghost" size="sm" onClick={expandAll} className="h-8">
                                Desplegar Todos
                            </Button>
                            <span className="text-neutral-300">|</span>
                            <Button variant="ghost" size="sm" onClick={collapseAll} className="h-8">
                                Colapsar Todos
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Modules & Classes List */}
                <div className="space-y-5">
                    {modules.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-neutral-50 dark:bg-neutral-900/30">
                            <Layers className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                            <p className="text-neutral-600 dark:text-neutral-400 font-medium">Este curso aún no tiene módulos registrados.</p>
                            <Link href={`/admin/courses/${cohort.course_id}/builder`}>
                                <Button variant="outline" className="mt-4">
                                    Ir al Constructor de Contenido
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        modules.map((module, mIdx) => {
                            const isCollapsed = !!collapsed[module.id];

                            return (
                                <Card
                                    key={module.id}
                                    className="overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    {/* MODULE HEADER */}
                                    <div className="bg-neutral-900 text-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div
                                            onClick={() => toggleCollapse(module.id)}
                                            className="flex items-center gap-3 cursor-pointer select-none grow"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                                {isCollapsed ? (
                                                    <ChevronDown className="w-4 h-4 text-white" />
                                                ) : (
                                                    <ChevronUp className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-600 text-white font-mono text-[10px] px-1.5">
                                                        Módulo #{mIdx + 1}
                                                    </Badge>
                                                    <h3 className="font-bold text-base text-white hover:underline">
                                                        {module.title}
                                                    </h3>
                                                </div>
                                                <span className="text-xs text-neutral-400">
                                                    {module.lessons.length} clases asignadas
                                                </span>
                                            </div>
                                        </div>

                                        {/* Module Schedule Inputs */}
                                        <div className="flex flex-wrap items-center gap-3 bg-neutral-800/80 p-2.5 rounded-xl border border-neutral-700/50">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-neutral-400 uppercase font-semibold">Fecha Inicio</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="dd/mm/aaaa"
                                                    value={module.fecha_inicial || ''}
                                                    onChange={(e) => handleModuleChange(module.id, 'fecha_inicial', e.target.value)}
                                                    className="h-8 w-28 text-xs bg-neutral-900 border-neutral-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-neutral-400 uppercase font-semibold">Fecha Fin</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="dd/mm/aaaa"
                                                    value={module.fecha_final || ''}
                                                    onChange={(e) => handleModuleChange(module.id, 'fecha_final', e.target.value)}
                                                    className="h-8 w-28 text-xs bg-neutral-900 border-neutral-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-neutral-400 uppercase font-semibold">Hora Inicio</Label>
                                                <Input
                                                    type="time"
                                                    value={module.hora_inicial || '00:00'}
                                                    onChange={(e) => handleModuleChange(module.id, 'hora_inicial', e.target.value)}
                                                    className="h-8 w-24 text-xs bg-neutral-900 border-neutral-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-neutral-400 uppercase font-semibold">Hora Fin</Label>
                                                <Input
                                                    type="time"
                                                    value={module.hora_final || '23:59'}
                                                    onChange={(e) => handleModuleChange(module.id, 'hora_final', e.target.value)}
                                                    className="h-8 w-24 text-xs bg-neutral-900 border-neutral-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-neutral-400 uppercase font-semibold">Orden</Label>
                                                <Input
                                                    type="number"
                                                    value={module.position || mIdx + 1}
                                                    onChange={(e) => handleModuleChange(module.id, 'position', e.target.value)}
                                                    className="h-8 w-16 text-xs bg-neutral-900 border-neutral-700 text-white text-center"
                                                />
                                            </div>
                                            <div className="pt-4">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => copyDatesToLessons(module)}
                                                    className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white border-0 gap-1.5"
                                                    title="Copiar estas fechas a todas las clases de este módulo"
                                                >
                                                    <Copy className="w-3.5 h-3.5" /> A Clases
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CLASSES TABLE */}
                                    {!isCollapsed && (
                                        <CardContent className="p-0">
                                            {module.lessons.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-neutral-400 italic">
                                                    No hay clases asignadas a este módulo.
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader className="bg-neutral-50 dark:bg-neutral-900/60">
                                                        <TableRow>
                                                            <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
                                                            <TableHead className="text-xs font-bold">Clase / Lección</TableHead>
                                                            <TableHead className="w-36 text-xs font-bold">Fecha Inicial</TableHead>
                                                            <TableHead className="w-36 text-xs font-bold">Fecha Final</TableHead>
                                                            <TableHead className="w-32 text-xs font-bold">Hora Inicial</TableHead>
                                                            <TableHead className="w-32 text-xs font-bold">Hora Final</TableHead>
                                                            <TableHead className="w-20 text-center text-xs font-bold">Orden</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {module.lessons.map((lesson, lIdx) => (
                                                            <TableRow key={lesson.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                                                                <TableCell className="text-center font-mono text-xs text-neutral-400">
                                                                    {lIdx + 1}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                                                                        {lesson.title}
                                                                    </div>
                                                                    <span className="text-[10px] font-mono text-neutral-400">
                                                                        ID: {lesson.id}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="dd/mm/aaaa"
                                                                        value={lesson.fecha_inicial || ''}
                                                                        onChange={(e) =>
                                                                            handleLessonChange(module.id, lesson.id, 'fecha_inicial', e.target.value)
                                                                        }
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="dd/mm/aaaa"
                                                                        value={lesson.fecha_final || ''}
                                                                        onChange={(e) =>
                                                                            handleLessonChange(module.id, lesson.id, 'fecha_final', e.target.value)
                                                                        }
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="time"
                                                                        value={lesson.hora_inicial || '00:00'}
                                                                        onChange={(e) =>
                                                                            handleLessonChange(module.id, lesson.id, 'hora_inicial', e.target.value)
                                                                        }
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="time"
                                                                        value={lesson.hora_final || '23:59'}
                                                                        onChange={(e) =>
                                                                            handleLessonChange(module.id, lesson.id, 'hora_final', e.target.value)
                                                                        }
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Input
                                                                        type="number"
                                                                        value={lesson.position || lIdx + 1}
                                                                        onChange={(e) =>
                                                                            handleLessonChange(module.id, lesson.id, 'position', e.target.value)
                                                                        }
                                                                        className="h-8 w-16 text-xs text-center mx-auto"
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Bottom Action Bar */}
                {modules.length > 0 && (
                    <div className="flex justify-end pt-4 pb-12">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg px-8"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Guardando...' : 'Guardar Programación de Contenido'}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

ScheduleContent.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Programación', href: '/admin/registro/programacion' },
        { title: 'Contenido de Cohorte', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
