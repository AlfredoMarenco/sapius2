import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    '../../../../../node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface FieldConfig {
    id: string;
    name?: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    unit?: 'pt' | 'percent';
}

interface HighlightRect {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    unit?: 'pt' | 'percent';
}

interface PageSize {
    width: number;
    height: number;
}

export default function Review({ material, student, answers }: any) {
    const courseId = material?.lesson?.course?.id || material?.lesson?.curso_id;
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(1.0);
    const [pageSizes, setPageSizes] = useState<Record<number, PageSize>>({});

    const fields: FieldConfig[] = Array.isArray(material.fields_config) ? material.fields_config : [];
    const currentPageSize: PageSize = pageSizes[currentPage] || { width: 612, height: 792 };

    const isStructured = answers && typeof answers === 'object' && ('inputs' in answers || 'highlights' in answers);
    const studentInputs: Record<string, string> = isStructured ? answers.inputs || {} : answers || {};
    const studentHighlights: HighlightRect[] = isStructured && Array.isArray(answers.highlights) ? answers.highlights : [];
    const inkColor: string = isStructured && answers.color ? answers.color : '#0038a8';

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const onPageLoadSuccess = (page: any) => {
        const viewport = page.getViewport ? page.getViewport({ scale: 1.0 }) : null;
        const w = viewport?.width || page.originalWidth || 612;
        const h = viewport?.height || page.originalHeight || 792;
        setPageSizes((prev) => ({
            ...prev,
            [currentPage]: { width: w, height: h },
        }));
    };

    const getPercentStyle = (box: { x: number; y: number; width: number; height: number; unit?: string }) => {
        if (box.unit === 'percent') {
            return {
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
            };
        }

        return {
            left: `${(box.x / currentPageSize.width) * 100}%`,
            top: `${(box.y / currentPageSize.height) * 100}%`,
            width: `${(box.width / currentPageSize.width) * 100}%`,
            height: `${(box.height / currentPageSize.height) * 100}%`,
        };
    };

    return (
        <>
            <Head title={`Revisión: ${material.titulo} - ${student.name}`} />

            <div className="p-6 mx-auto h-[calc(100vh-80px)] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                            <User className="text-brand-blue" />
                            Revisión de Alumno: {student.nombre_completo || student.name || student.email}
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Documento: {material.titulo}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-lg bg-white px-2 py-1 gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.2).toFixed(2))))}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-xs font-mono font-semibold w-12 text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.2).toFixed(2))))}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={courseId ? `/admin/courses/${courseId}` : '/admin/courses'}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Curso
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-neutral-800 rounded-lg relative">
                    <div className="p-6 overflow-auto w-full flex flex-col items-center">
                        <div className="sticky top-0 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-4 z-20 mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm font-medium">
                                Página {currentPage} de {numPages || '--'}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= numPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>

                        <div className="relative shadow-2xl bg-white">
                            <Document file={material.file_url} onLoadSuccess={onDocumentLoadSuccess}>
                                <Page
                                    pageNumber={currentPage}
                                    scale={zoom}
                                    onLoadSuccess={onPageLoadSuccess}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>

                            {/* Highlights overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                {studentHighlights
                                    .filter((h) => h.page === currentPage)
                                    .map((h) => (
                                        <div
                                            key={h.id}
                                            className="absolute bg-yellow-300/45 border border-yellow-500/50 rounded-xs"
                                            style={getPercentStyle(h)}
                                        />
                                    ))}
                            </div>

                            {/* Overlay displaying fields with student answers */}
                            <div className="absolute inset-0 pointer-events-none">
                                {fields
                                    .filter((f) => f.page === currentPage)
                                    .map((field) => {
                                        const val = studentInputs[field.id] ?? (field.name ? studentInputs[field.name] : '') ?? '';
                                        return (
                                            <div
                                                key={field.id}
                                                className="absolute bg-white/90 border border-brand-blue/30 p-1 overflow-y-auto"
                                                style={{
                                                    ...getPercentStyle(field),
                                                    color: inkColor,
                                                }}
                                            >
                                                <span className="text-sm font-medium pointer-events-auto whitespace-pre-wrap">
                                                    {val}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Review.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Cursos', href: '/admin/courses' },
            { title: 'Revisión PDF', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
