import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    Image as ImageIcon,
    Type,
    FileText,
    Tag,
    Plus,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import { store as storeCategoryRoute } from '@/routes/admin/categories';
import { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Course {
    id: number;
    title: string;
    category_id: number;
    description: string;
    image: string | null;
}

interface Props {
    course: Course;
    categories: Category[];
}

export default function Edit({ course, categories }: Props) {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: course.title,
        category_id: course.category_id ? course.category_id.toString() : '',
        description: course.description || '',
        image: null as File | null,
        _method: 'PUT', // Method spoofing for Laravel
    });

    const categoryForm = useForm({
        name: '',
    });

    const handleCreateCategory = () => {
        categoryForm.post(storeCategoryRoute.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCategoryModalOpen(false);
                categoryForm.reset();
            }
        });
    };

    useEffect(() => {
        if (categories.length > 0 && categoryForm.wasSuccessful) {
             const latest = categories[categories.length - 1];
             setData('category_id', latest.id.toString());
        }
    }, [categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/courses/${course.id}`);
    };

    return (
        <>
            <Head title={`Editar - ${course.title}`} />

            <div className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-lg shrink-0">
                        <Link href="/admin/courses">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                            Editar Curso
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500">
                            Actualiza la información básica del curso.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 space-y-5">
                        <Card className="rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden dark:border-neutral-800">
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title" className="text-xs sm:text-sm font-semibold text-[#101E33] dark:text-neutral-200 flex items-center gap-2">
                                        <Type className="h-4 w-4 text-blue-600" /> Título del Curso
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="h-10 rounded-lg"
                                    />
                                    {errors.title && <p className="text-xs text-red-600 font-medium">{errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="category_id" className="text-xs sm:text-sm font-semibold text-[#101E33] dark:text-neutral-200 flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-[#FF6B52]" /> Categoría
                                        </Label>
                                        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2">
                                                    <Plus className="h-3.5 w-3.5 mr-1" /> Nueva
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-xl p-0 overflow-hidden max-w-sm">
                                                <div className="bg-[#101E33] px-5 py-4 text-white text-sm font-bold flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-[#FF6B52]" /> Nueva Categoría
                                                </div>
                                                <div className="p-5 space-y-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Nombre</Label>
                                                        <Input
                                                            value={categoryForm.data.name}
                                                            onChange={e => categoryForm.setData('name', e.target.value)}
                                                            className="h-9 rounded-lg text-sm"
                                                            placeholder="Ej: Neurología"
                                                        />
                                                        {categoryForm.errors.name && <p className="text-xs text-red-600 font-medium">{categoryForm.errors.name}</p>}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={handleCreateCategory}
                                                        disabled={categoryForm.processing}
                                                        className="w-full bg-[#FF6B52] hover:bg-[#F0563C] text-white h-9 rounded-lg text-xs font-semibold"
                                                    >
                                                        Guardar Categoría
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <Select
                                        onValueChange={value => setData('category_id', value)}
                                        value={data.category_id}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg">
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-xs text-red-600 font-medium">{errors.category_id}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="description" className="text-xs sm:text-sm font-semibold text-[#101E33] dark:text-neutral-200 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-orange-500" /> Descripción
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="min-h-[130px] rounded-lg"
                                    />
                                    {errors.description && <p className="text-xs text-red-600 font-medium">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-5">
                        <Card className="rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden dark:border-neutral-800">
                            <CardContent className="p-5 space-y-5">
                                <div className="space-y-3">
                                    <Label className="text-xs sm:text-sm font-semibold text-[#101E33] dark:text-neutral-200 flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-blue-600" /> Imagen Actual
                                    </Label>

                                    <div className="aspect-video w-full rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center relative overflow-hidden group dark:bg-neutral-900 dark:border-neutral-700">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={e => setData('image', e.target.files?.[0] || null)}
                                        />
                                        {data.image ? (
                                            <div className="flex flex-col items-center px-3 text-center">
                                                <ImageIcon className="h-8 w-8 text-blue-600 mb-1.5" />
                                                <span className="text-xs font-semibold text-blue-600 truncate max-w-[180px]">{(data.image as any).name}</span>
                                            </div>
                                        ) : course.image ? (
                                            <img src={`/media/stream/${course.image}`} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-neutral-400" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#101E33]/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <span className="text-white text-xs font-semibold">Cambiar Imagen</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-10 bg-[#FF6B52] hover:bg-[#F0563C] text-white rounded-lg font-semibold text-sm gap-2 shadow-xs"
                                    >
                                        <Save className="h-4 w-4" /> Actualizar Curso
                                    </Button>

                                    <Button variant="ghost" asChild className="w-full h-9 rounded-lg text-neutral-500 font-medium">
                                        <Link href="/admin/courses">Cancelar</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Cursos', href: '/admin/courses' }, { title: 'Editar', href: '#' }]}>
        {page}
    </AppLayout>
);
