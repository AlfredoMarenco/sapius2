import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, MousePointer2, Trash2 } from 'lucide-react';
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

export default function Editor({ material }: any) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    // State of all drawn fields
    const [fields, setFields] = useState<FieldConfig[]>(material.fields_config || []);
    
    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentBox, setCurrentBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    const { post, processing } = useForm({
        fields_config: []
    });

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleMouseDown = (e: ReactMouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate relative coordinates in percentage
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentBox({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e: ReactMouseEvent) => {
        if (!isDrawing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        const currentX = ((e.clientX - rect.left) / rect.width) * 100;
        const currentY = ((e.clientY - rect.top) / rect.height) * 100;

        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);
        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);

        setCurrentBox({ x, y, width, height });
    };

    const handleMouseUp = () => {
        if (isDrawing && currentBox && currentBox.width > 2 && currentBox.height > 2) {
            const newField: FieldConfig = {
                id: `field_${Date.now()}`,
                page: currentPage,
                x: currentBox.x,
                y: currentBox.y,
                width: currentBox.width,
                height: currentBox.height,
                type: 'text' // default
            };
            setFields([...fields, newField]);
        }
        setIsDrawing(false);
        setCurrentBox(null);
    };

    const removeField = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFields(fields.filter(f => f.id !== id));
    };

    const saveLayout = () => {
        post(`/admin/material-pdfs/${material.id}/save-layout`, {
            data: { fields_config: fields },
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Cursos', href: '/admin/cursos' },
            { title: material.lesson.course.title, href: `/admin/curso/${material.lesson.course.id}` },
            { title: 'Materiales PDF', href: `/admin/lessons/${material.leccion_id}/material-pdfs` },
            { title: 'Editor', href: '#' },
        ]}>
            <Head title={`Editor: ${material.titulo}`} />

            <div className="p-6 mx-auto h-[calc(100vh-100px)] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            Editor de Campos Interactivos
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Arrastra sobre el documento para crear cajas de texto editables.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/lessons/${material.leccion_id}/material-pdfs`}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Cancelar
                            </Link>
                        </Button>
                        <Button onClick={saveLayout} disabled={processing} className="bg-brand-blue hover:bg-brand-blue/90">
                            <Save className="w-4 h-4 mr-2" /> {processing ? 'Guardando...' : 'Guardar Layout'}
                        </Button>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Toolbar / Sidebar */}
                    <div className="w-64 bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-500">Herramientas</h3>
                            <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-md text-brand-blue flex items-center gap-2 text-sm font-medium">
                                <MousePointer2 className="w-4 h-4" /> Dibujar Caja
                            </div>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Haz clic y arrastra sobre el PDF para crear un área donde el alumno podrá escribir su respuesta.
                            </p>
                        </div>
                        
                        <hr />
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-neutral-500">Campos Creados ({fields.length})</h3>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                                {fields.map((f, i) => (
                                    <div key={f.id} className="flex items-center justify-between bg-neutral-50 border rounded p-2 text-xs">
                                        <div>
                                            <span className="font-mono font-medium text-neutral-700">Caja #{i+1}</span>
                                            <span className="text-neutral-400 ml-2">Pág. {f.page}</span>
                                        </div>
                                        <button onClick={(e) => removeField(f.id, e)} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {fields.length === 0 && <p className="text-xs text-neutral-400">No hay cajas creadas.</p>}
                            </div>
                        </div>
                    </div>

                    {/* PDF Canvas */}
                    <div className="flex-1 bg-neutral-800 rounded-lg overflow-auto flex flex-col items-center p-8 relative select-none">
                        
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

                        <div className="relative shadow-2xl bg-white" 
                            ref={containerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <Document
                                file={material.file_url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                className="pdf-document-wrapper"
                            >
                                <Page 
                                    pageNumber={currentPage} 
                                    width={800} // fixed width for consistent coordinate mapping
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>
                            
                            {/* Overlay for drawing and displaying fields */}
                            <div className="absolute inset-0 cursor-crosshair">
                                {/* Existing fields for THIS page */}
                                {fields.filter(f => f.page === currentPage).map(field => (
                                    <div 
                                        key={field.id}
                                        className="absolute border-2 border-brand-blue bg-brand-blue/20 flex items-center justify-center group"
                                        style={{
                                            left: `${field.x}%`,
                                            top: `${field.y}%`,
                                            width: `${field.width}%`,
                                            height: `${field.height}%`
                                        }}
                                    >
                                        <button 
                                            onClick={(e) => removeField(field.id, e)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <span className="text-[10px] font-bold text-brand-navy opacity-50 select-none pointer-events-none">Respuesta</span>
                                    </div>
                                ))}

                                {/* Box currently being drawn */}
                                {isDrawing && currentBox && (
                                    <div 
                                        className="absolute border-2 border-dashed border-brand-blue bg-brand-blue/10 pointer-events-none"
                                        style={{
                                            left: `${currentBox.x}%`,
                                            top: `${currentBox.y}%`,
                                            width: `${currentBox.width}%`,
                                            height: `${currentBox.height}%`
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
