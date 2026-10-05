import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Phone, BookOpen, GraduationCap, Award, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-3 text-neutral-600">
                        <Link href="/admin/users">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Usuarios
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Profile Card */}
                    <Card className="md:col-span-1 p-6 space-y-6 border-neutral-200/80 dark:border-neutral-800 shadow-sm text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                                {user.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{user.name}</h2>
                            <p className="text-xs text-neutral-400">@{user.username}</p>
                            <Badge className="mt-2 capitalize bg-blue-600 text-white">{user.role}</Badge>
                        </div>

                        <Separator />

                        <div className="space-y-3 text-left text-xs">
                            <div>
                                <span className="text-neutral-400 block">Correo Electrónico</span>
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{user.email}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">Teléfono</span>
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{user.phone || 'No especificado'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">Folio CENEVAL</span>
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{user.folio || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">Universidad</span>
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{user.university || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">Especialidad</span>
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{user.specialty || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">Fecha de Registro</span>
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{user.created_at}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Enrollments & Activity */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Security Card */}
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                    Seguridad y Anti-Cheat
                                </CardTitle>
                                <CardDescription>Estado de la cuenta y conteo de infracciones</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                                            Nivel de Infracciones (Strikes)
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            Los strikes se acumulan por intentos de captura de pantalla, cambio de pestañas o clic derecho. Al llegar a 3, la cuenta se bloquea.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                                            user.strikes >= 3 ? 'bg-red-100 text-red-600' :
                                            user.strikes === 2 ? 'bg-orange-100 text-orange-600' :
                                            user.strikes === 1 ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {user.strikes}
                                        </div>
                                        <span className="text-neutral-400 font-medium">/ 3</span>
                                    </div>
                                </div>

                                {user.is_blocked && (
                                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-red-700 dark:text-red-400">Cuenta Bloqueada por Seguridad</h4>
                                                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                                                    El usuario excedió el límite de strikes y el sistema Anti-Cheat ha cerrado su sesión automáticamente.
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="destructive"
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

                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Cursos e Inscripciones</CardTitle>
                                <CardDescription>Historial de programas adquiridos por el usuario</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {enrollments.length === 0 ? (
                                    <p className="text-sm text-neutral-400 italic py-4 text-center">
                                        El usuario no cuenta con inscripciones activas.
                                    </p>
                                ) : (
                                    enrollments.map((e) => (
                                        <div
                                            key={e.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50"
                                        >
                                            <div>
                                                <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                                    {e.course_title}
                                                </h4>
                                                <p className="text-xs text-neutral-400 mt-0.5">
                                                    Inscrito el: {e.created_at}
                                                </p>
                                            </div>
                                            <Badge variant={e.status === 'si' ? 'default' : 'secondary'} className={e.status === 'si' ? 'bg-emerald-600' : 'bg-amber-500 text-white'}>
                                                {e.status === 'si' ? 'Aprobado' : 'Pendiente'}
                                            </Badge>
                                        </div>
                                    ))
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
