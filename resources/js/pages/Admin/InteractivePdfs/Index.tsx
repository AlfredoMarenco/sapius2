import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FileText, Plus, Trash2, Layout, ArrowLeft, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    const courseId = lesson?.course?.id || lesson?.curso_id;
    const lessonTitle = lesson?.title || lesson?.titulo || 'Lección';

    const { data, setData, post, processing, errors, reset } = useForm({
        titulo: '',
        file: null as File | null,
        allow_download: false,
        leccion_id: lesson.id,
    });

    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editAllowDownload, setEditAllowDownload] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/material-pdfs', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setIsUploading(false);
            },
            preserveScroll: true,
        });
    };

    const startEdit = (pdf: any) => {
        setEditingId(pdf.id);
        setEditTitle(pdf.titulo || '');
        setEditAllowDownload(Boolean(pdf.allow_download));
    };

    const saveEdit = (id: number) => {
        router.put(
            `/admin/material-pdfs/${id}`,
            {
                titulo: editTitle,
                allow_download: editAllowDownload,
            },
            {
                preserveScroll: true,
                onSuccess: () => setEditingId(null),
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este PDF interactivo? Todos los datos de los alumnos se perderán.')) {
            router.delete(`/admin/material-pdfs/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title={`PDFs Interactivos - ${lessonTitle}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={courseId ? `/admin/courses/${courseId}` : '/admin/courses'}
                            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-4 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Curso
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <FileText className="w-8 h-8 text-brand-blue" />
                            Materiales PDF Interactivos
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Lección / Módulo: {lessonTitle}
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
                                            onChange={(e) => setData('titulo', e.target.value)}
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
                                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
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
                                materials.map((pdf: any) => {
                                    const isEditing = editingId === pdf.id;
                                    const fieldsCount = Array.isArray(pdf.fields_config) ? pdf.fields_config.length : 0;

                                    return (
                                        <TableRow key={pdf.id}>
                                            <TableCell className="font-medium text-neutral-900">
                                                {isEditing ? (
                                                    <Input
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                ) : (
                                                    pdf.titulo
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-neutral-500 truncate max-w-[200px]" title={pdf.file_path}>
                                                {pdf.file_path}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing ? (
                                                    <div className="inline-flex items-center justify-center">
                                                        <Switch
                                                            checked={editAllowDownload}
                                                            onCheckedChange={setEditAllowDownload}
                                                        />
                                                    </div>
                                                ) : pdf.allow_download ? (
                                                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Sí</span>
                                                ) : (
                                                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">No</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-xs text-brand-blue">
                                                {fieldsCount} campos
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="text-emerald-600" onClick={() => saveEdit(pdf.id)}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-neutral-500" onClick={() => setEditingId(null)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="text-neutral-600" onClick={() => startEdit(pdf)} title="Editar metadatos">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button asChild size="sm" variant="outline" className="text-xs border-brand-blue text-brand-blue hover:bg-brand-blue/10">
                                                            <Link href={`/admin/material-pdfs/${pdf.id}/edit`}>
                                                                <Layout className="w-4 h-4 mr-1" /> Editar Campos
                                                            </Link>
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(pdf.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Cursos', href: '/admin/courses' },
            { title: 'PDFs Interactivos', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
