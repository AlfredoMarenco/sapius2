import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ApprovedProps {
    enrollment: {
        id: number;
        course_title: string;
        reference: string;
        date: string;
    };
}

export default function Approved({ enrollment }: ApprovedProps) {
    return (
        <>
            <Head title="¡Pago Aprobado!" />

            <div className="py-16 px-4 max-w-xl mx-auto">
                <Card className="text-center border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden">
                    <div className="p-8 bg-emerald-50 dark:bg-emerald-950/30 flex flex-col items-center justify-center border-b border-emerald-100 dark:border-emerald-900/30">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                            ¡Inscripción Exitosa!
                        </h1>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                            Tu pago ha sido confirmado y tu acceso ha sido habilitado.
                        </p>
                    </div>

                    <CardContent className="p-6 space-y-4 text-left">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500">Curso:</span>
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{enrollment.course_title}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500">Número de Referencia:</span>
                                <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">{enrollment.reference}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500">Fecha y Hora:</span>
                                <span className="text-neutral-700 dark:text-neutral-300">{enrollment.date}</span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium">
                            <Link href="/alumno">
                                Ir a Mi Panel de Cursos <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

Approved.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Inscripción', href: '#' },
        { title: 'Aprobado', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
