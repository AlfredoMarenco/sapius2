import AppLayout from '@/layouts/app-layout';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    CheckCircle2,
    Circle,
    FileText,
    Download,
    PlayCircle,
    LayoutList,
    BookOpen,
    BrainCircuit,
    ChevronLeft,
    UploadCloud,
    FileCheck,
    ExternalLink,
    Eye,
    Lock,
    X,
    ZoomIn,
    ZoomOut,
    BarChart3,
    ClipboardCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { getEmbedVideoUrl } from '@/lib/utils';
import MathHtml from '@/components/MathHtml';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js?v=6.3.289';

interface LessonProps {
    lesson: {
        id: number;
        parent_id: number;
        title: string;
        description: string | null;
        summary: string | null;
        archivo_pdf?: string | null;
        is_completed: boolean;
        is_late?: boolean;
        closes_at?: string | null;
        media: any[];
        quizzes: any[];
        homework: any | null;
        interactive_pdfs?: any[];
        has_homework_feature: boolean;
    };
    scheduled: {
        id: number;
        title: string;
        category?: string;
    };
    enrollment_id?: number;
    modules: any[];
}

export default function Lesson({
    lesson,
    scheduled,
    enrollment_id,
    modules = [],
}: LessonProps) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';

    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
    });

    const [completed, setCompleted] = useState(lesson.is_completed);
    const [loadingToggle, setLoadingToggle] = useState(false);

    // Visor protegido para materiales no descargables y archivo_pdf
    const [protectedViewer, setProtectedViewer] = useState<{
        title: string;
        url: string;
        kind: 'pdf' | 'image' | 'other';
    } | null>(null);
    const [pdfNumPages, setPdfNumPages] = useState(0);
    const [pdfPage, setPdfPage] = useState(1);
    const [pdfZoom, setPdfZoom] = useState(1.0);

    const handleToggleCompletion = async () => {
        setLoadingToggle(true);
        try {
            const response = await fetch('/alumno/lecciones/toggle-completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    leccion_id: lesson.id,
                    curso_programado_id: scheduled.id,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setCompleted(data.completed);
                router.reload({ only: ['modules', 'lesson'] });
            }
        } catch (error) {
            console.error('Error toggling completion', error);
        } finally {
            setLoadingToggle(false);
        }
    };

    const getMediaType = (m: any): string => String(m.file_type || m.tipo || m.type || '').toLowerCase();
    const getMediaPath = (m: any): string => String(m.file_path || m.ruta || m.url || m.archivo || '');

    const videoMedia = lesson.media?.find((m) => ['video', 'videoext'].includes(getMediaType(m)));
    const lessonFiles = lesson.media?.filter((m) => !['video', 'videoext'].includes(getMediaType(m))) || [];
    const totalMaterialCount = lessonFiles.length + (lesson.archivo_pdf ? 1 : 0);

    const activeModuleId = modules.find(
        (m) => m.id === lesson.id || m.lessons?.some((l: any) => l.id === lesson.id),
    )?.id;

    const openProtectedPreview = (title: string, url: string, pathForExt: string, mediaType: string) => {
        const lower = pathForExt.toLowerCase();
        const kind: 'pdf' | 'image' | 'other' =
            lower.endsWith('.pdf') || mediaType === 'archivo_pdf' || mediaType === 'pdf'
                ? 'pdf'
                : /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(lower) || mediaType === 'imagen'
                  ? 'image'
                  : 'other';

        setPdfPage(1);
        setPdfNumPages(0);
        setPdfZoom(1.0);
        setProtectedViewer({ title, url, kind });
    };

    const buildMediaStreamUrl = (rawPath: string): string => {
        if (!rawPath) return '';
        if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
            return rawPath;
        }
        return `/alumno/medias/stream/${encodeURI(rawPath.replace(/^\/+/, ''))}`;
    };

    return (
        <>
            <Head title={`${lesson.title} - ${scheduled.title}`} />
            <StrikeAlert />
            <Watermark />

            <div
                className={`p-0 sm:p-4 lg:p-6 w-full max-w-[1600px] mx-auto select-none ${
                    isBlurred ? 'blur-xl pointer-events-none' : ''
                }`}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <Button asChild variant="ghost" size="sm" className="-ml-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <Link href={`/alumno/curso/${scheduled.id}`}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Regresar al temario
                        </Link>
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/alumno/curso/progress/${scheduled.id}`}>
                                <BarChart3 className="w-4 h-4 mr-1.5 text-indigo-600" /> Mi Progreso
                            </Link>
                        </Button>
                        {lesson.has_homework_feature && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/alumno/curso/homework-tracking/${scheduled.id}`}>
                                    <ClipboardCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> Mis Tareas
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Panel Izquierdo: Contenido de la Lección (70%) */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {/* Video Player Section */}
                        {videoMedia ? (
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md border border-neutral-800/50">
                                {getMediaPath(videoMedia).includes('http') ? (
                                    <iframe
                                        src={getEmbedVideoUrl(getMediaPath(videoMedia))}
                                        title={lesson.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        controls
                                        controlsList="nodownload"
                                        disablePictureInPicture
                                        onContextMenu={(e) => e.preventDefault()}
                                        className="w-full h-full object-cover rounded-xl"
                                        src={buildMediaStreamUrl(getMediaPath(videoMedia))}
                                    >
                                        Tu navegador no soporta el formato de video.
                                    </video>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 shadow-md flex flex-col items-center justify-center text-white p-6 text-center">
                                <BookOpen className="w-16 h-16 text-blue-300/50 mb-4" />
                                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                                <p className="text-blue-200 mt-2">Esta lección no contiene contenido en video.</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
                                    {lesson.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50">
                                        {scheduled.title}
                                    </Badge>
                                    {lesson.closes_at && (
                                        <span className="text-xs text-neutral-500">
                                            Cierre programado: {lesson.closes_at}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleToggleCompletion}
                                disabled={loadingToggle}
                                variant={completed ? 'default' : 'outline'}
                                className={`shrink-0 ${
                                    completed
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                        : 'border-neutral-300 hover:bg-neutral-50'
                                }`}
                            >
                                {completed ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Completada</>
                                ) : (
                                    <><Circle className="w-4 h-4 mr-2" /> Marcar como completada</>
                                )}
                            </Button>
                        </div>

                        {/* Lesson Content & Tabs */}
                        <Tabs defaultValue="content" className="space-y-6">
                            <TabsList className="bg-slate-100/80 backdrop-blur-md dark:bg-slate-800/80 p-1.5 rounded-2xl flex w-full overflow-x-auto overflow-y-hidden hide-scrollbar gap-2 shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                                <TabsTrigger value="content" className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-indigo-400">
                                    <BookOpen className="w-4 h-4 mr-2 hidden sm:block" />
                                    Resumen
                                </TabsTrigger>
                                {totalMaterialCount > 0 && (
                                    <TabsTrigger value="files" className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400">
                                        <Download className="w-4 h-4 mr-2 hidden sm:block" />
                                        Material <Badge variant="secondary" className="ml-1 sm:ml-2 bg-slate-200 dark:bg-slate-700 text-xs px-1.5 py-0">{totalMaterialCount}</Badge>
                                    </TabsTrigger>
                                )}
                                {lesson.quizzes?.length > 0 && (
                                    <TabsTrigger value="quizzes" className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-purple-400">
                                        <BrainCircuit className="w-4 h-4 mr-2 hidden sm:block" />
                                        Exámenes <Badge variant="secondary" className="ml-1 sm:ml-2 bg-slate-200 dark:bg-slate-700 text-xs px-1.5 py-0">{lesson.quizzes.length}</Badge>
                                    </TabsTrigger>
                                )}
                                {lesson.has_homework_feature && (
                                    <TabsTrigger value="homework" className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-emerald-400">
                                        <UploadCloud className="w-4 h-4 mr-2 hidden sm:block" />
                                        Tarea
                                    </TabsTrigger>
                                )}
                                {lesson.interactive_pdfs && lesson.interactive_pdfs.length > 0 && (
                                    <TabsTrigger value="interactive_pdfs" className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-amber-400">
                                        <BookOpen className="w-4 h-4 mr-2 hidden sm:block" />
                                        PDF Interactivo <Badge variant="secondary" className="ml-1 sm:ml-2 bg-slate-200 dark:bg-slate-700 text-xs px-1.5 py-0">{lesson.interactive_pdfs.length}</Badge>
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="content" className="space-y-4">
                                <Card className="border-0 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
                                    <CardContent className="prose dark:prose-invert max-w-none pt-6 text-neutral-700 dark:text-neutral-300">
                                        {lesson.description ? (
                                            <MathHtml html={lesson.description} />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                                                <FileText className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="italic">No hay notas adicionales del instructor.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {totalMaterialCount > 0 && (
                                <TabsContent value="files">
                                    <Card className="border-0 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                Materiales de Estudio
                                            </CardTitle>
                                            <CardDescription>Recursos digitales y enlaces de apoyo</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {lesson.archivo_pdf && (
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                            <FileText className="w-4 h-4 text-indigo-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-semibold text-sm text-neutral-800 block truncate">
                                                                Documento PDF de la Lección
                                                            </span>
                                                            <span className="text-xs text-neutral-500">Visor protegido (solo lectura)</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="shrink-0 bg-white"
                                                        onClick={() =>
                                                            openProtectedPreview(
                                                                'Documento PDF de la Lección',
                                                                buildMediaStreamUrl(lesson.archivo_pdf!),
                                                                lesson.archivo_pdf!,
                                                                'archivo_pdf',
                                                            )
                                                        }
                                                    >
                                                        <Eye className="w-4 h-4 mr-1.5" /> Abrir Visor
                                                    </Button>
                                                </div>
                                            )}

                                            {lessonFiles.map((file, i) => {
                                                const mediaType = getMediaType(file);
                                                const rawPath = getMediaPath(file);
                                                const fileTitle = file.title || file.titulo || file.name || 'Documento Adjunto';
                                                const isLink = mediaType === 'liga' || mediaType === 'link';
                                                const isDownloadable = Boolean(file.is_downloadable);
                                                const streamUrl = isLink ? rawPath : buildMediaStreamUrl(rawPath);

                                                return (
                                                    <div
                                                        key={file.id || i}
                                                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                                                {isLink ? (
                                                                    <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                ) : isDownloadable ? (
                                                                    <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200 block truncate">
                                                                    {fileTitle}
                                                                </span>
                                                                {!isLink && !isDownloadable && (
                                                                    <span className="text-[11px] text-neutral-500">Solo visualización protegida</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isLink ? (
                                                            <Button asChild size="sm" variant="outline" className="shrink-0 bg-white dark:bg-neutral-950">
                                                                <a href={streamUrl} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Abrir Enlace
                                                                </a>
                                                            </Button>
                                                        ) : isDownloadable ? (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => openProtectedPreview(fileTitle, streamUrl, rawPath, mediaType)}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline" className="bg-white dark:bg-neutral-950">
                                                                    <a href={streamUrl} target="_blank" rel="noopener noreferrer" download>
                                                                        <Download className="w-3.5 h-3.5 mr-1.5" /> Descargar
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                className="shrink-0 bg-white dark:bg-neutral-950"
                                                                onClick={() => openProtectedPreview(fileTitle, streamUrl, rawPath, mediaType)}
                                                            >
                                                                <Eye className="w-3.5 h-3.5 mr-1.5" /> Visor Protegido
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {lesson.quizzes?.length > 0 && (
                                <TabsContent value="quizzes">
                                    <Card className="border-0 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                <BrainCircuit className="w-5 h-5 text-purple-600" />
                                                Evaluaciones
                                            </CardTitle>
                                            <CardDescription>Demuestra lo que has aprendido</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {lesson.quizzes.map((quiz) => (
                                                <div
                                                    key={quiz.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-gradient-to-r from-purple-50/50 to-white dark:from-purple-950/20 dark:to-neutral-900"
                                                >
                                                    <div>
                                                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                                                            {quiz.title}
                                                        </h4>
                                                        <p className="text-xs text-neutral-500 mt-1">
                                                            {quiz.questions_count ?? quiz.questions?.length ?? 0} preguntas preparadas
                                                        </p>
                                                    </div>
                                                    <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                                                        <Link
                                                            href={
                                                                enrollment_id
                                                                    ? `/alumno/exams/${quiz.id}/preview?enrollment_id=${enrollment_id}`
                                                                    : `/alumno/exams/${quiz.id}/preview`
                                                            }
                                                        >
                                                            Comenzar Examen
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {lesson.interactive_pdfs && lesson.interactive_pdfs.length > 0 && (
                                <TabsContent value="interactive_pdfs">
                                    <Card className="border-0 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-amber-600" />
                                                PDFs Interactivos
                                            </CardTitle>
                                            <CardDescription>Resuelve los ejercicios directamente en línea</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {lesson.interactive_pdfs.map((pdf) => (
                                                <div
                                                    key={pdf.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/50 to-white dark:from-amber-950/20 dark:to-neutral-900"
                                                >
                                                    <div>
                                                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                                                            {pdf.titulo}
                                                        </h4>
                                                    </div>
                                                    <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                                                        <Link href={`/alumno/material-pdfs/${pdf.id}/resolver?curso_programado_id=${scheduled.id}`}>
                                                            Abrir y Resolver
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {lesson.has_homework_feature && (
                                <TabsContent value="homework">
                                    <Card className="border-0 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                <UploadCloud className="w-5 h-5 text-indigo-600" />
                                                Entrega de Tarea
                                            </CardTitle>
                                            <CardDescription>Sube tu archivo (PDF, DOC o DOCX) para que el instructor lo revise</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {lesson.summary && (
                                                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                        Instrucciones de la actividad:
                                                    </h5>
                                                    <MathHtml
                                                        html={lesson.summary}
                                                        className="text-sm text-neutral-700 dark:text-neutral-300 prose prose-sm max-w-none whitespace-pre-line"
                                                    />
                                                </div>
                                            )}
                                            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                                                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                                                    Enviar tarea de {lesson.title.toLowerCase()}
                                                </h4>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800">
                                                    {lesson.homework ? (
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                                                <FileCheck className="w-5 h-5" /> Tarea enviada correctamente.
                                                                {Boolean(lesson.homework.is_late) && (
                                                                    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                                                                        Entrega tardía
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-neutral-500">
                                                                Fecha de envío: {new Date(lesson.homework.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full">
                                                            <form
                                                                onSubmit={(e) => {
                                                                    e.preventDefault();
                                                                    const formData = new FormData(e.currentTarget);
                                                                    router.post(`/alumno/homework/${lesson.id}/submit`, formData);
                                                                }}
                                                                className="flex flex-col gap-4"
                                                            >
                                                                <input type="hidden" name="curso_programado_id" value={scheduled.id} />
                                                                <input
                                                                    type="file"
                                                                    name="documento"
                                                                    accept=".pdf,.doc,.docx"
                                                                    required
                                                                    className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                                />
                                                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-max">
                                                                    Subir Tarea
                                                                </Button>
                                                            </form>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>

                    {/* Panel Derecho: Temario (Sidebar del Aula 30%) */}
                    <div className="lg:w-[380px] shrink-0">
                        <div className="sticky top-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)] max-h-[800px]">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 flex items-center gap-2 shrink-0">
                                <LayoutList className="w-5 h-5 text-neutral-500" />
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    Contenido del Curso
                                </h3>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                <Accordion type="single" collapsible defaultValue={activeModuleId ? `module-${activeModuleId}` : undefined} className="w-full">
                                    {modules.map((modulo, i) => (
                                        <AccordionItem value={`module-${modulo.id}`} key={modulo.id} className="border-b-0">
                                            <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-sm font-semibold text-left">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-neutral-500 font-medium">Módulo {i + 1}</span>
                                                    <span>{modulo.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-0 pt-0">
                                                <div className="flex flex-col border-y border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-950/30">
                                                    {modulo.has_direct_content && (
                                                        modulo.is_available !== false ? (
                                                            <Link
                                                                href={`/alumno/modulo/${modulo.id}/${scheduled.id}`}
                                                                className={`flex items-start gap-3 p-3 text-sm transition-colors ${
                                                                    modulo.id === lesson.id
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
                                                                        : 'border-l-2 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                                }`}
                                                            >
                                                                <BookOpen className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" />
                                                                <span className="font-medium text-indigo-900 dark:text-indigo-200">
                                                                    Contenido / Evaluación del Módulo
                                                                </span>
                                                            </Link>
                                                        ) : (
                                                            <div className="flex items-start gap-3 p-3 text-sm text-neutral-400 cursor-not-allowed">
                                                                <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                                                                <span>Contenido del módulo (Bloqueado)</span>
                                                            </div>
                                                        )
                                                    )}

                                                    {modulo.lessons?.map((l: any, j: number) => {
                                                        const isCurrent = l.id === lesson.id;
                                                        const isAvailable = l.is_available !== false;

                                                        if (!isAvailable) {
                                                            return (
                                                                <div
                                                                    key={l.id}
                                                                    className="flex items-start gap-3 p-3 text-sm text-neutral-400 cursor-not-allowed opacity-70"
                                                                >
                                                                    <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                                                                    <span>{j + 1}. {l.title}</span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <Link
                                                                key={l.id}
                                                                href={`/alumno/modulo/${l.id}/${scheduled.id}`}
                                                                className={`flex items-start gap-3 p-3 text-sm transition-colors ${
                                                                    isCurrent
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
                                                                        : 'border-l-2 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                                }`}
                                                            >
                                                                <div className="mt-0.5">
                                                                    {l.is_completed ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                    ) : (
                                                                        <PlayCircle className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : 'text-neutral-400'}`} />
                                                                    )}
                                                                </div>
                                                                <span className={`${isCurrent ? 'font-semibold text-blue-900 dark:text-blue-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                                                    {j + 1}. {l.title}
                                                                </span>
                                                            </Link>
                                                        );
                                                    })}
                                                    {(!modulo.lessons || modulo.lessons.length === 0) && !modulo.has_direct_content && (
                                                        <div className="p-3 text-xs text-neutral-400 italic">No hay lecciones en este módulo.</div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Visor Protegido (sin descarga) */}
            {protectedViewer && (
                <div
                    className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-xs p-4 sm:p-6 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 rounded-t-xl border-b border-slate-700">
                        <div className="flex items-center gap-2 min-w-0">
                            <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="font-semibold text-sm truncate">{protectedViewer.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {protectedViewer.kind === 'pdf' && (
                                <>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="text-white hover:bg-slate-800 h-8 w-8"
                                        onClick={() => setPdfZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs font-mono">{Math.round(pdfZoom * 100)}%</span>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="text-white hover:bg-slate-800 h-8 w-8"
                                        onClick={() => setPdfZoom((z) => Math.min(2.0, Number((z + 0.2).toFixed(2))))}
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="text-white hover:bg-slate-800"
                                        disabled={pdfPage <= 1}
                                        onClick={() => setPdfPage((p) => p - 1)}
                                    >
                                        Ant
                                    </Button>
                                    <span className="text-xs font-mono">
                                        {pdfPage}/{pdfNumPages || '--'}
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="text-white hover:bg-slate-800"
                                        disabled={pdfPage >= pdfNumPages}
                                        onClick={() => setPdfPage((p) => p + 1)}
                                    >
                                        Sig
                                    </Button>
                                </>
                            )}
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-white hover:bg-slate-800 h-8 w-8"
                                onClick={() => setProtectedViewer(null)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-neutral-900 rounded-b-xl overflow-auto flex justify-center items-start p-4">
                        {protectedViewer.kind === 'pdf' ? (
                            <Document
                                file={protectedViewer.url}
                                options={{ withCredentials: true }}
                                onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}
                            >
                                <Page
                                    pageNumber={pdfPage}
                                    scale={pdfZoom}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>
                        ) : protectedViewer.kind === 'image' ? (
                            <img
                                src={protectedViewer.url}
                                alt={protectedViewer.title}
                                className="max-h-full max-w-full object-contain rounded"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        ) : (
                            <iframe
                                src={`${protectedViewer.url}#toolbar=0&navpanes=0`}
                                title={protectedViewer.title}
                                className="w-full h-full bg-white rounded border-0"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

Lesson.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Aula Virtual', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
