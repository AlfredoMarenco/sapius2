import { Head, Link, usePage } from '@inertiajs/react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface ErrorProps {
    error?: string;
    code?: string;
    course_id?: number | null;
}

export default function CheckoutError({ error, code, course_id }: ErrorProps) {
    const { props } = usePage();
    const flashError = (props as any).flash?.error as string | undefined;
    const message = flashError || error || 'Ocurrió un error al procesar el pago.';

    return (
        <>
            <Head title="Error en el Pago" />

            <div className="py-16 px-4 max-w-xl mx-auto">
                <Card className="text-center border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden">
                    <div className="p-8 bg-red-50 dark:bg-red-950/30 flex flex-col items-center justify-center border-b border-red-100 dark:border-red-900/30">
                        <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-red-500/20">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-red-900 dark:text-red-100">
                            No se pudo completar el pago
                        </h1>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            No se realizó ningún cargo definitivo o la transacción no fue confirmada.
                        </p>
                    </div>

                    <CardContent className="p-6 space-y-4 text-left">
                        <div className="p-4 rounded-lg bg-red-50/70 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-sm text-red-800 dark:text-red-200">
                            {message}
                        </div>

                        {code && (
                            <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                                <span>Código de referencia:</span>
                                <Badge variant="outline" className="font-mono">
                                    {code}
                                </Badge>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                        {course_id ? (
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium">
                                <Link href={`/alumno/checkout/${course_id}`}>
                                    <RefreshCw className="w-4 h-4 mr-1.5" /> Reintentar Pago
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium">
                                <Link href="/alumno/cursos">
                                    <RefreshCw className="w-4 h-4 mr-1.5" /> Volver al Catálogo
                                </Link>
                            </Button>
                        )}

                        <Button asChild variant="outline" className="w-full h-11 font-medium">
                            <Link href={course_id ? '/alumno/cursos' : '/alumno'}>
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> {course_id ? 'Ir al Catálogo' : 'Ir a Mi Panel'}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

CheckoutError.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Cursos Disponibles', href: '/alumno/cursos' },
            { title: 'Error en Pago', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
