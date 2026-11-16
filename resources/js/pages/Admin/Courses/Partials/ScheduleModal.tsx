import { router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    DollarSign,
    User as UserIcon,
    Tag,
    X,
    FileUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Instructor {
    id: number;
    first_name: string;
    last_name: string;
}

interface ScheduledCourse {
    id: number;
    instructor_id: number;
    start_date: string;
    end_date: string;
    fecha_inicio_venta?: string | null;
    fecha_fin_venta?: string | null;
    price: number;
    internal_id: string | null;
    is_active: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    course: {
        id: number;
        title: string;
        category?: { name: string } | null;
    };
    instructors: Instructor[];
    initialData?: ScheduledCourse | null;
}

function toDateInputValue(raw?: string | null): string {
    if (!raw) {
        return '';
    }

    return String(raw).split('T')[0].split(' ')[0];
}

function ScheduleModalForm({
    onClose,
    course,
    instructors,
    initialData,
}: Omit<Props, 'isOpen'>) {
    const [instructorId, setInstructorId] = useState(
        initialData ? initialData.instructor_id.toString() : '',
    );
    const [startDate, setStartDate] = useState(
        initialData ? toDateInputValue(initialData.start_date) : '',
    );
    const [endDate, setEndDate] = useState(
        initialData ? toDateInputValue(initialData.end_date) : '',
    );
    const [fechaInicioVenta, setFechaInicioVenta] = useState(
        initialData ? toDateInputValue(initialData.fecha_inicio_venta) : '',
    );
    const [fechaFinVenta, setFechaFinVenta] = useState(
        initialData ? toDateInputValue(initialData.fecha_fin_venta) : '',
    );
    const [price, setPrice] = useState(
        initialData ? initialData.price.toString() : '',
    );
    const [internalId, setInternalId] = useState(initialData?.internal_id || '');
    const [isActive, setIsActive] = useState(
        initialData ? Boolean(initialData.is_active) : true,
    );
    const [guiaFile, setGuiaFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const normalizedCategory = (course.category?.name || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const isGuidesCategory = normalizedCategory.includes('guia');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('instructor_id', instructorId);
        formData.append('start_date', startDate);
        formData.append('end_date', endDate);
        formData.append('fecha_inicio_venta', fechaInicioVenta);
        formData.append('fecha_fin_venta', fechaFinVenta);
        formData.append('price', price);
        formData.append('internal_id', internalId);
        formData.append('is_active', isActive ? '1' : '0');

        if (isGuidesCategory && guiaFile) {
            formData.append('guia_file', guiaFile);
        }

        if (initialData) {
            formData.append('_method', 'PUT');
            router.post(`/admin/schedules/${initialData.id}`, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Programación actualizada correctamente');
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post(`/admin/courses/${course.id}/schedules`, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Nueva programación activada');
                    onClose();
                },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8">
            <div className="grid grid-cols-2 gap-5">
                {/* Instructor */}
                <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                        <UserIcon className="h-3.5 w-3.5" /> Instructor Titular
                    </Label>
                    <Select value={instructorId} onValueChange={setInstructorId}>
                        <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold focus:ring-brand-blue">
                            <SelectValue placeholder="Seleccionar instructor" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                            {instructors.map((instructor) => (
                                <SelectItem
                                    key={instructor.id}
                                    value={instructor.id.toString()}
                                    className="rounded-xl p-3 font-bold"
                                >
                                    {instructor.first_name} {instructor.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.instructor_id && (
                        <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                            {errors.instructor_id}
                        </p>
                    )}
                </div>

                {/* Course Dates */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                        <CalendarIcon className="h-3.5 w-3.5" /> Fecha de Inicio
                    </Label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                    />
                    {errors.start_date && (
                        <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                            {errors.start_date}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                        <CalendarIcon className="h-3.5 w-3.5" /> Fecha de Expiración
                    </Label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                    />
                    {errors.end_date && (
                        <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                            {errors.end_date}
                        </p>
                    )}
                </div>

                {/* Sale Dates */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                        <CalendarIcon className="h-3.5 w-3.5" /> Inicio de Venta
                    </Label>
                    <Input
                        type="date"
                        value={fechaInicioVenta}
                        onChange={(e) => setFechaInicioVenta(e.target.value)}
                        className="h-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                    />
                    {errors.fecha_inicio_venta && (
                        <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                            {errors.fecha_inicio_venta}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                        <CalendarIcon className="h-3.5 w-3.5" /> Fin de Venta
                    </Label>
                    <Input
                        type="date"
                        value={fechaFinVenta}
                        onChange={(e) => setFechaFinVenta(e.target.value)}
                        className="h-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                    />
                    {errors.fecha_fin_venta && (
                        <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                            {errors.fecha_fin_venta}
                        </p>
                    )}
                </div>

                {/* Price & ID */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                        <DollarSign className="h-3.5 w-3.5" /> Precio Sugerido (MXN)
                    </Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="h-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                    />
                    {errors.price && (
                        <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                            {errors.price}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                        <Tag className="h-3.5 w-3.5" /> ID Interno / Folio
                    </Label>
                    <Input
                        value={internalId}
                        onChange={(e) => setInternalId(e.target.value)}
                        placeholder="OPCIONAL"
                        className="h-12 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                    />
                    {errors.internal_id && (
                        <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                            {errors.internal_id}
                        </p>
                    )}
                </div>

                {/* Optional Guia File when category is Guias */}
                {isGuidesCategory && (
                    <div className="col-span-2 space-y-2 rounded-2xl border-2 border-dashed border-brand-blue/25 bg-brand-blue/5 p-4">
                        <Label
                            htmlFor="guia_file"
                            className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-navy uppercase"
                        >
                            <FileUp className="h-4 w-4 text-brand-blue" /> Archivo de Guía
                            (Opcional — Categoría Guías)
                        </Label>
                        <Input
                            id="guia_file"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => setGuiaFile(e.target.files?.[0] || null)}
                            className="rounded-xl bg-white"
                        />
                        {guiaFile && (
                            <p className="text-xs font-semibold text-brand-blue">
                                Archivo seleccionado: {guiaFile.name}
                            </p>
                        )}
                        {errors.guia_file && (
                            <p className="text-[10px] font-black tracking-widest text-destructive uppercase">
                                {errors.guia_file}
                            </p>
                        )}
                    </div>
                )}

                {/* Active Toggle */}
                <div className="col-span-2 flex items-center justify-between rounded-[2rem] border-2 border-brand-navy/5 bg-brand-navy/5 p-5">
                    <div className="space-y-1">
                        <Label className="text-xs font-black tracking-tight text-brand-navy uppercase">
                            Activar inmediatamente
                        </Label>
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase italic">
                            Hacer visible en el catálogo de alumnos.
                        </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={(val) => setIsActive(val)} />
                </div>
            </div>

            <DialogFooter className="pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-2xl text-[10px] font-black tracking-widest uppercase"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-12 rounded-2xl bg-brand-navy px-8 text-[10px] font-black tracking-widest uppercase shadow-xl shadow-brand-navy/10 hover:bg-brand-blue"
                >
                    {processing
                        ? 'Guardando...'
                        : initialData
                          ? 'Actualizar Programación'
                          : 'Publicar Programación'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function ScheduleModal({
    isOpen,
    onClose,
    course,
    instructors,
    initialData,
}: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[3rem] border-2 border-gray-100 p-0 shadow-2xl sm:max-w-[580px]">
                <div className="relative bg-brand-navy p-8 text-white">
                    <div className="absolute top-[-20%] right-[-10%] h-40 w-40 rounded-full bg-brand-coral/20 blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl leading-none font-black tracking-tight uppercase">
                            {initialData
                                ? 'Editar Programación'
                                : 'Programar Nueva Edición'}
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-[10px] font-black tracking-widest text-white/60 uppercase">
                            Curso: {course.title}
                        </DialogDescription>
                    </DialogHeader>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {isOpen && (
                    <ScheduleModalForm
                        key={`${initialData?.id ?? 'new'}`}
                        onClose={onClose}
                        course={course}
                        instructors={instructors}
                        initialData={initialData}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
