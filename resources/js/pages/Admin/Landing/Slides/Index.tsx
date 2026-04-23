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
import { useState } from 'react';
import { LandingAdminNav } from '../LandingAdminNav';

interface Slide {
    id: number;
    title: string;
    img: string;
    section: string;
    position: number;
    active: boolean;
}

export default function Index({ slides }: { slides: Slide[] }) {
    const [isEditing, setIsEditing] = useState<Slide | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        title: '',
        img: null as any,
        section: 'Hero',
        position: 1,
        active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            post(`/admin/landing/slides/${isEditing.id}?_method=PUT`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsOpen(false);
                    setIsEditing(null);
                    reset();
                },
            });
        } else {
            post('/admin/landing/slides', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (slide: Slide) => {
        setIsEditing(slide);
        setData({
            title: slide.title,
            img: null,
            section: slide.section,
            position: slide.position,
            active: slide.active,
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este slide?')) {
            destroy(`/admin/landing/slides/${id}`);
        }
    };

    return (
        <>
            <Head title="Gestión de Slides" />


            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Slides Principales</h1>
                        <p className="text-gray-500">Gestiona las imágenes y textos del carrusel de inicio.</p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setIsEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-orange hover:bg-brand-orange/90">
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Slide
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEditing ? 'Editar Slide' : 'Crear Nuevo Slide'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Ej: Bienvenidos a Sapius" />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="img">Imagen</Label>
                                    <Input id="img" type="file" onChange={e => setData('img', e.target.files?.[0])} />
                                    {errors.img && <p className="text-sm text-red-500">{errors.img}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Posición</Label>
                                        <Input id="position" type="number" value={data.position} onChange={e => setData('position', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="section">Sección</Label>
                                        <Input id="section" value={data.section} onChange={e => setData('section', e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="bg-brand-blue">
                                        {isEditing ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <LandingAdminNav active="slides" />

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Imagen</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Sección</TableHead>
                                <TableHead>Posición</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {slides.map((slide) => (
                                <TableRow key={slide.id}>
                                    <TableCell>
                                        <div className="h-12 w-20 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {slide.img ? (
                                                <img src={slide.img.startsWith('http') ? slide.img : `/storage/${slide.img}`} alt={slide.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{slide.title}</TableCell>
                                    <TableCell>{slide.section}</TableCell>
                                    <TableCell>{slide.position}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)}>
                                                <Pencil className="h-4 w-4 text-brand-blue" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}>
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
    <AppLayout breadcrumbs={[{ title: 'Gestión Landing', href: '#' }, { title: 'Slides', href: '/admin/landing/slides' }]}>
        {page}
    </AppLayout>
);

