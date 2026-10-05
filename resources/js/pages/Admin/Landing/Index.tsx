import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Layers, Image as ImageIcon, Award, GraduationCap, Plus, Trash2, Edit, Upload, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Slide {
    id: number;
    img: string;
    section: string;
    position: number;
}

interface Pride {
    id: number;
    img: string;
    name: string;
    text: string;
    text2: string;
    position: number;
}

interface Teacher {
    id: number;
    img: string;
    name: string;
    description: string;
    position: number;
}

interface Props {
    slides: Slide[];
    prides: Pride[];
    teachers: Teacher[];
}

export default function LandingConfigIndex({ slides = [], prides = [], teachers = [] }: Props) {
    // Slides state
    const [isUploadSlideOpen, setIsUploadSlideOpen] = useState(false);
    const [slideFile, setSlideFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Prides state
    const [isPrideModalOpen, setIsPrideModalOpen] = useState(false);
    const [editingPride, setEditingPride] = useState<Pride | null>(null);
    const [prideForm, setPrideForm] = useState({ name: '', text: '', text2: '' });
    const [prideFile, setPrideFile] = useState<File | null>(null);

    // Teachers state
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [teacherForm, setTeacherForm] = useState({ name: '', description: '' });
    const [teacherFile, setTeacherFile] = useState<File | null>(null);

    // Handlers: Slides
    const handleUploadSlide = (e: React.FormEvent) => {
        e.preventDefault();
        if (!slideFile) return;
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', slideFile);

        router.post('/admin/configuraciones/upload', formData, {
            onSuccess: () => {
                setIsUploadSlideOpen(false);
                setSlideFile(null);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteSlide = (slide: Slide) => {
        if (!confirm('¿Estás seguro de eliminar este slide?')) return;
        router.get(`/admin/configuraciones/delete/${slide.id}`);
    };

    // Handlers: Prides
    const openCreatePride = () => {
        setEditingPride(null);
        setPrideForm({ name: '', text: '', text2: '' });
        setPrideFile(null);
        setIsPrideModalOpen(true);
    };

    const openEditPride = (pride: Pride) => {
        setEditingPride(pride);
        setPrideForm({ name: pride.name, text: pride.text, text2: pride.text2 });
        setPrideFile(null);
        setIsPrideModalOpen(true);
    };

    const handleSubmitPride = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', prideForm.name);
        formData.append('text', prideForm.text);
        formData.append('text2', prideForm.text2);
        if (prideFile) {
            formData.append('image', prideFile);
        }

        if (editingPride) {
            formData.append('_method', 'PUT');
            router.post(`/admin/configuraciones/pride/${editingPride.id}/update`, formData, {
                onSuccess: () => setIsPrideModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/configuraciones/pride/upload', formData, {
                onSuccess: () => setIsPrideModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleDeletePride = (pride: Pride) => {
        if (!confirm(`¿Eliminar orgullo Sapius de ${pride.name}?`)) return;
        router.get(`/admin/configuraciones/pride/${pride.id}/delete`);
    };

    // Handlers: Teachers
    const openCreateTeacher = () => {
        setEditingTeacher(null);
        setTeacherForm({ name: '', description: '' });
        setTeacherFile(null);
        setIsTeacherModalOpen(true);
    };

    const openEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setTeacherForm({ name: teacher.name, description: teacher.description });
        setTeacherFile(null);
        setIsTeacherModalOpen(true);
    };

    const handleSubmitTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', teacherForm.name);
        formData.append('description', teacherForm.description);
        if (teacherFile) {
            formData.append('image', teacherFile);
        }

        if (editingTeacher) {
            formData.append('_method', 'PUT');
            router.post(`/admin/configuraciones/teacher/${editingTeacher.id}/update`, formData, {
                onSuccess: () => setIsTeacherModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/configuraciones/teacher/upload', formData, {
                onSuccess: () => setIsTeacherModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleDeleteTeacher = (teacher: Teacher) => {
        if (!confirm(`¿Eliminar docente ${teacher.name}?`)) return;
        router.get(`/admin/configuraciones/teacher/${teacher.id}/delete`);
    };

    const getStorageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `/media/stream/${path}`;
    };

    return (
        <>
            <Head title="Configuraciones de la Plataforma - Landing" />

            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Configuraciones de Landing
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Personaliza los banners principales, la sección de testimonios de Orgullo Sapius y los perfiles docentes.
                    </p>
                </div>

                <Tabs defaultValue="slides" className="space-y-6">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                        <TabsTrigger value="slides" className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Slides Principales ({slides.length})
                        </TabsTrigger>
                        <TabsTrigger value="prides" className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Orgullo Sapius ({prides.length})
                        </TabsTrigger>
                        <TabsTrigger value="teachers" className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Docentes ({teachers.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* SLIDES TAB */}
                    <TabsContent value="slides" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    Banners del Slider Principal
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Imágenes promocionales rotatorias mostradas en la cabecera del portal.
                                </p>
                            </div>
                            <Button onClick={() => setIsUploadSlideOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Subir Imagen
                            </Button>
                        </div>

                        {slides.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30">
                                <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No hay banners en el slider</p>
                                <Button onClick={() => setIsUploadSlideOpen(true)} variant="outline" className="mt-4">
                                    Subir primer banner
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {slides.map((slide) => (
                                    <Card key={slide.id} className="overflow-hidden group hover:shadow-md transition">
                                        <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                            <img
                                                src={getStorageUrl(slide.img)}
                                                alt={`Slide ${slide.id}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        </div>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <span className="text-xs font-mono text-neutral-400">ID #{slide.id}</span>
                                            <Button
                                                onClick={() => handleDeleteSlide(slide)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* PRIDES TAB */}
                    <TabsContent value="prides" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    Testimonios Orgullo Sapius
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Alumnos admitidos y casos de éxito compartidos con la comunidad.
                                </p>
                            </div>
                            <Button onClick={openCreatePride} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Agregar Orgullo
                            </Button>
                        </div>

                        {prides.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30">
                                <Award className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No hay registros de Orgullo Sapius</p>
                                <Button onClick={openCreatePride} variant="outline" className="mt-4">
                                    Agregar primer testimonio
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {prides.map((pride) => (
                                    <Card key={pride.id} className="hover:shadow-md transition">
                                        <CardHeader className="pb-3 flex flex-row items-center gap-4 space-y-0">
                                            <img
                                                src={getStorageUrl(pride.img)}
                                                alt={pride.name}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-amber-200"
                                            />
                                            <div className="overflow-hidden">
                                                <CardTitle className="text-base truncate">{pride.name}</CardTitle>
                                                <CardDescription className="text-xs truncate">{pride.text}</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-3">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg">
                                                "{pride.text2}"
                                            </p>
                                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                                <Button onClick={() => openEditPride(pride)} variant="ghost" size="sm">
                                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeletePride(pride)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TEACHERS TAB */}
                    <TabsContent value="teachers" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    Docentes y Profesores
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Especialistas médicos y profesores destacados en la plataforma.
                                </p>
                            </div>
                            <Button onClick={openCreateTeacher} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Agregar Docente
                            </Button>
                        </div>

                        {teachers.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30">
                                <GraduationCap className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400 font-medium">No hay docentes registrados</p>
                                <Button onClick={openCreateTeacher} variant="outline" className="mt-4">
                                    Agregar primer docente
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teachers.map((teacher) => (
                                    <Card key={teacher.id} className="hover:shadow-md transition">
                                        <CardHeader className="pb-3 flex flex-row items-center gap-4 space-y-0">
                                            <img
                                                src={getStorageUrl(teacher.img)}
                                                alt={teacher.name}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
                                            />
                                            <div className="overflow-hidden">
                                                <CardTitle className="text-base truncate">{teacher.name}</CardTitle>
                                                <CardDescription className="text-xs">Especialista Docente</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-3">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg">
                                                {teacher.description}
                                            </p>
                                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                                <Button onClick={() => openEditTeacher(teacher)} variant="ghost" size="sm">
                                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteTeacher(teacher)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* MODAL: Upload Slide */}
            <Dialog open={isUploadSlideOpen} onOpenChange={setIsUploadSlideOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subir Banner Principal</DialogTitle>
                        <DialogDescription>
                            Selecciona una imagen para agregar al slider de la página de inicio.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUploadSlide} className="space-y-4">
                        <div>
                            <Label htmlFor="slideImage">Imagen del Slide</Label>
                            <Input
                                id="slideImage"
                                type="file"
                                accept="image/*"
                                required
                                onChange={(e) => setSlideFile(e.target.files?.[0] || null)}
                                className="mt-1"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUploadSlideOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !slideFile} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSubmitting ? 'Subiendo...' : 'Subir Banner'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL: Pride (Create/Edit) */}
            <Dialog open={isPrideModalOpen} onOpenChange={setIsPrideModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPride ? 'Editar Orgullo Sapius' : 'Agregar Orgullo Sapius'}</DialogTitle>
                        <DialogDescription>
                            Registra un alumno destacado o testimonio de admisión.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPride} className="space-y-4">
                        <div>
                            <Label htmlFor="prideName">Nombre del Estudiante</Label>
                            <Input
                                id="prideName"
                                value={prideForm.name}
                                onChange={(e) => setPrideForm({ ...prideForm, name: e.target.value })}
                                required
                                placeholder="Ej. Dra. María Pérez"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="prideText">Texto 1 (Universidad / Especialidad)</Label>
                            <Input
                                id="prideText"
                                value={prideForm.text}
                                onChange={(e) => setPrideForm({ ...prideForm, text: e.target.value })}
                                required
                                placeholder="Ej. Admitida en Medicina UNAM"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="prideText2">Texto 2 (Testimonio / Comentario)</Label>
                            <Textarea
                                id="prideText2"
                                value={prideForm.text2}
                                onChange={(e) => setPrideForm({ ...prideForm, text2: e.target.value })}
                                required
                                placeholder="Escribe el testimonio o mensaje del alumno..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="prideFile">Foto de perfil {editingPride && '(opcional si no cambia)'}</Label>
                            <Input
                                id="prideFile"
                                type="file"
                                accept="image/*"
                                required={!editingPride}
                                onChange={(e) => setPrideFile(e.target.files?.[0] || null)}
                                className="mt-1"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPrideModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                                {isSubmitting ? 'Guardando...' : (editingPride ? 'Guardar Cambios' : 'Registrar Orgullo')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL: Teacher (Create/Edit) */}
            <Dialog open={isTeacherModalOpen} onOpenChange={setIsTeacherModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTeacher ? 'Editar Docente' : 'Agregar Docente'}</DialogTitle>
                        <DialogDescription>
                            Gestiona el perfil de los docentes mostrados públicamente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitTeacher} className="space-y-4">
                        <div>
                            <Label htmlFor="teacherName">Nombre del Docente</Label>
                            <Input
                                id="teacherName"
                                value={teacherForm.name}
                                onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                required
                                placeholder="Ej. Dr. Carlos Mendoza"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="teacherDescription">Descripción / Biografía</Label>
                            <Textarea
                                id="teacherDescription"
                                value={teacherForm.description}
                                onChange={(e) => setTeacherForm({ ...teacherForm, description: e.target.value })}
                                required
                                placeholder="Especialidad, trayectoria o materias impartidas..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="teacherFile">Foto de perfil {editingTeacher && '(opcional si no cambia)'}</Label>
                            <Input
                                id="teacherFile"
                                type="file"
                                accept="image/*"
                                required={!editingTeacher}
                                onChange={(e) => setTeacherFile(e.target.files?.[0] || null)}
                                className="mt-1"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsTeacherModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                                {isSubmitting ? 'Guardando...' : (editingTeacher ? 'Guardar Cambios' : 'Registrar Docente')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

LandingConfigIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Configuraciones', href: '/admin/configuraciones' },
        { title: 'Landing', href: '/admin/configuraciones' },
    ]}>
        {page}
    </AppLayout>
);
