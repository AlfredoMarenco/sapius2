import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Layers, 
    Plus, 
    Pencil, 
    Trash2, 
    Stethoscope, 
    Apple, 
    FileText, 
    Gamepad2, 
    Save, 
    X 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ManageableItem {
    id: number;
    titulo: string;
    descripcion: string | null;
    image: string | null;
    type: string;
    category: string;
    position: number;
}

interface ManageableProps {
    simulatorsMedicine: ManageableItem[];
    simulatorsNutrition: ManageableItem[];
    guiasMedicine: ManageableItem[];
    guiasNutrition: ManageableItem[];
}

export default function ManageableIndex({
    simulatorsMedicine = [],
    simulatorsNutrition = [],
    guiasMedicine = [],
    guiasNutrition = [],
}: ManageableProps) {
    const [selectedType, setSelectedType] = useState<'simuladores' | 'guias'>('simuladores');
    const [selectedCategory, setSelectedCategory] = useState<'medicina' | 'nutricion'>('medicina');

    // Create Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        titulo: '',
        descripcion: '',
        type: 'simuladores',
        category: 'medicina',
    });

    // Edit Modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{
        id: number;
        titulo: string;
        descripcion: string;
        type: string;
        category: string;
    } | null>(null);

    const getActiveList = (): ManageableItem[] => {
        if (selectedType === 'simuladores') {
            return selectedCategory === 'medicina' ? simulatorsMedicine : simulatorsNutrition;
        } else {
            return selectedCategory === 'medicina' ? guiasMedicine : guiasNutrition;
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/manageable/store', createForm, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreateForm({
                    titulo: '',
                    descripcion: '',
                    type: selectedType,
                    category: selectedCategory,
                });
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        router.put('/admin/manageable/update', editingItem, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
            },
        });
    };

    const handleDelete = (item: ManageableItem) => {
        if (!confirm(`¿Eliminar la tarjeta "${item.titulo}"?`)) return;

        let deleteUrl = '';
        if (item.type === 'simuladores') {
            deleteUrl = item.category === 'medicina'
                ? `/admin/manageable/simulators/medicine/delete/${item.id}`
                : `/admin/manageable/simulators/nutrition/delete/${item.id}`;
        } else {
            deleteUrl = item.category === 'medicina'
                ? `/admin/manageable/guides/medicine/delete/${item.id}`
                : `/admin/manageable/guides/nutrition/delete/${item.id}`;
        }

        router.get(deleteUrl);
    };

    const activeList = getActiveList();

    return (
        <>
            <Head title="Contenido Administrable (Landing)" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Layers className="w-8 h-8 text-blue-600" /> Secciones Administrables
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Gestión de tarjetas informativas para Simuladores y Guías de Estudio mostradas en la landing pública.
                        </p>
                    </div>

                    <Button
                        onClick={() => {
                            setCreateForm({
                                titulo: '',
                                descripcion: '',
                                type: selectedType,
                                category: selectedCategory,
                            });
                            setIsCreateOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nueva Tarjeta
                    </Button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                    {/* Type Filter */}
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                        <Button
                            variant={selectedType === 'simuladores' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedType('simuladores')}
                            className={selectedType === 'simuladores' ? 'bg-blue-600 text-white' : ''}
                        >
                            <Gamepad2 className="w-4 h-4 mr-1.5" /> Simuladores
                        </Button>
                        <Button
                            variant={selectedType === 'guias' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedType('guias')}
                            className={selectedType === 'guias' ? 'bg-blue-600 text-white' : ''}
                        >
                            <FileText className="w-4 h-4 mr-1.5" /> Guías de Estudio
                        </Button>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                        <Button
                            variant={selectedCategory === 'medicina' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedCategory('medicina')}
                            className={selectedCategory === 'medicina' ? 'bg-emerald-600 text-white' : ''}
                        >
                            <Stethoscope className="w-4 h-4 mr-1.5" /> Medicina (ENARM / EGEL)
                        </Button>
                        <Button
                            variant={selectedCategory === 'nutricion' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedCategory('nutricion')}
                            className={selectedCategory === 'nutricion' ? 'bg-emerald-600 text-white' : ''}
                        >
                            <Apple className="w-4 h-4 mr-1.5" /> Nutrición
                        </Button>
                    </div>
                </div>

                {/* Cards Grid */}
                {activeList.length === 0 ? (
                    <Card className="border-dashed border-2 text-center py-16">
                        <CardContent className="space-y-3">
                            <Layers className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700" />
                            <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
                                No hay tarjetas registradas
                            </h3>
                            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                                No existen tarjetas para {selectedType === 'simuladores' ? 'Simuladores' : 'Guías'} en el área de {selectedCategory}.
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsCreateOpen(true)}
                                className="mt-2"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> Crear Primera Tarjeta
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {activeList.map((item) => (
                            <Card key={item.id} className="border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                            {item.titulo}
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                                            #{item.id}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs text-neutral-500 mt-1 line-clamp-3">
                                        {item.descripcion || 'Sin descripción detallada.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0 border-t border-neutral-100 dark:border-neutral-800/60 mt-3 pt-3 flex items-center justify-between">
                                    <span className="text-[11px] text-neutral-400 font-mono">
                                        Tipo: {item.type} • {item.category}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-2 text-neutral-600 hover:text-blue-600"
                                            onClick={() => {
                                                setEditingItem({
                                                    id: item.id,
                                                    titulo: item.titulo,
                                                    descripcion: item.descripcion || '',
                                                    type: item.type,
                                                    category: item.category,
                                                });
                                                setIsEditOpen(true);
                                            }}
                                            title="Editar tarjeta"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-2 text-neutral-400 hover:text-red-600"
                                            onClick={() => handleDelete(item)}
                                            title="Eliminar tarjeta"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Nueva Tarjeta Administrable</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Sección</Label>
                                        <select
                                            className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent p-2"
                                            value={createForm.type}
                                            onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                                        >
                                            <option value="simuladores">Simuladores</option>
                                            <option value="guias">Guías de Estudio</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Categoría</Label>
                                        <select
                                            className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent p-2"
                                            value={createForm.category}
                                            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                                        >
                                            <option value="medicina">Medicina</option>
                                            <option value="nutricion">Nutrición</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Título</Label>
                                    <Input
                                        required
                                        placeholder="Ej: Simulador Completo ENARM 450 Reactivos"
                                        value={createForm.titulo}
                                        onChange={(e) => setCreateForm({ ...createForm, titulo: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Descripción</Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Breve descripción del contenido o enlace..."
                                        value={createForm.descripcion}
                                        onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" size="sm" className="bg-blue-600 text-white">
                                        <Save className="w-4 h-4 mr-1.5" /> Guardar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditOpen && editingItem && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Editar Tarjeta #{editingItem.id}</h3>
                                <button onClick={() => setIsEditOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Título</Label>
                                    <Input
                                        required
                                        value={editingItem.titulo}
                                        onChange={(e) => setEditingItem({ ...editingItem, titulo: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Descripción</Label>
                                    <Textarea
                                        rows={3}
                                        value={editingItem.descripcion}
                                        onChange={(e) => setEditingItem({ ...editingItem, descripcion: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" size="sm" className="bg-blue-600 text-white">
                                        <Save className="w-4 h-4 mr-1.5" /> Actualizar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ManageableIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Secciones Administrables', href: '/admin/manageable' },
    ]}>
        {page}
    </AppLayout>
);
