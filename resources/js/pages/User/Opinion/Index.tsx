import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Review {
    id: number;
    name: string;
    rating: number;
    comment: string;
    visible: number | boolean;
    created_at: string;
}

interface OpinionProps {
    reviews: Review[];
}

export default function Opinion({ reviews = [] }: OpinionProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        rating: 5,
        comment: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/alumno/tu-opinion/store', {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Tu Opinión Nos Importa" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Tu Opinión es Muy Valiosa
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Comparte tu experiencia de estudio en Sapius para ayudarnos a mejorar día a día.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Opinion Form */}
                    <div className="md:col-span-6 space-y-6">
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Deja tu Testimonio</CardTitle>
                                <CardDescription>Califica tu experiencia con nuestros contenidos y profesores</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name">Tu Nombre o Alias</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ej. Dr. Carlos Mendoza"
                                            required
                                        />
                                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                    </div>

                                    {/* Star Rating */}
                                    <div className="space-y-1.5">
                                        <Label>Calificación (Estrellas)</Label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className="p-1 text-neutral-300 hover:text-yellow-400 focus:outline-none transition-colors"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setData('rating', star)}
                                                >
                                                    <Star
                                                        className={`w-7 h-7 ${(hoverRating || data.rating) >= star ? 'text-yellow-400 fill-yellow-400' : ''}`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="ml-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                                                {data.rating} de 5
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="comment">Tu Comentario o Reseña (Mínimo 50 caracteres)</Label>
                                        <Textarea
                                            id="comment"
                                            rows={5}
                                            value={data.comment}
                                            onChange={e => setData('comment', e.target.value)}
                                            placeholder="¿Qué te parecieron los simuladores, las clases y las explicaciones? Cuéntanos..."
                                            required
                                        />
                                        {errors.comment && <p className="text-xs text-red-500">{errors.comment}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {processing ? 'Enviando...' : 'Publicar mi opinión'}
                                    </Button>
                                </CardContent>
                            </form>
                        </Card>
                    </div>

                    {/* Previous reviews */}
                    <div className="md:col-span-6 space-y-4">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            Tus Reseñas Enviadas
                        </h2>

                        {reviews.length === 0 ? (
                            <Card className="p-8 text-center text-neutral-400">
                                Aún no has enviado ninguna reseña. ¡Nos encantaría conocer tu experiencia!
                            </Card>
                        ) : (
                            reviews.map((rev) => (
                                <Card key={rev.id} className="p-5 space-y-2 border-neutral-200/80 dark:border-neutral-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-4 h-4 ${rev.rating >= s ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <Badge variant={rev.visible ? "default" : "secondary"} className="text-xs">
                                            {rev.visible ? "Visible en Landing" : "Pendiente"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                                        "{rev.comment}"
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        {new Date(rev.created_at).toLocaleDateString()}
                                    </p>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Opinion.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Alumno', href: '/alumno' },
        { title: 'Tu Opinión', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
