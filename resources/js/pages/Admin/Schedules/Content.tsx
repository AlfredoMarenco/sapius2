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
    GripVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Helper to guarantee YYYY-MM-DD for native HTML5 date input calendar picker
const ensureYmd = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const dmyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        return `${year}-${month}-${day}`;
    }
    return dateStr;
};

// Sortable Row for each Lesson within a Module
interface SortableLessonRowProps {
    lesson: LessonItem;
    lIdx: number;
    moduleId: number;
    onLessonChange: (moduleId: number, lessonId: number, field: keyof LessonItem, value: any) => void;
}

function SortableLessonRow({ lesson, lIdx, moduleId, onLessonChange }: SortableLessonRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 15 : undefined,
    };

    return (
        <TableRow 
            ref={setNodeRef} 
            style={style}
            className={`transition-colors ${
                isDragging 
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 shadow-lg ring-1 ring-blue-400 opacity-90' 
                    : 'hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40'
            }`}
        >
            {/* Drag Handle */}
            <TableCell className="w-10 p-2 text-center">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        listeners?.onPointerDown?.(e);
                    }}
                    className="cursor-grab active:cursor-grabbing p-1.5 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center justify-center"
                    title="Arrastra para reordenar la clase"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </TableCell>

            {/* Position number */}
            <TableCell className="text-center font-mono text-xs text-neutral-400 w-10">
                {lIdx + 1}
            </TableCell>

            {/* Title */}
            <TableCell>
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                    {lesson.title}
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                    ID: {lesson.id}
                </span>
            </TableCell>

            {/* Fecha Inicial (Calendar Picker) */}
            <TableCell className="w-40">
                <div className="relative flex items-center">
                    <Input
                        type="date"
                        value={ensureYmd(lesson.fecha_inicial)}
                        onChange={(e) =>
                            onLessonChange(moduleId, lesson.id, 'fecha_inicial', e.target.value)
                        }
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className="h-8 text-xs cursor-pointer font-medium bg-white dark:bg-neutral-900 pr-2 border-neutral-300 dark:border-neutral-700"
                        title="Selecciona la fecha inicial desde el calendario"
                    />
                </div>
            </TableCell>

            {/* Fecha Final (Calendar Picker) */}
            <TableCell className="w-40">
                <div className="relative flex items-center">
                    <Input
                        type="date"
                        value={ensureYmd(lesson.fecha_final)}
                        onChange={(e) =>
                            onLessonChange(moduleId, lesson.id, 'fecha_final', e.target.value)
                        }
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className="h-8 text-xs cursor-pointer font-medium bg-white dark:bg-neutral-900 pr-2 border-neutral-300 dark:border-neutral-700"
                        title="Selecciona la fecha final desde el calendario"
                    />
                </div>
            </TableCell>

            {/* Hora Inicial */}
            <TableCell className="w-28">
                <Input
                    type="time"
                    value={lesson.hora_inicial || '00:00'}
                    onChange={(e) =>
                        onLessonChange(moduleId, lesson.id, 'hora_inicial', e.target.value)
                    }
                    className="h-8 text-xs"
                />
            </TableCell>

            {/* Hora Final */}
            <TableCell className="w-28">
                <Input
                    type="time"
                    value={lesson.hora_final || '23:59'}
                    onChange={(e) =>
                        onLessonChange(moduleId, lesson.id, 'hora_final', e.target.value)
                    }
                    className="h-8 text-xs"
                />
            </TableCell>

            {/* Orden */}
            <TableCell className="text-center w-20">
                <Input
                    type="number"
                    value={lesson.position || lIdx + 1}
                    onChange={(e) =>
                        onLessonChange(moduleId, lesson.id, 'position', Number(e.target.value) || 0)
                    }
                    className="h-8 w-16 text-xs text-center mx-auto font-mono font-bold"
                />
            </TableCell>
        </TableRow>
    );
}

// Sortable Card for each Module
interface SortableModuleCardProps {
    module: ModuleItem;
    mIdx: number;
    isCollapsed: boolean;
    onToggleCollapse: (moduleId: number) => void;
    onModuleChange: (moduleId: number, field: keyof ModuleItem, value: any) => void;
    onLessonChange: (moduleId: number, lessonId: number, field: keyof LessonItem, value: any) => void;
    onCopyDatesToLessons: (module: ModuleItem) => void;
    onDragEndLessons: (moduleId: number, event: DragEndEvent) => void;
    sensors: any;
}

