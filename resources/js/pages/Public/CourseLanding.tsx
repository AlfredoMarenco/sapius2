import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle, ArrowRight, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CourseLandingProps {
    slug: string;
    reviews: any[];
}

export default function CourseLanding({ slug, reviews = [] }: CourseLandingProps) {
    const formattedTitle = slug.replace(/-/g, ' ').toUpperCase();

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500 selection:text-white">
            <Head title={`Curso ${formattedTitle} - Sapius`} />

            {/* Navbar */}
            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <Link href="/" className="text-xl font-black tracking-wider text-blue-400">
                    SAPIUS
                </Link>
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                        <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                        <Link href="/register">Registrarme</Link>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative py-24 px-6 max-w-5xl mx-auto text-center space-y-6">
                <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Programa Especializado
                </Badge>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                    Preparación Integral para <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        {formattedTitle}
                    </span>
                </h1>
                <p className="text-neutral-400 max-w-2xl mx-auto text-base sm:text-lg">
                    Domina cada área del examen con nuestros simuladores clínicos, clases en video y material enfocado en los reactivos de mayor frecuencia.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-13 px-8 text-base shadow-lg shadow-blue-600/25">
                        <Link href="/register">
                            Comenzar Ahora <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-13 px-8 text-base">
                        <Link href="/login">Acceder a mi cuenta</Link>
                    </Button>
                </div>
            </header>

            {/* Features */}
            <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Módulos Dinámicos</h3>
                    <p className="text-neutral-400 text-sm">Contenido desglosado paso a paso con clases grabadas y explicaciones detalladas.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Simuladores Reales</h3>
                    <p className="text-neutral-400 text-sm">Preguntas redactadas con el mismo formato y grado de complejidad de la prueba oficial.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Retroalimentación Instantánea</h3>
                    <p className="text-neutral-400 text-sm">Conoce tus aciertos y errores de inmediato con justificación médica y bibliográfica.</p>
                </div>
            </section>
        </div>
    );
}
