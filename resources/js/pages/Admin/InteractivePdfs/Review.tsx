import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User } from 'lucide-react';
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

export default function Review({ material, student, answers }: any) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    const fields: FieldConfig[] = material.fields_config || [];
    const studentAnswers = answers || {}; // Object mapping field.id -> text

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Cursos', href: '/admin/cursos' },
            { title: material.lesson.course.title, href: `/admin/curso/${material.lesson.course.id}` },
            { title: 'Materiales PDF', href: `/admin/lessons/${material.leccion_id}/material-pdfs` },
            { title: 'Revisión', href: '#' },
        ]}>
            <Head title={`Revisión: ${material.titulo} - ${student.name}`} />

            <div className="p-6 mx-auto h-[calc(100vh-100px)] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                            <User className="text-brand-blue" />
                            Revisión de Alumno: {student.name} {student.paternal_surname}
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Documento: {material.titulo}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        {/* Go back to course cohort or previous view */}
                        <Link href={`/admin/curso/${material.lesson.course.id}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Curso
                        </Link>
                    </Button>
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
                            
                            {/* Overlay displaying fields with student answers */}
                            <div className="absolute inset-0 pointer-events-none">
                                {fields.filter(f => f.page === currentPage).map(field => (
                                    <div 
                                        key={field.id}
                                        className="absolute bg-white/90 border border-brand-blue/30 text-brand-navy p-1 overflow-y-auto"
                                        style={{
                                            left: `${field.x}%`,
                                            top: `${field.y}%`,
                                            width: `${field.width}%`,
                                            height: `${field.height}%`
                                        }}
                                    >
                                        <span className="text-sm pointer-events-auto">
                                            {studentAnswers[field.id] || ''}
                                        </span>
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
