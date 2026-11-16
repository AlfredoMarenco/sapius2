import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Send, Mail, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
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
    const { props } = usePage<any>();
    const flash = props.flash as { success?: string | null; error?: string | null } | undefined;
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        asunto: '',
        comentario: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedSuccess(false);
        post('/alumno/soporte', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSubmittedSuccess(true);
            },
        });
    };

    const successMessage = flash?.success || (submittedSuccess ? '¡Gracias! Tu mensaje ha sido enviado a nuestro equipo de soporte. En breve nos pondremos en contacto contigo.' : null);

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

                {successMessage && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 shadow-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-sm font-medium">
                            {successMessage}
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 shadow-xs">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-sm font-medium">
                            {flash.error}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Contact Form */}
                    <div className="md:col-span-8">
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Enviar Mensaje a Soporte Técnico</CardTitle>
                                <CardDescription>Responderemos a tu correo registrado ({user.email}) a la mayor brevedad posible</CardDescription>
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
                                    <span>contacto@sapius.com.mx</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                                    <span>Lunes a Viernes: 8:00 - 18:00 hrs</span>
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
