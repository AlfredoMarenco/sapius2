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

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                                Categorías
                            </h1>
                            <Badge variant="outline" className="text-xs font-medium">
                                {categories.length} registradas
                            </Badge>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                            Gestiona las áreas temáticas de tus cursos y evaluaciones.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white px-4 text-xs sm:text-sm font-semibold shadow-xs gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" /> Nueva Categoría
                    </Button>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                    {categories.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                            No hay categorías registradas.
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div
                                key={category.id}
                                className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs flex items-center justify-between gap-3 dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-[#101E33] dark:text-neutral-100 truncate">
                                            {category.name}
                                        </span>
                                        <Badge variant="secondary" className="text-[11px] shrink-0">
                                            {category.courses_count} cursos
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-neutral-500 truncate">
                                        {category.description || 'Sin descripción'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEditModal(category)}
                                        className="h-8 w-8 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(category.id)}
                                        className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop & Laptop Compact Table */}
                <div className="hidden md:block rounded-xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/70 dark:bg-neutral-800/50">
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-center">Cursos</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center text-neutral-400 text-sm">
                                        No hay categorías registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id} className="group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#101E33] dark:text-neutral-100">
                                                    {category.name}
                                                </span>
                                                <span className="text-xs text-neutral-500 truncate max-w-[420px]">
                                                    {category.description || 'Sin descripción'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-xs font-medium gap-1.5">
                                                <BookOpen className="h-3.5 w-3.5 text-blue-600" /> {category.courses_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(category)}
                                                    className="h-8 w-8 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(category.id)}
                                                    className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
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
                <DialogContent className="rounded-xl p-0 overflow-hidden max-w-md">
                    <div className="bg-[#101E33] px-5 py-4 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold flex items-center gap-2 text-white">
                                <Tag className="h-4 w-4 text-[#FF6B52]" />
                                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">Nombre de la Categoría</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="h-9 rounded-lg"
                                placeholder="Ej: Ciencias Médicas"
                            />
                            {errors.name && <p className="text-xs text-red-600 font-medium">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-semibold">Descripción (Opcional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="min-h-[90px] rounded-lg"
                                placeholder="Escribe algo sobre esta categoría..."
                            />
                            {errors.description && <p className="text-xs text-red-600 font-medium">{errors.description}</p>}
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                className="h-9 rounded-lg"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#FF6B52] hover:bg-[#F0563C] text-white rounded-lg px-5 h-9 text-xs sm:text-sm font-semibold"
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
