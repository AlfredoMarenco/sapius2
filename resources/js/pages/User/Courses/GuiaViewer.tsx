import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAntiCheat } from '@/hooks/useAntiCheat';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    '../../../../../node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface GuiaViewerProps {
    scheduled: {
        id: number;
        identifier: string;
        title: string;
    };
    guia: {
        id: number;
        url: string;
        stream_url: string;
    } | null;
}

export default function GuiaViewer({ scheduled, guia }: GuiaViewerProps) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';
    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
    });

    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(1.0);

    const pdfSource = useMemo(
        () => (guia ? { url: guia.stream_url } : null),
        [guia],
    );

    const pdfOptions = useMemo(
        () => ({
            withCredentials: true,
        }),
        [],
    );

    return (
        <>
            <Head title={`Guía Digital - ${scheduled.title}`} />
            <StrikeAlert />
            <Watermark />

            <main
                className={`p-4 sm:p-6 mx-auto h-[calc(100vh-80px)] flex flex-col max-w-6xl select-none ${
                    isBlurred ? 'blur-xl pointer-events-none' : ''
                }`}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                            <BookOpen className="text-blue-600 shrink-0" />
                            <span>{scheduled.title}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500">
                            Guía Digital Protegida · {scheduled.identifier || `Cohorte #${scheduled.id}`}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/alumno/curso/${scheduled.id}`}>
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al curso
                        </Link>
                    </Button>
                </div>

                {!guia || !pdfSource ? (
                    <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-500">
                        No hay un archivo de guía publicado para esta cohorte todavía.
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-800 rounded-xl relative">
                        <div className="bg-neutral-900/90 border-b border-neutral-700 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-white">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-neutral-700"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                >
                                    Anterior
                                </Button>
                                <span className="text-xs font-mono">
                                    Página {currentPage} de {numPages || '--'}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-neutral-700"
                                    disabled={currentPage >= numPages}
                                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                                >
                                    Siguiente
                                </Button>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-neutral-700"
                                    onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-neutral-700"
                                    onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
                            <div className="shadow-2xl bg-white">
                                <Document file={pdfSource} options={pdfOptions} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                    <Page
                                        pageNumber={currentPage}
                                        scale={zoom}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </Document>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

GuiaViewer.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Mis Cursos', href: '/alumno' },
            { title: 'Guía Digital', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
