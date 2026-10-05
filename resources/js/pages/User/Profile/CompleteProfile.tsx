import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { UserCheck, AlertCircle, Save, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserProfile {
    id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
    folio: string | null;
    university: string | null;
    specialty: string | null;
    sustentation_date: string | null;
}

interface CompleteProfileProps {
    user: UserProfile;
    role: string;
}

export default function CompleteProfile({ user, role }: CompleteProfileProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nombre: user.first_name || '',
        apellido: user.last_name || '',
        telefono: user.phone || '',
        folio: user.folio || '',
        universidad_procedencia: user.university || '',
        especialidad: user.specialty || '',
        fecha_sustentacion: user.sustentation_date || '',
        foto: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/alumno/users/${user.id}/updateComplete`);
    };

    return (
        <>
            <Head title="Completar Perfil" />

            <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 mb-2">
                        <UserCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Completa tus Datos de Alumno
                    </h1>
                    <p className="text-neutral-500 text-sm max-w-md mx-auto">
                        Para habilitar el seguimiento académico y emisión de constancias, por favor completa tu perfil.
                    </p>
                </div>

                <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-md">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Datos Personales y Académicos</CardTitle>
                            <CardDescription>Los campos marcados con (*) son obligatorios</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nombre">Nombre(s) *</Label>
                                    <Input
                                        id="nombre"
                                        value={data.nombre}
                                        onChange={e => setData('nombre', e.target.value)}
                                        required
                                    />
                                    {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="apellido">Apellidos *</Label>
                                    <Input
                                        id="apellido"
                                        value={data.apellido}
                                        onChange={e => setData('apellido', e.target.value)}
                                        required
                                    />
                                    {errors.apellido && <p className="text-xs text-red-500">{errors.apellido}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="telefono">Teléfono / WhatsApp *</Label>
                                    <Input
                                        id="telefono"
                                        value={data.telefono}
                                        onChange={e => setData('telefono', e.target.value)}
                                        placeholder="10 dígitos"
                                        required
                                    />
                                    {errors.telefono && <p className="text-xs text-red-500">{errors.telefono}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="folio">Folio CENEVAL / Registro</Label>
                                    <Input
                                        id="folio"
                                        value={data.folio}
                                        onChange={e => setData('folio', e.target.value)}
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="universidad">Universidad de Procedencia</Label>
                                    <Input
                                        id="universidad"
                                        value={data.universidad_procedencia}
                                        onChange={e => setData('universidad_procedencia', e.target.value)}
                                        placeholder="Ej. UNAM, UANL, etc."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="especialidad">Carrera / Especialidad</Label>
                                    <Input
                                        id="especialidad"
                                        value={data.especialidad}
                                        onChange={e => setData('especialidad', e.target.value)}
                                        placeholder="Ej. Médico Cirujano"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="fecha_sustentacion">Fecha Programada de Examen</Label>
                                    <Input
                                        id="fecha_sustentacion"
                                        type="date"
                                        value={data.fecha_sustentacion}
                                        onChange={e => setData('fecha_sustentacion', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="foto">Foto de Perfil (Opcional)</Label>
                                    <Input
                                        id="foto"
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('foto', e.target.files ? e.target.files[0] : null)}
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Guardando datos...' : 'Guardar y Continuar a la Plataforma'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}

CompleteProfile.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Alumno', href: '/alumno' },
        { title: 'Completar Perfil', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
