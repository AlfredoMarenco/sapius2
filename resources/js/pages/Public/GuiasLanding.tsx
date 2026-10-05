import { Head, Link } from '@inertiajs/react';
import { BookCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GuiasProps {
    area: string;
    guias: any[];
}

export default function GuiasLanding({ area, guias = [] }: GuiasProps) {
    const title = `Guías de Estudio - ${area.toUpperCase()}`;

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Head title={title} />

            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <Link href="/" className="text-xl font-black tracking-wider text-blue-400">
                    SAPIUS
                </Link>
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                        <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                        <Link href="/register">Registrarme</Link>
                    </Button>
                </div>
            </nav>

            <main className="py-16 px-6 max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        Material Especializado
                    </Badge>
                    <h1 className="text-4xl font-extrabold sm:text-5xl">
                        Guías Oficiales de {area.charAt(0).toUpperCase() + area.slice(1)}
                    </h1>
                    <p className="text-neutral-400">
                        Compendios estructurados por temarios clave y casos prácticos indispensables para tu examen.
                    </p>
                </div>

                {guias.length === 0 ? (
                    <Card className="bg-white/5 border-white/10 p-12 text-center text-neutral-400">
                        No hay guías activas para venta en este momento en el área de {area}.
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guias.map((item) => (
                            <Card key={item.id} className="bg-neutral-900 border-neutral-800 text-white flex flex-col justify-between">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold">{item.course?.title || item.identificador}</CardTitle>
                                    <CardDescription className="text-neutral-400 text-xs">
                                        Identificador: {item.identificador}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-300 line-clamp-3">
                                        {item.course?.description}
                                    </p>
                                    <div className="mt-4 text-2xl font-black text-blue-400">
                                        ${Number(item.precio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-neutral-800 pt-4">
                                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
                                        <Link href={`/checkout/${item.id}`}>
                                            Adquirir Guía <ArrowRight className="w-4 h-4 ml-1.5" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
