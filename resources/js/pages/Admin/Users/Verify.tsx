import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    UserCheck, 
    UserX, 
    FileText, 
    Download, 
    Check, 
    X, 
    ArrowLeft, 
    ShieldAlert, 
    Laptop, 
    Unlock, 
    Calendar, 
    GraduationCap, 
    Building2, 
    Phone, 
    Mail, 
    User as UserIcon,
    AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VerifyUserProps {
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
        role: string;
        phone: string | null;
        fecha_sustentacion: string | null;
        folio: string | null;
        university: string | null;
        specialty: string | null;
        is_validated: boolean;
        is_active: boolean;
        is_blocked: boolean;
        strikes: number;
        foto: string | null;
        documento_identificacion: string | null;
        pase_ingreso: string | null;
        mac_address: string | null;
        pending_mac_address: string | null;
        created_at: string | null;
    };
}

export default function UserVerify({ user }: VerifyUserProps) {
    const handleApprove = () => {
        router.post('/admin/users/approve', { id: user.id });
    };

    const handleUnapprove = () => {
        router.post('/admin/users/unapprove', { id: user.id });
    };

    const handleUnlock = () => {
        router.post(`/admin/users/${user.id}/unlock`);
    };

    const handleClearMac = () => {
        if (confirm('¿Desvincular la dirección MAC de este usuario?')) {
            router.post(`/admin/users/${user.id}/clear-mac`);
        }
    };

    const handleApproveMac = () => {
        router.post(`/admin/users/${user.id}/approve-mac`);
    };

    const handleRejectMac = () => {
        router.post(`/admin/users/${user.id}/reject-mac`);
    };

    return (
        <>
            <Head title={`Verificar Alumno - ${user.name}`} />

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full">
                            <Link href="/admin/users">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Verificación de Expediente
                                </h1>
                                {user.is_validated ? (
                                    <Badge className="bg-emerald-600 text-white text-xs">Validado</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">Pendiente de Validación</Badge>
                                )}
                                {user.is_blocked && (
                                    <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                                )}
                            </div>
                            <p className="text-sm text-neutral-500 mt-0.5">
                                Expediente académico, documentos oficiales de registro y seguridad de hardware.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {user.is_validated ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleUnapprove}
                                className="gap-1.5"
                            >
                                <X className="w-4 h-4" /> Revocar Validación
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleApprove}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            >
                                <Check className="w-4 h-4" /> Aprobar y Validar Alumno
                            </Button>
                        )}
                        {user.is_blocked && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUnlock}
                                className="text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50 gap-1.5"
                            >
                                <Unlock className="w-4 h-4" /> Desbloquear Cuenta
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Col 1: Photo & General ID */}
                    <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm md:col-span-1">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-32 h-32 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center relative shadow-sm">
                                {user.foto ? (
                                    <img
                                        src={`/admin/users/image/${user.foto}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <UserIcon className="w-12 h-12 text-neutral-400" />
                                )}
                            </div>
                            <CardTitle className="text-lg mt-3">{user.name}</CardTitle>
                            <CardDescription className="text-xs">@{user.username} • {user.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2 text-sm">
                            <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                                <Mail className="w-4 h-4 shrink-0 text-neutral-400" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                                <Phone className="w-4 h-4 shrink-0 text-neutral-400" />
                                <span>{user.phone || 'Teléfono no registrado'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                                <Calendar className="w-4 h-4 shrink-0 text-neutral-400" />
                                <span>Registrado: {user.created_at || 'N/A'}</span>
                            </div>

                            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                                    Seguridad & Strikes
                                </span>
                                <div className="flex items-center justify-between text-xs bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                    <span className="text-neutral-600 dark:text-neutral-400">Puntos de infracción:</span>
                                    <span className={`font-bold ${user.strikes >= 100 ? 'text-red-600' : user.strikes > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {user.strikes} / 100 pts
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Col 2: Academic Details & Digital Documents */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Academic Data */}
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-blue-600" /> Datos Académicos y Registro
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <span className="text-xs text-neutral-500 block mb-0.5">Folio Oficial</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                        {user.folio || 'Sin folio registrado'}
                                    </span>
                                </div>

                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <span className="text-xs text-neutral-500 block mb-0.5">Fecha de Sustentación</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                        {user.fecha_sustentacion || 'Pendiente'}
                                    </span>
                                </div>

                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <span className="text-xs text-neutral-500 block mb-0.5">Universidad de Procedencia</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                        {user.university || 'No especificada'}
                                    </span>
                                </div>

                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <span className="text-xs text-neutral-500 block mb-0.5">Especialidad</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                        {user.specialty || 'No especificada'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Digital Documents */}
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" /> Documentación Digital
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Archivos cargados por el alumno durante el proceso de inscripción.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Pase de Ingreso */}
                                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold block text-neutral-900 dark:text-neutral-100">
                                                Pase de Ingreso
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                {user.pase_ingreso ? 'Documento cargado' : 'No presentado'}
                                            </span>
                                        </div>
                                    </div>
                                    {user.pase_ingreso ? (
                                        <Button asChild size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                                            <a href={`/admin/users/pase/${user.pase_ingreso}`} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-3.5 h-3.5" /> Descargar / Ver Pase
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" disabled className="w-full text-xs opacity-50">
                                            Sin archivo
                                        </Button>
                                    )}
                                </div>

                                {/* Identificación Oficial */}
                                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold block text-neutral-900 dark:text-neutral-100">
                                                Identificación Oficial
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                {user.documento_identificacion ? 'Documento cargado' : 'No presentado'}
                                            </span>
                                        </div>
                                    </div>
                                    {user.documento_identificacion ? (
                                        <Button asChild size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                                            <a href={`/admin/users/documento/${user.documento_identificacion}`} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-3.5 h-3.5" /> Descargar / Ver Identificación
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" disabled className="w-full text-xs opacity-50">
                                            Sin archivo
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* MAC Address Security Management */}
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Laptop className="w-4 h-4 text-purple-600" /> Control de Dispositivos (Dirección MAC)
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Control del hardware autorizado para acceder a simuladores y exámenes en la aplicación de escritorio.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <div>
                                        <span className="text-xs text-neutral-500 block mb-0.5">MAC Vinculada:</span>
                                        <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            {user.mac_address || 'Sin dispositivo vinculado (acceso libre inicial)'}
                                        </span>
                                    </div>
                                    {user.mac_address && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleClearMac}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs shrink-0"
                                        >
                                            Desvincular MAC
                                        </Button>
                                    )}
                                </div>

                                {user.pending_mac_address && (
                                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Solicitud de cambio de dispositivo
                                            </div>
                                            <span className="font-mono text-xs text-amber-900 dark:text-amber-200 block mt-0.5">
                                                {user.pending_mac_address}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                onClick={handleApproveMac}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                                            >
                                                Aprobar MAC
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleRejectMac}
                                                className="text-neutral-600 hover:text-red-600 text-xs h-8 px-3"
                                            >
                                                Rechazar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

UserVerify.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Usuarios', href: '/admin/users' },
        { title: 'Verificar Alumno', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
