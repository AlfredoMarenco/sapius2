import { useForm, router } from '@inertiajs/react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
    Calendar as CalendarIcon, 
    DollarSign, 
    User as UserIcon, 
    Tag,
    X
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

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
    price: number;
    internal_id: string | null;
    is_active: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    course: { id: number; title: string };
    instructors: Instructor[];
    initialData?: ScheduledCourse | null;
}

export default function ScheduleModal({ isOpen, onClose, course, instructors, initialData }: Props) {
    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        instructor_id: '',
        start_date: '',
        end_date: '',
        price: '',
        internal_id: '',
        is_active: true,
    });

    useEffect(() => {
        if (initialData) {
            setData({
                instructor_id: initialData.instructor_id.toString(),
                start_date: initialData.start_date.split('T')[0],
                end_date: initialData.end_date.split('T')[0],
                price: initialData.price.toString(),
                internal_id: initialData.internal_id || '',
                is_active: initialData.is_active,
            });
        } else {
            reset();
        }
        clearErrors();
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (initialData) {
            patch(`/admin/schedules/${initialData.id}`, {
                onSuccess: () => {
                    toast.success('Programación actualizada correctamente');
                    onClose();
                },
                preserveScroll: true,
            });
        } else {
            post(`/admin/courses/${course.id}/schedules`, {
                onSuccess: () => {
                    toast.success('Nueva programación activada');
                    onClose();
                },
                preserveScroll: true,
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-0 overflow-hidden border-2 border-gray-100 shadow-2xl">
                <div className="bg-brand-navy p-8 text-white relative">
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-brand-coral/20 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">
                            {initialData ? 'Editar Programación' : 'Programar Nueva Edición'}
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">
                             Curso: {course.title}
                        </DialogDescription>
                    </DialogHeader>
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white/60 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Instructor */}
                        <div className="col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 flex items-center gap-2">
                                <UserIcon className="w-3.5 h-3.5" /> Instructor Titular
                            </Label>
                            <Select 
                                value={data.instructor_id} 
                                onValueChange={(val) => setData('instructor_id', val)}
                            >
                                <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 focus:ring-brand-blue bg-gray-50/30 font-bold">
                                    <SelectValue placeholder="Seleccionar instructor" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    {instructors.map((instructor) => (
                                        <SelectItem 
                                            key={instructor.id} 
                                            value={instructor.id.toString()}
                                            className="rounded-xl font-bold p-3"
                                        >
                                            {instructor.first_name} {instructor.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.instructor_id && <p className="text-[10px] font-black text-destructive uppercase tracking-widest">{errors.instructor_id}</p>}
                        </div>

                        {/* Dates */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5" /> Fecha de Inicio
                            </Label>
                            <Input 
                                type="date" 
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                            />
                            {errors.start_date && <p className="text-[10px] font-black text-destructive uppercase tracking-widest">{errors.start_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5" /> Fecha de Expiración
                            </Label>
                            <Input 
                                type="date" 
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                            />
                            {errors.end_date && <p className="text-[10px] font-black text-destructive uppercase tracking-widest">{errors.end_date}</p>}
                        </div>

                        {/* Price & ID */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5" /> Precio Sugerido (MXN)
                            </Label>
                            <Input 
                                type="number" 
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="0.00"
                                className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                            />
                            {errors.price && <p className="text-[10px] font-black text-destructive uppercase tracking-widest">{errors.price}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" /> ID Interno / Folio
                            </Label>
                            <Input 
                                value={data.internal_id}
                                onChange={(e) => setData('internal_id', e.target.value)}
                                placeholder="OPCIONAL"
                                className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 font-bold"
                            />
                            {errors.internal_id && <p className="text-[10px] font-black text-destructive uppercase tracking-widest">{errors.internal_id}</p>}
                        </div>

                        {/* Active Toggle */}
                        <div className="col-span-2 p-6 rounded-[2rem] bg-brand-navy/5 border-2 border-brand-navy/5 flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-xs font-black uppercase text-brand-navy tracking-tight">Activar inmediatamente</Label>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Hacer visible en el catálogo de alumnos.</p>
                            </div>
                            <Switch 
                                checked={data.is_active}
                                onCheckedChange={(val) => setData('is_active', val)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={onClose}
                            className="rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            disabled={processing}
                            className="h-14 px-8 rounded-2xl bg-brand-navy hover:bg-brand-blue font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-navy/10"
                        >
                            {processing ? 'Guardando...' : (initialData ? 'Actualizar Programación' : 'Publicar Programación')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Separator } from '@/components/ui/separator';
