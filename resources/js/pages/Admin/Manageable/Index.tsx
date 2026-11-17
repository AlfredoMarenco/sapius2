import { Head, router } from '@inertiajs/react';
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
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface ManageableItem {
    id: number;
    titulo: string;
    descripcion: string | null;
    image: string | null;
    type: string;
    category: string;
    position: number;
}

interface CriteriaRow {
    label: string;
    value: string;
    max?: string;
    badge?: string;
}

interface CriteriaTable {
    title: string;
    subtitle: string;
    columns: string[];
    rows: CriteriaRow[];
}

interface ManageableProps {
    simulatorsMedicine: ManageableItem[];
    simulatorsNutrition: ManageableItem[];
    guiasMedicine: ManageableItem[];
    guiasNutrition: ManageableItem[];
    examCriteria?: Record<string, CriteriaTable>;
}

export default function ManageableIndex({
    simulatorsMedicine = [],
    simulatorsNutrition = [],
    guiasMedicine = [],
    guiasNutrition = [],
    examCriteria = {},
}: ManageableProps) {
    const [selectedType, setSelectedType] = useState<'simuladores' | 'guias' | 'criterios'>('simuladores');
    const [selectedCategory, setSelectedCategory] = useState<'medicina' | 'nutricion'>('medicina');
    const [selectedExamType, setSelectedExamType] = useState<'EGEL' | 'EXANI' | 'ENARM'>('EGEL');
    const [criteriaState, setCriteriaState] = useState<Record<string, CriteriaTable>>(examCriteria);
    const [savingCriteria, setSavingCriteria] = useState(false);

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

        if (!editingItem) {
return;
}

        router.put('/admin/manageable/update', editingItem, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
            },
        });
    };

    const handleDelete = (item: ManageableItem) => {
        if (!confirm(`¿Eliminar la tarjeta "${item.titulo}"?`)) {
return;
}

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

        router.delete(deleteUrl, { preserveScroll: true });
    };

    const activeList = getActiveList();

    return (
        <>
            <Head title="Contenido Administrable (Landing)" />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100 flex items-center gap-2">
                            <Layers className="w-6 h-6 text-blue-600 shrink-0" /> Secciones Administrables
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Gestión de tarjetas informativas para Simuladores y Guías de Estudio mostradas en la landing pública.
                        </p>
                    </div>

                    {selectedType !== 'criterios' && (
                        <Button
                            size="sm"
                            onClick={() => {
                                setCreateForm({
                                    titulo: '',
                                    descripcion: '',
                                    type: selectedType,
                                    category: selectedCategory,
                                });
                                setIsCreateOpen(true);
                            }}
                            className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white px-4 text-xs sm:text-sm font-semibold gap-2 shadow-xs self-start sm:self-auto"
                        >
                            <Plus className="w-4 h-4" /> Nueva Tarjeta
                        </Button>
                    )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
                    {/* Type Filter */}
                    <div className="flex flex-wrap items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                        <Button
                            variant={selectedType === 'simuladores' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedType('simuladores')}
                            className={`h-8 rounded-md text-xs ${selectedType === 'simuladores' ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90' : ''}`}
                        >
                            <Gamepad2 className="w-3.5 h-3.5 mr-1.5" /> Simuladores
                        </Button>
                        <Button
                            variant={selectedType === 'guias' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedType('guias')}
                            className={`h-8 rounded-md text-xs ${selectedType === 'guias' ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90' : ''}`}
                        >
                            <FileText className="w-3.5 h-3.5 mr-1.5" /> Guías de Estudio
                        </Button>
                        <Button
                            variant={selectedType === 'criterios' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedType('criterios')}
                            className={`h-8 rounded-md text-xs ${selectedType === 'criterios' ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90' : ''}`}
                        >
                            <Layers className="w-3.5 h-3.5 mr-1.5" /> Tablas de Puntaje (EGEL / EXANI / ENARM)
                        </Button>
                    </div>

                    {/* Category Filter */}
                    {selectedType !== 'criterios' ? (
                        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                            <Button
                                variant={selectedCategory === 'medicina' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedCategory('medicina')}
                                className={`h-8 rounded-md text-xs ${selectedCategory === 'medicina' ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90' : ''}`}
                            >
                                <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Medicina (ENARM / EGEL)
                            </Button>
                            <Button
                                variant={selectedCategory === 'nutricion' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedCategory('nutricion')}
                                className={`h-8 rounded-md text-xs ${selectedCategory === 'nutricion' ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90' : ''}`}
                            >
                                <Apple className="w-3.5 h-3.5 mr-1.5" /> Nutrición
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                            {(['EGEL', 'EXANI', 'ENARM'] as const).map((etype) => (
                                <Button
                                    key={etype}
                                    variant={selectedExamType === etype ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedExamType(etype)}
                                    className={`h-8 rounded-md text-xs ${selectedExamType === etype ? 'bg-[#101E33] text-white hover:bg-[#101E33]/90' : ''}`}
                                >
                                    {etype}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cards Grid or Exam Criteria Editor */}
                {selectedType === 'criterios' ? (
                    <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    {criteriaState[selectedExamType]?.title || `Tabla de Criterios ${selectedExamType}`}
                                </CardTitle>
                                <CardDescription>
                                    {criteriaState[selectedExamType]?.subtitle || 'Edita los niveles o puntajes de referencia que ven los alumnos en sus resultados.'}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const current = criteriaState[selectedExamType] || {
                                            title: `Criterios ${selectedExamType}`,
                                            subtitle: '',
                                            columns: ['Categoría / Nivel', 'Puntaje'],
                                            rows: [],
                                        };
                                        const newRow: CriteriaRow = selectedExamType === 'ENARM'
                                            ? { label: 'Nueva Especialidad', max: '80.000', value: '65.000' }
                                            : { label: 'Nuevo Nivel / Carrera', value: '1000', badge: 'info' };
                                        setCriteriaState({
                                            ...criteriaState,
                                            [selectedExamType]: {
                                                ...current,
                                                rows: [...(current.rows || []), newRow],
                                            },
                                        });
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Agregar Fila
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={savingCriteria}
                                    className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white font-semibold"
                                    onClick={() => {
                                        setSavingCriteria(true);
                                        router.post('/admin/manageable/exam-criteria', { criteria: criteriaState as any }, {
                                            preserveScroll: true,
                                            onFinish: () => setSavingCriteria(false),
                                        });
                                    }}
                                >
                                    <Save className="w-4 h-4 mr-1.5" /> {savingCriteria ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Título de la Tabla</Label>
                                    <Input
                                        value={criteriaState[selectedExamType]?.title || ''}
                                        onChange={(e) => setCriteriaState({
                                            ...criteriaState,
                                            [selectedExamType]: {
                                                ...criteriaState[selectedExamType],
                                                title: e.target.value,
                                            },
                                        })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Subtítulo / Nota explicativa</Label>
                                    <Input
                                        value={criteriaState[selectedExamType]?.subtitle || ''}
                                        onChange={(e) => setCriteriaState({
                                            ...criteriaState,
                                            [selectedExamType]: {
                                                ...criteriaState[selectedExamType],
                                                subtitle: e.target.value,
                                            },
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                {(criteriaState[selectedExamType]?.rows || []).map((row, rIdx) => (
                                    <div key={rIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                                        <div className="flex-1 min-w-[180px]">
                                            <Label className="text-[10px] uppercase text-neutral-400">Nombre / Nivel / Carrera</Label>
                                            <Input
                                                value={row.label}
                                                onChange={(e) => {
                                                    const updatedRows = [...(criteriaState[selectedExamType]?.rows || [])];
                                                    updatedRows[rIdx] = { ...updatedRows[rIdx], label: e.target.value };
                                                    setCriteriaState({
                                                        ...criteriaState,
                                                        [selectedExamType]: { ...criteriaState[selectedExamType], rows: updatedRows },
                                                    });
                                                }}
                                            />
                                        </div>
                                        {selectedExamType === 'ENARM' && (
                                            <div className="w-36">
                                                <Label className="text-[10px] uppercase text-neutral-400">Puntaje Máximo</Label>
                                                <Input
                                                    value={row.max || ''}
                                                    onChange={(e) => {
                                                        const updatedRows = [...(criteriaState[selectedExamType]?.rows || [])];
                                                        updatedRows[rIdx] = { ...updatedRows[rIdx], max: e.target.value };
                                                        setCriteriaState({
                                                            ...criteriaState,
                                                            [selectedExamType]: { ...criteriaState[selectedExamType], rows: updatedRows },
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="w-44">
                                            <Label className="text-[10px] uppercase text-neutral-400">
                                                {selectedExamType === 'ENARM' ? 'Puntaje Mínimo' : 'Rango / Puntaje'}
                                            </Label>
                                            <Input
                                                value={row.value}
                                                onChange={(e) => {
                                                    const updatedRows = [...(criteriaState[selectedExamType]?.rows || [])];
                                                    updatedRows[rIdx] = { ...updatedRows[rIdx], value: e.target.value };
                                                    setCriteriaState({
                                                        ...criteriaState,
                                                        [selectedExamType]: { ...criteriaState[selectedExamType], rows: updatedRows },
                                                    });
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="mt-4 text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                const updatedRows = (criteriaState[selectedExamType]?.rows || []).filter((_, idx) => idx !== rIdx);
                                                setCriteriaState({
                                                    ...criteriaState,
                                                    [selectedExamType]: { ...criteriaState[selectedExamType], rows: updatedRows },
                                                });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : activeList.length === 0 ? (
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
                                    <CardDescription
                                        className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-4 prose prose-xs max-w-none"
                                        dangerouslySetInnerHTML={{ __html: item.descripcion || 'Sin descripción detallada.' }}
                                    />
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
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="h-9 rounded-lg">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" size="sm" className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white font-semibold">
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
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)} className="h-9 rounded-lg">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" size="sm" className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white font-semibold">
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
