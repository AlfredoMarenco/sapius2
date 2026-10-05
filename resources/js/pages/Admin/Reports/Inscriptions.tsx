import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface InscriptionRecord {
    id: number;
    user_name: string;
    user_email: string;
    course_title: string;
    reference: string;
    status: string;
    payment_type: string | null;
    created_at: string;
}

interface InscriptionsProps {
    inscriptions: {
        data: InscriptionRecord[];
        links: any[];
    };
}

export default function Inscriptions({ inscriptions }: InscriptionsProps) {
    return (
        <>
            <Head title="Reporte de Inscripciones" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-3 text-neutral-600">
                        <Link href="/admin/reports">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Reportes
                        </Link>
                    </Button>
                </div>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Reporte Detallado de Inscripciones
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Historial de alumnos inscritos, referencias de pago y estado de validación.
                    </p>
                </div>

                <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/50 dark:bg-neutral-900/50">
                                <TableHead>ID</TableHead>
                                <TableHead>Alumno</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Referencia</TableHead>
                                <TableHead>Tipo Pago</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inscriptions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-neutral-400">
                                        No se encontraron registros de inscripciones.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inscriptions.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                                {item.user_name}
                                            </div>
                                            <div className="text-xs text-neutral-400">
                                                {item.user_email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-blue-600">
                                            {item.course_title}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                                            {item.reference}
                                        </TableCell>
                                        <TableCell className="text-xs capitalize">
                                            {item.payment_type || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === 'si' ? 'default' : 'secondary'} className={item.status === 'si' ? 'bg-emerald-600' : 'bg-amber-500 text-white'}>
                                                {item.status === 'si' ? 'Aprobado' : 'Pendiente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-neutral-500">
                                            {item.created_at}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild size="sm" variant="outline" className="text-xs">
                                                <Link href={`/admin/reports/inscriptions/${item.id}`}>
                                                    Ver Detalles
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}

Inscriptions.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Reportes', href: '/admin/reports' },
        { title: 'Inscripciones', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
