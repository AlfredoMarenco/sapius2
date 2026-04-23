import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContentSchedulingModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: 'Modulo' | 'Lección' | 'Examen';
    data: {
        is_scheduled: boolean;
        available_at: string | null;
        expires_at: string | null;
    };
    onSave: (data: any) => void;
    processing?: boolean;
}

export default function ContentSchedulingModal({ 
    isOpen, 
    onClose, 
    title, 
    type,
    data, 
    onSave,
    processing = false
}: ContentSchedulingModalProps) {
    const [formData, setFormData] = useState(data);

    useEffect(() => {
        setFormData(data);
    }, [data, isOpen]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    // Helper to format date for input[type="datetime-local"]
    const formatDateForInput = (dateStr: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        
        // Format to YYYY-MM-DDTHH:mm
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tight flex items-center gap-3">
                        <Clock className="h-6 w-6 text-brand-blue" />
                        Programar {type}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSave} className="space-y-6 py-4">
                    <div className="bg-brand-blue/5 rounded-2xl p-4 border border-brand-blue/10 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-black uppercase tracking-widest text-brand-navy">Activar Programación</Label>
                            <p className="text-[10px] text-muted-foreground italic">Si está activado, el acceso se regirá por fechas.</p>
                        </div>
                        <Switch 
                            checked={formData.is_scheduled} 
                            onCheckedChange={(val) => setFormData({ ...formData, is_scheduled: val })} 
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy flex items-center gap-2 px-1">
                                <Calendar className="h-3 w-3" /> Fecha y Hora de Apertura
                            </Label>
                            <Input 
                                type="datetime-local"
                                value={formatDateForInput(formData.available_at)}
                                onChange={(e) => setFormData({ ...formData, available_at: e.target.value })}
                                disabled={!formData.is_scheduled}
                                className="h-12 border-2 rounded-xl font-bold bg-white focus:border-brand-blue"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy flex items-center gap-2 px-1">
                                <AlertCircle className="h-3 w-3 text-brand-coral" /> Fecha y Hora de Cierre (Opcional)
                            </Label>
                            <Input 
                                type="datetime-local"
                                value={formatDateForInput(formData.expires_at)}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                disabled={!formData.is_scheduled}
                                className="h-12 border-2 rounded-xl font-bold bg-white focus:border-brand-blue"
                            />
                            <p className="text-[9px] text-muted-foreground italic px-1">Deja vacío para que el contenido nunca expire.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium leading-relaxed text-brand-navy/60">
                            <strong>Nota:</strong> Los horarios se calculan en base a la zona horaria del servidor. Los alumnos verán una cuenta regresiva si aún no es hora de apertura.
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
                        <Button type="submit" disabled={processing} className="bg-brand-blue rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-brand-blue/20">
                            {processing ? 'Guardando...' : 'Programar Contenido'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
