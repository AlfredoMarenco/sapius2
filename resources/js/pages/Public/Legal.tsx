import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield, FileText, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalProps {
    type: string;
}

export default function Legal({ type }: LegalProps) {
    const titles: Record<string, { title: string; subtitle: string }> = {
        terms: {
            title: 'Términos y Condiciones de Uso',
            subtitle: 'Condiciones generales de acceso y prestación de servicios académicos en Sapius.',
        },
        privacidad: {
            title: 'Aviso de Privacidad',
            subtitle: 'Cómo protegemos y resguardamos tus datos personales de acuerdo con la legislación vigente.',
        },
        cookies: {
            title: 'Política de Cookies',
            subtitle: 'Información sobre el uso de cookies para mejorar tu experiencia en la plataforma.',
        },
        'no-access': {
            title: 'Acceso Restringido',
            subtitle: 'Esta sección requiere conexión desde un equipo de escritorio o navegador autorizado.',
        },
    };

    const current = titles[type] || { title: 'Información Legal', subtitle: '' };

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Head title={`${current.title} - Sapius`} />

            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
                <Link href="/" className="text-xl font-black tracking-wider text-blue-400">
                    SAPIUS
                </Link>
                <Button asChild variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al Inicio
                    </Link>
                </Button>
            </nav>

            <main className="py-16 px-6 max-w-4xl mx-auto space-y-8">
                <div className="border-b border-white/10 pb-6 space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold">{current.title}</h1>
                    <p className="text-neutral-400 text-sm">{current.subtitle}</p>
                </div>

                <div className="prose prose-invert max-w-none text-neutral-300 space-y-4 text-sm leading-relaxed">
                    <p>
                        Bienvenido a <strong>Sapius</strong>. Al utilizar nuestros servicios, aceptas cumplir con nuestras políticas institucionales, destinadas a proteger los derechos de autor de nuestro material médico y pedagógico, así como salvaguardar la privacidad de nuestros estudiantes.
                    </p>
                    <h2 className="text-lg font-bold text-white mt-6">1. Propiedad Intelectual</h2>
                    <p>
                        Todos los reactivos, simuladores, videos explicativos y guías de estudio son propiedad exclusiva de Sapius. Queda estrictamente prohibida la reproducción, distribución o reventa parcial o total del contenido sin autorización previa por escrito.
                    </p>
                    <h2 className="text-lg font-bold text-white mt-6">2. Uso de la Cuenta</h2>
                    <p>
                        El acceso al campus virtual es de carácter personal e intransferible. La detección de accesos simultáneos o anomalías en la dirección de red podrá derivar en la suspensión preventiva del servicio.
                    </p>
                </div>
            </main>
        </div>
    );
}
