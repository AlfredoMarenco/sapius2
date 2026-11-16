import { Head, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Copy,
    Eye,
    Plus,
    RotateCcw,
    Save,
    SlidersHorizontal,
    Sparkles,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import MiniTestModal, {
    DEFAULT_MINI_TEST_CONFIG,
} from '@/components/public/MiniTestModal';
import type {
    MiniTestArea,
    MiniTestConfig,
    MiniTestOption,
    MiniTestPurchaseMode,
    MiniTestQuestion,
    MiniTestRecommendation,
} from '@/components/public/MiniTestModal';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { LandingAdminNav } from './LandingAdminNav';

interface Props {
    config: MiniTestConfig;
    scheduledCourses: ScheduledCourseCandidate[];
}

const AREA_LABELS: Record<MiniTestArea, string> = {
    nutricion: 'EGEL Nutrición',
    medicina: 'EGEL Medicina',
    otro: 'Otro CENEVAL',
    general: 'General (todas las áreas)',
};

const PURCHASE_MODE_LABELS: Record<MiniTestPurchaseMode, string> = {
    buy: 'Compra directa (Checkout si hay cohorte, respaldo WhatsApp)',
    presale: 'Preventa (WhatsApp directo)',
    waitlist: 'Lista de espera (WhatsApp directo)',
    whatsapp: 'Solo orientación por WhatsApp',
};

function normalizeWeightsMap(
    raw: Record<string, number> | unknown[] | undefined,
): Record<string, number> {
    if (!raw || Array.isArray(raw) || typeof raw !== 'object') {
        return {};
    }

    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(raw)) {
        if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
            result[key] = val;
        }
    }

    return result;
}

function normalizeConfig(raw?: MiniTestConfig): MiniTestConfig {
    const base = raw && raw.questions?.length ? raw : DEFAULT_MINI_TEST_CONFIG;

    return {
        header: {
            badge: base.header?.badge ?? DEFAULT_MINI_TEST_CONFIG.header.badge,
            title: base.header?.title ?? DEFAULT_MINI_TEST_CONFIG.header.title,
            resultSubtitle:
                base.header?.resultSubtitle ??
                DEFAULT_MINI_TEST_CONFIG.header.resultSubtitle,
        },
        questions: (base.questions ?? []).map((q) => ({
            ...q,
            active: q.active !== false,
            options: (q.options ?? []).map((o) => ({
                ...o,
                helper: o.helper ?? '',
                areaFilter: o.areaFilter ?? null,
                weights: normalizeWeightsMap(o.weights),
            })),
        })),
        recommendations: (base.recommendations ?? []).map((r, idx) => ({
            ...r,
            priority: r.priority ?? idx + 1,
            active: r.active !== false,
            oldPrice: r.oldPrice ?? '',
            includes: Array.isArray(r.includes) ? r.includes : [],
            keywords: Array.isArray(r.keywords) ? r.keywords : [],
            scheduledCourseId: r.scheduledCourseId ?? null,
        })),
    };
}

function makeUniqueId(prefix: string, existingIds: string[]): string {
    let index = existingIds.length + 1;
    while (existingIds.includes(`${prefix}_${index}`)) {
        index++;
    }

    return `${prefix}_${index}`;
}

