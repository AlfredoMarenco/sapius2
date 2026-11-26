import React, { useState, useMemo, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Columns2,
    FileText,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAntiCheat } from '@/hooks/useAntiCheat';

pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js?v=6.3.289';

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
    const [reloadKey, setReloadKey] = useState(0);
    const [twoPageMode, setTwoPageMode] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pageInput, setPageInput] = useState('1');
    const viewerRef = useRef<HTMLDivElement>(null);

    const step = twoPageMode ? 2 : 1;

    const goToPrev = () => {
        setCurrentPage((p) => Math.max(1, p - step));
    };

    const goToNext = () => {
        if (!numPages) return;
        setCurrentPage((p) => {
            const next = p + step;
            return next > numPages ? p : next;
        });
    };

    useEffect(() => {
        setPageInput(String(currentPage));
    }, [currentPage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [numPages, twoPageMode]);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const toggleFullscreen = async () => {
        if (!viewerRef.current) return;
        if (!document.fullscreenElement) {
            await viewerRef.current.requestFullscreen().catch(() => {});
        } else {
            await document.exitFullscreen().catch(() => {});
        }
    };

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
                    <div
                        ref={viewerRef}
                        className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl relative shadow-xl border border-neutral-700/60"
                    >
                        {/* Barra superior de lectura */}
                        <div className="bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-white shrink-0">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-neutral-200 hover:text-white hover:bg-neutral-800"
                                    disabled={currentPage <= 1}
                                    onClick={goToPrev}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Anterior
                                </Button>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const parsed = parseInt(pageInput, 10);
                                        if (!isNaN(parsed) && parsed >= 1 && parsed <= (numPages || 1)) {
                                            setCurrentPage(parsed);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-mono text-neutral-300"
                                >
                                    <span>Pág.</span>
                                    <input
                                        type="text"
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        className="w-11 text-center bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <span>de {numPages || '--'}</span>
                                </form>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-neutral-200 hover:text-white hover:bg-neutral-800"
                                    disabled={!numPages || currentPage + (twoPageMode ? 1 : 0) >= numPages}
                                    onClick={goToNext}
                                >
                                    Siguiente
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={`text-xs ${
                                        twoPageMode
                                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30'
                                            : 'text-neutral-300 hover:bg-neutral-800'
                                    }`}
                                    onClick={() => setTwoPageMode((v) => !v)}
                                    title={twoPageMode ? 'Cambiar a 1 página' : 'Cambiar a modo libro (2 páginas)'}
                                >
                                    {twoPageMode ? (
                                        <>
                                            <Columns2 className="w-3.5 h-3.5 mr-1.5" />
                                            Libro (2 págs)
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                                            1 página
                                        </>
                                    )}
                                </Button>

                                <div className="h-4 w-px bg-neutral-700 mx-0.5" />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-200 hover:text-white hover:bg-neutral-800"
                                    onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-xs font-mono w-12 text-center text-neutral-200">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-200 hover:text-white hover:bg-neutral-800"
                                    onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.15).toFixed(2))))}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>

                                <div className="h-4 w-px bg-neutral-700 mx-0.5" />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-200 hover:text-white hover:bg-neutral-800"
                                    onClick={toggleFullscreen}
                                    title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                                >
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Área de lectura tipo libro */}
                        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-center relative">
                            {/* Botón lateral izquierdo */}
                            <button
                                type="button"
                                onClick={goToPrev}
                                disabled={currentPage <= 1}
                                className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-14 items-center justify-center rounded-full bg-neutral-950/70 hover:bg-neutral-900 text-white border border-white/10 shadow-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                                title="Página anterior (←)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <div className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] rounded-sm bg-white transition-all duration-300">
                                <Document
                                    key={reloadKey}
                                    file={pdfSource}
                                    options={pdfOptions}
                                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                    loading={
                                        <div className="p-16 text-center text-neutral-600 text-sm min-w-[340px]">
                                            Cargando guía digital...
                                        </div>
                                    }
                                    error={
                                        <div className="p-16 text-center space-y-3 min-w-[340px]">
                                            <p className="text-sm text-red-600 font-medium">
                                                No se pudo cargar el documento PDF.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setReloadKey((k) => k + 1)}
                                            >
                                                Reintentar
                                            </Button>
                                        </div>
                                    }
                                >
                                    <div className="flex items-stretch justify-center bg-[#f8f6f1]">
                                        <div className="relative bg-white">
                                            <Page
                                                pageNumber={currentPage}
                                                scale={zoom}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                            />
                                            {twoPageMode && currentPage + 1 <= numPages && (
                                                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/15 to-transparent" />
                                            )}
                                        </div>

                                        {twoPageMode && currentPage + 1 <= numPages && (
                                            <div className="relative bg-white border-l border-neutral-300/80">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/15 to-transparent z-10" />
                                                <Page
                                                    pageNumber={currentPage + 1}
                                                    scale={zoom}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Document>
                            </div>

                            {/* Botón lateral derecho */}
                            <button
                                type="button"
                                onClick={goToNext}
                                disabled={!numPages || currentPage + (twoPageMode ? 1 : 0) >= numPages}
                                className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-14 items-center justify-center rounded-full bg-neutral-950/70 hover:bg-neutral-900 text-white border border-white/10 shadow-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                                title="Página siguiente (→)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Barra de progreso de lectura */}
                        {numPages > 0 && (
                            <div className="bg-neutral-950/90 border-t border-neutral-800 px-4 py-1.5 flex items-center gap-3 text-[11px] text-neutral-400 shrink-0">
                                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{
                                            width: `${Math.min(100, Math.round(((currentPage + (twoPageMode && currentPage + 1 <= numPages ? 1 : 0)) / numPages) * 100))}%`,
                                        }}
                                    />
                                </div>
                                <span className="font-mono shrink-0">
                                    {Math.min(100, Math.round(((currentPage + (twoPageMode && currentPage + 1 <= numPages ? 1 : 0)) / numPages) * 100))}% leído
                                </span>
                            </div>
                        )}
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