function SortableModuleCard({
    module,
    mIdx,
    isCollapsed,
    onToggleCollapse,
    onModuleChange,
    onLessonChange,
    onCopyDatesToLessons,
    onDragEndLessons,
    sensors,
}: SortableModuleCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-sm transition-all ${
                isDragging ? 'shadow-2xl ring-2 ring-blue-500 opacity-95' : 'hover:shadow-md'
            }`}
        >
            {/* MODULE HEADER */}
            <div className="bg-neutral-900 text-white p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-2 grow">
                    {/* Drag Handle for Module */}
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-2 text-neutral-400 hover:text-blue-400 rounded-lg hover:bg-white/10 transition-colors"
                        title="Arrastra para reordenar el módulo completo"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>

                    {/* Accordion toggle & Title */}
                    <div
                        onClick={() => onToggleCollapse(module.id)}
                        className="flex items-center gap-3 cursor-pointer select-none grow"
                    >
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            {isCollapsed ? (
                                <ChevronDown className="w-4 h-4 text-white" />
                            ) : (
                                <ChevronUp className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-blue-600 text-white font-mono text-[10px] px-1.5 py-0">
                                    Módulo #{mIdx + 1}
                                </Badge>
                                <h3 className="font-bold text-sm text-white hover:underline">
                                    {module.title}
                                </h3>
                            </div>
                            <span className="text-xs text-neutral-400">
                                {module.lessons.length} {module.lessons.length === 1 ? 'clase asignada' : 'clases asignadas'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Module Schedule Inputs */}
                <div className="flex flex-wrap items-center gap-2.5 bg-neutral-800/90 p-2 rounded-xl border border-neutral-700/60 shrink-0">
                    {/* Fecha Inicio (Calendar Picker) */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-400" /> Fecha Inicio
                        </Label>
                        <Input
                            type="date"
                            value={ensureYmd(module.fecha_inicial)}
                            onChange={(e) => onModuleChange(module.id, 'fecha_inicial', e.target.value)}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            className="h-8 w-36 text-xs bg-neutral-900 border-neutral-700 text-white cursor-pointer [color-scheme:dark] font-medium"
                            title="Selecciona la fecha de inicio desde el calendario"
                        />
                    </div>

                    {/* Fecha Fin (Calendar Picker) */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-400" /> Fecha Fin
                        </Label>
                        <Input
                            type="date"
                            value={ensureYmd(module.fecha_final)}
                            onChange={(e) => onModuleChange(module.id, 'fecha_final', e.target.value)}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            className="h-8 w-36 text-xs bg-neutral-900 border-neutral-700 text-white cursor-pointer [color-scheme:dark] font-medium"
                            title="Selecciona la fecha final desde el calendario"
                        />
                    </div>

                    {/* Hora Inicio */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" /> Hora Inicio
                        </Label>
                        <Input
                            type="time"
                            value={module.hora_inicial || '00:00'}
                            onChange={(e) => onModuleChange(module.id, 'hora_inicial', e.target.value)}
                            className="h-8 w-24 text-xs bg-neutral-900 border-neutral-700 text-white font-mono"
                        />
                    </div>

                    {/* Hora Fin */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" /> Hora Fin
                        </Label>
                        <Input
                            type="time"
                            value={module.hora_final || '23:59'}
                            onChange={(e) => onModuleChange(module.id, 'hora_final', e.target.value)}
                            className="h-8 w-24 text-xs bg-neutral-900 border-neutral-700 text-white font-mono"
                        />
                    </div>

                    {/* Orden */}
                    <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400 uppercase font-semibold">Orden</Label>
                        <Input
                            type="number"
                            value={module.position || mIdx + 1}
                            onChange={(e) => onModuleChange(module.id, 'position', Number(e.target.value) || 0)}
                            className="h-8 w-16 text-xs bg-neutral-900 border-neutral-700 text-white text-center font-mono font-bold"
                        />
                    </div>

                    {/* Copiar a Clases Button */}
                    <div className="pt-4">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => onCopyDatesToLessons(module)}
                            className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white border-0 gap-1.5 shadow-sm"
                            title="Copiar estas fechas y horas a todas las clases de este módulo"
                        >
                            <Copy className="w-3.5 h-3.5" /> A Clases
                        </Button>
                    </div>
                </div>
            </div>

            {/* CLASSES TABLE WITH DND */}
            {!isCollapsed && (
                <CardContent className="p-0">
                    {module.lessons.length === 0 ? (
                        <div className="p-6 text-center text-sm text-neutral-400 italic">
                            No hay clases asignadas a este módulo.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => onDragEndLessons(module.id, event)}
                        >
                            <SortableContext
                                items={module.lessons.map((l) => l.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <Table>
                                    <TableHeader className="bg-neutral-50 dark:bg-neutral-900/60">
                                        <TableRow>
                                            <TableHead className="w-10 text-center text-xs font-bold" title="Reordenar">
                                                <GripVertical className="w-4 h-4 mx-auto text-neutral-400" />
                                            </TableHead>
                                            <TableHead className="w-10 text-center text-xs font-bold">#</TableHead>
                                            <TableHead className="text-xs font-bold">Clase / Lección</TableHead>
                                            <TableHead className="w-40 text-xs font-bold">Fecha Inicial</TableHead>
                                            <TableHead className="w-40 text-xs font-bold">Fecha Final</TableHead>
                                            <TableHead className="w-28 text-xs font-bold">Hora Inicial</TableHead>
                                            <TableHead className="w-28 text-xs font-bold">Hora Final</TableHead>
                                            <TableHead className="w-20 text-center text-xs font-bold">Orden</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {module.lessons.map((lesson, lIdx) => (
                                            <SortableLessonRow
                                                key={lesson.id}
                                                lesson={lesson}
                                                lIdx={lIdx}
                                                moduleId={module.id}
                                                onLessonChange={onLessonChange}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </SortableContext>
                        </DndContext>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

export default function ScheduleContent({ cohort, modules: initialModules }: Props) {
    const [modules, setModules] = useState<ModuleItem[]>(initialModules);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const [isSaving, setIsSaving] = useState(false);

    // DND Sensors with 5px movement constraint so regular clicks aren't intercepted as drags
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    // Drag and drop reordering for modules
    const handleDragEndModules = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setModules((prev) => {
            const oldIndex = prev.findIndex((m) => m.id === active.id);
            const newIndex = prev.findIndex((m) => m.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return prev;

            const reordered = arrayMove(prev, oldIndex, newIndex);
            // Automatically synchronize the 'position' (Orden) field to reflect new sequence
            return reordered.map((m, idx) => ({
                ...m,
                position: idx + 1,
            }));
        });
        toast.success('Módulos reordenados.');
    };

    // Drag and drop reordering for lessons within a module
    const handleDragEndLessons = (moduleId: number, event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setModules((prev) =>
            prev.map((m) => {
                if (m.id !== moduleId) return m;

                const oldIndex = m.lessons.findIndex((l) => l.id === active.id);
                const newIndex = m.lessons.findIndex((l) => l.id === over.id);
                if (oldIndex === -1 || newIndex === -1) return m;

                const reordered = arrayMove(m.lessons, oldIndex, newIndex);
                // Automatically synchronize the 'position' (Orden) field to reflect new sequence
                return {
                    ...m,
                    lessons: reordered.map((l, idx) => ({
                        ...l,
                        position: idx + 1,
                    })),
                };
            })
        );
        toast.success('Clases reordenadas.');
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
                            Establece las fechas de apertura, cierre y arrastra los módulos y clases para ordenar el contenido de esta cohorte.
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

                {/* Modules & Classes List with Drag and Drop */}
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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEndModules}
                        >
                            <SortableContext
                                items={modules.map((m) => m.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-5">
                                    {modules.map((module, mIdx) => (
                                        <SortableModuleCard
                                            key={module.id}
                                            module={module}
                                            mIdx={mIdx}
                                            isCollapsed={!!collapsed[module.id]}
                                            onToggleCollapse={toggleCollapse}
                                            onModuleChange={handleModuleChange}
                                            onLessonChange={handleLessonChange}
                                            onCopyDatesToLessons={copyDatesToLessons}
                                            onDragEndLessons={handleDragEndLessons}
                                            sensors={sensors}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
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
