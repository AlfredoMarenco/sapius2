import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Tag, 
    BookOpen, 
    MoreHorizontal,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { store as storeCategoryRoute, update as updateCategoryRoute, destroy as destroyCategoryRoute } from '@/routes/admin/categories';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    courses_count: number;
}

interface Props {
    categories: Category[];
}

export default function Index({ categories }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(updateCategoryRoute.url(editingCategory.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(storeCategoryRoute.url(), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        reset();
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            destroy(destroyCategoryRoute.url(id));
        }
    };

    return (
        <>
            <Head title="Gestión de Categorías" />

            <div className="flex h-full flex-1 flex-col gap-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Categorías</h1>
                        <p className="text-muted-foreground font-medium italic">Gestiona las áreas temáticas de tus cursos.</p>
                    </div>
                    <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl shadow-lg shadow-brand-blue/20 font-black uppercase tracking-widest gap-2"
                    >
                        <Plus className="h-5 w-5" /> Nueva Categoría
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
                    <div className="md:col-span-1 bg-brand-navy p-6 rounded-[2rem] text-white shadow-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Total</p>
                            <h3 className="text-3xl font-black">{categories.length}</h3>
                        </div>
                        <Tag className="h-10 w-10 opacity-20" />
                    </div>
                </div>

                <div className="rounded-[2.5rem] border-2 border-brand-navy/5 bg-white shadow-xl shadow-brand-navy/5 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b-2">
                                <TableHead className="py-6 px-8 text-brand-navy font-black uppercase tracking-widest text-xs">Categoría</TableHead>
                                <TableHead className="text-center font-black uppercase tracking-widest text-xs">Cursos</TableHead>
                                <TableHead className="text-right py-6 px-8 font-black uppercase tracking-widest text-xs">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-48 text-center text-muted-foreground italic">
                                        No hay categorías registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id} className="group hover:bg-brand-blue/[0.02] transition-colors border-b">
                                        <TableCell className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-md font-bold text-brand-navy group-hover:text-brand-blue transition-colors">{category.name}</span>
                                                <span className="text-xs text-muted-foreground font-medium truncate max-w-[400px]">
                                                    {category.description || 'Sin descripción'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="rounded-full px-4 border-2 border-brand-blue/10 text-brand-blue font-bold">
                                                <BookOpen className="h-3 w-3 mr-2" /> {category.courses_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-6 px-8">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => openEditModal(category)}
                                                    className="h-10 w-10 rounded-full hover:bg-brand-orange/10 hover:text-brand-orange"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(category.id)}
                                                    className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl p-0 overflow-hidden max-w-md">
                    <div className="bg-brand-navy p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Tag className="h-6 w-6 text-brand-coral" />
                                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-brand-navy font-bold">Nombre de la Categoría</Label>
                            <Input 
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="h-12 border-2 focus-visible:ring-brand-blue rounded-2xl"
                                placeholder="Ej: Ciencias Médicas"
                            />
                            {errors.name && <p className="text-xs text-destructive font-black uppercase">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-brand-navy font-bold">Descripción (Opcional)</Label>
                            <Textarea 
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="min-h-[100px] border-2 focus-visible:ring-brand-blue rounded-2xl"
                                placeholder="Escribe algo sobre esta categoría..."
                            />
                            {errors.description && <p className="text-xs text-destructive font-black uppercase">{errors.description}</p>}
                        </div>
                        <DialogFooter className="pt-4">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={closeModal}
                                className="font-bold text-muted-foreground"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest"
                            >
                                {editingCategory ? 'Actualizar' : 'Crear Categoría'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Categorías', href: '#' }]}>
        {page}
    </AppLayout>
);
