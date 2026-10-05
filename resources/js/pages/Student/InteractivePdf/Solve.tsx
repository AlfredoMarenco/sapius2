import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FieldConfig {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
}

export default function Solve({ material, existingAnswers }: any) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    const fields: FieldConfig[] = material.fields_config || [];
    
    const { data, setData, post, processing } = useForm({
        answers: existingAnswers || {}
    });

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleInputChange = (fieldId: string, value: string) => {
        setData('answers', {
            ...data.answers,
            [fieldId]: value
        });
    };

    const saveAnswers = () => {
        post(`/alumno/material-pdfs/${material.id}/save-answers`, {
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Inicio', href: '/alumno' },
            { title: 'Mis Cursos', href: '/alumno/cursos' },
            { title: material.lesson.course.title, href: `/alumno/curso/${material.lesson.course.id}` },
            { title: 'Módulo ' + material.lesson.titulo, href: `/alumno/modulo/${material.lesson.id}/${material.lesson.course.id}` },
            { title: material.titulo, href: '#' },
        ]}>
            <Head title={`${material.titulo}`} />

            <div className="p-6 mx-auto h-[calc(100vh-100px)] flex flex-col max-w-5xl">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                            <BookOpen className="text-brand-blue" />
                            {material.titulo}
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Completa los campos interactivos sobre el documento. Tus cambios se guardarán automáticamente al enviarlos.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/alumno/modulo/${material.leccion_id}/${material.lesson.course.id}`}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                            </Link>
                        </Button>
                        <Button onClick={saveAnswers} disabled={processing} className="bg-brand-blue hover:bg-brand-blue/90">
                            <Save className="w-4 h-4 mr-2" /> {processing ? 'Enviando...' : 'Guardar y Enviar Tarea'}
                        </Button>
                    </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 flex gap-4 overflow-hidden justify-center bg-neutral-800 rounded-lg relative">
                    
                    {/* Pagination controls */}
                    <div className="absolute top-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-4 z-10">
                        <Button 
                            variant="outline" size="sm" 
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm font-medium">
                            Página {currentPage} de {numPages || '--'}
                        </span>
                        <Button 
                            variant="outline" size="sm" 
                            disabled={currentPage >= numPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>

                    <div className="p-8 overflow-auto w-full flex justify-center items-start">
                        <div className="relative shadow-2xl bg-white">
                            <Document
                                file={material.file_url}
                                onLoadSuccess={onDocumentLoadSuccess}
                            >
                                <Page 
                                    pageNumber={currentPage} 
                                    width={900} 
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>
                            
                            {/* Overlay for inputs */}
                            <div className="absolute inset-0 pointer-events-none">
                                {fields.filter(f => f.page === currentPage).map(field => (
                                    <div 
                                        key={field.id}
                                        className="absolute pointer-events-auto"
                                        style={{
                                            left: `${field.x}%`,
                                            top: `${field.y}%`,
                                            width: `${field.width}%`,
                                            height: `${field.height}%`
                                        }}
                                    >
                                        <textarea
                                            className="w-full h-full resize-none border-2 border-brand-blue/50 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-brand-blue/5 p-2 text-sm text-brand-navy placeholder-brand-blue/40 font-medium"
                                            placeholder="Escribe tu respuesta aquí..."
                                            value={data.answers[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
