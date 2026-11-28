import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    Filter,
    Plus,
    Radio,
    Search,
    Trash2,
    Video,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LessonOption {
    id: number;
    title: string;
}

interface ModuleOption {
    id: number;
    title: string;
    lessons: LessonOption[];
}

interface ZoomClassItem {
    id: number;
    title: string;
    description: string | null;
    creation_mode: 'auto' | 'manual';
    meeting_number: string;
    passcode: string | null;
    scheduled_at: string | null;
    scheduled_at_formatted: string | null;
    ends_at_formatted: string | null;
    duration_minutes: number;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    computed_status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    is_active: boolean;
    module_id: number | null;
    module_title: string | null;
    leccion_id: number | null;
    lesson_title: string | null;
    instructor_name: string | null;
    has_start_url: boolean;
}

interface CohortOption {
    id: number;
    course_id: number;
    course_title: string;
    internal_id: string;
    is_active: boolean;
}

interface ZoomClassesProps {
    cohort: {
        id: number;
        course_id: number;
        course_title: string;
        internal_id: string;
        instructor_name: string;
    };
    availableCohorts?: CohortOption[];
    modules: ModuleOption[];
    zoomClasses: ZoomClassItem[];
    routePrefix: 'admin' | 'instructor';
    apiConfigured: boolean;
    sdkConfigured: boolean;
}

