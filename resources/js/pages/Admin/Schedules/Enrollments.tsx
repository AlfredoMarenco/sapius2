import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { 
    Users, 
    UserCheck, 
    UserX, 
    ShieldAlert, 
    Search, 
    Download, 
    UserPlus, 
    ChevronLeft, 
    Award, 
    FileText, 
    TrendingUp, 
    Unlock, 
    Check, 
    X,
    Calendar,
    DollarSign,
    GraduationCap,
    Filter
} from 'lucide-react';

interface StudentEnrollment {
    id: number;
    user_id: number;
    student_name: string;
    student_email: string;
    student_phone: string;
    enrolled_at: string | null;
    accepted: string;
    is_blocked: boolean;
    mac_address: string | null;
    reference: string;
}

interface CohortInfo {
    id: number;
    internal_id: string;
    start_date: string | null;
    end_date: string | null;
    price: string | number;
    course: {
        id: number;
        title: string;
        image: string | null;
    } | null;
    instructor: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    cohort: CohortInfo;
    enrollments: StudentEnrollment[];
    otherCohorts: { id: number; title: string }[];
}

export default function Enrollments({ cohort, enrollments, otherCohorts }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'pending' | 'blocked'>('all');
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [selectedSourceCohort, setSelectedSourceCohort] = useState<number | ''>('');
    const [sourceStudents, setSourceStudents] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [loadingSourceStudents, setLoadingSourceStudents] = useState(false);
    const [submittingCopy, setSubmittingCopy] = useState(false);

    // Estados para Inscripción Manual
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualTab, setManualTab] = useState<'existing'|'new'>('existing');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [selectedManualUser, setSelectedManualUser] = useState<any>(null);
    const [newManualUser, setNewManualUser] = useState({ name: '', email: '', phone: '' });
    const [submittingManual, setSubmittingManual] = useState(false);

    // Búsqueda con debounce (simple)
    React.useEffect(() => {
        if (manualTab !== 'existing' || searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }
        const delayFn = setTimeout(async () => {
            setSearchingUsers(true);
            try {
                const res = await fetch(`/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearchingUsers(false);
            }
        }, 500);
        return () => clearTimeout(delayFn);
    }, [searchQuery, manualTab]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingManual(true);

        const payload = manualTab === 'existing' 
            ? { user_id: selectedManualUser?.id } 
            : { new_name: newManualUser.name, new_email: newManualUser.email, new_phone: newManualUser.phone };

        router.post(`/admin/curso-programado/${cohort.id}/manual-enroll`, payload as any, {
            preserveScroll: true,
            onSuccess: () => {
                setManualModalOpen(false);
                setSearchQuery('');
                setSelectedManualUser(null);
                setNewManualUser({ name: '', email: '', phone: '' });
                setSubmittingManual(false);
            },
            onError: () => setSubmittingManual(false),
        });
    };

    // Filtrar inscripciones
    const filteredEnrollments = enrollments.filter((item) => {
        const matchesSearch = 
            item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.student_email.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if (statusFilter === 'accepted') return item.accepted === 'si';
        if (statusFilter === 'pending') return item.accepted === 'no';
        if (statusFilter === 'blocked') return item.is_blocked;

        return true;
    });

    const totalStudents = enrollments.length;
    const acceptedCount = enrollments.filter((e) => e.accepted === 'si').length;
    const pendingCount = enrollments.filter((e) => e.accepted === 'no').length;
    const blockedCount = enrollments.filter((e) => e.is_blocked).length;

    const handleToggleAcceptance = (enrollmentId: number, currentlyAccepted: string) => {
        const routeName = currentlyAccepted === 'si' ? '/admin/curso/destroy' : '/admin/curso/activate';
        router.post(routeName, { id: enrollmentId }, { preserveScroll: true });
    };

    const handleUnlockUser = (userId: number) => {
        if (confirm('¿Estás seguro de que deseas desbloquear la cuenta de este usuario?')) {
            router.post(`/admin/users/${userId}/unlock`, {}, { preserveScroll: true });
        }
    };

    const handleSourceCohortChange = async (cohortId: number) => {
        setSelectedSourceCohort(cohortId);
        setSelectedStudentIds([]);
        if (!cohortId) {
            setSourceStudents([]);
            return;
        }

        setLoadingSourceStudents(true);
        try {
            const res = await fetch(`/admin/cursos/${cohortId}/inscritos`);
            const data = await res.json();
            setSourceStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSourceStudents(false);
        }
    };

    const handleSelectAllStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(sourceStudents.map((s) => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleToggleStudentSelection = (id: number) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter((sid) => sid !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    const handleSubmitCopy = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0) return;

        setSubmittingCopy(true);
        router.post(
            `/admin/curso-programado/${cohort.id}/agregar-alumnos`,
            { alumnos: selectedStudentIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCopyModalOpen(false);
                    setSelectedSourceCohort('');
                    setSourceStudents([]);
                    setSelectedStudentIds([]);
                    setSubmittingCopy(false);
                },
                onError: () => setSubmittingCopy(false),
            }
        );
    };

    return (
        <>
            <Head title={`Inscritos - ${cohort.internal_id}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Botón de retorno y encabezado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="size-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                                    Cohorte #{cohort.id}
                                </span>
                                <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                    {cohort.internal_id}
                                </span>
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                {cohort.course?.title || 'Curso Programado'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setCopyModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-brand-blue bg-white px-4 py-2 text-sm font-medium text-brand-blue shadow-sm hover:bg-brand-blue/5 transition-all"
                        >
                            <Users className="size-4" />
                            Copiar Cohorte
                        </button>
                        <button
                            onClick={() => setManualModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-blue/90 transition-all"
                        >
                            <UserPlus className="size-4" />
                            Venta Presencial
                        </button>
                        <a
                            href={`/admin/exportAllResults/${cohort.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-all"
                        >
                            <Download className="size-4 text-green-600" />
                            Exportar Calificaciones
                        </a>
                    </div>
                </div>

                {/* Banner de datos del curso */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Total Inscritos</p>
                                <p className="text-xl font-bold text-foreground">{totalStudents}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-500/10 p-2 text-green-600">
                                <UserCheck className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Alumnos Aceptados</p>
                                <p className="text-xl font-bold text-foreground">{acceptedCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                                <UserX className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Pendientes / Inactivos</p>
                                <p className="text-xl font-bold text-foreground">{pendingCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                                <ShieldAlert className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Cuentas Bloqueadas</p>
                                <p className="text-xl font-bold text-foreground">{blockedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y buscador */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo electrónico..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                statusFilter === 'all'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Todos ({totalStudents})
                        </button>
                        <button
                            onClick={() => setStatusFilter('accepted')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                statusFilter === 'accepted'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Aceptados ({acceptedCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                statusFilter === 'pending'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Pendientes ({pendingCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('blocked')}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                statusFilter === 'blocked'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Bloqueados ({blockedCount})
                        </button>
                    </div>
                </div>

                {/* Tabla de Alumnos */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Alumno</th>
                                    <th className="px-6 py-4">Fecha Registro</th>
                                    <th className="px-6 py-4">Aceptado</th>
                                    <th className="px-6 py-4">Seguridad</th>
                                    <th className="px-6 py-4 text-right">Seguimiento y Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredEnrollments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                            No se encontraron alumnos con los criterios seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEnrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-xs">
                                                        {enrollment.student_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{enrollment.student_name}</p>
                                                        <p className="text-xs text-muted-foreground">{enrollment.student_email}</p>
                                                        {enrollment.student_phone && (
                                                            <p className="text-[11px] text-muted-foreground/80">Tel: {enrollment.student_phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                {enrollment.enrolled_at || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleAcceptance(enrollment.id, enrollment.accepted)}
                                                    title={enrollment.accepted === 'si' ? 'Clic para desactivar' : 'Clic para aceptar'}
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                                                        enrollment.accepted === 'si'
                                                            ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20'
                                                            : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20'
                                                    }`}
                                                >
                                                    {enrollment.accepted === 'si' ? (
                                                        <>
                                                            <Check className="size-3" /> Aceptado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="size-3" /> Pendiente
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {enrollment.is_blocked ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600">
                                                            <ShieldAlert className="size-3" /> Bloqueado
                                                        </span>
                                                        <button
                                                            onClick={() => handleUnlockUser(enrollment.user_id)}
                                                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                            title="Desbloquear cuenta de usuario"
                                                        >
                                                            <Unlock className="size-3.5 text-amber-600" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                        Activo
                                                    </span>
                                                )}
                                                {enrollment.mac_address && (
                                                    <p className="mt-1 text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                                                        MAC: {enrollment.mac_address}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/admin/evaluacion/resultados/${enrollment.id}`}
                                                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-brand-blue transition-colors shadow-sm"
                                                        title="Ver Resultados de Exámenes"
                                                    >
                                                        <Award className="size-3.5 text-brand-blue" />
                                                        <span>Exámenes</span>
                                                    </Link>

                                                    <Link
                                                        href={`/admin/curso/progress/${cohort.id}/${enrollment.user_id}`}
                                                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-green-600 transition-colors shadow-sm"
                                                        title="Ver Progreso del Alumno"
                                                    >
                                                        <TrendingUp className="size-3.5 text-green-600" />
                                                        <span>Progreso</span>
                                                    </Link>

                                                    <Link
                                                        href={`/admin/curso/homework-tracking/${cohort.id}/${enrollment.user_id}`}
                                                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-blue-600 transition-colors shadow-sm"
                                                        title="Seguimiento de Tareas"
                                                    >
                                                        <FileText className="size-3.5 text-blue-600" />
                                                        <span>Tareas</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal: Inscribir alumnos de curso existente */}
            {copyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Inscribir Alumnos de Curso Existente</h3>
                                <p className="text-xs text-muted-foreground">
                                    Selecciona un curso de origen y marca los alumnos que deseas matricular en esta cohorte.
                                </p>
                            </div>
                            <button
                                onClick={() => setCopyModalOpen(false)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCopy} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                    Seleccionar Curso de Origen
                                </label>
                                <select
                                    value={selectedSourceCohort}
                                    onChange={(e) => handleSourceCohortChange(Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                >
                                    <option value="">-- Selecciona una cohorte origen --</option>
                                    {otherCohorts.map((oc) => (
                                        <option key={oc.id} value={oc.id}>
                                            {oc.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {loadingSourceStudents && (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    Cargando alumnos de la cohorte seleccionada...
                                </div>
                            )}

                            {!loadingSourceStudents && sourceStudents.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-foreground">
                                            Alumnos disponibles ({sourceStudents.length})
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs text-brand-blue cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentIds.length === sourceStudents.length && sourceStudents.length > 0}
                                                onChange={handleSelectAllStudents}
                                                className="rounded border-border text-brand-blue focus:ring-brand-blue"
                                            />
                                            Seleccionar todos
                                        </label>
                                    </div>

                                    <div className="max-h-60 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                                        {sourceStudents.map((student) => (
                                            <label
                                                key={student.id}
                                                className="flex items-center gap-3 p-2.5 hover:bg-muted/30 cursor-pointer text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onChange={() => handleToggleStudentSelection(student.id)}
                                                    className="rounded border-border text-brand-blue focus:ring-brand-blue"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground text-xs">{student.name || student.email}</p>
                                                    <p className="text-[11px] text-muted-foreground">{student.email}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!loadingSourceStudents && selectedSourceCohort && sourceStudents.length === 0 && (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                    No se encontraron alumnos en la cohorte seleccionada.
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCopyModalOpen(false)}
                                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={selectedStudentIds.length === 0 || submittingCopy}
                                    className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-blue/90 disabled:opacity-50"
                                >
                                    {submittingCopy ? 'Inscribiendo...' : `Inscribir (${selectedStudentIds.length}) Alumnos`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal de Inscripción Manual (Venta Presencial) */}
            {manualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-xl bg-background shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
                            <h3 className="text-lg font-bold">Inscripción Manual (Venta Presencial)</h3>
                            <button
                                onClick={() => setManualModalOpen(false)}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        
                        <div className="flex border-b border-border">
                            <button 
                                className={`flex-1 py-3 text-sm font-medium ${manualTab === 'existing' ? 'border-b-2 border-brand-blue text-brand-blue bg-brand-blue/5' : 'text-muted-foreground hover:bg-muted/30'}`}
                                onClick={() => { setManualTab('existing'); setSelectedManualUser(null); setSearchQuery(''); }}
                            >
                                Alumno Existente
                            </button>
                            <button 
                                className={`flex-1 py-3 text-sm font-medium ${manualTab === 'new' ? 'border-b-2 border-brand-blue text-brand-blue bg-brand-blue/5' : 'text-muted-foreground hover:bg-muted/30'}`}
                                onClick={() => { setManualTab('new'); setNewManualUser({ name: '', email: '', phone: '' }); }}
                            >
                                Alumno Nuevo
                            </button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="flex flex-col overflow-hidden">
                            <div className="p-5 flex-1 overflow-y-auto space-y-4">
                                {manualTab === 'existing' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-foreground">
                                                Buscar alumno por nombre o correo
                                            </label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Escribe al menos 3 caracteres..."
                                                    className="w-full rounded-md border border-border bg-background pl-9 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {searchingUsers && <div className="text-center text-xs text-muted-foreground py-2">Buscando...</div>}
                                        
                                        {!searchingUsers && searchResults.length > 0 && !selectedManualUser && (
                                            <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                                                {searchResults.map(user => (
                                                    <div 
                                                        key={user.id} 
                                                        onClick={() => setSelectedManualUser(user)}
                                                        className="p-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                        <span className="text-xs text-brand-blue">Seleccionar</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {selectedManualUser && (
                                            <div className="rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-4 relative">
                                                <button 
                                                    type="button" 
                                                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                                                    onClick={() => setSelectedManualUser(null)}
                                                >
                                                    <X className="size-4" />
                                                </button>
                                                <p className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">Alumno Seleccionado</p>
                                                <p className="text-sm font-bold">{selectedManualUser.name}</p>
                                                <p className="text-xs text-muted-foreground">{selectedManualUser.email}</p>
                                            </div>
                                        )}
                                        
                                        {!searchingUsers && searchQuery.length >= 3 && searchResults.length === 0 && (
                                            <div className="text-center text-xs text-muted-foreground py-4">No se encontraron usuarios. Intenta registrarlo como nuevo.</div>
                                        )}
                                    </div>
                                )}

                                {manualTab === 'new' && (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded p-3 text-xs text-amber-800 dark:text-amber-200 mb-2">
                                            <p>Se creará un usuario nuevo y se inscribirá automáticamente. La contraseña será <strong>Sapius{new Date().getFullYear()}</strong>.</p>
                                        </div>
                                        
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-foreground">Nombre Completo</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                                value={newManualUser.name}
                                                onChange={(e) => setNewManualUser({...newManualUser, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-foreground">Correo Electrónico</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                                value={newManualUser.email}
                                                onChange={(e) => setNewManualUser({...newManualUser, email: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-foreground">Teléfono (Opcional)</label>
                                            <input
                                                type="tel"
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                                value={newManualUser.phone}
                                                onChange={(e) => setNewManualUser({...newManualUser, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-border p-4 bg-muted/10">
                                <button
                                    type="button"
                                    onClick={() => setManualModalOpen(false)}
                                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingManual || (manualTab === 'existing' && !selectedManualUser)}
                                    className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-blue/90 disabled:opacity-50"
                                >
                                    {submittingManual ? 'Procesando...' : 'Inscribir Alumno'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Enrollments.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Panel de Control', href: '/admin' }, { title: 'Inscritos', href: '#' }]}>
        {page}
    </AppLayout>
);
