import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    course_id: number | null;
    course?: Course;
}

export default function Index({ reviews, courses }: { reviews: Review[], courses: Course[] }) {
    const [isEditing, setIsEditing] = useState<Review | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        user_name: '',
        content: '',
        rating: 5,
        course_id: '' as any,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/landing/reviews/${isEditing.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setIsEditing(null);
                    reset();
                },
            });
        } else {
            post('/admin/landing/reviews', {
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
            course_id: review.course_id?.toString() || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta reseña?')) {
            destroy(`/admin/landing/reviews/${id}`);
        }
    };

    return (
        <>
            <Head title="Gestión de Reseñas" />


            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-serif">Administración del Sitio</h1>
                        <p className="text-gray-500">Testimonios que aparecen en la landing page.</p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) setIsEditing(null); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-orange hover:bg-brand-orange/90 rounded-full px-6">
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
                                    <Input id="user_name" value={data.user_name} onChange={e => setData('user_name', e.target.value)} />
                                    {errors.user_name && <p className="text-sm text-red-500">{errors.user_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course_id">Curso Asociado</Label>
                                    <Select value={data.course_id} onValueChange={val => setData('course_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => (
                                                <SelectItem key={course.id} value={course.id.toString()}>{course.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Contenido de la reseña</Label>
                                    <Textarea id="content" value={data.content} onChange={e => setData('content', e.target.value)} className="min-h-[100px]" />
                                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rating">Calificación (1-5)</Label>
                                    <Input id="rating" type="number" min="1" max="5" value={data.rating} onChange={e => setData('rating', parseInt(e.target.value))} />
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

                <LandingAdminNav active="reviews" />

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Calificación</TableHead>
                                <TableHead className="max-w-xs">Contenido</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell className="font-medium">{review.user_name}</TableCell>
                                    <TableCell>{review.course?.title || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-brand-orange text-brand-orange' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{review.content}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(review)}>
                                                <Pencil className="h-4 w-4 text-brand-blue" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)}>
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
    <AppLayout breadcrumbs={[{ title: 'Gestión Landing', href: '#' }, { title: 'Reseñas', href: '/admin/landing/reviews' }]}>
        {page}
    </AppLayout>
);

