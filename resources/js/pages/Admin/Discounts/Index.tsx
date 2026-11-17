import { Head, useForm, Link } from '@inertiajs/react';
import { Ticket, ArrowLeft, Plus, Edit3, Power, Percent, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface Discount {
    id: number;
    clave: string;
    descuento: number;
    limite: number;
    activo: 'si' | 'no';
    created_at: string;
}

interface ScheduledCourse {
    id: number;
    course_id: number;
    internal_id: string;
    start_date: string;
    end_date: string;
    price: string;
    course: {
        title: string;
    };
}

interface Props {
    scheduledCourse: ScheduledCourse;
    discounts: Discount[];
}

export default function DiscountsIndex({ scheduledCourse, discounts }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, patch, processing, errors, reset } = useForm({
        clave: '',
        descuento: '',
        limite: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (discount: Discount) => {
        setData({
            clave: discount.clave,
            descuento: discount.descuento.toString(),
            limite: discount.limite.toString(),
        });
        setEditingId(discount.id);
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            put(`/admin/scheduled-courses/${scheduledCourse.id}/discounts/${editingId}`, {
                onSuccess: () => {
                    toast.success('Cupón actualizado correctamente.');
                    setIsModalOpen(false);
                }
            });
        } else {
            post(`/admin/scheduled-courses/${scheduledCourse.id}/discounts`, {
                onSuccess: () => {
                    toast.success('Cupón creado exitosamente.');
                    setIsModalOpen(false);
                }
            });
        }
    };

    const handleToggle = (discountId: number, currentStatus: string) => {
        patch(`/admin/scheduled-courses/${scheduledCourse.id}/discounts/${discountId}/toggle`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(currentStatus === 'si' ? 'Cupón desactivado' : 'Cupón activado');
            }
        });
    };

    return (
        <>
            <Head title={`Descuentos - ${scheduledCourse.course.title}`} />

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-lg shrink-0">
                            <Link href={`/admin/courses/${scheduledCourse.course_id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100 flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-blue-600 shrink-0" />
                                Códigos de Descuento
                            </h1>
                            <p className="text-xs sm:text-sm text-neutral-500">
                                {scheduledCourse.course.title} — {scheduledCourse.internal_id || `Cohorte #${scheduledCourse.id}`}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={openCreateModal}
                        className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white px-4 text-xs sm:text-sm font-semibold shadow-xs gap-2 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Código
                    </Button>
                </div>

                {/* Listado */}
                <Card className="rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden dark:border-neutral-800">
                    <CardHeader className="bg-neutral-50/60 border-b border-neutral-100 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/50">
                        <CardTitle className="text-base font-bold text-[#101E33] dark:text-neutral-100">
                            Cupones Registrados
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Gestiona los cupones que pueden usar los alumnos al inscribirse a esta cohorte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {discounts.length === 0 ? (
                            <div className="p-10 text-center text-neutral-500">
                                <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-2.5" />
                                <p className="text-sm font-medium">No hay descuentos registrados para esta cohorte.</p>
                                <Button variant="link" onClick={openCreateModal} className="text-blue-600 text-xs">
                                    Crear el primer código
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {discounts.map((discount) => (
                                    <div key={discount.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border border-dashed ${discount.activo === 'si' ? 'border-emerald-300 text-emerald-600 bg-emerald-50/70' : 'border-neutral-300 text-neutral-400 bg-neutral-50'}`}>
                                                <Ticket className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-base font-bold tracking-wider text-[#101E33] dark:text-neutral-100 uppercase">
                                                        {discount.clave}
                                                    </h3>
                                                    {discount.activo === 'si' ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 text-[11px]">Activo</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-neutral-400 text-[11px]">Inactivo</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                    <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> {discount.descuento}%</span>
                                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Límite: {discount.limite}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(discount)}
                                                className="h-8 px-3 gap-1.5 rounded-lg text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggle(discount.id, discount.activo)}
                                                className={`h-8 px-3 gap-1.5 rounded-lg text-xs ${discount.activo === 'si' ? 'text-neutral-600 border-neutral-200 hover:bg-neutral-100' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                                            >
                                                <Power className="w-3.5 h-3.5" /> {discount.activo === 'si' ? 'Desactivar' : 'Activar'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal Crear/Editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#101E33] dark:text-neutral-100">
                            {editingId ? 'Editar Descuento' : 'Nuevo Código de Descuento'}
                        </DialogTitle>
                        <DialogDescription>
                            Ingresa los detalles del cupón promocional.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="clave" className="text-xs font-semibold">Código del Cupón</Label>
                                <Input
                                    id="clave"
                                    value={data.clave}
                                    onChange={e => setData('clave', e.target.value.toUpperCase())}
                                    placeholder="EJ: VERANO24"
                                    className={`uppercase h-9 rounded-lg ${errors.clave ? 'border-red-500' : ''}`}
                                />
                                {errors.clave && <p className="text-xs text-red-500 font-medium">{errors.clave}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="descuento" className="text-xs font-semibold">Descuento (%)</Label>
                                <Input
                                    id="descuento"
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="1"
                                    value={data.descuento}
                                    onChange={e => setData('descuento', e.target.value)}
                                    placeholder="1 - 100"
                                    className={`h-9 rounded-lg ${errors.descuento ? 'border-red-500' : ''}`}
                                />
                                {errors.descuento && <p className="text-xs text-red-500 font-medium">{errors.descuento}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="limite" className="text-xs font-semibold">Límite de usos</Label>
                                <Input
                                    id="limite"
                                    type="number"
                                    min="1"
                                    value={data.limite}
                                    onChange={e => setData('limite', e.target.value)}
                                    placeholder="1"
                                    className={`h-9 rounded-lg ${errors.limite ? 'border-red-500' : ''}`}
                                />
                                {errors.limite && <p className="text-xs text-red-500 font-medium">{errors.limite}</p>}
                                <p className="text-[11px] text-neutral-400">Cantidad máxima de veces que puede ser utilizado por diferentes alumnos.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 rounded-lg">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing} className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white font-semibold">
                                Guardar Cupón
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

DiscountsIndex.layout = (page: any) => <AppLayout breadcrumbs={[{ title: 'Descuentos', href: '#' }]}>{page}</AppLayout>;