export default function ZoomClasses({
    cohort,
    availableCohorts = [],
    modules = [],
    zoomClasses = [],
    routePrefix,
    apiConfigured,
    sdkConfigured,
}: ZoomClassesProps) {
    const [cohortQuery, setCohortQuery] = useState('');
    const [classSearch, setClassSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        creation_mode: apiConfigured ? 'auto' : 'manual',
        meeting_input: '',
        passcode: '',
        scheduled_at: '',
        duration_minutes: 60,
        module_id: '',
        leccion_id: '',
    });

    const selectedModule = modules.find((m) => String(m.id) === String(form.module_id));

    const filteredCohorts = useMemo(() => {
        const q = cohortQuery.trim().toLowerCase();
        if (!q) return availableCohorts;
        return availableCohorts.filter(
            (c) =>
                c.course_title.toLowerCase().includes(q) ||
                c.internal_id.toLowerCase().includes(q) ||
                String(c.id) === q,
        );
    }, [availableCohorts, cohortQuery]);

    const filteredZoomClasses = useMemo(() => {
        const q = classSearch.trim().toLowerCase();
        return zoomClasses.filter((zc) => {
            if (q) {
                const matchesText =
                    zc.title.toLowerCase().includes(q) ||
                    zc.meeting_number.toLowerCase().includes(q) ||
                    (zc.module_title || '').toLowerCase().includes(q) ||
                    (zc.lesson_title || '').toLowerCase().includes(q);
                if (!matchesText) return false;
            }
            if (moduleFilter === 'general') {
                if (zc.module_id !== null) return false;
            } else if (moduleFilter !== 'all') {
                if (String(zc.module_id ?? '') !== moduleFilter) return false;
            }
            if (statusFilter !== 'all' && zc.computed_status !== statusFilter) {
                return false;
            }
            return true;
        });
    }, [zoomClasses, classSearch, moduleFilter, statusFilter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            `/${routePrefix}/schedules/${cohort.id}/zoom-classes`,
            {
                ...form,
                module_id: form.module_id ? Number(form.module_id) : null,
                leccion_id: form.leccion_id ? Number(form.leccion_id) : null,
            },
            {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setForm({
                        title: '',
                        description: '',
                        creation_mode: apiConfigured ? 'auto' : 'manual',
                        meeting_input: '',
                        passcode: '',
                        scheduled_at: '',
                        duration_minutes: 60,
                        module_id: '',
                        leccion_id: '',
                    });
                },
            },
        );
    };

    const handleStatusChange = (id: number, status: 'live' | 'ended' | 'scheduled') => {
        router.put(`/${routePrefix}/zoom-classes/${id}`, { status });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta clase en vivo de Zoom?')) {
            router.delete(`/${routePrefix}/zoom-classes/${id}`);
        }
    };

    const backHref =
        routePrefix === 'instructor'
            ? `/instructor/cursos/${cohort.course_id}/view?cohort_id=${cohort.id}`
            : '/admin/registro/programacion';

    return (
        <>
            <Head title={`Clases Zoom - ${cohort.course_title}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={backHref}
                            className="mb-1 inline-flex items-center text-xs font-medium text-neutral-500 hover:text-neutral-800"
                        >
                            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Regresar
                        </Link>
                        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#101E33] sm:text-2xl dark:text-neutral-100">
                            <Video className="h-6 w-6 text-blue-600" />
                            Clases en Vivo (Zoom)
                        </h1>
                        <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">
                            {cohort.course_title} • <span className="font-semibold">{cohort.internal_id}</span> • Instructor:{' '}
                            {cohort.instructor_name}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-9 gap-2 self-start rounded-lg bg-[#FF6B52] px-4 text-xs font-semibold text-white hover:bg-[#F0563C] sm:self-auto sm:text-sm"
                    >
                        <Plus className="h-4 w-4" /> Programar Clase Zoom
                    </Button>
                </div>

                {/* Selector Rápido de Curso / Cohorte */}
                {availableCohorts.length > 1 && (
                    <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                            <Filter className="h-3.5 w-3.5 text-blue-600" />
                            Cambiar rápidamente de Curso o Cohorte
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                            <div className="relative sm:col-span-5">
                                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Filtrar curso o grupo (ej. Manejo de servicios...)"
                                    value={cohortQuery}
                                    onChange={(e) => setCohortQuery(e.target.value)}
                                    className="h-9 pl-9 text-xs"
                                />
                            </div>
                            <div className="sm:col-span-7">
                                <select
                                    className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent px-3 text-xs font-medium dark:border-neutral-700"
                                    value={cohort.id}
                                    onChange={(e) => {
                                        const nextId = e.target.value;
                                        if (nextId && Number(nextId) !== cohort.id) {
                                            router.get(`/${routePrefix}/schedules/${nextId}/zoom-classes`);
                                        }
                                    }}
                                >
                                    {filteredCohorts.length === 0 ? (
                                        <option value={cohort.id}>Sin coincidencias para "{cohortQuery}"</option>
                                    ) : (
                                        filteredCohorts.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                #{c.id} — {c.course_title} ({c.internal_id}){c.is_active ? '' : ' [Inactivo]'}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado de configuración */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white p-3.5 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                            Zoom API (Creación Automática S2S)
                        </span>
                        <Badge variant={apiConfigured ? 'outline' : 'secondary'} className={apiConfigured ? 'border-emerald-300 text-emerald-700' : ''}>
                            {apiConfigured ? 'Configurada' : 'Solo Modo Manual'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white p-3.5 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                            Zoom Meeting SDK (Sala Embebida)
                        </span>
                        <Badge variant={sdkConfigured ? 'outline' : 'destructive'} className={sdkConfigured ? 'border-emerald-300 text-emerald-700' : ''}>
                            {sdkConfigured ? 'Activo' : 'Pendiente .env'}
                        </Badge>
                    </div>
                </div>

                {/* Filtros de Clases Zoom */}
                {zoomClasses.length > 0 && (
                    <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-xs sm:grid-cols-12 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="relative sm:col-span-5">
                            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Buscar clase por título, Meeting ID o lección..."
                                value={classSearch}
                                onChange={(e) => setClassSearch(e.target.value)}
                                className="h-9 pl-9 text-xs"
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <select
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent px-2.5 text-xs dark:border-neutral-700"
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                            >
                                <option value="all">Todos los módulos</option>
                                <option value="general">General del curso</option>
                                {modules.map((m) => (
                                    <option key={m.id} value={String(m.id)}>
                                        {m.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-3">
                            <select
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-transparent px-2.5 text-xs dark:border-neutral-700"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Todos los estatus</option>
                                <option value="live">En vivo</option>
                                <option value="scheduled">Programadas</option>
                                <option value="ended">Finalizadas</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Lista de Clases */}
                {filteredZoomClasses.length === 0 ? (
                    <Card className="p-12 text-center text-neutral-400">
                        <Video className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {zoomClasses.length === 0
                                ? 'No hay clases en vivo programadas para este grupo'
                                : 'No se encontraron clases con los filtros aplicados'}
                        </h3>
                        <p className="mt-1 text-xs">
                            {zoomClasses.length === 0
                                ? 'Programa una nueva sesión de Zoom para que aparezca en el calendario y temario de tus alumnos.'
                                : 'Prueba limpiando el texto de búsqueda o cambiando el filtro de módulo/estatus.'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredZoomClasses.map((zc) => (
                            <Card key={zc.id} className="border-neutral-200/80 shadow-xs dark:border-neutral-800">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {zc.computed_status === 'live' ? (
                                                    <Badge className="bg-red-600 text-white">
                                                        <Radio className="mr-1 h-3 w-3" /> EN VIVO
                                                    </Badge>
                                                ) : zc.computed_status === 'ended' ? (
                                                    <Badge variant="secondary">Finalizada</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                                                        Programada
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="font-mono text-[11px]">
                                                    ID: {zc.meeting_number}
                                                </Badge>
                                                <Badge variant="outline" className="text-[11px]">
                                                    {zc.creation_mode === 'auto' ? 'Zoom API' : 'Manual'}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base font-bold sm:text-lg">{zc.title}</CardTitle>
                                            <CardDescription className="flex flex-wrap items-center gap-3 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" /> {zc.scheduled_at_formatted}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" /> {zc.duration_minutes} min (hasta{' '}
                                                    {zc.ends_at_formatted})
                                                </span>
                                                {zc.module_title && <span>Módulo: {zc.module_title}</span>}
                                                {zc.lesson_title && <span>Lección: {zc.lesson_title}</span>}
                                            </CardDescription>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button asChild size="sm" className="h-8 bg-blue-600 text-xs text-white hover:bg-blue-700">
                                                <a href={`/${routePrefix}/zoom-classes/${zc.id}/host-launch`} target="_blank" rel="noreferrer">
                                                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Iniciar en Zoom App
                                                </a>
                                            </Button>
                                            <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                                                <Link href={`/${routePrefix}/zoom-classes/${zc.id}/room`}>
                                                    <Video className="mr-1.5 h-3.5 w-3.5" /> Ver Sala en Sapius
                                                </Link>
                                            </Button>
                                            {zc.status !== 'ended' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs text-emerald-700"
                                                    onClick={() => handleStatusChange(zc.id, 'ended')}
                                                >
                                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Finalizar
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600"
                                                onClick={() => handleDelete(zc.id)}
                                                title="Eliminar clase"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                {zc.description && (
                                    <CardContent className="pt-0 text-xs text-neutral-500">
                                        {zc.description}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal Crear Clase Zoom */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Programar Clase en Vivo (Zoom)</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Modo de Creación</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            disabled={!apiConfigured}
                                            onClick={() => setForm({ ...form, creation_mode: 'auto' })}
                                            className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${
                                                form.creation_mode === 'auto'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-neutral-200 text-neutral-600'
                                            } ${!apiConfigured ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <div className="font-semibold">Automático (Zoom API)</div>
                                            <div className="text-[11px] opacity-80">Crea la reunión en Zoom</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, creation_mode: 'manual' })}
                                            className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${
                                                form.creation_mode === 'manual'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-neutral-200 text-neutral-600'
                                            }`}
                                        >
                                            <div className="font-semibold">Manual (ID o Enlace)</div>
                                            <div className="text-[11px] opacity-80">Pega tu link o Meeting ID</div>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Título de la Clase</Label>
                                    <Input
                                        required
                                        placeholder="Ej: Repaso Módulo 1 - Cardiología"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Fecha y Hora de Inicio</Label>
                                        <Input
                                            type="datetime-local"
                                            required
                                            value={form.scheduled_at}
                                            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Duración (minutos)</Label>
                                        <Input
                                            type="number"
                                            min={15}
                                            max={480}
                                            required
                                            value={form.duration_minutes}
                                            onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) || 60 })}
                                        />
                                    </div>
                                </div>

                                {form.creation_mode === 'manual' && (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Enlace de Zoom o Meeting ID</Label>
                                            <Input
                                                required
                                                placeholder="https://zoom.us/j/... o 81234567890"
                                                value={form.meeting_input}
                                                onChange={(e) => setForm({ ...form, meeting_input: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Código de Acceso (Passcode)</Label>
                                            <Input
                                                placeholder="Opcional si viene en el link"
                                                value={form.passcode}
                                                onChange={(e) => setForm({ ...form, passcode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Módulo (Opcional)</Label>
                                        <select
                                            className="w-full rounded-lg border border-neutral-300 bg-transparent p-2 text-xs dark:border-neutral-700"
                                            value={form.module_id}
                                            onChange={(e) => setForm({ ...form, module_id: e.target.value, leccion_id: '' })}
                                        >
                                            <option value="">General del curso</option>
                                            {modules.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Lección (Opcional)</Label>
                                        <select
                                            className="w-full rounded-lg border border-neutral-300 bg-transparent p-2 text-xs dark:border-neutral-700"
                                            value={form.leccion_id}
                                            onChange={(e) => setForm({ ...form, leccion_id: e.target.value })}
                                            disabled={!selectedModule}
                                        >
                                            <option value="">Todo el módulo</option>
                                            {selectedModule?.lessons.map((l) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Descripción / Notas (Opcional)</Label>
                                    <textarea
                                        rows={2}
                                        className="w-full rounded-lg border border-neutral-300 bg-transparent p-2 text-xs dark:border-neutral-700"
                                        placeholder="Indicaciones previas para los alumnos..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" size="sm" className="h-9 rounded-lg bg-[#FF6B52] font-semibold text-white hover:bg-[#F0563C]">
                                        Guardar Clase Zoom
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

ZoomClasses.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Programación', href: '#' },
            { title: 'Clases Zoom', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
