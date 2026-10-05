import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { HelpCircle, Send, Mail, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupportProps {
    user: {
        name: string;
        email: string;
    };
}

export default function Support({ user }: SupportProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        asunto: '',
        comentario: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/alumno/soporte', {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Soporte y Atención al Alumno" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Centro de Soporte y Ayuda
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        ¿Tienes dudas con tu plataforma o cursos? Estamos listos para asistirte.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Contact Form */}
                    <div className="md:col-span-8">
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Enviar Mensaje a Soporte Técnico</CardTitle>
                                <CardDescription>Responderemos a tu correo registrado a la mayor brevedad posible</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="asunto">Asunto del Mensaje</Label>
                                        <Input
                                            id="asunto"
                                            value={data.asunto}
                                            onChange={e => setData('asunto', e.target.value)}
                                            placeholder="Ej. Problema con acceso a simulador"
                                            required
                                        />
                                        {errors.asunto && <p className="text-xs text-red-500">{errors.asunto}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="comentario">Descripción Detallada</Label>
                                        <Textarea
                                            id="comentario"
                                            rows={6}
                                            value={data.comentario}
                                            onChange={e => setData('comentario', e.target.value)}
                                            placeholder="Explícanos tu situación con la mayor precisión posible..."
                                            required
                                        />
                                        {errors.comentario && <p className="text-xs text-red-500">{errors.comentario}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {processing ? 'Enviando...' : 'Enviar Mensaje'}
                                    </Button>
                                </CardContent>
                            </form>
                        </Card>
                    </div>

                    {/* Contact Info Card */}
                    <div className="md:col-span-4 space-y-4">
                        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 p-5 space-y-4">
                            <h3 className="font-bold text-sm text-blue-950 dark:text-blue-100">
                                Canales de Atención Directa
                            </h3>
                            <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <span>soporte@sapius.com.mx</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                                    <span>Lunes a Viernes: 9:00 - 18:00 hrs</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Support.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Alumno', href: '/alumno' },
        { title: 'Soporte', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
