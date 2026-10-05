import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Ticket, ArrowLeft, Plus, Edit3, Power, DollarSign, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

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

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full shrink-0">
                            <Link href={`/admin/courses/${scheduledCourse.course.title ? 'todo' : 'todo'}`}> {/* Simplificado temporalmente, lo ideal es regresar a course */} 
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-brand-navy dark:text-neutral-100 flex items-center gap-2">
                                <Ticket className="w-6 h-6 text-brand-cyan" />
                                Códigos de Descuento
                            </h1>
                            <p className="text-sm text-neutral-500 font-medium">
                                {scheduledCourse.course.title} — {scheduledCourse.internal_id || `Cohorte #${scheduledCourse.id}`}
                            </p>
                        </div>
                    </div>
                    <Button onClick={openCreateModal} className="bg-brand-navy hover:bg-brand-blue text-white gap-2 rounded-xl">
                        <Plus className="w-4 h-4" /> Nuevo Código
                    </Button>
                </div>

                {/* Listado */}
                <Card className="rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-gray-200/40">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                        <CardTitle className="text-lg">Cupones Registrados</CardTitle>
                        <CardDescription>Gestiona los cupones que pueden usar los alumnos al inscribirse a esta cohorte.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {discounts.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="font-medium">No hay descuentos registrados para esta cohorte.</p>
                                <Button variant="link" onClick={openCreateModal} className="text-brand-blue">
                                    Crear el primer código
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {discounts.map((discount) => (
                                    <div key={discount.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-5 w-full md:w-auto">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-dashed ${discount.activo === 'si' ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5' : 'border-gray-300 text-gray-400 bg-gray-50'}`}>
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-black tracking-widest text-brand-navy uppercase">{discount.clave}</h3>
                                                    {discount.activo === 'si' ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase text-[9px] font-black tracking-widest">Activo</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-400 uppercase text-[9px] font-black tracking-widest border-gray-200">Inactivo</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> ${discount.descuento} MXN</span>
                                                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Límite: {discount.limite}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => openEditModal(discount)}
                                                className="h-9 px-3 gap-1.5 rounded-xl text-orange-600 border-orange-200 hover:bg-orange-50 uppercase text-[10px] font-black tracking-widest"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" /> Editar
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleToggle(discount.id, discount.activo)}
                                                className={`h-9 px-3 gap-1.5 rounded-xl uppercase text-[10px] font-black tracking-widest ${discount.activo === 'si' ? 'text-gray-600 border-gray-200 hover:bg-gray-100' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
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
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-brand-navy">
                            {editingId ? 'Editar Descuento' : 'Nuevo Código de Descuento'}
                        </DialogTitle>
                        <DialogDescription>
                            Ingresa los detalles del cupón promocional.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="clave" className="font-bold">Código del Cupón</Label>
                                <Input 
                                    id="clave" 
                                    value={data.clave} 
                                    onChange={e => setData('clave', e.target.value.toUpperCase())}
                                    placeholder="EJ: VERANO24"
                                    className={`uppercase ${errors.clave ? 'border-red-500' : ''}`}
                                />
                                {errors.clave && <p className="text-xs text-red-500 font-medium">{errors.clave}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descuento" className="font-bold">Monto a descontar ($ MXN)</Label>
                                <Input 
                                    id="descuento" 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.descuento} 
                                    onChange={e => setData('descuento', e.target.value)}
                                    placeholder="0.00"
                                    className={errors.descuento ? 'border-red-500' : ''}
                                />
                                {errors.descuento && <p className="text-xs text-red-500 font-medium">{errors.descuento}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="limite" className="font-bold">Límite de usos</Label>
                                <Input 
                                    id="limite" 
                                    type="number"
                                    min="1"
                                    value={data.limite} 
                                    onChange={e => setData('limite', e.target.value)}
                                    placeholder="1"
                                    className={errors.limite ? 'border-red-500' : ''}
                                />
                                {errors.limite && <p className="text-xs text-red-500 font-medium">{errors.limite}</p>}
                                <p className="text-[10px] text-gray-400 mt-1">Cantidad máxima de veces que puede ser utilizado por diferentes alumnos.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing} className="rounded-xl bg-brand-navy hover:bg-brand-blue text-white">
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
