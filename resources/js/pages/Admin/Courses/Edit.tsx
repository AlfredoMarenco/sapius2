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
        category_id: course.category_id.toString(),
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

            <div className="flex h-full flex-1 flex-col gap-6 p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="rounded-full">
                            <Link href="/admin/courses">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Editar Curso</h1>
                            <p className="text-muted-foreground font-medium italic">Actualiza la información básica del curso.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="rounded-[2.5rem] border-2 border-brand-navy/5 shadow-xl shadow-brand-navy/5 overflow-hidden">
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-brand-navy font-bold flex items-center gap-2">
                                        <Type className="h-4 w-4 text-brand-blue" /> Título del Curso
                                    </Label>
                                    <Input 
                                        id="title"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="h-12 border-2 rounded-2xl focus-visible:ring-brand-blue"
                                    />
                                    {errors.title && <p className="text-sm text-destructive font-bold">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="category_id" className="text-brand-navy font-bold flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-brand-coral" /> Categoría
                                        </Label>
                                        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-black tracking-widest text-brand-blue hover:text-brand-blue/80 p-0 px-2">
                                                    <Plus className="h-3 w-3 mr-1" /> Nueva
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-2 shadow-2xl max-w-sm">
                                                <div className="bg-brand-navy p-6 text-white text-md font-black uppercase tracking-tight flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-brand-coral" /> Nueva Categoría
                                                </div>
                                                <div className="p-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-brand-navy">Nombre</Label>
                                                        <Input 
                                                            value={categoryForm.data.name} 
                                                            onChange={e => categoryForm.setData('name', e.target.value)}
                                                            className="h-10 border-2 rounded-xl text-sm"
                                                            placeholder="Ej: Neurología"
                                                        />
                                                        {categoryForm.errors.name && <p className="text-[10px] text-destructive font-bold uppercase">{categoryForm.errors.name}</p>}
                                                    </div>
                                                    <Button 
                                                        type="button" 
                                                        onClick={handleCreateCategory}
                                                        disabled={categoryForm.processing}
                                                        className="w-full bg-brand-blue h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
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
                                        <SelectTrigger className="h-12 border-2 border-gray-100 rounded-2xl">
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
                                    {errors.category_id && <p className="text-sm text-destructive font-bold">{errors.category_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-brand-navy font-bold flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-brand-orange" /> Descripción
                                    </Label>
                                    <Textarea 
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="min-h-[150px] border-2 border-sidebar-border rounded-2xl focus-visible:ring-brand-blue"
                                    />
                                    {errors.description && <p className="text-sm text-destructive font-bold">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-[2.5rem] border-2 border-brand-navy/5 shadow-xl shadow-brand-navy/5 overflow-hidden">
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-brand-navy font-bold flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-brand-cyan" /> Imagen Actual
                                    </Label>
                                    
                                    <div className="aspect-video w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                            onChange={e => setData('image', e.target.files?.[0] || null)}
                                        />
                                        {data.image ? (
                                            <div className="flex flex-col items-center">
                                                <ImageIcon className="h-10 w-10 text-brand-blue mb-2" />
                                                <span className="text-xs font-bold text-brand-blue truncate max-w-[150px]">{(data.image as any).name}</span>
                                            </div>
                                        ) : course.image ? (
                                            <img src={`/media/stream/${course.image}`} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 mb-2" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Cambiar Imagen</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-gray-100" />

                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full h-14 bg-brand-blue shadow-lg shadow-brand-blue/20 font-black uppercase tracking-widest gap-2 rounded-2xl"
                                >
                                    <Save className="h-5 w-5" /> Actualizar Curso
                                </Button>
                                
                                <Button variant="ghost" asChild className="w-full text-muted-foreground font-bold">
                                    <Link href="/admin/courses">Cancelar</Link>
                                </Button>
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