export default function MiniTestAdminPage({
    config: initialConfig,
    scheduledCourses = [],
}: Props) {
    const [draft, setDraft] = useState<MiniTestConfig>(() =>
        normalizeConfig(initialConfig),
    );
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [areaFilterTab, setAreaFilterTab] = useState<'all' | MiniTestArea>(
        'all',
    );
    const [selectedWeightTarget, setSelectedWeightTarget] = useState<
        Record<string, string>
    >({});
    const [selectedWeightPoints, setSelectedWeightPoints] = useState<
        Record<string, number>
    >({});

    useEffect(() => {
        setDraft(normalizeConfig(initialConfig));
    }, [initialConfig]);

    const hasUnsavedChanges = useMemo(
        () =>
            JSON.stringify(draft) !==
            JSON.stringify(normalizeConfig(initialConfig)),
        [draft, initialConfig],
    );

    const activeQuestionsCount = useMemo(
        () =>
            draft.questions.filter(
                (q) => q.active && q.options && q.options.length > 0,
            ).length,
        [draft.questions],
    );

    const activeRecommendationsCount = useMemo(
        () => draft.recommendations.filter((r) => r.active).length,
        [draft.recommendations],
    );

    const recById = useMemo(() => {
        const map: Record<string, MiniTestRecommendation> = {};
        for (const rec of draft.recommendations) {
            map[rec.id] = rec;
        }

        return map;
    }, [draft.recommendations]);

    const handleSave = () => {
        if (activeQuestionsCount === 0) {
            toast.error('Debes dejar al menos una pregunta activa con opciones.');
            return;
        }

        if (activeRecommendationsCount === 0) {
            toast.error('Debes dejar al menos una tarjeta de recomendación activa.');
            return;
        }

        setSaving(true);
        router.post('/admin/mini-test', draft as unknown as Record<string, never>, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Mini-Test actualizado y publicado en la landing.');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(
                    typeof firstError === 'string'
                        ? firstError
                        : 'Revisa los campos requeridos antes de guardar.',
                );
            },
            onFinish: () => setSaving(false),
        });
    };

    const handleReset = () => {
        if (
            !confirm(
                '¿Restaurar todas las preguntas, pesos y tarjetas de recomendación a los valores originales de Sapius? Se perderán tus cambios personalizados.',
            )
        ) {
            return;
        }

        setResetting(true);
        router.post(
            '/admin/mini-test/reset',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Mini-Test restaurado a los valores originales.');
                },
                onError: () => {
                    toast.error('No se pudo restaurar la configuración.');
                },
                onFinish: () => setResetting(false),
            },
        );
    };

    // --- Question Mutations ---
    const addQuestion = () => {
        const newId = makeUniqueId(
            'pregunta',
            draft.questions.map((q) => q.id),
        );
        const defaultRecId = draft.recommendations[0]?.id;
        const newQuestion: MiniTestQuestion = {
            id: newId,
            title: 'Nueva pregunta del test',
            active: true,
            options: [
                {
                    id: 'opcion_1',
                    label: 'Primera opción',
                    helper: 'Descripción breve para orientar al alumno.',
                    areaFilter: null,
                    weights: defaultRecId ? { [defaultRecId]: 2 } : {},
                },
                {
                    id: 'opcion_2',
                    label: 'Segunda opción',
                    helper: 'Otra alternativa de estudio.',
                    areaFilter: null,
                    weights: {},
                },
            ],
        };

        setDraft((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));
    };

    const updateQuestion = (
        qIndex: number,
        patch: Partial<MiniTestQuestion>,
    ) => {
        setDraft((prev) => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
                idx === qIndex ? { ...q, ...patch } : q,
            ),
        }));
    };

    const moveQuestion = (qIndex: number, direction: -1 | 1) => {
        const target = qIndex + direction;
        if (target < 0 || target >= draft.questions.length) {
            return;
        }

        setDraft((prev) => {
            const next = [...prev.questions];
            const [moved] = next.splice(qIndex, 1);
            next.splice(target, 0, moved);

            return { ...prev, questions: next };
        });
    };

    const deleteQuestion = (qIndex: number) => {
        if (draft.questions.length <= 1) {
            toast.error('El test debe conservar al menos una pregunta.');
            return;
        }

        setDraft((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, idx) => idx !== qIndex),
        }));
    };

    // --- Option Mutations ---
    const addOption = (qIndex: number) => {
        const question = draft.questions[qIndex];
        if (!question) {
            return;
        }

        const newOptId = makeUniqueId(
            'opcion',
            question.options.map((o) => o.id),
        );
        const newOpt: MiniTestOption = {
            id: newOptId,
            label: `Opción ${question.options.length + 1}`,
            helper: '',
            areaFilter: null,
            weights: {},
        };

        updateQuestion(qIndex, { options: [...question.options, newOpt] });
    };

    const updateOption = (
        qIndex: number,
        oIndex: number,
        patch: Partial<MiniTestOption>,
    ) => {
        const question = draft.questions[qIndex];
        if (!question) {
            return;
        }

        updateQuestion(qIndex, {
            options: question.options.map((o, idx) =>
                idx === oIndex ? { ...o, ...patch } : o,
            ),
        });
    };

    const deleteOption = (qIndex: number, oIndex: number) => {
        const question = draft.questions[qIndex];
        if (!question || question.options.length <= 1) {
            toast.error('Cada pregunta debe tener al menos una opción.');
            return;
        }

        updateQuestion(qIndex, {
            options: question.options.filter((_, idx) => idx !== oIndex),
        });
    };

    const assignOptionWeight = (
        qIndex: number,
        oIndex: number,
        recId: string,
        points: number,
    ) => {
        const option = draft.questions[qIndex]?.options[oIndex];
        if (!option || !recId) {
            return;
        }

        const current = normalizeWeightsMap(option.weights);
        if (points <= 0) {
            delete current[recId];
        } else {
            current[recId] = points;
        }

        updateOption(qIndex, oIndex, { weights: { ...current } });
    };

    // --- Recommendation Mutations ---
    const addRecommendation = () => {
        const newId = makeUniqueId(
            'programa',
            draft.recommendations.map((r) => r.id),
        );
        const newRec: MiniTestRecommendation = {
            id: newId,
            area: areaFilterTab === 'all' ? 'nutricion' : areaFilterTab,
            priority: draft.recommendations.length + 1,
            active: true,
            badge: 'Nueva Recomendación Sapius',
            title: 'Nuevo Programa Recomendado',
            price: '$999 MXN',
            oldPrice: '',
            paymentNote: 'Un solo pago',
            summary: 'Descripción breve de por qué este programa es ideal para el alumno.',
            includes: [
                'Acceso completo en plataforma Sapius',
                'Material de estudio y reactivos actualizados',
            ],
            coursePageHref: '/cursos',
            keywords: [],
            purchaseMode: 'buy',
            scheduledCourseId: null,
            whatsappMessage:
                'Hola Sapius, hice el Mini-Test y me interesa obtener información sobre el Nuevo Programa Recomendado.',
        };

        setDraft((prev) => ({
            ...prev,
            recommendations: [...prev.recommendations, newRec],
        }));
    };

    const duplicateRecommendation = (rec: MiniTestRecommendation) => {
        const newId = makeUniqueId(
            rec.id,
            draft.recommendations.map((r) => r.id),
        );
        const copy: MiniTestRecommendation = {
            ...rec,
            id: newId,
            title: `${rec.title} (Copia)`,
            priority: draft.recommendations.length + 1,
            includes: [...rec.includes],
            keywords: [...rec.keywords],
        };

        setDraft((prev) => ({
            ...prev,
            recommendations: [...prev.recommendations, copy],
        }));
    };

    const updateRecommendation = (
        recId: string,
        patch: Partial<MiniTestRecommendation>,
    ) => {
        setDraft((prev) => ({
            ...prev,
            recommendations: prev.recommendations.map((r) =>
                r.id === recId ? { ...r, ...patch } : r,
            ),
        }));
    };

    const deleteRecommendation = (recId: string) => {
        if (draft.recommendations.length <= 1) {
            toast.error('Debe haber al menos una tarjeta de recomendación.');
            return;
        }

        if (
            !confirm(
                '¿Eliminar esta tarjeta de recomendación? También se limpiará de los pesos asignados en las opciones.',
            )
        ) {
            return;
        }

        setDraft((prev) => ({
            ...prev,
            recommendations: prev.recommendations.filter((r) => r.id !== recId),
            questions: prev.questions.map((q) => ({
                ...q,
                options: q.options.map((opt) => {
                    const weights = normalizeWeightsMap(opt.weights);
                    delete weights[recId];

                    return { ...opt, weights };
                }),
            })),
        }));
    };

    const filteredRecommendations = useMemo(() => {
        if (areaFilterTab === 'all') {
            return draft.recommendations;
        }

        return draft.recommendations.filter((r) => r.area === areaFilterTab);
    }, [draft.recommendations, areaFilterTab]);

    return (
        <>
            <Head title="Mini-Test Vocacional - Configuración Landing" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Encabezado y Acciones Principales */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Mini-Test Vocacional de Landing
                            </h1>
                            {hasUnsavedChanges && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                                    Cambios sin guardar
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                            Administra cuántas preguntas se muestran ({activeQuestionsCount} activas), sus opciones, puntos de afinidad y las {activeRecommendationsCount} tarjetas de recomendación sugeridas.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPreviewOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4 text-blue-600" />
                            Vista Previa en Vivo
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={resetting || saving}
                            className="flex items-center gap-2 text-neutral-700"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {resetting ? 'Restaurando...' : 'Restaurar Original'}
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || resetting}
                            className="flex items-center gap-2 bg-[#FF6B52] hover:bg-[#F0563C] text-white"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </div>

                <LandingAdminNav active="mini-test" />

                {/* Banner explicativo del motor */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-950 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-semibold">
                            ¿Cómo decide el test qué sugerir al alumno?
                        </p>
                        <p className="text-xs leading-relaxed text-blue-900/90">
                            Cada opción elegida puede <strong>filtrar el área</strong> (Nutrición, Medicina u Otro) y <strong>sumar puntos de afinidad</strong> hacia una o más tarjetas de recomendación. Al terminar todas las preguntas activas (sean 3, 6 o 10), el sistema sugiere la tarjeta de esa área que acumuló más puntos. Puedes usar <strong>Vista Previa en Vivo</strong> para probar tu flujo antes de guardar.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="questions" className="space-y-6">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex-wrap h-auto">
                        <TabsTrigger value="questions" className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4" />
                            Preguntas y Opciones ({activeQuestionsCount}/{draft.questions.length})
                        </TabsTrigger>
                        <TabsTrigger value="recommendations" className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Tarjetas de Recomendación ({activeRecommendationsCount}/{draft.recommendations.length})
                        </TabsTrigger>
                        <TabsTrigger value="header" className="flex items-center gap-2">
                            Encabezado del Modal
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: PREGUNTAS Y OPCIONES */}
                    <TabsContent value="questions" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-600">
                                Ordena, activa o desactiva preguntas y asigna qué resultado impulsa cada respuesta.
                            </p>
                            <Button type="button" onClick={addQuestion} className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Agregar Pregunta
                            </Button>
                        </div>

                        <div className="space-y-5">
                            {draft.questions.map((question, qIndex) => (
                                <Card
                                    key={question.id}
                                    className={
                                        question.active
                                            ? 'border-neutral-200 shadow-sm'
                                            : 'border-dashed border-neutral-300 bg-neutral-50/70 opacity-80'
                                    }
                                >
                                    <CardHeader className="pb-4 border-b border-neutral-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    #{qIndex + 1}
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={question.active}
                                                        onCheckedChange={(checked) =>
                                                            updateQuestion(qIndex, { active: checked })
                                                        }
                                                    />
                                                    <span className="text-xs font-medium text-neutral-700">
                                                        {question.active ? 'Visible en el test' : 'Oculta'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={qIndex === 0}
                                                    onClick={() => moveQuestion(qIndex, -1)}
                                                    title="Subir pregunta"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={qIndex === draft.questions.length - 1}
                                                    onClick={() => moveQuestion(qIndex, 1)}
                                                    title="Bajar pregunta"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteQuestion(qIndex)}
                                                    title="Eliminar pregunta"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="pt-3">
                                            <Label htmlFor={`q-title-${question.id}`} className="text-xs text-neutral-500">
                                                Texto de la pregunta
                                            </Label>
                                            <Input
                                                id={`q-title-${question.id}`}
                                                value={question.title}
                                                onChange={(e) =>
                                                    updateQuestion(qIndex, { title: e.target.value })
                                                }
                                                className="mt-1 font-semibold"
                                                placeholder="Ej. ¿Qué examen vas a presentar?"
                                            />
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                                Opciones de respuesta ({question.options.length})
                                            </h4>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => addOption(qIndex)}
                                                className="h-8 text-xs flex items-center gap-1.5"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Agregar opción
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {question.options.map((option, oIndex) => {
                                                const key = `${question.id}::${option.id}`;
                                                const weights = normalizeWeightsMap(option.weights);
                                                const targetRec =
                                                    selectedWeightTarget[key] ??
                                                    draft.recommendations[0]?.id ??
                                                    '';
                                                const targetPts = selectedWeightPoints[key] ?? 3;

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-3"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                                            <div className="md:col-span-5">
                                                                <Label className="text-xs text-neutral-500">
                                                                    Texto de la opción
                                                                </Label>
                                                                <Input
                                                                    value={option.label}
                                                                    onChange={(e) =>
                                                                        updateOption(qIndex, oIndex, {
                                                                            label: e.target.value,
                                                                        })
                                                                    }
                                                                    className="mt-1 bg-white"
                                                                />
                                                            </div>

                                                            <div className="md:col-span-4">
                                                                <Label className="text-xs text-neutral-500">
                                                                    Subtítulo de ayuda (opcional)
                                                                </Label>
                                                                <Input
                                                                    value={option.helper ?? ''}
                                                                    onChange={(e) =>
                                                                        updateOption(qIndex, oIndex, {
                                                                            helper: e.target.value,
                                                                        })
                                                                    }
                                                                    className="mt-1 bg-white"
                                                                    placeholder="Texto descriptivo debajo de la opción"
                                                                />
                                                            </div>

                                                            <div className="md:col-span-2">
                                                                <Label className="text-xs text-neutral-500">
                                                                    Filtro de Área
                                                                </Label>
                                                                <select
                                                                    value={option.areaFilter ?? ''}
                                                                    onChange={(e) =>
                                                                        updateOption(qIndex, oIndex, {
                                                                            areaFilter: (e.target.value || null) as MiniTestOption['areaFilter'],
                                                                        })
                                                                    }
                                                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-white px-2.5 py-1 text-xs shadow-xs"
                                                                >
                                                                    <option value="">Sin filtro de área</option>
                                                                    <option value="nutricion">EGEL Nutrición</option>
                                                                    <option value="medicina">EGEL Medicina</option>
                                                                    <option value="otro">Otro CENEVAL</option>
                                                                </select>
                                                            </div>

                                                            <div className="md:col-span-1 flex justify-end pt-6">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => deleteOption(qIndex, oIndex)}
                                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    title="Eliminar opción"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Puntos de afinidad */}
                                                        <div className="border-t border-neutral-200/80 pt-3 flex flex-col gap-2.5">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="text-[11px] font-semibold text-neutral-500 mr-1">
                                                                    Puntos que suma:
                                                                </span>
                                                                {Object.keys(weights).length === 0 ? (
                                                                    <span className="text-[11px] italic text-neutral-400">
                                                                        Ninguno (solo filtra o es informativa)
                                                                    </span>
                                                                ) : (
                                                                    Object.entries(weights).map(([recId, pts]) => {
                                                                        const rec = recById[recId];

                                                                        return (
                                                                            <span
                                                                                key={recId}
                                                                                className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B52]/30 bg-[#FFD9CE]/35 px-2.5 py-0.5 text-[11px] font-medium text-[#101E33]"
                                                                            >
                                                                                <span className="font-bold text-[#FF6B52]">
                                                                                    +{pts}
                                                                                </span>
                                                                                <span className="truncate max-w-[230px]">
                                                                                    {rec ? rec.title : recId}
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        assignOptionWeight(qIndex, oIndex, recId, 0)
                                                                                    }
                                                                                    className="ml-0.5 text-neutral-500 hover:text-red-600 font-bold"
                                                                                    title="Quitar puntos"
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </span>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <select
                                                                    value={targetRec}
                                                                    onChange={(e) =>
                                                                        setSelectedWeightTarget((prev) => ({
                                                                            ...prev,
                                                                            [key]: e.target.value,
                                                                        }))
                                                                    }
                                                                    className="h-8 rounded-md border border-input bg-white px-2 text-xs max-w-xs"
                                                                >
                                                                    {draft.recommendations.map((rec) => (
                                                                        <option key={rec.id} value={rec.id}>
                                                                            [{AREA_LABELS[rec.area]}] {rec.title}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                <select
                                                                    value={targetPts}
                                                                    onChange={(e) =>
                                                                        setSelectedWeightPoints((prev) => ({
                                                                            ...prev,
                                                                            [key]: Number(e.target.value),
                                                                        }))
                                                                    }
                                                                    className="h-8 rounded-md border border-input bg-white px-2 text-xs"
                                                                >
                                                                    <option value={1}>+1 Leve</option>
                                                                    <option value={2}>+2 Moderado</option>
                                                                    <option value={3}>+3 Alto</option>
                                                                    <option value={4}>+4 Fuerte</option>
                                                                    <option value={5}>+5 Decisivo</option>
                                                                    <option value={10}>+10 Prioritario</option>
                                                                    <option value={15}>+15 Determinante</option>
                                                                </select>

                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    className="h-8 text-xs"
                                                                    onClick={() =>
                                                                        assignOptionWeight(
                                                                            qIndex,
                                                                            oIndex,
                                                                            targetRec,
                                                                            targetPts,
                                                                        )
                                                                    }
                                                                >
                                                                    Asignar puntos
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* TAB 2: TARJETAS DE RECOMENDACIÓN */}
                    <TabsContent value="recommendations" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {(['all', 'nutricion', 'medicina', 'otro', 'general'] as const).map(
                                    (area) => (
                                        <Button
                                            key={area}
                                            type="button"
                                            size="sm"
                                            variant={
                                                areaFilterTab === area ? 'default' : 'outline'
                                            }
                                            onClick={() => setAreaFilterTab(area)}
                                            className="text-xs"
                                        >
                                            {area === 'all' ? 'Todas' : AREA_LABELS[area]}
                                        </Button>
                                    ),
                                )}
                            </div>

                            <Button
                                type="button"
                                onClick={addRecommendation}
                                className="flex items-center gap-2 self-start"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Tarjeta de Recomendación
                            </Button>
                        </div>

                        <div className="space-y-5">
                            {filteredRecommendations.map((rec) => (
                                <Card
                                    key={rec.id}
                                    className={
                                        rec.active
                                            ? 'border-neutral-200 shadow-sm'
                                            : 'border-dashed border-neutral-300 bg-neutral-50/70 opacity-80'
                                    }
                                >
                                    <CardHeader className="pb-4 border-b border-neutral-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <Badge className="bg-[#101E33] text-white">
                                                    {AREA_LABELS[rec.area]}
                                                </Badge>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    Prioridad #{rec.priority}
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={rec.active}
                                                        onCheckedChange={(checked) =>
                                                            updateRecommendation(rec.id, {
                                                                active: checked,
                                                            })
                                                        }
                                                    />
                                                    <span className="text-xs font-medium text-neutral-700">
                                                        {rec.active ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => duplicateRecommendation(rec)}
                                                    className="h-8 text-xs flex items-center gap-1.5"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    Duplicar
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteRecommendation(rec.id)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    title="Eliminar tarjeta"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-5 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-5">
                                                <Label className="text-xs">Título de la Tarjeta</Label>
                                                <Input
                                                    value={rec.title}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            title: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1 font-semibold"
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <Label className="text-xs">Etiqueta (Badge)</Label>
                                                <Input
                                                    value={rec.badge}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            badge: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-xs">Área</Label>
                                                <select
                                                    value={rec.area}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            area: e.target.value as MiniTestArea,
                                                        })
                                                    }
                                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
                                                >
                                                    {Object.entries(AREA_LABELS).map(([val, lbl]) => (
                                                        <option key={val} value={val}>
                                                            {lbl}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-xs">Prioridad desempate</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={rec.priority}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            priority: Math.max(
                                                                1,
                                                                Number(e.target.value) || 1,
                                                            ),
                                                        })
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-xs">Precio mostrado</Label>
                                                <Input
                                                    value={rec.price}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            price: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1"
                                                    placeholder="Ej. $4,499 MXN"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Precio anterior tachado (opcional)</Label>
                                                <Input
                                                    value={rec.oldPrice ?? ''}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            oldPrice: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1"
                                                    placeholder="Ej. $6,750 MXN"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Nota de pago</Label>
                                                <Input
                                                    value={rec.paymentNote}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            paymentNote: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1"
                                                    placeholder="Ej. Un solo pago"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-xs">Resumen persuasivo</Label>
                                            <Textarea
                                                value={rec.summary}
                                                onChange={(e) =>
                                                    updateRecommendation(rec.id, {
                                                        summary: e.target.value,
                                                    })
                                                }
                                                rows={2}
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Lista ¿Qué incluye? */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs">Lista de beneficios (¿Qué incluye?)</Label>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        updateRecommendation(rec.id, {
                                                            includes: [...rec.includes, 'Nuevo beneficio incluido'],
                                                        })
                                                    }
                                                    className="h-7 text-xs flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Agregar beneficio
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {rec.includes.map((inc, incIdx) => (
                                                    <div key={incIdx} className="flex items-center gap-2">
                                                        <Input
                                                            value={inc}
                                                            onChange={(e) =>
                                                                updateRecommendation(rec.id, {
                                                                    includes: rec.includes.map((v, idx) =>
                                                                        idx === incIdx ? e.target.value : v,
                                                                    ),
                                                                })
                                                            }
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                updateRecommendation(rec.id, {
                                                                    includes: rec.includes.filter(
                                                                        (_, idx) => idx !== incIdx,
                                                                    ),
                                                                })
                                                            }
                                                            className="h-8 w-8 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Conversión / Checkout / WhatsApp */}
                                        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                                                Acción de compra e inscripción
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs">Modo del botón principal</Label>
                                                    <select
                                                        value={rec.purchaseMode}
                                                        onChange={(e) =>
                                                            updateRecommendation(rec.id, {
                                                                purchaseMode: e.target.value as MiniTestPurchaseMode,
                                                            })
                                                        }
                                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-white px-2.5 py-1 text-xs shadow-xs"
                                                    >
                                                        {Object.entries(PURCHASE_MODE_LABELS).map(
                                                            ([val, lbl]) => (
                                                                <option key={val} value={val}>
                                                                    {lbl}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label className="text-xs">
                                                        Curso Programado específico (opcional)
                                                    </Label>
                                                    <select
                                                        value={rec.scheduledCourseId ?? ''}
                                                        onChange={(e) =>
                                                            updateRecommendation(rec.id, {
                                                                scheduledCourseId: e.target.value
                                                                    ? Number(e.target.value)
                                                                    : null,
                                                            })
                                                        }
                                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-white px-2.5 py-1 text-xs shadow-xs"
                                                    >
                                                        <option value="">
                                                            Buscar automáticamente por palabras clave
                                                        </option>
                                                        {scheduledCourses.map((sc) => (
                                                            <option key={sc.id} value={sc.id}>
                                                                #{sc.id} · {sc.course_title} ({sc.identificador || 'Cohorte'}) — ${sc.precio ?? 0} MXN
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label className="text-xs">
                                                        Palabras clave para coincidencia automática (separadas por coma)
                                                    </Label>
                                                    <Input
                                                        value={rec.keywords.join(', ')}
                                                        onChange={(e) =>
                                                            updateRecommendation(rec.id, {
                                                                keywords: e.target.value
                                                                    .split(',')
                                                                    .map((s) => s.trim())
                                                                    .filter(Boolean),
                                                            })
                                                        }
                                                        className="mt-1 bg-white"
                                                        placeholder="ej. premium, nutricion"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">
                                                        Ruta "Ver detalles del programa"
                                                    </Label>
                                                    <Input
                                                        value={rec.coursePageHref}
                                                        onChange={(e) =>
                                                            updateRecommendation(rec.id, {
                                                                coursePageHref: e.target.value,
                                                            })
                                                        }
                                                        className="mt-1 bg-white"
                                                        placeholder="/egel-plus-nutricion#paquetes"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-xs">
                                                    Mensaje prellenado de WhatsApp (usado en botón verde y como respaldo si no hay cohorte)
                                                </Label>
                                                <Textarea
                                                    value={rec.whatsappMessage}
                                                    onChange={(e) =>
                                                        updateRecommendation(rec.id, {
                                                            whatsappMessage: e.target.value,
                                                        })
                                                    }
                                                    rows={2}
                                                    className="mt-1 bg-white"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* TAB 3: ENCABEZADO DEL MODAL */}
                    <TabsContent value="header">
                        <Card>
                            <CardHeader>
                                <CardTitle>Textos Generales del Modal</CardTitle>
                                <CardDescription>
                                    Personaliza la cabecera que aparece al abrir el Mini-Test desde cualquier página pública.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-w-2xl">
                                <div>
                                    <Label htmlFor="header-badge">Etiqueta superior (Badge)</Label>
                                    <Input
                                        id="header-badge"
                                        value={draft.header.badge}
                                        onChange={(e) =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                header: { ...prev.header, badge: e.target.value },
                                            }))
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="header-title">Título principal del Modal</Label>
                                    <Input
                                        id="header-title"
                                        value={draft.header.title}
                                        onChange={(e) =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                header: { ...prev.header, title: e.target.value },
                                            }))
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="header-subtitle">Subtítulo al mostrar resultado</Label>
                                    <Input
                                        id="header-subtitle"
                                        value={draft.header.resultSubtitle}
                                        onChange={(e) =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                header: {
                                                    ...prev.header,
                                                    resultSubtitle: e.target.value,
                                                },
                                            }))
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Vista Previa en Vivo con el borrador actual */}
            <MiniTestModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                config={draft}
                scheduledCourses={scheduledCourses}
                listenToGlobalEvent={false}
            />
        </>
    );
}

MiniTestAdminPage.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Configuraciones Landing', href: '/admin/configuraciones' },
            { title: 'Mini-Test Vocacional', href: '/admin/mini-test' },
        ]}
    >
        {page}
    </AppLayout>
);
