import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ChevronLeft,
    Calendar,
    UploadCloud,
    Trash2,
    ArrowUp,
    ArrowDown,
    Image as ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

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

export default function CourseCalendars({ course, calendars = [] }: Props) {
    const [uploading, setUploading] = useState(false);

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
        post(`/admin/courses/${course.id}/calendars/upload`, {
            onSuccess: () => {
                reset();
                setUploading(false);
            },
            onError: () => {
                setUploading(false);
            },
        });
    };

    const deleteCalendar = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este calendario?')) {
            router.delete(`/admin/courses/calendars/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const movePosition = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) {
return;
}

        if (direction === 'down' && index === calendars.length - 1) {
return;
}

        const newCalendars = calendars.map((c) => ({ ...c }));
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        const tempPos = newCalendars[index].position;
        newCalendars[index].position = newCalendars[swapIndex].position;
        newCalendars[swapIndex].position = tempPos;

        const orderData = newCalendars.map((c) => ({
            id: c.id,
            position: c.position,
        }));

        router.post(
            `/admin/courses/${course.id}/calendars/reorder`,
            { order: orderData },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={`Calendarios - ${course.title}`} />

            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/cursos/${course.id}`}
                        className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ChevronLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Calendarios de Programación
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Administra los cronogramas en imagen para el curso:{' '}
                            <span className="font-semibold text-foreground">
                                {course.title}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Panel de Subida */}
                    <div className="lg:col-span-1">
                        <form
                            onSubmit={submit}
                            className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                        >
                            <h3 className="border-b border-border pb-2 text-base font-semibold text-foreground">
                                Subir Nuevo Calendario
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="images">Imágenes del Calendario</Label>
                                <div className="mt-1 flex justify-center rounded-lg border border-dashed border-border px-6 py-6">
                                    <div className="text-center">
                                        <ImageIcon
                                            className="mx-auto h-8 w-8 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                                            <label
                                                htmlFor="images"
                                                className="relative cursor-pointer rounded-md bg-card font-semibold text-brand-blue focus-within:outline-none hover:text-brand-blue/80"
                                            >
                                                <span>Sube archivos</span>
                                                <input
                                                    id="images"
                                                    name="images"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            <p className="pl-1">o arrastra y suelta</p>
                                        </div>
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            PNG, JPG, WEBP hasta 5MB
                                        </p>
                                        {data.images.length > 0 && (
                                            <p className="mt-2 rounded-md bg-brand-blue/10 py-1 text-xs font-semibold text-brand-blue">
                                                {data.images.length} archivo(s) seleccionado(s)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {errors.images && (
                                    <p className="mt-1 text-xs text-red-500">{errors.images}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="group_name">
                                    Nombre del Grupo / Semana (Opcional)
                                </Label>
                                <Input
                                    id="group_name"
                                    type="text"
                                    value={data.group_name}
                                    onChange={(e) => setData('group_name', e.target.value)}
                                    placeholder="Ej: Semana 1, Grupo A..."
                                />
                                {errors.group_name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.group_name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Fecha Inicio</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Fecha Fin</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-brand-blue font-semibold text-white hover:bg-brand-blue/90"
                                disabled={processing || uploading || data.images.length === 0}
                            >
                                <UploadCloud className="mr-2 size-4" />
                                {processing ? 'Subiendo...' : 'Subir Calendarios'}
                            </Button>
                        </form>
                    </div>

                    {/* Lista de Calendarios */}
                    <div className="space-y-4 lg:col-span-2">
                        {calendars.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center">
                                <Calendar className="mb-3 size-12 text-muted-foreground/30" />
                                <h3 className="text-lg font-medium text-foreground">
                                    Sin calendarios
                                </h3>
                                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                    Aún no hay calendarios programados para este curso. Sube las
                                    imágenes a la izquierda para comenzar.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {calendars.map((calendar, index) => (
                                    <div
                                        key={calendar.id}
                                        className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                                    >
                                        <div className="group relative h-48 overflow-hidden border-b border-border bg-muted/30">
                                            <img
                                                src={calendar.image_url}
                                                alt={`Calendario ${index + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <a
                                                    href={calendar.image_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-black shadow-lg transition-colors hover:bg-white"
                                                >
                                                    Ver Imagen Original
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between p-4">
                                            <div>
                                                {calendar.group_name && (
                                                    <span className="mb-2 inline-block rounded bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-blue uppercase">
                                                        {calendar.group_name}
                                                    </span>
                                                )}
                                                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                    <Calendar className="size-3.5" />
                                                    {calendar.start_date} al {calendar.end_date}
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => movePosition(index, 'up')}
                                                        disabled={index === 0}
                                                        className="rounded bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-30"
                                                        title="Subir posición"
                                                    >
                                                        <ArrowUp className="size-3.5" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-bold text-foreground">
                                                        {index + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            movePosition(index, 'down')
                                                        }
                                                        disabled={index === calendars.length - 1}
                                                        className="rounded bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-30"
                                                        title="Bajar posición"
                                                    >
                                                        <ArrowDown className="size-3.5" />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCalendar(calendar.id)}
                                                    className="rounded bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100"
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
        </>
    );
}

CourseCalendars.layout = (
    page: ReactElement<{ course?: { id: number; title: string } }>,
) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Cursos', href: '/admin/courses' },
            {
                title: page.props?.course?.title || 'Curso',
                href: page.props?.course?.id
                    ? `/admin/cursos/${page.props.course.id}`
                    : '/admin/courses',
            },
            { title: 'Calendarios', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
