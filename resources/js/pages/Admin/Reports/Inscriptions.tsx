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

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-neutral-600 h-8">
                        <Link href="/admin/reports">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Reportes
                        </Link>
                    </Button>
                </div>

                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                        Reporte Detallado de Inscripciones
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Historial de alumnos inscritos, referencias de pago y estado de validación.
                    </p>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                    {inscriptions.data.length === 0 ? (
                        <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
                            No se encontraron registros de inscripciones.
                        </div>
                    ) : (
                        inscriptions.data.map((item) => (
                            <div key={item.id} className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm text-[#101E33] dark:text-neutral-100 truncate">
                                            #{item.id} · {item.user_name}
                                        </div>
                                        <div className="text-xs text-neutral-500 truncate">{item.user_email}</div>
                                    </div>
                                    <Badge variant={item.status === 'si' ? 'default' : 'secondary'} className={`shrink-0 text-[11px] ${item.status === 'si' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                                        {item.status === 'si' ? 'Aprobado' : 'Pendiente'}
                                    </Badge>
                                </div>
                                <div className="text-xs space-y-0.5 text-neutral-600 dark:text-neutral-300">
                                    <div className="font-medium text-blue-600">{item.course_title}</div>
                                    <div className="text-neutral-500">Ref: <span className="font-mono">{item.reference}</span> · {item.payment_type || 'N/A'}</div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <span className="text-[11px] text-neutral-400">{item.created_at}</span>
                                    <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs">
                                        <Link href={`/admin/reports/inscriptions/${item.id}`}>
                                            Ver Detalles
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Card className="hidden md:block rounded-xl border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/70 dark:bg-neutral-900/50">
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
                                    <TableCell colSpan={8} className="text-center py-8 text-neutral-400">
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
                                            <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs">
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
                    {inscriptions.links && inscriptions.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 bg-neutral-50/30 dark:bg-neutral-900/30">
                            {inscriptions.links.map((link: any, index: number) => (
                                link.url ? (
                                    <Button
                                        key={index}
                                        asChild
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        className={link.active ? 'bg-[#101E33] hover:bg-[#192B47] text-white h-8' : 'text-xs h-8'}
                                    >
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </Button>
                                ) : (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 text-xs text-neutral-400 select-none"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </Card>

                {/* Mobile Pagination */}
                {inscriptions.links && inscriptions.links.length > 3 && (
                    <div className="flex md:hidden flex-wrap justify-center gap-1 rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                        {inscriptions.links.map((link: any, index: number) => (
                            link.url ? (
                                <Button
                                    key={index}
                                    asChild
                                    size="sm"
                                    variant={link.active ? 'default' : 'outline'}
                                    className={link.active ? 'bg-[#101E33] text-white h-8' : 'text-xs h-8'}
                                >
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Button>
                            ) : (
                                <span
                                    key={index}
                                    className="px-2.5 py-1 text-xs text-neutral-400 select-none"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
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
