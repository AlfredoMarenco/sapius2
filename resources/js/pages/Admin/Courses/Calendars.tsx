import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    ChevronLeft, 
    Calendar,
    UploadCloud,
    Trash2,
    ArrowUp,
    ArrowDown,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CalendarItem {
    id: number;
    image_url: string;
    start_date: string;
    end_date: string;
    group_name: string | null;
    position: number;
}

interface Props {
    course: {
        id: number;
        title: string;
    };
    calendars: CalendarItem[];
}

export default function CourseCalendars({ course, calendars }: Props) {
    const [uploading, setUploading] = useState(false);
    
    // Formulario de subida
    const { data, setData, post, processing, errors, reset } = useForm({
        images: [] as File[],
        start_date: '',
        end_date: '',
        group_name: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        post(`/admin/courses/${course.id}/calendars`, {
            onSuccess: () => {
                reset();
                setUploading(false);
            },
            onError: () => {
                setUploading(false);
            }
        });
    };

    const deleteCalendar = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este calendario?')) {
            router.delete(`/admin/calendars/${id}`, { preserveScroll: true });
        }
    };

    const movePosition = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === calendars.length - 1) return;

        const newCalendars = [...calendars];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Intercambiamos posiciones visualmente
        const tempPos = newCalendars[index].position;
        newCalendars[index].position = newCalendars[swapIndex].position;
        newCalendars[swapIndex].position = tempPos;
        
        // Creamos el arreglo con el nuevo orden
        const orderData = newCalendars.map(c => ({
            id: c.id,
            position: c.position
        }));

        router.post(`/admin/courses/${course.id}/calendars/reorder`, { order: orderData }, {
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Cursos', href: '/admin/courses' },
            { title: course.title, href: `/admin/cursos/${course.id}` },
            { title: 'Calendarios' },
        ]}>
            <Head title={`Calendarios - ${course.title}`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/cursos/${course.id}`}
                        className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Calendarios de Programación
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Administra los cronogramas en imagen para el curso: <span className="font-semibold text-foreground">{course.title}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Panel de Subida */}
                    <div className="lg:col-span-1">
                        <form onSubmit={submit} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="font-semibold text-base text-foreground border-b border-border pb-2">
                                Subir Nuevo Calendario
                            </h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="images">Imágenes del Calendario</Label>
                                <div className="mt-1 flex justify-center rounded-lg border border-dashed border-border px-6 py-6">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                                        <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                                            <label
                                                htmlFor="images"
                                                className="relative cursor-pointer rounded-md bg-card font-semibold text-brand-blue hover:text-brand-blue/80 focus-within:outline-none"
                                            >
                                                <span>Sube archivos</span>
                                                <input id="images" name="images" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">o arrastra y suelta</p>
                                        </div>
                                        <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, WEBP hasta 5MB</p>
                                        {data.images.length > 0 && (
                                            <p className="mt-2 text-xs font-semibold text-brand-blue bg-brand-blue/10 rounded-md py-1">
                                                {data.images.length} archivo(s) seleccionado(s)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="group_name">Nombre del Grupo / Semana (Opcional)</Label>
                                <Input
                                    id="group_name"
                                    type="text"
                                    value={data.group_name}
                                    onChange={e => setData('group_name', e.target.value)}
                                    placeholder="Ej: Semana 1, Grupo A..."
                                />
                                {errors.group_name && <p className="text-xs text-red-500 mt-1">{errors.group_name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Fecha Inicio</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        required
                                    />
                                    {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Fecha Fin</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        required
                                    />
                                    {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>}
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold"
                                disabled={processing || uploading || data.images.length === 0}
                            >
                                <UploadCloud className="size-4 mr-2" />
                                {processing ? 'Subiendo...' : 'Subir Calendarios'}
                            </Button>
                        </form>
                    </div>

                    {/* Lista de Calendarios */}
                    <div className="lg:col-span-2 space-y-4">
                        {calendars.length === 0 ? (
                            <div className="bg-card border border-border rounded-xl p-10 text-center flex flex-col items-center justify-center">
                                <Calendar className="size-12 text-muted-foreground/30 mb-3" />
                                <h3 className="text-lg font-medium text-foreground">Sin calendarios</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    Aún no hay calendarios programados para este curso. Sube las imágenes a la izquierda para comenzar.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {calendars.map((calendar, index) => (
                                    <div key={calendar.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                                        <div className="relative h-48 bg-muted/30 border-b border-border group overflow-hidden">
                                            <img 
                                                src={calendar.image_url} 
                                                alt={`Calendario ${index+1}`} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <a href={calendar.image_url} target="_blank" rel="noreferrer" className="bg-white/90 text-black px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-white transition-colors shadow-lg">
                                                    Ver Imagen Original
                                                </a>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                {calendar.group_name && (
                                                    <span className="inline-block bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                                                        {calendar.group_name}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-3">
                                                    <Calendar className="size-3.5" />
                                                    {calendar.start_date} al {calendar.end_date}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => movePosition(index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        title="Subir posición"
                                                    >
                                                        <ArrowUp className="size-3.5" />
                                                    </button>
                                                    <span className="text-xs font-bold text-foreground w-6 text-center">{index + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => movePosition(index, 'down')}
                                                        disabled={index === calendars.length - 1}
                                                        className="p-1.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        title="Bajar posición"
                                                    >
                                                        <ArrowDown className="size-3.5" />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCalendar(calendar.id)}
                                                    className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Eliminar calendario"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
