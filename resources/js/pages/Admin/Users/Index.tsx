import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    Eye,
    Search,
    FileCheck,
    Unlock,
    Laptop,
    AlertTriangle,
    Edit3,
    UserPlus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

interface UserRecord {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    is_validated: boolean;
    is_blocked: boolean;
    strikes: number;
    mac_address: string | null;
    pending_mac_address: string | null;
    created_at: string | null;
}

interface RoleOption {
    id: number;
    name: string;
    slug?: string;
}

interface UsersProps {
    users: {
        data: UserRecord[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        current_page: number;
        last_page: number;
        total: number;
    };
    activeFilter: string;
    searchTerm: string;
    roles?: RoleOption[];
}

export default function UsersIndex({
    users,
    activeFilter = 'enable',
    searchTerm = '',
    roles = [],
}: UsersProps) {
    const [search, setSearch] = useState(searchTerm);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const createForm = useForm({
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        rol_id: roles.length > 0 ? String(roles[0].id) : '',
        role: 'alumno',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/admin/users/${activeFilter}`, { search }, { preserveState: true });
    };

    const handleApprove = (id: number) => {
        router.post('/admin/users/approve', { id });
    };

    const handleUnapprove = (id: number) => {
        router.post('/admin/users/unapprove', { id });
    };

    const handleToggleActive = (id: number) => {
        router.delete(`/admin/users/${id}`);
    };

    const handleUnlock = (id: number) => {
        if (
            confirm(
                '¿Desbloquear la cuenta de este usuario y reiniciar sus infracciones a 0?',
            )
        ) {
            router.post(`/admin/users/${id}/unlock`);
        }
    };

    const handleClearMac = (id: number) => {
        if (confirm('¿Desvincular la dirección MAC registrada para este alumno?')) {
            router.post(`/admin/users/${id}/clear-mac`);
        }
    };

    const handleCreateUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/users/store', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Usuario registrado correctamente');
                setIsCreateModalOpen(false);
                createForm.reset();
            },
            onError: () => {
                toast.error('No se pudo crear el usuario. Revisa los datos.');
            },
        });
    };

    return (
        <>
            <Head title="Gestión de Usuarios" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                            Administración de Usuarios
                        </h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                            Control de cuentas ({users.total} en total), validación de
                            expedientes y seguridad de hardware.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                            <Button
                                asChild
                                variant={activeFilter === 'enable' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-8 rounded-md text-xs ${
                                    activeFilter === 'enable'
                                        ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90'
                                        : ''
                                }`}
                            >
                                <Link href="/admin/users/enable">Activos</Link>
                            </Button>
                            <Button
                                asChild
                                variant={activeFilter === 'disable' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-8 rounded-md text-xs ${
                                    activeFilter === 'disable'
                                        ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90'
                                        : ''
                                }`}
                            >
                                <Link href="/admin/users/disable">Inactivos</Link>
                            </Button>
                            <Button
                                asChild
                                variant={activeFilter === 'blocked' ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-8 rounded-md text-xs ${
                                    activeFilter === 'blocked'
                                        ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90'
                                        : ''
                                }`}
                            >
                                <Link href="/admin/users/blocked">Bloqueados</Link>
                            </Button>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="h-9 rounded-lg gap-2 bg-[#FF6B52] text-white hover:bg-[#F0563C] px-4 text-xs sm:text-sm font-semibold shadow-xs"
                        >
                            <UserPlus className="h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Buscar por nombre, correo, usuario o folio..."
                            className="h-9 pl-9 rounded-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button type="submit" variant="secondary" size="sm" className="h-9 rounded-lg">
                        Buscar
                    </Button>
                    {searchTerm && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-lg"
                            onClick={() => {
                                setSearch('');
                                router.get(`/admin/users/${activeFilter}`);
                            }}
                        >
                            Limpiar
                        </Button>
                    )}
                </form>

                {/* Mobile Cards View */}
                <div className="space-y-3 md:hidden">
                    {users.data.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                            No se encontraron usuarios con los criterios especificados.
                        </div>
                    ) : (
                        users.data.map((user) => (
                            <div
                                key={user.id}
                                className={`rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-3 dark:border-neutral-800 dark:bg-neutral-900 ${
                                    user.is_blocked ? 'bg-red-50/40 dark:bg-red-950/15' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="font-mono text-[11px] text-neutral-400">#{user.id}</span>
                                            <span className="font-semibold text-sm text-[#101E33] dark:text-neutral-100 truncate">
                                                {user.name}
                                            </span>
                                            <Badge variant="outline" className="text-[11px] capitalize">
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                                            @{user.username} · {user.email}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={user.is_active ? 'outline' : 'destructive'}
                                        className={user.is_active ? 'border-emerald-300 text-emerald-700 text-[11px]' : 'text-[11px]'}
                                    >
                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {user.is_validated ? (
                                        <Badge
                                            className="cursor-pointer bg-emerald-600 text-[11px] text-white"
                                            onClick={() => handleUnapprove(user.id)}
                                        >
                                            Validado
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer bg-amber-100 text-[11px] text-amber-800"
                                            onClick={() => handleApprove(user.id)}
                                        >
                                            Pendiente validación
                                        </Badge>
                                    )}

                                    {user.is_blocked && (
                                        <Badge variant="destructive" className="text-[11px]">
                                            Bloqueado ({user.strikes} pts)
                                        </Badge>
                                    )}

                                    {user.pending_mac_address ? (
                                        <Link href={`/admin/users/${user.id}/verify`}>
                                            <Badge className="bg-amber-500 text-[11px] text-white gap-1">
                                                <AlertTriangle className="h-3 w-3" /> Cambio MAC
                                            </Badge>
                                        </Link>
                                    ) : user.mac_address ? (
                                        <span className="font-mono text-[11px] text-neutral-500 truncate max-w-[160px]">
                                            MAC: {user.mac_address}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    {user.is_blocked && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1 rounded-lg border-amber-200 px-2.5 text-xs text-amber-600"
                                            onClick={() => handleUnlock(user.id)}
                                        >
                                            <Unlock className="h-3.5 w-3.5" /> Desbloquear
                                        </Button>
                                    )}
                                    {user.mac_address && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1 rounded-lg border-neutral-200 px-2.5 text-xs text-neutral-600"
                                            onClick={() => handleClearMac(user.id)}
                                        >
                                            <Laptop className="h-3.5 w-3.5" /> Reset MAC
                                        </Button>
                                    )}
                                    <Button asChild size="sm" variant="outline" className="h-8 gap-1 rounded-lg border-orange-200 px-2.5 text-xs text-orange-600">
                                        <Link href={`/admin/users/${user.id}/edit`}>
                                            <Edit3 className="h-3.5 w-3.5" /> Editar
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline" className="h-8 gap-1 rounded-lg border-blue-200 px-2.5 text-xs text-blue-600">
                                        <Link href={`/admin/users/${user.id}/verify`}>
                                            <FileCheck className="h-3.5 w-3.5" /> Validar
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={`h-8 gap-1 rounded-lg px-2.5 text-xs ${
                                            user.is_active ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-600'
                                        }`}
                                        onClick={() => handleToggleActive(user.id)}
                                    >
                                        {user.is_active ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                        {user.is_active ? 'Desactivar' : 'Activar'}
                                    </Button>
                                    <Button asChild size="sm" variant="outline" className="h-8 gap-1 rounded-lg px-2.5 text-xs">
                                        <Link href={`/admin/users/${user.id}/view`}>
                                            <Eye className="h-3.5 w-3.5" /> Detalles
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop & Laptop Table Card */}
                <Card className="hidden md:block overflow-hidden rounded-xl border-neutral-200/80 shadow-xs dark:border-neutral-800">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/70 dark:bg-neutral-900/50">
                                <TableHead className="w-12">ID</TableHead>
                                <TableHead>Nombre / Usuario</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Validación</TableHead>
                                <TableHead>MAC</TableHead>
                                <TableHead>Estatus</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center text-neutral-400"
                                    >
                                        No se encontraron usuarios con los criterios
                                        especificados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className={
                                            user.is_blocked
                                                ? 'bg-red-50/30 dark:bg-red-950/10'
                                                : ''
                                        }
                                    >
                                        <TableCell className="font-mono text-xs text-neutral-500">
                                            {user.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {user.name}
                                                {user.is_blocked && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="h-4 px-1 py-0 text-[10px]"
                                                    >
                                                        Bloqueado ({user.strikes} pts)
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-400">
                                                @{user.username}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-neutral-600 dark:text-neutral-300">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="text-xs font-semibold capitalize"
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_validated ? (
                                                <Badge
                                                    className="cursor-pointer bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                                                    onClick={() => handleUnapprove(user.id)}
                                                    title="Clic para revocar validación"
                                                >
                                                    Validado
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="cursor-pointer bg-amber-100 text-xs text-amber-800 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                                                    onClick={() => handleApprove(user.id)}
                                                    title="Clic para aprobar"
                                                >
                                                    Pendiente
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.pending_mac_address ? (
                                                <Link href={`/admin/users/${user.id}/verify`}>
                                                    <Badge className="cursor-pointer gap-1 bg-amber-500 text-xs text-white hover:bg-amber-600">
                                                        <AlertTriangle className="h-3 w-3" />{' '}
                                                        Cambio Pendiente
                                                    </Badge>
                                                </Link>
                                            ) : user.mac_address ? (
                                                <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                                                    <Laptop className="h-3.5 w-3.5 text-neutral-400" />
                                                    <span
                                                        className="max-w-[110px] truncate"
                                                        title={user.mac_address}
                                                    >
                                                        {user.mac_address}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400 italic">
                                                    Libre
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.is_active ? 'outline' : 'destructive'
                                                }
                                                className={
                                                    user.is_active
                                                        ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400'
                                                        : ''
                                                }
                                            >
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {user.is_blocked && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 gap-1.5 border-amber-200 px-2.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                        onClick={() => handleUnlock(user.id)}
                                                        title="Desbloquear alumno y resetear strikes"
                                                    >
                                                        <Unlock className="h-3.5 w-3.5" />
                                                        <span className="hidden text-[10px] font-bold tracking-widest uppercase xl:inline">
                                                            Desbloquear
                                                        </span>
                                                    </Button>
                                                )}

                                                {user.mac_address && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 gap-1.5 border-neutral-200 px-2.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                                                        onClick={() => handleClearMac(user.id)}
                                                        title="Desvincular MAC address"
                                                    >
                                                        <Laptop className="h-3.5 w-3.5" />
                                                        <span className="hidden text-[10px] font-bold tracking-widest uppercase xl:inline">
                                                            Reset MAC
                                                        </span>
                                                    </Button>
                                                )}

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5 border-orange-200 px-2.5 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                >
                                                    <Link
                                                        href={`/admin/users/${user.id}/edit`}
                                                        title="Editar Usuario"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                        <span className="hidden text-[10px] font-bold tracking-widest uppercase xl:inline">
                                                            Editar
                                                        </span>
                                                    </Link>
                                                </Button>

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5 border-blue-200 px-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                    title="Verificar Expediente y Documentación"
                                                >
                                                    <Link href={`/admin/users/${user.id}/verify`}>
                                                        <FileCheck className="h-3.5 w-3.5" />
                                                        <span className="hidden text-[10px] font-bold tracking-widest uppercase xl:inline">
                                                            Validar
                                                        </span>
                                                    </Link>
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={`h-8 gap-1.5 px-2.5 ${
                                                        user.is_active
                                                            ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                                                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                                    }`}
                                                    onClick={() => handleToggleActive(user.id)}
                                                    title={
                                                        user.is_active
                                                            ? 'Desactivar usuario'
                                                            : 'Activar usuario'
                                                    }
                                                >
                                                    {user.is_active ? (
                                                        <>
                                                            <XCircle className="h-3.5 w-3.5" />{' '}
                                                            <span className="hidden text-[10px] font-bold tracking-widest uppercase xl:inline">
                                                                Desactivar
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-3.5 w-3.5" />{' '}
                                                            <span className="hidden text-[10px] font-bold tracking-widest uppercase xl:inline">
                                                                Activar
                                                            </span>
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5 border-slate-200 px-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-700"
                                                >
                                                    <Link href={`/admin/users/${user.id}/view`}>
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span className="hidden text-[10px] font-bold tracking-widest uppercase xl:inline">
                                                            Detalles
                                                        </span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                            <span className="text-xs text-neutral-500">
                                Página {users.current_page} de {users.last_page}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {users.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        asChild={Boolean(link.url)}
                                        disabled={!link.url}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={`h-8 px-2.5 text-xs ${link.active ? 'bg-[#101E33] text-white' : ''}`}
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Mobile Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="flex md:hidden flex-col gap-2 items-center rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                        <span className="text-xs text-neutral-500">
                            Página {users.current_page} de {users.last_page}
                        </span>
                        <div className="flex flex-wrap justify-center gap-1">
                            {users.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    asChild={Boolean(link.url)}
                                    disabled={!link.url}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-8 px-2.5 text-xs ${link.active ? 'bg-[#101E33] text-white' : ''}`}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Alta Manual de Usuario */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Alta Manual de Usuario</DialogTitle>
                        <DialogDescription>
                            Crea una nueva cuenta de alumno, instructor o administrador.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new_nombre">Nombre(s) *</Label>
                                <Input
                                    id="new_nombre"
                                    required
                                    value={createForm.data.nombre}
                                    onChange={(e) =>
                                        createForm.setData('nombre', e.target.value)
                                    }
                                />
                                {createForm.errors.nombre && (
                                    <p className="text-xs text-red-500">
                                        {createForm.errors.nombre}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new_apellido">Apellidos *</Label>
                                <Input
                                    id="new_apellido"
                                    required
                                    value={createForm.data.apellido}
                                    onChange={(e) =>
                                        createForm.setData('apellido', e.target.value)
                                    }
                                />
                                {createForm.errors.apellido && (
                                    <p className="text-xs text-red-500">
                                        {createForm.errors.apellido}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new_username">Nombre de usuario *</Label>
                                <Input
                                    id="new_username"
                                    required
                                    value={createForm.data.username}
                                    onChange={(e) =>
                                        createForm.setData('username', e.target.value)
                                    }
                                />
                                {createForm.errors.username && (
                                    <p className="text-xs text-red-500">
                                        {createForm.errors.username}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new_email">Correo electrónico *</Label>
                                <Input
                                    id="new_email"
                                    type="email"
                                    required
                                    value={createForm.data.email}
                                    onChange={(e) =>
                                        createForm.setData('email', e.target.value)
                                    }
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-red-500">
                                        {createForm.errors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Rol asignado *</Label>
                            {roles.length > 0 ? (
                                <Select
                                    value={createForm.data.rol_id}
                                    onValueChange={(val) => {
                                        const found = roles.find(
                                            (r) => String(r.id) === val,
                                        );
                                        createForm.setData((prev) => ({
                                            ...prev,
                                            rol_id: val,
                                            role: found?.slug || found?.name || 'alumno',
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                <span className="capitalize">{r.name}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Select
                                    value={createForm.data.role}
                                    onValueChange={(val) =>
                                        createForm.setData('role', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alumno">Alumno</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            {(createForm.errors.rol_id || createForm.errors.role) && (
                                <p className="text-xs text-red-500">
                                    {createForm.errors.rol_id || createForm.errors.role}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new_password">Contraseña *</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    required
                                    value={createForm.data.password}
                                    onChange={(e) =>
                                        createForm.setData('password', e.target.value)
                                    }
                                />
                                {createForm.errors.password && (
                                    <p className="text-xs text-red-500">
                                        {createForm.errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new_password_confirmation">
                                    Confirmar contraseña *
                                </Label>
                                <Input
                                    id="new_password_confirmation"
                                    type="password"
                                    required
                                    value={createForm.data.password_confirmation}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="h-9 rounded-lg bg-[#FF6B52] text-white hover:bg-[#F0563C] font-semibold"
                            >
                                {createForm.processing ? 'Creando...' : 'Registrar Usuario'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Usuarios', href: '/admin/users' },
        ]}
    >
        {page}
    </AppLayout>
);
