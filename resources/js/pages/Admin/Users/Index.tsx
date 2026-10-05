import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Users, 
    CheckCircle, 
    XCircle, 
    Eye, 
    ShieldAlert, 
    Check, 
    X, 
    Search, 
    FileCheck, 
    Unlock, 
    Laptop, 
    AlertTriangle,
    Edit3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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
}

export default function UsersIndex({ users, activeFilter = 'enable', searchTerm = '' }: UsersProps) {
    const [search, setSearch] = useState(searchTerm);

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
        if (confirm('¿Desbloquear la cuenta de este usuario y reiniciar sus infracciones a 0?')) {
            router.post(`/admin/users/${id}/unlock`);
        }
    };

    const handleClearMac = (id: number) => {
        if (confirm('¿Desvincular la dirección MAC registrada para este alumno?')) {
            router.post(`/admin/users/${id}/clear-mac`);
        }
    };

    return (
        <>
            <Head title="Gestión de Usuarios" />

            <div className="p-6 max-w-8xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Administración de Usuarios
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Control de cuentas ({users.total} en total), validación de expedientes y seguridad de hardware.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl self-start">
                        <Button
                            asChild
                            variant={activeFilter === 'enable' ? 'default' : 'ghost'}
                            size="sm"
                            className={activeFilter === 'enable' ? 'bg-blue-600 text-white' : ''}
                        >
                            <Link href="/admin/users/enable">Activos</Link>
                        </Button>
                        <Button
                            asChild
                            variant={activeFilter === 'disable' ? 'default' : 'ghost'}
                            size="sm"
                            className={activeFilter === 'disable' ? 'bg-blue-600 text-white' : ''}
                        >
                            <Link href="/admin/users/disable">Inactivos</Link>
                        </Button>
                        <Button
                            asChild
                            variant={activeFilter === 'blocked' ? 'default' : 'ghost'}
                            size="sm"
                            className={activeFilter === 'blocked' ? 'bg-blue-600 text-white' : ''}
                        >
                            <Link href="/admin/users/blocked">Bloqueados</Link>
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                        <Input
                            placeholder="Buscar por nombre, correo, usuario o folio..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button type="submit" variant="secondary" size="default">
                        Buscar
                    </Button>
                    {searchTerm && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setSearch('');
                                router.get(`/admin/users/${activeFilter}`);
                            }}
                        >
                            Limpiar
                        </Button>
                    )}
                </form>

                <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/50 dark:bg-neutral-900/50">
                                <TableHead className="w-12">ID</TableHead>
                                <TableHead>Nombre / Usuario</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Validación</TableHead>
                                <TableHead>Dispositivo MAC</TableHead>
                                <TableHead>Estatus</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-neutral-400">
                                        No se encontraron usuarios con los criterios especificados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id} className={user.is_blocked ? 'bg-red-50/30 dark:bg-red-950/10' : ''}>
                                        <TableCell className="font-mono text-xs text-neutral-500">{user.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                                {user.name}
                                                {user.is_blocked && (
                                                    <Badge variant="destructive" className="text-[10px] h-4 px-1 py-0">
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
                                            <Badge variant="outline" className="capitalize text-xs font-semibold">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_validated ? (
                                                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">
                                                    Validado
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs">
                                                    Pendiente
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.pending_mac_address ? (
                                                <Link href={`/admin/users/${user.id}/verify`}>
                                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs cursor-pointer gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Cambio Pendiente
                                                    </Badge>
                                                </Link>
                                            ) : user.mac_address ? (
                                                <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                                                    <Laptop className="w-3.5 h-3.5 text-neutral-400" />
                                                    <span className="truncate max-w-[110px]" title={user.mac_address}>
                                                        {user.mac_address}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400 italic">Libre</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? "outline" : "destructive"} className={user.is_active ? "border-emerald-300 text-emerald-700 dark:text-emerald-400" : ""}>
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {user.is_blocked && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2.5 gap-1.5 text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50"
                                                        onClick={() => handleUnlock(user.id)}
                                                        title="Desbloquear alumno y resetear strikes"
                                                    >
                                                        <Unlock className="w-3.5 h-3.5" />
                                                        <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Desbloquear</span>
                                                    </Button>
                                                )}

                                                {user.mac_address && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2.5 gap-1.5 text-neutral-500 hover:text-red-600 border-neutral-200 hover:bg-red-50"
                                                        onClick={() => handleClearMac(user.id)}
                                                        title="Desvincular MAC address"
                                                    >
                                                        <Laptop className="w-3.5 h-3.5" />
                                                        <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Reset MAC</span>
                                                    </Button>
                                                )}
                                                
                                                <Button asChild size="sm" variant="outline" className="h-8 px-2.5 gap-1.5 text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50">
                                                    <Link href={`/admin/users/${user.id}/edit`} title="Editar Usuario">
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Editar</span>
                                                    </Link>
                                                </Button>

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2.5 gap-1.5 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                                    title="Verificar Expediente y Documentación"
                                                >
                                                    <Link href={`/admin/users/${user.id}/verify`}>
                                                        <FileCheck className="w-3.5 h-3.5" />
                                                        <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Validar</span>
                                                    </Link>
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={`h-8 px-2.5 gap-1.5 ${user.is_active ? 'text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                                                    onClick={() => handleToggleActive(user.id)}
                                                    title={user.is_active ? "Desactivar usuario" : "Activar usuario"}
                                                >
                                                    {user.is_active ? (
                                                        <><XCircle className="w-3.5 h-3.5" /> <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Desactivar</span></>
                                                    ) : (
                                                        <><CheckCircle className="w-3.5 h-3.5" /> <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Activar</span></>
                                                    )}
                                                </Button>

                                                <Button asChild size="sm" variant="outline" className="h-8 px-2.5 gap-1.5 text-slate-600 hover:text-slate-700 border-slate-200 hover:bg-slate-50">
                                                    <Link href={`/admin/users/${user.id}/view`}>
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Detalles</span>
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
                        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <span className="text-xs text-neutral-500">
                                Mostrando página {users.current_page} de {users.last_page}
                            </span>
                            <div className="flex gap-1">
                                {users.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        asChild={Boolean(link.url)}
                                        disabled={!link.url}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 px-3 text-xs"
                                    >
                                        {link.url ? (
                                            <Link 
                                                href={link.url} 
                                                dangerouslySetInnerHTML={{ __html: link.label }} 
                                            />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}

UsersIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Usuarios', href: '/admin/users' },
    ]}>
        {page}
    </AppLayout>
);
