import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, Plus, Trash2, Edit, Layout, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function Index({ lesson, materials }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        titulo: '',
        file: null as File | null,
        allow_download: false,
        leccion_id: lesson.id
    });

    const [isUploading, setIsUploading] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/material-pdfs', {
            onSuccess: () => {
                reset();
                setIsUploading(false);
            },
            preserveScroll: true
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este PDF interactivo? Todos los datos de los alumnos se perderán.')) {
            // using inertia to delete
            post(`/admin/material-pdfs/${id}`, {
                data: { _method: 'delete' },
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Cursos', href: '/admin/cursos' },
            { title: lesson.course.title, href: `/admin/curso/${lesson.course.id}` },
            { title: `Módulo ${lesson.titulo}`, href: '#' },
            { title: 'PDFs Interactivos', href: '#' },
        ]}>
            <Head title={`PDFs Interactivos - ${lesson.titulo}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={`/admin/curso/${lesson.course.id}`} className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-4 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Curso
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <FileText className="w-8 h-8 text-brand-blue" />
                            Materiales PDF Interactivos
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Módulo: {lesson.titulo}
                        </p>
                    </div>
                    <Button onClick={() => setIsUploading(!isUploading)} className="bg-brand-blue hover:bg-brand-blue/90">
                        {isUploading ? 'Cancelar' : <><Plus className="w-4 h-4 mr-2" /> Nuevo PDF</>}
                    </Button>
                </div>

                {isUploading && (
                    <Card className="border-brand-blue/20 shadow-md bg-brand-blue/5">
                        <CardHeader className="pb-3 border-b border-brand-blue/10">
                            <CardTitle className="text-lg text-brand-blue">Subir nuevo PDF Interactivo</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="titulo">Título del Documento</Label>
                                        <Input
                                            id="titulo"
                                            value={data.titulo}
                                            onChange={e => setData('titulo', e.target.value)}
                                            required
                                        />
                                        {errors.titulo && <p className="text-red-500 text-xs">{errors.titulo}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Archivo PDF</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => setData('file', e.target.files ? e.target.files[0] : null)}
                                            required
                                        />
                                        {errors.file && <p className="text-red-500 text-xs">{errors.file}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="allow_download"
                                        checked={data.allow_download}
                                        onCheckedChange={(checked) => setData('allow_download', checked)}
                                    />
                                    <Label htmlFor="allow_download">Permitir a los alumnos descargar el archivo original</Label>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={processing} className="bg-brand-navy hover:bg-brand-navy/90">
                                        Subir Archivo
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-neutral-200/80 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50/50">
                                <TableHead>Título</TableHead>
                                <TableHead>Archivo</TableHead>
                                <TableHead className="text-center">Permite Descarga</TableHead>
                                <TableHead className="text-center">Campos Configurados</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-neutral-400">
                                        No hay PDFs interactivos en esta lección.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                materials.map((pdf: any) => (
                                    <TableRow key={pdf.id}>
                                        <TableCell className="font-medium text-neutral-900">{pdf.titulo}</TableCell>
                                        <TableCell className="text-sm text-neutral-500 truncate max-w-[200px]" title={pdf.file_path}>
                                            {pdf.file_path}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {pdf.allow_download ? (
                                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Sí</span>
                                            ) : (
                                                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">No</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-xs text-brand-blue">
                                            {pdf.fields_config ? pdf.fields_config.length : 0} campos
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button asChild size="sm" variant="outline" className="text-xs border-brand-blue text-brand-blue hover:bg-brand-blue/10">
                                                <Link href={`/admin/material-pdfs/${pdf.id}/edit`}>
                                                    <Layout className="w-4 h-4 mr-1" /> Editar Campos
                                                </Link>
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(pdf.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
