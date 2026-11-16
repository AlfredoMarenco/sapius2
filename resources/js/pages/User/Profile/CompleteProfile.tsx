import { Head, router } from '@inertiajs/react';
import {
    UserCheck,
    Save,
    FileText,
    Download,
    Image as ImageIcon,
    CheckCircle2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface UserProfile {
    id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
    folio: string | null;
    university: string | null;
    specialty: string | null;
    sustentation_date: string | null;
    foto?: string | null;
    photo?: string | null;
    documento_identificacion?: string | null;
    pase_ingreso?: string | null;
    is_validated?: boolean;
}

interface CompleteProfileProps {
    user: UserProfile;
    role: string;
}

function getBaseFilename(path?: string | null): string {
    if (!path) {
return '';
}

    return path.split('/').pop() || path;
}

export default function CompleteProfile({ user }: CompleteProfileProps) {
    const [nombre, setNombre] = useState(user.first_name || '');
    const [apellido, setApellido] = useState(user.last_name || '');
    const [telefono, setTelefono] = useState(user.phone || '');
    const [folio, setFolio] = useState(user.folio || '');
    const [universidadProcedencia, setUniversidadProcedencia] = useState(
        user.university || '',
    );
    const [especialidad, setEspecialidad] = useState(user.specialty || '');
    const [fechaSustentacion, setFechaSustentacion] = useState(
        user.sustentation_date ? String(user.sustentation_date).split('T')[0] : '',
    );

    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null);
    const [documentoFile, setDocumentoFile] = useState<File | null>(null);
    const [paseFile, setPaseFile] = useState<File | null>(null);

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const existingFoto = user.foto || user.photo || null;
    const existingFotoFilename = getBaseFilename(existingFoto);
    const existingFotoUrl = existingFoto
        ? existingFoto.startsWith('http')
            ? existingFoto
            : `/alumno/users/image/${existingFotoFilename}`
        : null;

    const existingDocFilename = getBaseFilename(user.documento_identificacion);
    const existingPaseFilename = getBaseFilename(user.pase_ingreso);

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFotoFile(file);

        if (file) {
            setFotoPreviewUrl(URL.createObjectURL(file));
        } else {
            setFotoPreviewUrl(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('nombre', nombre);
        formData.append('apellido', apellido);
        formData.append('telefono', telefono);
        formData.append('folio', folio);
        formData.append('universidad_procedencia', universidadProcedencia);
        formData.append('especialidad', especialidad);
        formData.append('fecha_sustentacion', fechaSustentacion);

        if (fotoFile) {
            formData.append('foto', fotoFile);
        }

        if (documentoFile) {
            formData.append('documento_identificacion', documentoFile);
        }

        if (paseFile) {
            formData.append('pase_ingreso', paseFile);
        }

        setProcessing(true);
        setErrors({});

        router.post(`/alumno/users/${user.id}/updateComplete`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Expediente actualizado correctamente');
            },
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                toast.error('Revisa los campos marcados en el formulario.');
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <>
            <Head title="Completar Perfil" />

            <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                <div className="space-y-2 text-center">
                    <div className="mb-2 inline-flex rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/40">
                        <UserCheck className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Completa tus Datos de Alumno
                    </h1>
                    <p className="mx-auto max-w-md text-sm text-neutral-500">
                        Para habilitar el seguimiento académico, validación de identidad y
                        emisión de constancias, completa tu expediente.
                    </p>
                </div>

                <Card className="border-neutral-200/80 shadow-md dark:border-neutral-800">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-xl font-bold">
                                        Datos Personales, Académicos y Documentos
                                    </CardTitle>
                                    <CardDescription>
                                        Los campos marcados con (*) son obligatorios
                                    </CardDescription>
                                </div>
                                {user.is_validated !== undefined && (
                                    <Badge
                                        className={
                                            user.is_validated
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-amber-100 text-amber-800'
                                        }
                                    >
                                        {user.is_validated
                                            ? 'Expediente Validado'
                                            : 'Validación Pendiente'}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nombre">Nombre(s) *</Label>
                                    <Input
                                        id="nombre"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                    {errors.nombre && (
                                        <p className="text-xs text-red-500">{errors.nombre}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="apellido">Apellidos *</Label>
                                    <Input
                                        id="apellido"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        required
                                    />
                                    {errors.apellido && (
                                        <p className="text-xs text-red-500">
                                            {errors.apellido}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="telefono">Teléfono / WhatsApp *</Label>
                                    <Input
                                        id="telefono"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="10 dígitos"
                                        required
                                    />
                                    {errors.telefono && (
                                        <p className="text-xs text-red-500">
                                            {errors.telefono}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="folio">Folio CENEVAL / Registro</Label>
                                    <Input
                                        id="folio"
                                        value={folio}
                                        onChange={(e) => setFolio(e.target.value)}
                                        placeholder="Ej. 123456789"
                                    />
                                    {errors.folio && (
                                        <p className="text-xs text-red-500">{errors.folio}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="universidad">
                                        Universidad de Procedencia
                                    </Label>
                                    <Input
                                        id="universidad"
                                        value={universidadProcedencia}
                                        onChange={(e) =>
                                            setUniversidadProcedencia(e.target.value)
                                        }
                                        placeholder="Ej. UNAM, UANL, UADY..."
                                    />
                                    {errors.universidad_procedencia && (
                                        <p className="text-xs text-red-500">
                                            {errors.universidad_procedencia}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="especialidad">
                                        Carrera / Especialidad
                                    </Label>
                                    <Input
                                        id="especialidad"
                                        value={especialidad}
                                        onChange={(e) => setEspecialidad(e.target.value)}
                                        placeholder="Ej. Médico Cirujano"
                                    />
                                    {errors.especialidad && (
                                        <p className="text-xs text-red-500">
                                            {errors.especialidad}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="fecha_sustentacion">
                                    Fecha Programada de Examen
                                </Label>
                                <Input
                                    id="fecha_sustentacion"
                                    type="date"
                                    value={fechaSustentacion}
                                    onChange={(e) => setFechaSustentacion(e.target.value)}
                                />
                                {errors.fecha_sustentacion && (
                                    <p className="text-xs text-red-500">
                                        {errors.fecha_sustentacion}
                                    </p>
                                )}
                            </div>

                            {/* Documentación & Fotografía */}
                            <div className="space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                    Fotografía y Documentación Oficial
                                </h3>

                                {/* Foto de Perfil */}
                                <div className="flex flex-col gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:flex-row sm:items-center dark:border-neutral-800 dark:bg-neutral-900/40">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                                        {fotoPreviewUrl || existingFotoUrl ? (
                                            <img
                                                src={fotoPreviewUrl || existingFotoUrl || ''}
                                                alt="Foto de alumno"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-neutral-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Label htmlFor="foto" className="font-semibold">
                                                Fotografía del Alumno (JPG / PNG)
                                            </Label>
                                            {existingFotoUrl && !fotoFile && (
                                                <a
                                                    href={existingFotoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Ver foto actual
                                                </a>
                                            )}
                                        </div>
                                        <Input
                                            id="foto"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFotoChange}
                                        />
                                        {errors.foto && (
                                            <p className="text-xs text-red-500">
                                                {errors.foto}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Documento de Identificación (PDF) */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label
                                                htmlFor="documento_identificacion"
                                                className="flex items-center gap-1.5 font-semibold"
                                            >
                                                <FileText className="h-4 w-4 text-purple-600" />
                                                Identificación Oficial (PDF)
                                            </Label>
                                            {existingDocFilename && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                                                >
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Cargado
                                                </Badge>
                                            )}
                                        </div>
                                        <Input
                                            id="documento_identificacion"
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            onChange={(e) =>
                                                setDocumentoFile(
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        {documentoFile && (
                                            <p className="truncate text-xs font-medium text-blue-600">
                                                Nuevo archivo: {documentoFile.name}
                                            </p>
                                        )}
                                        {existingDocFilename && (
                                            <a
                                                href={`/alumno/users/documento/${existingDocFilename}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Descargar identificación actual
                                            </a>
                                        )}
                                        {errors.documento_identificacion && (
                                            <p className="text-xs text-red-500">
                                                {errors.documento_identificacion}
                                            </p>
                                        )}
                                    </div>

                                    {/* Pase de Ingreso (PDF) */}
                                    <div className="space-y-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label
                                                htmlFor="pase_ingreso"
                                                className="flex items-center gap-1.5 font-semibold"
                                            >
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                Pase de Ingreso (PDF)
                                            </Label>
                                            {existingPaseFilename && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                                                >
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Cargado
                                                </Badge>
                                            )}
                                        </div>
                                        <Input
                                            id="pase_ingreso"
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            onChange={(e) =>
                                                setPaseFile(e.target.files?.[0] || null)
                                            }
                                        />
                                        {paseFile && (
                                            <p className="truncate text-xs font-medium text-blue-600">
                                                Nuevo archivo: {paseFile.name}
                                            </p>
                                        )}
                                        {existingPaseFilename && (
                                            <a
                                                href={`/alumno/users/pase/${existingPaseFilename}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Descargar pase actual
                                            </a>
                                        )}
                                        {errors.pase_ingreso && (
                                            <p className="text-xs text-red-500">
                                                {errors.pase_ingreso}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="border-t border-neutral-100 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/30">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 w-full bg-blue-600 font-medium text-white hover:bg-blue-700"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {processing
                                    ? 'Guardando datos...'
                                    : 'Guardar y Continuar a la Plataforma'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}

CompleteProfile.layout = (page: ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Alumno', href: '/alumno' },
            { title: 'Completar Perfil', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
