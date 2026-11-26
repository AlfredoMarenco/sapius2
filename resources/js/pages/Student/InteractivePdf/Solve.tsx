import React, { useState, useRef, useMemo, MouseEvent as ReactMouseEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Save, Highlighter, Type, ZoomIn, ZoomOut, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAntiCheat } from '@/hooks/useAntiCheat';

pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js?v=6.3.289';

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

export default function Solve({ material, curso_programado_id, existingAnswers }: any) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';
    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
        allowTextInputs: true,
    });

    const lessonTitle = material?.lesson?.title || material?.lesson?.titulo || 'Módulo';
    const backHref = curso_programado_id
        ? `/alumno/modulo/${material.leccion_id}/${curso_programado_id}`
        : '/alumno';

    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(1.0);
    const [pageSizes, setPageSizes] = useState<Record<number, PageSize>>({});

    const fields: FieldConfig[] = Array.isArray(material.fields_config) ? material.fields_config : [];

    // Compatibilidad con formato { inputs, highlights, color } y formato plano legacy
    const isStructured =
        existingAnswers &&
        typeof existingAnswers === 'object' &&
        ('inputs' in existingAnswers || 'highlights' in existingAnswers);

    const [inputs, setInputs] = useState<Record<string, string>>(
        isStructured ? existingAnswers.inputs || {} : existingAnswers || {},
    );
    const [highlights, setHighlights] = useState<HighlightRect[]>(
        isStructured && Array.isArray(existingAnswers.highlights) ? existingAnswers.highlights : [],
    );
    const [inkColor, setInkColor] = useState<'#0038a8' | '#000000'>(
        isStructured && (existingAnswers.color === '#000000' || existingAnswers.color === '#0038a8')
            ? existingAnswers.color
            : '#0038a8',
    );
    const [toolMode, setToolMode] = useState<'text' | 'highlight'>('text');
    const [processing, setProcessing] = useState(false);

    // Highlight drawing state (in PDF points scale=1.0)
    const [isDrawingHighlight, setIsDrawingHighlight] = useState(false);
    const [highlightStart, setHighlightStart] = useState({ x: 0, y: 0 });
    const [draftHighlight, setDraftHighlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    const currentPageSize: PageSize = pageSizes[currentPage] || { width: 612, height: 792 };

    const pdfFileSource = useMemo(
        () => ({
            url: material.file_url,
        }),
        [material.file_url],
    );

    const pdfOptions = useMemo(
        () => ({
            httpHeaders: {
                'X-Pdf-Viewer': 'sapius',
            },
            withCredentials: true,
        }),
        [],
    );

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

    const getFieldValue = (field: FieldConfig): string => {
        return inputs[field.id] ?? (field.name ? inputs[field.name] : '') ?? '';
    };

    const handleInputChange = (field: FieldConfig, value: string) => {
        setInputs((prev) => {
            const next = { ...prev, [field.id]: value };
            if (field.name) {
                next[field.name] = value;
            }
            return next;
        });
    };

    const handleCanvasMouseDown = (e: ReactMouseEvent) => {
        if (toolMode !== 'highlight' || !canvasWrapperRef.current) return;
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        const rect = canvasWrapperRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * currentPageSize.width;
        const y = ((e.clientY - rect.top) / rect.height) * currentPageSize.height;

        setIsDrawingHighlight(true);
        setHighlightStart({ x, y });
        setDraftHighlight({ x, y, width: 0, height: 0 });
    };

    const handleCanvasMouseMove = (e: ReactMouseEvent) => {
        if (!isDrawingHighlight || toolMode !== 'highlight' || !canvasWrapperRef.current) return;
        const rect = canvasWrapperRef.current.getBoundingClientRect();
        const currX = Math.max(0, Math.min(currentPageSize.width, ((e.clientX - rect.left) / rect.width) * currentPageSize.width));
        const currY = Math.max(0, Math.min(currentPageSize.height, ((e.clientY - rect.top) / rect.height) * currentPageSize.height));

        setDraftHighlight({
            x: Math.min(highlightStart.x, currX),
            y: Math.min(highlightStart.y, currY),
            width: Math.abs(currX - highlightStart.x),
            height: Math.abs(currY - highlightStart.y),
        });
    };

    const handleCanvasMouseUp = () => {
        if (isDrawingHighlight && draftHighlight && draftHighlight.width > 8 && draftHighlight.height > 6) {
            const newHighlight: HighlightRect = {
                id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                page: currentPage,
                x: Math.round(draftHighlight.x * 100) / 100,
                y: Math.round(draftHighlight.y * 100) / 100,
                width: Math.round(draftHighlight.width * 100) / 100,
                height: Math.round(draftHighlight.height * 100) / 100,
                color: '#fef08a',
                unit: 'pt',
            };
            setHighlights((prev) => [...prev, newHighlight]);
        }
        setIsDrawingHighlight(false);
        setDraftHighlight(null);
    };

    const removeHighlight = (id: string) => {
        setHighlights((prev) => prev.filter((h) => h.id !== id));
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

    const saveAnswers = () => {
        setProcessing(true);
        router.post(
            `/alumno/material-pdfs/${material.id}/save-answers`,
            {
                curso_programado_id,
                answers: {
                    inputs,
                    highlights,
                    color: inkColor,
                } as any,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title={`${material.titulo} - ${lessonTitle}`} />
            <StrikeAlert />
            <Watermark />

            <main
                className={`p-4 sm:p-6 mx-auto h-[calc(100vh-80px)] flex flex-col max-w-6xl select-none ${
                    isBlurred ? 'blur-xl pointer-events-none' : ''
                }`}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                            <BookOpen className="text-brand-blue shrink-0" />
                            <span>{material.titulo}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500">
                            {lessonTitle} · Completa los campos interactivos o resalta el texto con el marcatexto.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={backHref}>
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver
                            </Link>
                        </Button>
                        {Boolean(material.allow_download) && (
                            <Button variant="outline" size="sm" asChild className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                                <a
                                    href={`/alumno/material-pdfs/${material.id}/stream?download=1${
                                        curso_programado_id ? `&curso_programado_id=${curso_programado_id}` : ''
                                    }`}
                                    download
                                >
                                    <Download className="w-4 h-4 mr-1.5" /> Descargar PDF
                                </a>
                            </Button>
                        )}
                        <Button onClick={saveAnswers} disabled={processing} size="sm" className="bg-brand-blue hover:bg-brand-blue/90">
                            <Save className="w-4 h-4 mr-1.5" /> {processing ? 'Guardando...' : 'Guardar Respuestas'}
                        </Button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-2 mb-3 shadow-2xs flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={toolMode === 'text' ? 'default' : 'outline'}
                            className={toolMode === 'text' ? 'bg-brand-blue text-white' : ''}
                            onClick={() => setToolMode('text')}
                        >
                            <Type className="w-4 h-4 mr-1.5" /> Escribir
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={toolMode === 'highlight' ? 'default' : 'outline'}
                            className={toolMode === 'highlight' ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' : ''}
                            onClick={() => setToolMode('highlight')}
                        >
                            <Highlighter className="w-4 h-4 mr-1.5" /> Marcatexto
                        </Button>

                        <div className="h-5 w-px bg-neutral-200 mx-1" />

                        <span className="text-xs text-neutral-500 font-medium hidden sm:inline">Color de tinta:</span>
                        <button
                            type="button"
                            title="Azul Tinta (#0038a8)"
                            onClick={() => setInkColor('#0038a8')}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                                inkColor === '#0038a8' ? 'border-brand-blue scale-110 ring-2 ring-brand-blue/30' : 'border-neutral-300'
                            }`}
                            style={{ backgroundColor: '#0038a8' }}
                        />
                        <button
                            type="button"
                            title="Negro (#000000)"
                            onClick={() => setInkColor('#000000')}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                                inkColor === '#000000' ? 'border-neutral-900 scale-110 ring-2 ring-neutral-400' : 'border-neutral-300'
                            }`}
                            style={{ backgroundColor: '#000000' }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-lg px-1.5 py-0.5 gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                            >
                                <ZoomOut className="w-3.5 h-3.5" />
                            </Button>
                            <span className="text-xs font-mono font-semibold w-11 text-center">{Math.round(zoom * 100)}%</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
                            >
                                <ZoomIn className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                Anterior
                            </Button>
                            <span className="text-xs font-medium px-2">
                                {currentPage} / {numPages || '--'}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= numPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main PDF Viewer */}
                <div className="flex-1 flex overflow-auto justify-center bg-neutral-800 rounded-lg relative p-6">
                    <div className="flex justify-center items-start">
                        <div
                            ref={canvasWrapperRef}
                            className={`relative shadow-2xl bg-white ${toolMode === 'highlight' ? 'cursor-crosshair' : ''}`}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                        >
                            <Document file={pdfFileSource} options={pdfOptions} onLoadSuccess={onDocumentLoadSuccess}>
                                <Page
                                    pageNumber={currentPage}
                                    scale={zoom}
                                    onLoadSuccess={onPageLoadSuccess}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>

                            {/* Highlights layer */}
                            <div className="absolute inset-0 pointer-events-none">
                                {highlights
                                    .filter((h) => h.page === currentPage)
                                    .map((h) => (
                                        <div
                                            key={h.id}
                                            className="absolute bg-yellow-300/45 border border-yellow-500/40 rounded-xs group pointer-events-auto"
                                            style={getPercentStyle(h)}
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeHighlight(h.id);
                                                }}
                                                title="Quitar resaltado"
                                                className="absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                {isDrawingHighlight && draftHighlight && (
                                    <div
                                        className="absolute bg-yellow-300/40 border border-dashed border-amber-500"
                                        style={getPercentStyle({ ...draftHighlight, unit: 'pt' })}
                                    />
                                )}
                            </div>

                            {/* Inputs overlay */}
                            <div className={`absolute inset-0 ${toolMode === 'highlight' ? 'pointer-events-none opacity-80' : 'pointer-events-none'}`}>
                                {fields
                                    .filter((f) => f.page === currentPage)
                                    .map((field) => (
                                        <div
                                            key={field.id}
                                            className={`absolute ${toolMode === 'text' ? 'pointer-events-auto' : 'pointer-events-none'}`}
                                            style={getPercentStyle(field)}
                                        >
                                            <textarea
                                                className="w-full h-full resize-none border-2 border-brand-blue/50 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-brand-blue/5 p-1.5 text-sm placeholder-brand-blue/40 font-medium"
                                                style={{ color: inkColor }}
                                                placeholder={field.name || 'Escribe aquí...'}
                                                value={getFieldValue(field)}
                                                onChange={(e) => handleInputChange(field, e.target.value)}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

Solve.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Inicio', href: '/alumno' },
            { title: 'PDF Interactivo', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
