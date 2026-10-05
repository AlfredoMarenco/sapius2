import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Support() {
    const [form, setForm] = useState({ asunto: '', mensaje: '' });
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.post('/instructor/soporte', form, {
            onSuccess: () => {
                setSuccess(true);
                setForm({ asunto: '', mensaje: '' });
                setLoading(false);
            },
            onError: () => setLoading(false)
        });
    };

    return (
        <>
            <Head title="Soporte Técnico" />
            
            <div className="max-w-2xl mx-auto rounded-xl border border-sidebar-border/50 bg-sidebar/10 p-8 shadow-sm">
                <h1 className="text-2xl font-bold mb-2">Contacto con Soporte</h1>
                <p className="text-muted-foreground mb-6">
                    Envíanos tus dudas o reporta algún problema con la plataforma. Nuestro equipo te responderá a la brevedad.
                </p>

                {success && (
                    <div className="mb-6 rounded-md border border-green-500/50 bg-green-500/10 p-4 flex gap-3 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <p>Tu mensaje se ha enviado exitosamente.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Asunto</label>
                        <input 
                            type="text" 
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            placeholder="Ej. Problema con video de la lección 3"
                            value={form.asunto}
                            onChange={e => setForm({...form, asunto: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mensaje detallado</label>
                        <textarea 
                            rows={6}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            placeholder="Describe el problema o duda..."
                            value={form.mensaje}
                            onChange={e => setForm({...form, mensaje: e.target.value})}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full gap-2"
                    >
                        {loading ? 'Enviando...' : (
                            <>
                                <Send className="h-4 w-4" />
                                Enviar mensaje
                            </>
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}

Support.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/instructor' },
        { title: 'Soporte', href: '/instructor/soporte' }
    ]}>
        {page}
    </AppLayout>
);
