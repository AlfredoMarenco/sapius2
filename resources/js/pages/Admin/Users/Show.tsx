import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Shield, AlertTriangle, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';

interface UserDetailProps {
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
        phone: string | null;
        folio: string | null;
        university: string | null;
        specialty: string | null;
        role: string;
        is_active: boolean;
        is_validated: boolean;
        is_blocked: boolean;
        is_v2_pilot?: boolean;
        strikes: number;
        created_at: string;
    };
    enrollments: Array<{
        id: number;
        course_title: string;
        status: string;
        created_at: string;
    }>;
}

export default function UserShow({ user, enrollments = [] }: UserDetailProps) {
    return (
        <>
            <Head title={`Expediente: ${user.name}`} />

            <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900">
                        <Link href="/admin/users">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Lista de Usuarios
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">ID #{user.id}</Badge>
                        <Badge className={`capitalize ${user.role === 'admin' ? 'bg-[#101E33] text-white' : 'bg-blue-600 text-white'}`}>
                            {user.role}
                        </Badge>
                        {user.role === 'alumno' && (
                            <Button
                                size="sm"
                                variant={user.is_v2_pilot ? 'default' : 'outline'}
                                className={`h-7 gap-1.5 rounded-full px-3 text-xs font-semibold ${
                                    user.is_v2_pilot
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                                }`}
                                onClick={() => router.post(`/admin/users/${user.id}/toggle-v2-pilot`, {}, { preserveScroll: true })}
                            >
                                <Rocket className="h-3.5 w-3.5" />
                                {user.is_v2_pilot ? 'Piloto V2 Activo' : 'Activar Piloto V2'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* User Profile Card (4 cols en lg/xl) */}
                    <Card className="lg:col-span-4 p-6 space-y-6 border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#101E33] to-[#192B47] text-white flex items-center justify-center text-3xl font-black mb-3 shadow-md border-2 border-white/20">
                                {user.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-[#101E33] dark:text-neutral-100">{user.name}</h2>
                            <p className="text-xs font-semibold text-neutral-400">@{user.username}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    user.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    <span className={`size-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {user.is_active ? 'Usuario Activo' : 'Inactivo'}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    user.is_validated ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                    {user.is_validated ? 'Validado' : 'Sin Validar'}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <span className="text-slate-400 block font-medium">Correo Electrónico</span>
                                <span className="font-bold text-slate-800 dark:text-neutral-200 break-all">{user.email}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <span className="text-slate-400 block font-medium">Teléfono / WhatsApp</span>
                                <span className="font-bold text-slate-800 dark:text-neutral-200">{user.phone || 'No especificado'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <span className="text-slate-400 block font-medium">Folio CENEVAL</span>
                                <span className="font-bold text-slate-800 dark:text-neutral-200">{user.folio || 'N/A'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <span className="text-slate-400 block font-medium">Universidad</span>
                                <span className="font-bold text-slate-800 dark:text-neutral-200">{user.university || 'N/A'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <span className="text-slate-400 block font-medium">Especialidad</span>
                                <span className="font-bold text-slate-800 dark:text-neutral-200">{user.specialty || 'N/A'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <span className="text-slate-400 block font-medium">Fecha de Registro</span>
                                <span className="font-bold text-slate-800 dark:text-neutral-200">{user.created_at}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Enrollments & Activity (8 cols en lg/xl) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Security Card */}
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#101E33] dark:text-neutral-100">
                                    <Shield className="w-5 h-5 text-[#FF6B52]" />
                                    Seguridad y Protección de Contenido (Anti-Cheat)
                                </CardTitle>
                                <CardDescription>Monitoreo en tiempo real de strikes y estado de sesión en Electron</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-neutral-100 mb-1">
                                            Nivel de Infracciones Acumuladas
                                        </p>
                                        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                                            Infracciones por atajos bloqueados, capturas de pantalla o apertura de DevTools. Al alcanzar 100 puntos, la cuenta se bloquea automáticamente.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                        <div className={`flex items-center justify-center min-w-14 h-11 px-3.5 rounded-xl font-black text-lg shadow-xs ${
                                            user.strikes >= 100 ? 'bg-red-100 text-red-700 border border-red-300' :
                                            user.strikes >= 50 ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                                            user.strikes > 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                            'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                        }`}>
                                            {user.strikes}
                                        </div>
                                        <span className="text-slate-400 font-bold text-xs whitespace-nowrap">/ 100 pts</span>
                                    </div>
                                </div>

                                {user.is_blocked && (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-red-800 dark:text-red-400">Cuenta Bloqueada por Seguridad</h4>
                                                <p className="text-xs text-red-700/90 dark:text-red-300/80 mt-1">
                                                    El usuario excedió el límite de strikes y el sistema Anti-Cheat ha cerrado su sesión automáticamente.
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="destructive"
                                            className="shrink-0 self-start sm:self-auto font-bold rounded-xl"
                                            onClick={() => {
                                                if(confirm('¿Estás seguro de desbloquear la cuenta de este usuario? Sus strikes regresarán a 0.')) {
                                                    router.post(`/admin/users/${user.id}/unlock`);
                                                }
                                            }}
                                        >
                                            Desbloquear Cuenta
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cursos e Inscripciones */}
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-[#101E33] dark:text-neutral-100">
                                    Cursos y Cohortes Inscritas
                                </CardTitle>
                                <CardDescription>Historial de programas asignados, adquiridos o cursados</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {enrollments.length === 0 ? (
                                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                                        <p className="text-sm font-semibold text-slate-500">
                                            El usuario no cuenta con inscripciones activas actualmente.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {enrollments.map((e) => (
                                            <div
                                                key={e.id}
                                                className="flex flex-col justify-between p-4 rounded-2xl border border-slate-100 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-900 transition-colors shadow-xs"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[11px] font-bold text-slate-400">Inscripción #{e.id}</span>
                                                        <Badge variant={e.status === 'si' ? 'default' : 'secondary'} className={e.status === 'si' ? 'bg-emerald-600' : 'bg-amber-500 text-white'}>
                                                            {e.status === 'si' ? 'Aprobado' : 'Pendiente'}
                                                        </Badge>
                                                    </div>
                                                    <h4 className="font-bold text-sm text-[#101E33] dark:text-neutral-100 line-clamp-2">
                                                        {e.course_title}
                                                    </h4>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
                                                    Inscrito: {e.created_at}
                                                </p>
                                            </div>
                                        ))}
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

UserShow.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Usuarios', href: '/admin/users' },
        { title: 'Expediente', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
