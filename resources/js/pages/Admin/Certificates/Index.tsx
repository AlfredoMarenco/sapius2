import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Award, Search, Trash2, Eye, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';

interface Certificate {
    id: number;
    student_name: string;
    student_email: string;
    course_title: string;
    cohort_id: string;
    validation_code: string;
    issue_date: string;
}

interface Cohort {
    id: number;
    title: string;
}

interface Props {
    certificates: {
        data: Certificate[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    cohorts: Cohort[];
}

export default function CertificatesIndex({ certificates, filters, cohorts }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isEmitModalOpen, setIsEmitModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        curso_programado_id: '',
        user_id: ''
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.certificates.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleEmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.certificates.emit'), {
            onSuccess: () => {
                setIsEmitModalOpen(false);
                reset();
            }
        });
    };

    const revokeCertificate = (id: number) => {
        if (confirm('¿Estás seguro de que deseas revocar y eliminar este certificado? Esta acción no se puede deshacer.')) {
            router.delete(route('admin.certificates.destroy', id));
        }
    };

    return (
        <>
            <Head title="Gestor de Certificados" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Award className="w-8 h-8 text-blue-600" />
                            Certificados Emitidos
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Gestión, consulta y emisión de certificados ({certificates?.total || 0} en total).
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsEmitModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Emitir Certificados
                    </Button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                        <Input
                            placeholder="Buscar por alumno, email o folio..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button type="submit" variant="secondary" size="default">
                        Buscar
                    </Button>
                    {filters.search && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setSearchTerm('');
                                router.get(route('admin.certificates.index'));
                            }}
                        >
                            Limpiar
                        </Button>
                    )}
                </form>

                <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/50 dark:bg-neutral-900/50">
                                <TableHead>Alumno</TableHead>
                                <TableHead>Curso / Cohorte</TableHead>
                                <TableHead>Folio / Emisión</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!certificates?.data || certificates.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-neutral-400">
                                        No se encontraron certificados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                certificates.data.map((cert) => (
                                    <TableRow key={cert.id}>
                                        <TableCell>
                                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{cert.student_name}</div>
                                            <div className="text-xs text-neutral-500">{cert.student_email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-neutral-900 line-clamp-1" title={cert.course_title}>{cert.course_title}</div>
                                            <div className="text-xs text-neutral-500">Cohorte: {cert.cohort_id}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-mono font-bold text-neutral-900">{cert.validation_code}</div>
                                            <div className="text-xs text-neutral-500">{cert.issue_date}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2.5 gap-1.5 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                                >
                                                    <a href={route('admin.certificates.download', cert.id)} target="_blank">
                                                        <Eye className="w-4 h-4" />
                                                        <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Ver PDF</span>
                                                    </a>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2.5 gap-1.5 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                                    onClick={() => revokeCertificate(cert.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Revocar</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {certificates?.links && certificates.links.length > 3 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <span className="text-xs text-neutral-500">
                                Mostrando página {certificates.current_page} de {certificates.last_page}
                            </span>
                            <div className="flex gap-1">
                                {certificates.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        asChild={Boolean(link.url)}
                                        disabled={!link.url}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 px-3 text-xs"
                                    >
                                        {link.url ? (
                                            <Link 
                                                href={link.url} 
                                                dangerouslySetInnerHTML={{ __html: link.label }} 
                                            />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <Dialog open={isEmitModalOpen} onOpenChange={setIsEmitModalOpen}>
                <DialogContent>
                    <form onSubmit={handleEmit}>
                        <DialogHeader>
                            <DialogTitle>Emitir Certificados Manualmente</DialogTitle>
                            <DialogDescription>
                                Selecciona la cohorte para la cual deseas emitir los certificados. El sistema emitirá certificados automáticamente para todos los alumnos aprobados en dicha cohorte que aún no tengan uno.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cohorte / Curso Programado <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.curso_programado_id}
                                    onChange={e => setData('curso_programado_id', e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    required
                                >
                                    <option value="">Seleccione una cohorte...</option>
                                    {cohorts.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                                {errors.curso_programado_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.curso_programado_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alumno específico (Opcional)
                                </label>
                                <Input
                                    type="text"
                                    value={data.user_id}
                                    onChange={e => setData('user_id', e.target.value)}
                                    placeholder="ID del usuario (Dejar en blanco para toda la cohorte)"
                                />
                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEmitModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {processing ? 'Procesando...' : 'Emitir Certificados'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

CertificatesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Gestor de Certificados', href: '/admin/certificates' }]}>
        {page}
    </AppLayout>
);
