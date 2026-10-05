import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Save, ArrowLeft, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
    id: number;
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    rol_id: number | null;
}

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    user: UserData;
    roles: Role[];
}

export default function EditUser({ user, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        username: user.username || '',
        email: user.email || '',
        rol_id: user.rol_id ? String(user.rol_id) : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                toast.success('Usuario actualizado correctamente');
            }
        });
    };

    return (
        <>
            <Head title={`Editar Usuario - ${user.nombre}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full">
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Editar Usuario
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Modifica los datos personales y de acceso del usuario.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="shadow-sm border-neutral-200/60 dark:border-neutral-800">
                        <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <UserCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Información de la Cuenta</CardTitle>
                                    <CardDescription>Actualiza el perfil y los roles de acceso.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="font-semibold">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        placeholder="Nombre del usuario"
                                        className={errors.nombre ? 'border-red-500' : ''}
                                    />
                                    {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido" className="font-semibold">Apellido</Label>
                                    <Input
                                        id="apellido"
                                        value={data.apellido}
                                        onChange={(e) => setData('apellido', e.target.value)}
                                        placeholder="Apellidos"
                                        className={errors.apellido ? 'border-red-500' : ''}
                                    />
                                    {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="font-semibold">Usuario</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Nombre de usuario (nickname)"
                                        className={errors.username ? 'border-red-500' : ''}
                                    />
                                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="rol_id" className="font-semibold">Rol del Sistema</Label>
                                    <Select 
                                        value={data.rol_id} 
                                        onValueChange={(val) => setData('rol_id', val)}
                                    >
                                        <SelectTrigger className={`w-full ${errors.rol_id ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Seleccione un rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((rol) => (
                                                <SelectItem key={rol.id} value={String(rol.id)}>
                                                    <span className="capitalize">{rol.name}</span> <span className="text-muted-foreground text-xs ml-1">({rol.slug})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.rol_id && <p className="text-sm text-red-500">{errors.rol_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 p-6 flex justify-end gap-3">
                            <Button type="button" variant="ghost" asChild>
                                <Link href="/admin/users">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-2 bg-brand-navy hover:bg-brand-blue">
                                <Save className="w-4 h-4" />
                                Guardar Cambios
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    );
}

EditUser.layout = (page: any) => <AppLayout breadcrumbs={[{ title: 'Usuarios', href: '/admin/users' }, { title: 'Editar Usuario' }]}>{page}</AppLayout>;
