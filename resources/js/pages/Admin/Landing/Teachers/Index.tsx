import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { LandingAdminNav } from '../LandingAdminNav';

interface Teacher {
    id: number;
    name: string;
    description: string;
    img: string;
    position: number;
    active: boolean;
}

export default function Index({ teachers }: { teachers: Teacher[] }) {
    const [isEditing, setIsEditing] = useState<Teacher | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
        _method: 'POST',
        name: '',
        description: '',
        img: null as any,
        position: 1,
        active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing 
            ? `/admin/landing/teachers/${isEditing.id}?_method=PUT` 
            : '/admin/landing/teachers';
        
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsOpen(false);
                setIsEditing(null);
                reset();
            },
        });
    };

    const handleEdit = (teacher: Teacher) => {
        setIsEditing(teacher);
        setData({
            _method: 'PUT',
            name: teacher.name,
            description: teacher.description,
            img: null,
            position: teacher.position,
            active: teacher.active,
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este docente?')) {
            destroy(`/admin/landing/teachers/${id}`);
        }
    };

    return (
        <>
            <Head title="Gestión de Docentes Sapius" />


            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-serif">Administración del Sitio</h1>
                        <p className="text-gray-500">Nuestros expertos docentes que forman parte del equipo.</p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setIsEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-orange hover:bg-brand-orange/90 rounded-full px-6">
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Docente
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{isEditing ? 'Editar Docente' : 'Crear Nuevo Docente'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre Corto / Apellido</Label>
                                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ej: Dr. García" />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Especialidad / Descripción</Label>
                                    <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Ej: Especialista en Medicina Interna" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="img">Foto de Perfil</Label>
                                    <Input id="img" type="file" onChange={e => setData('img', e.target.files?.[0])} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Posición</Label>
                                        <Input id="position" type="number" value={data.position} onChange={e => setData('position', parseInt(e.target.value))} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="bg-brand-blue rounded-full px-8">
                                        {isEditing ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <LandingAdminNav active="teachers" />

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Foto</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Posición</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell>
                                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {teacher.img ? (
                                                <img src={teacher.img.startsWith('http') ? teacher.img : `/storage/${teacher.img}`} alt={teacher.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{teacher.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">{teacher.description}</TableCell>
                                    <TableCell>{teacher.position}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher)}>
                                                <Pencil className="h-4 w-4 text-brand-blue" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Gestión Landing', href: '#' }, { title: 'Docentes', href: '/admin/landing/teachers' }]}>
        {page}
    </AppLayout>
);

