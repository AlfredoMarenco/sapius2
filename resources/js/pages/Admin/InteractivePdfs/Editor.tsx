import React, { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, MousePointer2, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    [key: string]: any;
}

interface PageSize {
    width: number;
    height: number;
}

export default function Editor({ material }: any) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(1.0);
    const [pageSizes, setPageSizes] = useState<Record<number, PageSize>>({});

    const [fields, setFields] = useState<FieldConfig[]>(
        Array.isArray(material.fields_config) ? material.fields_config : [],
    );

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [saving, setSaving] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const currentPageSize: PageSize = pageSizes[currentPage] || { width: 612, height: 792 };

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

    const handleMouseDown = (e: ReactMouseEvent) => {
        if (!containerRef.current) return;
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input')) return;

        const rect = containerRef.current.getBoundingClientRect();
        // Guardar coordenadas en puntos PDF (scale = 1.0)
        const x = ((e.clientX - rect.left) / rect.width) * currentPageSize.width;
        const y = ((e.clientY - rect.top) / rect.height) * currentPageSize.height;

        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentBox({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e: ReactMouseEvent) => {
        if (!isDrawing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const currentX = Math.max(0, Math.min(currentPageSize.width, ((e.clientX - rect.left) / rect.width) * currentPageSize.width));
        const currentY = Math.max(0, Math.min(currentPageSize.height, ((e.clientY - rect.top) / rect.height) * currentPageSize.height));

        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);
        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);

        setCurrentBox({ x, y, width, height });
    };

    const handleMouseUp = () => {
        if (isDrawing && currentBox && currentBox.width > 12 && currentBox.height > 10) {
            const nextNum = fields.length + 1;
            const newField: FieldConfig = {
                id: `field_${Date.now()}_${nextNum}`,
                name: `campo_${nextNum}`,
                page: currentPage,
                x: Math.round(currentBox.x * 100) / 100,
                y: Math.round(currentBox.y * 100) / 100,
                width: Math.round(currentBox.width * 100) / 100,
                height: Math.round(currentBox.height * 100) / 100,
                type: 'text',
                unit: 'pt',
            };
            setFields([...fields, newField]);
        }
        setIsDrawing(false);
        setCurrentBox(null);
    };

    const updateFieldProp = (id: string, key: keyof FieldConfig, value: any) => {
        setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
    };

    const removeField = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFields(fields.filter((f) => f.id !== id));
    };

    const getFieldPercentStyle = (field: { x: number; y: number; width: number; height: number; unit?: string }) => {
        if (field.unit === 'percent') {
            return {
                left: `${field.x}%`,
                top: `${field.y}%`,
                width: `${field.width}%`,
                height: `${field.height}%`,
            };
        }

        return {
            left: `${(field.x / currentPageSize.width) * 100}%`,
            top: `${(field.y / currentPageSize.height) * 100}%`,
            width: `${(field.width / currentPageSize.width) * 100}%`,
            height: `${(field.height / currentPageSize.height) * 100}%`,
        };
    };

    const saveLayout = () => {
        setSaving(true);
        router.post(
            `/admin/material-pdfs/${material.id}/save-layout`,
            {
                fields_config: fields,
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <>
            <Head title={`Editor: ${material.titulo}`} />

            <div className="p-6 mx-auto h-[calc(100vh-80px)] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            Editor de Campos Interactivos
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Arrastra sobre el documento para crear cajas editables en puntos PDF (escala 1.0).
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-lg bg-white px-2 py-1 gap-1 mr-2">
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
                            <Link href={`/admin/lessons/${material.leccion_id}/material-pdfs`}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                            </Link>
                        </Button>
                        <Button onClick={saveLayout} disabled={saving} className="bg-brand-blue hover:bg-brand-blue/90">
                            <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Layout'}
                        </Button>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Toolbar / Sidebar */}
                    <div className="w-72 bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-500">Herramientas</h3>
                            <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-md text-brand-blue flex items-center gap-2 text-sm font-medium">
                                <MousePointer2 className="w-4 h-4" /> Dibujar Caja (Puntos PDF)
                            </div>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Haz clic y arrastra sobre el PDF para crear un área donde el alumno podrá escribir su respuesta.
                            </p>
                        </div>

                        <hr />

                        <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-500">
                                Campos Creados ({fields.length})
                            </h3>
                            <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
                                {fields.map((f, i) => (
                                    <div key={f.id} className="bg-neutral-50 border rounded-md p-2.5 text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-mono font-semibold text-neutral-800">#{i + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage(f.page)}
                                                    className="text-brand-blue hover:underline ml-2"
                                                >
                                                    Pág. {f.page}
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => removeField(f.id, e)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <Input
                                            value={f.name || ''}
                                            placeholder={`campo_${i + 1}`}
                                            onChange={(e) => updateFieldProp(f.id, 'name', e.target.value)}
                                            className="h-7 text-xs bg-white"
                                        />
                                        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                                            <span>
                                                x:{Math.round(f.x)} y:{Math.round(f.y)} ({f.unit || 'pt'})
                                            </span>
                                            <select
                                                value={f.type || 'text'}
                                                onChange={(e) => updateFieldProp(f.id, 'type', e.target.value)}
                                                className="border rounded px-1 py-0.5 text-[10px] text-neutral-700 bg-white"
                                            >
                                                <option value="text">Texto</option>
                                                <option value="textarea">Párrafo</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {fields.length === 0 && <p className="text-xs text-neutral-400">No hay cajas creadas.</p>}
                            </div>
                        </div>
                    </div>

                    {/* PDF Canvas */}
                    <div className="flex-1 bg-neutral-800 rounded-lg overflow-auto flex flex-col items-center p-8 relative select-none">
                        {/* Pagination controls */}
                        <div className="sticky top-0 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-4 z-20 mb-4">
                            <Button
                                type="button"
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
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= numPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>

                        <div
                            className="relative shadow-2xl bg-white"
                            ref={containerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <Document file={material.file_url} onLoadSuccess={onDocumentLoadSuccess} className="pdf-document-wrapper">
                                <Page
                                    pageNumber={currentPage}
                                    scale={zoom}
                                    onLoadSuccess={onPageLoadSuccess}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>

                            {/* Overlay for drawing and displaying fields */}
                            <div className="absolute inset-0 cursor-crosshair">
                                {fields
                                    .filter((f) => f.page === currentPage)
                                    .map((field) => (
                                        <div
                                            key={field.id}
                                            className="absolute border-2 border-brand-blue bg-brand-blue/20 flex items-center justify-center group"
                                            style={getFieldPercentStyle(field)}
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => removeField(field.id, e)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            <span className="text-[10px] font-bold text-brand-navy opacity-70 select-none pointer-events-none truncate px-1">
                                                {field.name || 'Respuesta'}
                                            </span>
                                        </div>
                                    ))}

                                {isDrawing && currentBox && (
                                    <div
                                        className="absolute border-2 border-dashed border-brand-blue bg-brand-blue/10 pointer-events-none"
                                        style={getFieldPercentStyle({ ...currentBox, unit: 'pt' })}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Editor.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Cursos', href: '/admin/courses' },
            { title: 'Editor PDF', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
