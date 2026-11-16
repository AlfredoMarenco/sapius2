import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

interface Course {
    id: number;
    title: string;
}

interface Review {
    id: number;
    user_name: string;
    content: string;
    rating: number;
    visible?: boolean;
    course_id: number | null;
    course?: Course | null;
    created_at?: string | null;
}

export default function Index({ reviews = [], courses = [] }: { reviews: Review[], courses: Course[] }) {
    const [isEditing, setIsEditing] = useState<Review | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        user_name: '',
        content: '',
        rating: 5,
        visible: true,
        course_id: '' as any,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/reviews/${isEditing.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setIsEditing(null);
                    reset();
                },
            });
        } else {
            post('/admin/reviews', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (review: Review) => {
        setIsEditing(review);
        setData({
            user_name: review.user_name,
            content: review.content,
            rating: review.rating,
            visible: review.visible ?? true,
            course_id: review.course_id?.toString() || '',
        });
        setIsOpen(true);
    };

    const handleToggleVisibility = (review: Review) => {
        router.put(`/admin/reviews/${review.id}`, {
            user_name: review.user_name,
            content: review.content,
            rating: review.rating,
            visible: !review.visible,
        }, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta reseña?')) {
            destroy(`/admin/reviews/${id}`);
        }
    };

    return (
        <>
            <Head title="Gestión de Reseñas" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Administración de Reseñas y Testimonios</h1>
                        <p className="text-sm text-gray-500">
                            Aprueba, oculta o edita las opiniones enviadas por los alumnos para mostrarlas en la página principal.
                        </p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) setIsEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                                <Plus className="mr-2 h-4 w-4" /> Nueva Reseña
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{isEditing ? 'Editar Reseña' : 'Crear Nueva Reseña'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user_name">Nombre del Estudiante</Label>
                                    <Input id="user_name" value={data.user_name} onChange={e => setData('user_name', e.target.value)} required />
                                    {errors.user_name && <p className="text-sm text-red-500">{errors.user_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Contenido de la reseña</Label>
                                    <Textarea id="content" value={data.content} onChange={e => setData('content', e.target.value)} className="min-h-[100px]" required />
                                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <div className="space-y-2">
                                        <Label htmlFor="rating">Calificación (1-5)</Label>
                                        <Input id="rating" type="number" min="1" max="5" value={data.rating} onChange={e => setData('rating', parseInt(e.target.value))} />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <Switch checked={data.visible} onCheckedChange={(val) => setData('visible', val)} />
                                        <Label>Visible en Landing</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                                        {isEditing ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <LandingAdminNav active="reviews" />

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/60">
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Calificación</TableHead>
                                <TableHead className="max-w-md">Comentario</TableHead>
                                <TableHead>Visibilidad en Landing</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-neutral-400">
                                        No hay reseñas registradas aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-semibold text-neutral-900">
                                            {review.user_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="text-sm text-neutral-700 line-clamp-2" title={review.content}>
                                                {review.content}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVisibility(review)}
                                                className="inline-flex items-center gap-1.5"
                                            >
                                                {review.visible ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 cursor-pointer">
                                                        <Eye className="w-3 h-3 mr-1" /> Visible en Landing
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="cursor-pointer">
                                                        <EyeOff className="w-3 h-3 mr-1" /> Oculta
                                                    </Badge>
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-xs text-neutral-500">
                                            {review.created_at || '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(review)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Gestión Landing', href: '/admin/configuraciones' }, { title: 'Reseñas', href: '/admin/reviews' }]}>
        {page}
    </AppLayout>
);
