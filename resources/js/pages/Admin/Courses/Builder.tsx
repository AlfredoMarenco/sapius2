import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { 
    Plus, 
    BookOpen, 
    FileText, 
    HelpCircle, 
    ChevronRight, 
    Layout, 
    ArrowLeft,
    Info,
    Save,
    Trash2,
    Settings,
    Eye,
    CheckCircle2,
    Video,
    Image as ImageIcon,
    Link as LinkIcon,
    File as FileIcon,
    Play,
    Pencil,
    X,
    AlertCircle,
    CheckCircle,
    ShieldAlert,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from '@/components/ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from '@/components/editor/RichTextEditor';
import { AnimatePresence, motion } from 'framer-motion';
import ContentSchedulingModal from './Partials/ContentSchedulingModal';

interface Answer {
    id?: number;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    text: string;
    explanation: string | null;
    points: number;
    answers: Answer[];
}

interface Quiz {
    id: number;
    title: string;
    type: string;
    time_limit: number | null;
    attempts_allowed: number;
    passing_score: number;
    is_scheduled: boolean;
    available_at: string | null;
    expires_at: string | null;
    questions: Question[];
}

interface Homework {
    id?: number;
    title: string;
    description: string;
    points: number;
}

interface Media {
    id: number;
    title: string;
    file_type: string;
    file_path: string;
    is_downloadable: boolean;
}

interface Lesson {
    id: number;
    title: string;
    content: string | null;
    is_active: boolean;
    is_scheduled: boolean;
    available_at: string | null;
    expires_at: string | null;
    media: Media[];
    quizzes: Quiz[];
    homeworkAssignments: Homework[];
}

interface Module {
    id: number;
    title: string;
    image: string | null;
    is_active: boolean;
    is_scheduled: boolean;
    available_at: string | null;
    expires_at: string | null;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    modules: Module[];
}

interface Props {
    course: Course;
}

// Toast Component for superior UX
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-[2rem] shadow-2xl border-2 backdrop-blur-md",
                type === 'success' ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" : "bg-coral-50/90 border-brand-coral/20 text-brand-coral"
            )}
        >
            {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-black uppercase tracking-widest text-[10px]">{message}</span>
            <button onClick={onClose} className="ml-4 hover:opacity-50"><X className="h-4 w-4" /></button>
        </motion.div>
    );
};

const QUIZ_TYPES = ['EXANI I', 'EXANI II', 'EGEL', 'ENARM', 'ENQ', 'PRÁCTICA', 'EXAMEN'];

export default function Builder({ course }: Props) {
    const { props } = usePage();
    const flash = props.flash as { success: string | null, error: string | null };
    
    const [selectedItem, setSelectedItem] = useState<{ type: 'course' | 'module' | 'lesson', id: number | null }>({ type: 'course', id: course.id });
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [isEditingLessonTitle, setIsEditingLessonTitle] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Scheduling State
    const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
    const [schedulingTarget, setSchedulingTarget] = useState<any>(null);
    const [schedulingType, setSchedulingType] = useState<'Modulo' | 'Lección' | 'Examen'>('Modulo');

    // Forms
    const moduleForm = useForm({ title: '', image: '', position: 1 });
    const editModuleForm = useForm({ title: '', image: '' });
    const lessonForm = useForm({ title: '', position: 1 });
    
    // Deletion states for custom Modals
    const [confirmDelete, setConfirmDelete] = useState<{ 
        type: 'module' | 'lesson' | 'media' | 'question', 
        id: number, 
        title?: string, 
        hasChildren?: boolean,
        counts?: { media: number, quizzes: number, homework: number, lessons: number }
    } | null>(null);

    // Initial Flash Toast
    useEffect(() => {
        if (flash.success) setToast({ message: flash.success, type: 'success' });
        if (flash.error) setToast({ message: flash.error, type: 'error' });
    }, [flash]);

    // Filter course data to find selected lesson
    const activeLesson = useMemo(() => {
        if (selectedItem.type !== 'lesson') return null;
        for (const m of course.modules || []) {
            const lesson = m.lessons?.find(l => l.id === selectedItem.id);
            if (lesson) return lesson;
        }
        return null;
    }, [selectedItem, course]);

    // Content update form
    const contentForm = useForm({
        content: activeLesson?.content || ''
    });

    const lessonTitleForm = useForm({
        title: activeLesson?.title || ''
    });

    const quizForm = useForm({
        title: 'Evaluación de Lección',
        type: 'PRÁCTICA',
        time_limit: 30,
        attempts_allowed: 1,
        passing_score: 70,
    });

    const homeworkForm = useForm({
        title: 'Tarea de Refuerzo',
        description: '',
        points: 100,
    });

    const mediaForm = useForm({
        title: '',
        file_type: 'video',
        file_path: '',
        is_downloadable: false,
    });

    const questionForm = useForm({
        text: '',
        explanation: '',
        points: 10,
        answers: [
            { text: '', is_correct: true },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
        ]
    });

    const importForm = useForm({
        file: null as File | null,
    });

    useEffect(() => {
        if (activeLesson) {
            contentForm.setData('content', activeLesson.content || '');
            lessonTitleForm.setData('title', activeLesson.title || '');
            setIsEditingLessonTitle(false);
            
            quizForm.setData({
                title: activeLesson.quizzes?.[0]?.title ?? 'Evaluación de Lección',
                type: activeLesson.quizzes?.[0]?.type ?? 'PRÁCTICA',
                //@ts-ignore
                time_limit: activeLesson.quizzes?.[0]?.time_limit ?? 30,
                attempts_allowed: activeLesson.quizzes?.[0]?.attempts_allowed ?? 1,
                passing_score: activeLesson.quizzes?.[0]?.passing_score ?? 70,
            });
            homeworkForm.setData({
                //@ts-ignore
                title: (activeLesson.homeworkAssignments?.[0] || activeLesson.homework_assignments?.[0])?.title ?? 'Tarea de Refuerzo',
                //@ts-ignore
                description: (activeLesson.homeworkAssignments?.[0] || activeLesson.homework_assignments?.[0])?.description ?? '',
                //@ts-ignore
                points: (activeLesson.homeworkAssignments?.[0] || activeLesson.homework_assignments?.[0])?.points ?? 100,
            });
        }
    }, [activeLesson?.id]);

    const handleAddModule = (e: React.FormEvent) => {
        e.preventDefault();
        moduleForm.post(`/admin/courses/${course.id}/modules`, {
            onSuccess: () => { setIsModuleModalOpen(false); moduleForm.reset(); }
        });
    };

    const handleEditModule = (module: Module) => {
        setEditingModule(module);
        editModuleForm.setData({
            title: module.title,
            image: module.image || ''
        });
        setIsEditModuleModalOpen(true);
    };

    const handleUpdateModule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingModule) return;
        editModuleForm.patch(`/admin/modules/${editingModule.id}`, {
            onSuccess: () => { setIsEditModuleModalOpen(false); editModuleForm.reset(); }
        });
    };

    const handleDeleteModule = () => {
        if (!confirmDelete) return;
        router.delete(`/admin/modules/${confirmDelete.id}`, { 
            onSuccess: () => setConfirmDelete(null),
            onError: (err: any) => {
                if (err.error) setToast({ message: err.error, type: 'error' });
            },
            preserveScroll: true 
        });
    };

    const handleAddLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModuleId) return;
        lessonForm.post(`/admin/modules/${activeModuleId}/lessons`, {
            onSuccess: () => { setIsLessonModalOpen(false); lessonForm.reset(); }
        });
    };

    const handleUpdateLessonTitle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson) return;
        lessonTitleForm.patch(`/admin/lessons/${activeLesson.id}`, {
            onSuccess: () => setIsEditingLessonTitle(false),
            preserveScroll: true
        });
    };

    const handleDeleteLesson = () => {
        if (!confirmDelete) return;
        router.delete(`/admin/lessons/${confirmDelete.id}`, { 
            onSuccess: () => {
                setConfirmDelete(null);
                setSelectedItem({ type: 'course', id: course.id });
            },
            onError: (err: any) => {
                if (err.error) setToast({ message: err.error, type: 'error' });
            },
            preserveScroll: true 
        });
    };

    const handleSaveContent = () => {
        if (!activeLesson) return;
        contentForm.patch(`/admin/lessons/${activeLesson.id}`, { preserveScroll: true });
    };

    const handleAddMedia = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson) return;
        mediaForm.post(`/admin/lessons/${activeLesson.id}/media`, {
            onSuccess: () => { setIsMediaModalOpen(false); mediaForm.reset(); },
            preserveScroll: true
        });
    };

    const handleDeleteMedia = (id: number) => {
        router.delete(`/admin/media/${id}`, { preserveScroll: true });
    };

    const handleSaveQuiz = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson) return;
        quizForm.post(`/admin/lessons/${activeLesson.id}/quiz`, { preserveScroll: true });
    };

    const handleAddQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson || activeLesson.quizzes.length === 0) return;
        questionForm.post(`/admin/quizzes/${activeLesson.quizzes[0].id}/questions`, {
            onSuccess: () => { setIsQuestionModalOpen(false); questionForm.reset(); }
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson || activeLesson.quizzes.length === 0) return;
        importForm.post(`/admin/quizzes/${activeLesson.quizzes[0].id}/import-questions`, {
            onSuccess: () => { setIsImportModalOpen(false); importForm.reset(); }
        });
    };

    const handleDeleteQuestion = (id: number) => {
        router.delete(`/admin/questions/${id}`, { preserveScroll: true });
    };

    const handleSaveHomework = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson) return;
        homeworkForm.post(`/admin/lessons/${activeLesson.id}/homework`, { preserveScroll: true });
    };

    // New Scheduling Handlers
    const handleOpenScheduling = (type: 'Modulo' | 'Lección' | 'Examen', target: any) => {
        setSchedulingType(type);
        setSchedulingTarget(target);
        setIsSchedulingModalOpen(true);
    };

    const handleSaveScheduling = (formValues: any) => {
        if (!schedulingTarget) return;

        const url = schedulingType === 'Modulo' 
            ? `/admin/modules/${schedulingTarget.id}`
            : schedulingType === 'Lección'
                ? `/admin/lessons/${schedulingTarget.id}`
                : `/admin/lessons/${activeLesson?.id}/quiz`;

        router.patch(url, formValues, {
            onSuccess: () => {
                setIsSchedulingModalOpen(false);
                setToast({ message: `${schedulingType} programado correctamente`, type: 'success' });
            },
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title={`Constructor - ${course.title}`} />
            
            <AnimatePresence>
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </AnimatePresence>

            <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#F8FAFC]">
                <header className="border-b bg-white p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl border hover:bg-gray-50">
                            <Link href="/admin/courses"><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-brand-navy uppercase">{course.title}</h1>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                <span>Constructor</span> <ChevronRight className="h-3 w-3" />
                                <span className="text-brand-blue">Suite Pedagógica</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="w-80 border-r bg-white overflow-y-auto flex flex-col">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60">Estructura del Curso</span>
                            <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
                                <DialogTrigger asChild><Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-brand-blue/10 text-brand-blue"><Plus className="h-5 w-5" /></Button></DialogTrigger>
                                <DialogContent className="rounded-[2rem] border-2 shadow-2xl">
                                    <DialogHeader><DialogTitle className="font-black uppercase tracking-tight">Nuevo Módulo</DialogTitle></DialogHeader>
                                    <form onSubmit={handleAddModule} className="space-y-4 py-4">
                                        <div className="grid gap-2"><Label className="font-bold">Título del Módulo</Label><Input value={moduleForm.data.title} onChange={e => moduleForm.setData('title', e.target.value)} placeholder="Ej: Introducción a la Anatomía" className="h-12 border-2 rounded-xl" /></div>
                                        <div className="grid gap-2"><Label className="font-bold">Imagen/Icono (URL)</Label><Input value={moduleForm.data.image} onChange={e => moduleForm.setData('image', e.target.value)} placeholder="https://..." className="h-12 border-2 rounded-xl" /></div>
                                        <DialogFooter><Button type="submit" disabled={moduleForm.processing} className="bg-brand-blue rounded-xl font-bold uppercase tracking-widest px-8 h-12 shadow-lg shadow-brand-blue/20">Crear Módulo</Button></DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="p-3">
                            <Accordion type="multiple" className="space-y-2">
                                {course.modules.length === 0 && <div className="p-8 text-center text-xs italic text-muted-foreground">No hay módulos añadidos.</div>}
                                {course.modules.map((module) => (
                                    <AccordionItem key={module.id} value={`module-${module.id}`} className="border-2 border-brand-navy/5 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center w-full pr-4 group/module">
                                            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50/50 flex-1">
                                                <div className="flex items-center gap-3">
                                                    {module.image ? <img src={module.image} className="h-6 w-6 rounded-md object-cover" /> : <Layout className="h-4 w-4 text-brand-navy/40" />}
                                                    <span className="font-black text-xs uppercase tracking-widest text-brand-navy">{module.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <div className="flex items-center gap-1 opacity-0 group-hover/module:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className={cn("h-8 w-8", module.is_scheduled ? "text-brand-blue bg-brand-blue/10" : "text-gray-400 hover:bg-brand-blue/10 hover:text-brand-blue")} onClick={(e) => { e.stopPropagation(); handleOpenScheduling('Modulo', module); }}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-brand-blue/10 text-brand-blue" onClick={(e) => { e.stopPropagation(); handleEditModule(module); }}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-destructive" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        const lCount = module.lessons?.length || 0;
                                                        setConfirmDelete({ 
                                                            type: 'module', id: module.id, title: module.title, hasChildren: lCount > 0,
                                                            counts: { media: 0, quizzes: 0, homework: 0, lessons: lCount }
                                                        }); 
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <AccordionContent className="p-0 border-t-2 border-brand-navy/5 bg-gray-50/30">
                                            <div className="py-2">
                                                {module.lessons.map((lesson) => {
                                                    const mCount = lesson.media?.length || 0;
                                                    const qCount = lesson.quizzes?.length || 0;
                                                    //@ts-ignore
                                                    const hCount = (lesson.homeworkAssignments?.length || 0) + (lesson.homework_assignments?.length || 0);
                                                    const hasChildren = (mCount + qCount + hCount) > 0;

                                                    return (
                                                        <div key={lesson.id} className="relative group/lesson">
                                                            <div onClick={() => setSelectedItem({ type: 'lesson', id: lesson.id })} className={cn("mx-2 px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 mb-1 pr-12", selectedItem.type === 'lesson' && selectedItem.id === lesson.id ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "hover:bg-brand-blue/10 text-brand-navy/70 hover:text-brand-blue")}>
                                                                <BookOpen className={cn("h-4 w-4", selectedItem.type === 'lesson' && selectedItem.id === lesson.id ? "text-white" : "text-brand-navy/30")} />
                                                                <span className="text-[11px] font-bold uppercase tracking-wide truncate">{lesson.title}</span>
                                                            </div>
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/lesson:opacity-100 transition-opacity gap-1">
                                                                <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", lesson.is_scheduled ? "text-brand-blue bg-brand-blue/10" : "text-gray-400 hover:bg-brand-blue/10 hover:text-brand-blue")}
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenScheduling('Lección', lesson); }}
                                                                >
                                                                    <Clock className="h-3 w-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", selectedItem.id === lesson.id ? "text-white hover:bg-white/20" : "text-destructive hover:bg-destructive/10")} 
                                                                    onClick={(e) => { 
                                                                        e.stopPropagation(); 
                                                                        setConfirmDelete({ 
                                                                            type: 'lesson', id: lesson.id, title: lesson.title, hasChildren,
                                                                            counts: { media: mCount, quizzes: qCount, homework: hCount, lessons: 0 }
                                                                        }); 
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <Button variant="ghost" size="sm" className="w-[calc(100%-1rem)] mx-2 mt-2 text-brand-blue hover:bg-brand-blue/10 font-black uppercase text-[10px] tracking-widest h-10 border-2 border-dashed border-brand-blue/20 hover:border-brand-blue" onClick={() => { setActiveModuleId(module.id); setIsLessonModalOpen(true); }}><Plus className="h-3 w-3 mr-2" />Nueva Lección</Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto bg-white">
                        {selectedItem.type === 'lesson' && activeLesson ? (
                            <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
                                <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex-1 mr-8">
                                        {isEditingLessonTitle ? (
                                            <form onSubmit={handleUpdateLessonTitle} className="flex items-center gap-2 max-w-2xl">
                                                <Input 
                                                    autoFocus
                                                    value={lessonTitleForm.data.title}
                                                    onChange={e => lessonTitleForm.setData('title', e.target.value)}
                                                    className="h-14 text-3xl font-black text-brand-navy tracking-tighter uppercase rounded-2xl border-2 border-brand-blue ring-offset-0 focus-visible:ring-0"
                                                />
                                                <Button type="submit" disabled={lessonTitleForm.processing} className="h-14 w-14 rounded-2xl bg-brand-blue shadow-lg shadow-brand-blue/20"><Save className="h-6 w-6" /></Button>
                                                <Button type="button" variant="ghost" onClick={() => setIsEditingLessonTitle(false)} className="h-14 w-14 rounded-2xl text-muted-foreground"><X className="h-6 w-6" /></Button>
                                            </form>
                                        ) : (
                                            <div className="group/title flex items-center gap-4 cursor-pointer" onClick={() => setIsEditingLessonTitle(true)}>
                                                <h2 className="text-4xl font-black text-brand-navy tracking-tighter uppercase leading-none">{activeLesson.title}</h2>
                                                <Pencil className="h-5 w-5 text-brand-blue opacity-0 group-hover/title:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-4">
                                            <Badge variant="outline" className="rounded-full border-brand-blue text-brand-blue px-4 font-black uppercase text-[9px] tracking-widest">{activeLesson.media?.length ?? 0} Recursos</Badge>
                                            <Badge variant="outline" className="rounded-full border-orange-400 text-orange-600 px-4 font-black uppercase text-[9px] tracking-widest">{activeLesson.quizzes?.[0]?.type ?? 'Sin Examen'}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50"><Eye className="h-4 w-4 mr-2" /> Vista Previa</Button>
                                        <Button variant="ghost" className="h-12 w-12 rounded-2xl text-destructive hover:bg-destructive/5" 
                                            onClick={() => {
                                                const mCount = activeLesson.media?.length || 0;
                                                const qCount = activeLesson.quizzes?.length || 0;
                                                //@ts-ignore
                                                const hCount = (activeLesson.homeworkAssignments?.length || 0) + (activeLesson.homework_assignments?.length || 0);
                                                const hasChildren = (mCount + qCount + hCount) > 0;
                                                setConfirmDelete({ 
                                                    type: 'lesson', id: activeLesson.id, title: activeLesson.title, hasChildren,
                                                    counts: { media: mCount, quizzes: qCount, homework: hCount, lessons: 0 }
                                                });
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <Tabs defaultValue="content" className="w-full">
                                    <TabsList className="bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-[2rem] h-16 w-fit justify-start gap-2 mb-10 px-2 sticky top-0 z-10 shadow-inner">
                                        <TabsTrigger value="content" className="rounded-[1.5rem] px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-brand-navy h-13"><Layout className="h-4 w-4 mr-2" />Contenido & Media</TabsTrigger>
                                        <TabsTrigger value="quiz" className="rounded-[1.5rem] px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-brand-navy h-13"><HelpCircle className="h-4 w-4 mr-2" />Examen</TabsTrigger>
                                        <TabsTrigger value="homework" className="rounded-[1.5rem] px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data(/state=active]:text-brand-navy h-13"><FileText className="h-4 w-4 mr-2" />Tarea</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="content" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Media Manager Section */}
                                        <section className="space-y-6">
                                            <div className="flex items-center justify-between px-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Recursos Multimedia</h3>
                                                    <p className="text-xs text-muted-foreground font-medium italic">Gestiona videos, imágenes y documentos de apoyo.</p>
                                                </div>
                                                <Button onClick={() => setIsMediaModalOpen(true)} className="bg-brand-blue rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-6 shadow-lg shadow-brand-blue/20"><Plus className="h-4 w-4 mr-2" /> Agregar Recurso</Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {activeLesson.media?.length === 0 && (
                                                    <div className="col-span-full bg-gray-50 border-2 border-dashed rounded-[2.5rem] p-12 text-center">
                                                        <Video className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                                        <p className="text-xs italic text-muted-foreground">Esta lección aún no tiene recursos multimedia.</p>
                                                    </div>
                                                )}
                                                {activeLesson.media?.map((media) => (
                                                    <Card key={media.id} className="rounded-[2rem] border-2 group hover:border-brand-blue/20 transition-all shadow-lg shadow-brand-navy/5 overflow-hidden">
                                                        <CardContent className="p-0">
                                                            <div className="aspect-video bg-gray-100 flex items-center justify-center relative group-hover:bg-brand-blue/5 transition-colors">
                                                                {media.file_type === 'video' ? <Play className="h-10 w-10 text-brand-blue" /> : <ImageIcon className="h-10 w-10 text-gray-300" />}
                                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteMedia(media.id)} className="absolute top-3 right-3 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></Button>
                                                            </div>
                                                            <div className="p-4 border-t-2">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-1 block">{media.file_type}</span>
                                                                <h4 className="font-bold text-brand-navy text-sm line-clamp-1">{media.title}</h4>
                                                                <p className="text-[10px] text-muted-foreground truncate mt-1">{media.file_path}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </section>

                                        <Separator className="bg-brand-navy/5" />

                                        {/* Rich Text Editor Section */}
                                        <Card className="rounded-[3rem] border-2 border-brand-navy/5 shadow-2xl shadow-brand-navy/5 overflow-hidden">
                                            <CardContent className="p-10 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="text-brand-navy font-black uppercase text-xs tracking-widest flex items-center gap-2 mb-1">Editor de Contenido Teórico</Label>
                                                        <p className="text-[11px] text-muted-foreground italic">Redacta el contenido principal en formato enriquecido.</p>
                                                    </div>
                                                    <Button onClick={handleSaveContent} disabled={contentForm.processing} className="bg-brand-navy rounded-2xl font-black uppercase tracking-widest px-10 h-12 shadow-lg shadow-brand-navy/20">Guardar Texto</Button>
                                                </div>
                                                <RichTextEditor 
                                                    content={contentForm.data.content} 
                                                    onChange={val => contentForm.setData('content', val)} 
                                                    className="min-h-[500px]"
                                                />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="quiz" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Quiz content unchanged but can also use DeleteQuestion safety elsewhere */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                 <Card className="rounded-[2.5rem] border-2 border-orange-100/50 shadow-xl shadow-orange-100/20 overflow-hidden md:col-span-1 h-fit">
                                                <CardHeader className="bg-orange-50/50 border-b border-orange-100 flex-row items-center justify-between space-y-0 p-6">
                                                    <CardTitle className="text-orange-700 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"><Settings className="h-4 w-4" /> Configuración</CardTitle>
                                                    <div className="flex items-center gap-2">
                                                        {activeLesson.quizzes.length > 0 && (
                                                            <Button variant="ghost" size="icon" className={cn("h-8 w-8", activeLesson.quizzes[0].is_scheduled ? "text-orange-600 bg-orange-100" : "text-orange-400 hover:bg-orange-100")} onClick={() => handleOpenScheduling('Examen', activeLesson.quizzes[0])}>
                                                                <Clock className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Switch checked={activeLesson.quizzes.length > 0} />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-8 space-y-6">
                                                    <div className="grid gap-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-orange-800/60">Categoría Oficial</Label>
                                                        <Select value={quizForm.data.type} onValueChange={val => quizForm.setData('type', val)}>
                                                            <SelectTrigger className="h-12 border-orange-100 rounded-xl bg-white font-bold text-sm">
                                                                <SelectValue placeholder="Seleccionar Tipo" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl border-2">
                                                                {QUIZ_TYPES.map(type => (
                                                                    <SelectItem key={type} value={type} className="font-bold py-3">{type}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid gap-2"><Label className="text-[10px] font-black uppercase tracking-widest text-orange-800/60">Título del Examen</Label><Input value={quizForm.data.title} onChange={e => quizForm.setData('title', e.target.value)} className="h-12 border-orange-100 rounded-xl font-bold" /></div>
                                                    <div className="grid gap-2"><Label className="text-[10px] font-black uppercase tracking-widest text-orange-800/60">Calif. Mínima (%)</Label><Input type="number" value={quizForm.data.passing_score} onChange={e => quizForm.setData('passing_score', parseFloat(e.target.value))} className="h-12 border-orange-100 rounded-xl font-bold" /></div>
                                                    <Button onClick={handleSaveQuiz} disabled={quizForm.processing} className="w-full h-12 bg-orange-600 hover:bg-orange-700 rounded-xl font-black uppercase tracking-widest text-[10px] mt-4 shadow-lg shadow-orange-600/20"><Save className="h-4 w-4 mr-2" />Guardar Ajustes</Button>
                                                </CardContent>
                                            </Card>

                                            <div className="md:col-span-2 space-y-6">
                                                <div className="flex items-center justify-between px-4">
                                                    <div>
                                                        <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Banco de Preguntas ({activeLesson.quizzes[0]?.questions.length ?? 0})</h3>
                                                        <p className="text-xs text-muted-foreground font-medium italic">Solo opción múltiple con 4 respuestas.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button onClick={() => setIsImportModalOpen(true)} disabled={activeLesson.quizzes.length === 0} size="sm" variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-6 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"><FileText className="h-3 w-3 mr-2" /> Importar</Button>
                                                        <Button onClick={() => setIsQuestionModalOpen(true)} disabled={activeLesson.quizzes.length === 0} size="sm" className="bg-brand-blue rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-6"><Plus className="h-3 w-3 mr-2" /> Nueva Pregunta</Button>
                                                    </div>
                                                </div>

                                                {activeLesson.quizzes[0]?.questions.length === 0 && <div className="bg-gray-50 border-2 border-dashed rounded-[3rem] p-20 text-center">
                                                    <HelpCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                                    <p className="text-xs italic text-muted-foreground">No has añadido preguntas a este examen.</p>
                                                </div>}

                                                {activeLesson.quizzes[0]?.questions.map((q, idx) => (
                                                    <Card key={q.id} className="rounded-[2.5rem] border-2 hover:border-brand-blue/20 transition-all shadow-xl shadow-brand-navy/5 overflow-hidden">
                                                        <CardContent className="p-8 space-y-6">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <Badge className="bg-brand-navy text-white rounded-2xl h-10 w-10 flex items-center justify-center font-black text-lg">{idx + 1}</Badge>
                                                                    <p className="font-bold text-brand-navy text-base leading-snug">{q.text}</p>
                                                                </div>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)} className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/5"><Trash2 className="h-4 w-4" /></Button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-14">
                                                                {q.answers.map((a, aidx) => (
                                                                    <div key={aidx} className={cn("p-4 rounded-2xl border-2 text-[11px] font-bold flex items-center gap-3 transition-all", a.is_correct ? "bg-green-50 border-green-200 text-green-700 shadow-sm" : "bg-gray-50/50 border-gray-100 text-gray-500")}>
                                                                        {a.is_correct ? <CheckCircle2 className="h-4 w-4 fill-green-600 text-white" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                                                                        {a.text}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="homework" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Card className="rounded-[3rem] border-2 border-brand-navy/5 shadow-2xl shadow-brand-navy/5 overflow-hidden">
                                            <CardContent className="p-10 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Actividad Práctica / Tarea</h3>
                                                        <p className="text-xs text-muted-foreground font-medium italic">Define instrucciones para que el alumno entregue su trabajo.</p>
                                                    </div>
                                                    <Button onClick={handleSaveHomework} disabled={homeworkForm.processing} className="bg-brand-blue rounded-2xl font-black uppercase tracking-widest px-10 h-12 shadow-lg shadow-brand-blue/20">Guardar Tarea</Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="grid gap-2"><Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Título</Label><Input value={homeworkForm.data.title} onChange={e => homeworkForm.setData('title', e.target.value)} className="h-12 border-2 rounded-xl font-bold" /></div>
                                                    <div className="grid gap-2"><Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Puntos Totales</Label><Input type="number" value={homeworkForm.data.points} onChange={e => homeworkForm.setData('points', parseInt(e.target.value))} className="h-12 border-2 rounded-xl font-bold" /></div>
                                                </div>
                                                <div className="grid gap-2"><Label  className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Instrucciones Detalladas</Label><Textarea value={homeworkForm.data.description} onChange={e => homeworkForm.setData('description', e.target.value)} className="min-h-[250px] border-2 rounded-[1.5rem] font-medium p-6" placeholder="Escribe aquí los pasos que el estudiante debe seguir..." /></div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-center p-12 bg-white">
                                <div className="max-w-md space-y-6 animate-in zoom-in duration-700">
                                    <div className="bg-brand-blue h-28 w-28 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-blue/30"><Layout className="h-14 w-14 text-white" /></div>
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-black text-brand-navy uppercase tracking-tighter">Panel de Construcción</h2>
                                        <p className="text-muted-foreground font-bold italic tracking-wide">Selecciona una lección del panel lateral para comenzar a inyectar contenido pedagógico.</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-navy/30 pt-6">
                                        <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Multimedia</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> Exámenes</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Tareas</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Modals for creation */}
            <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl">
                    <DialogHeader><DialogTitle className="font-black uppercase tracking-tight">Nueva Lección</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddLesson} className="space-y-4 py-4">
                        <div className="grid gap-2"><Label className="font-bold">Título de la Lección</Label><Input value={lessonForm.data.title} onChange={e => lessonForm.setData('title', e.target.value)} placeholder="Ej: Anatomía del cráneo" className="h-12 border-2 rounded-xl" /></div>
                        <DialogFooter><Button type="submit" disabled={lessonForm.processing} className="bg-brand-blue rounded-xl font-black uppercase tracking-widest px-10 h-12">Crear Lección</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal for Edit Module */}
            <Dialog open={isEditModuleModalOpen} onOpenChange={setIsEditModuleModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl">
                    <DialogHeader><DialogTitle className="font-black uppercase tracking-tight">Editar Módulo</DialogTitle></DialogHeader>
                    <form onSubmit={handleUpdateModule} className="space-y-4 py-4">
                        <div className="grid gap-2"><Label className="font-bold">Título del Módulo</Label><Input value={editModuleForm.data.title} onChange={e => editModuleForm.setData('title', e.target.value)} placeholder="Ej: Introducción a la Anatomía" className="h-12 border-2 rounded-xl" /></div>
                        <div className="grid gap-2"><Label className="font-bold">Imagen/Icono (URL)</Label><Input value={editModuleForm.data.image} onChange={e => editModuleForm.setData('image', e.target.value)} placeholder="https://..." className="h-12 border-2 rounded-xl" /></div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditModuleModalOpen(false)} className="h-12 font-black uppercase text-[10px] tracking-widest">Cancelar</Button>
                            <Button type="submit" disabled={editModuleForm.processing} className="bg-brand-blue rounded-xl font-bold uppercase tracking-widest px-8 h-12 shadow-lg shadow-brand-blue/20">Actualizar Módulo</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Premium Confirm Delete Dialog */}
            <Dialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl p-0 max-w-md overflow-hidden">
                    <div className="p-8 text-center space-y-6">
                        <div className={cn(
                            "h-20 w-20 rounded-3xl mx-auto flex items-center justify-center mb-2",
                            confirmDelete?.hasChildren ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-coral/10 text-brand-coral"
                        )}>
                            {confirmDelete?.hasChildren ? <ShieldAlert className="h-10 w-10" /> : <Trash2 className="h-10 w-10" />}
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-brand-navy">
                                {confirmDelete?.hasChildren ? "Contenido Protegido" : "¿Deseas Eliminarlo?"}
                            </h3>
                            <div className="text-sm font-medium text-muted-foreground leading-relaxed px-4">
                                {confirmDelete?.hasChildren ? (
                                    <div className="space-y-4">
                                        <p>
                                            No se puede eliminar <span className="font-bold text-brand-navy">"{confirmDelete.title}"</span> para proteger el progreso.
                                        </p>
                                        <div className="bg-brand-blue/5 rounded-2xl p-4 grid gap-2 border border-brand-blue/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue/60 mb-1">Elementos que impiden el borrado:</p>
                                            {confirmDelete.counts && (
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {(confirmDelete.counts.media > 0) && <Badge variant="outline" className="border-brand-blue/20 bg-white">{confirmDelete.counts.media} Recurso(s) Media</Badge>}
                                                    {(confirmDelete.counts.quizzes > 0) && <Badge variant="outline" className="border-brand-blue/20 bg-white">{confirmDelete.counts.quizzes} Examen(es)</Badge>}
                                                    {(confirmDelete.counts.homework > 0) && <Badge variant="outline" className="border-brand-blue/20 bg-white">{confirmDelete.counts.homework} Tarea(s)</Badge>}
                                                    {(confirmDelete.counts.lessons > 0) && <Badge variant="outline" className="border-brand-blue/20 bg-white">{confirmDelete.counts.lessons} Lección(es)</Badge>}
                                                </div>
                                            )}
                                        </div>
                                        <p className="italic text-xs">Asegúrate de remover estos elementos antes de eliminar el contenedor.</p>
                                    </div>
                                ) : (
                                    <>
                                        Estás por eliminar <span className="font-bold text-brand-navy">"{confirmDelete?.title}"</span>. 
                                        Esta acción es definitiva y no podrá recuperarse en el futuro.
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2 px-4 pb-4">
                            {confirmDelete?.hasChildren ? (
                                <Button onClick={() => setConfirmDelete(null)} className="h-14 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 font-black uppercase tracking-widest text-[10px] w-full">
                                    Entendido, lo revisaré
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        onClick={confirmDelete?.type === 'module' ? handleDeleteModule : handleDeleteLesson} 
                                        className="h-14 rounded-2xl bg-brand-coral hover:bg-red-600 font-black uppercase tracking-widest text-[10px] w-full shadow-lg shadow-brand-coral/20"
                                    >
                                        Sí, borrar permanentemente
                                    </Button>
                                    <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="h-12 font-black uppercase tracking-widest text-[10px] w-full text-muted-foreground">
                                        No, mantenerlo por ahora
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal for Media Resource */}
            <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl max-w-lg">
                    <DialogHeader><DialogTitle className="font-black uppercase tracking-tight flex items-center gap-3"><Video className="h-6 w-6 text-brand-blue" />Agregar Recurso Multimedia</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddMedia} className="space-y-6 py-6">
                        <div className="grid gap-2"><Label className="font-bold">Título del Recurso</Label><Input value={mediaForm.data.title} onChange={e => mediaForm.setData('title', e.target.value)} placeholder="Ej: Video de Bienvenida" className="h-12 border-2 rounded-xl" /></div>
                        <div className="grid gap-2">
                            <Label className="font-bold">Tipo de Recurso</Label>
                            <Select value={mediaForm.data.file_type} onValueChange={val => mediaForm.setData('file_type', val)}>
                                <SelectTrigger className="h-12 border-2 rounded-xl bg-white font-bold">
                                    <SelectValue placeholder="Seleccionar Tipo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    <SelectItem value="video" className="font-bold py-3"><div className="flex items-center gap-2"><Video className="h-4 w-4" /> Video (YouTube/Vimeo)</div></SelectItem>
                                    <SelectItem value="image" className="font-bold py-3"><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Imagen</div></SelectItem>
                                    <SelectItem value="document" className="font-bold py-3"><div className="flex items-center gap-2"><FileIcon className="h-4 w-4" /> Documento (PDF)</div></SelectItem>
                                    <SelectItem value="link" className="font-bold py-3"><div className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Enlace Externo</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><Label className="font-bold">Ruta / URL del Recurso</Label><Input value={mediaForm.data.file_path} onChange={e => mediaForm.setData('file_path', e.target.value)} placeholder="https://youtube.com/..." className="h-12 border-2 rounded-xl" /></div>
                        <div className="flex items-center gap-3">
                            <Switch checked={mediaForm.data.is_downloadable} onCheckedChange={val => mediaForm.setData('is_downloadable', val)} />
                            <Label className="font-bold text-sm">Permitir descarga</Label>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsMediaModalOpen(false)} className="font-bold h-12">Cancelar</Button>
                            <Button type="submit" disabled={mediaForm.processing} className="bg-brand-blue rounded-xl font-black uppercase tracking-widest px-10 h-12 shadow-lg shadow-brand-blue/20">Agregar Recurso</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-2xl overflow-hidden p-0">
                    <div className="bg-brand-navy p-6 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText className="w-24 h-24" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight relative z-10">Importar Preguntas</DialogTitle>
                    </div>
                    <div className="p-6">
                        <div className="text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="mb-2"><strong>Formato Sapius Legacy (Excel/CSV)</strong></p>
                            <p>El archivo debe contener en la fila 1 la cabecera: <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">slug | pregunta | retro | r1 | r2 | r3 | r4 | ... | correcta | score | imagen</code></p>
                        </div>
                        <form onSubmit={handleImportSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60">Archivo Excel (.xlsx, .csv)</Label>
                                <Input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv" 
                                    onChange={e => importForm.setData('file', e.target.files?.[0] || null)}
                                    className="h-12 border-gray-100 rounded-xl font-bold file:h-12 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20"
                                />
                                {importForm.errors.file && <p className="text-xs text-red-500">{importForm.errors.file}</p>}
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button type="button" variant="ghost" onClick={() => setIsImportModalOpen(false)} className="font-black uppercase text-[10px] tracking-widest h-12">Cancelar</Button>
                                <Button type="submit" disabled={importForm.processing || !importForm.data.file} className="bg-brand-blue hover:bg-brand-blue/90 rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-brand-blue/20">
                                    Subir e Importar
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl max-w-2xl p-0 overflow-hidden">
                    <div className="bg-brand-navy p-8 text-white flex items-center justify-between">
                        <DialogHeader><DialogTitle className="font-black uppercase tracking-tight flex items-center gap-3"><HelpCircle className="h-6 w-6 text-brand-coral" />Nueva Pregunta (Opción Múltiple)</DialogTitle></DialogHeader>
                        <Badge className="bg-brand-coral text-white h-8 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest">4 Respuestas</Badge>
                    </div>
                    <form onSubmit={handleAddQuestion} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-widest text-brand-navy/60">Texto de la Pregunta</Label><Textarea value={questionForm.data.text} onChange={e => questionForm.setData('text', e.target.value)} className="border-2 rounded-2xl focus-visible:ring-brand-blue min-h-[100px] font-bold p-4 text-base" placeholder="Escribe el planteamiento de la pregunta..." /></div>
                        <div className="space-y-3"><Label className="font-black uppercase text-[10px] tracking-widest text-brand-navy/60">Retroalimentación / Explicación Pedagógica</Label><Textarea value={questionForm.data.explanation} onChange={e => questionForm.setData('explanation', e.target.value)} placeholder="Ej: La respuesta es correcta debido al principio de..." className="border-2 rounded-2xl border-dashed focus-visible:ring-brand-blue italic text-sm p-4 bg-gray-50/50" /></div>
                        
                        <div className="space-y-4">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-brand-blue">Opciones de Respuesta</Label>
                            {questionForm.data.answers.map((a, idx) => (
                                <div key={idx} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex-1 space-y-1">
                                        <div className="relative">
                                            <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg flex items-center justify-center font-black text-xs", a.is_correct ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400")}>{String.fromCharCode(65 + idx)}</div>
                                            <Input value={a.text} onChange={e => {
                                                const newAnswers = [...questionForm.data.answers];
                                                newAnswers[idx].text = e.target.value;
                                                questionForm.setData('answers', newAnswers);
                                            }} className={cn("h-13 pl-12 border-2 rounded-2xl font-bold", a.is_correct ? "border-green-400 bg-green-50/30" : "hover:border-gray-300")} placeholder={`Texto de la opción ${String.fromCharCode(65 + idx)}`} />
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant={a.is_correct ? "default" : "outline"} 
                                        onClick={() => {
                                            const newAnswers = questionForm.data.answers.map((ans, i) => ({ ...ans, is_correct: i === idx }));
                                            questionForm.setData('answers', newAnswers);
                                        }}
                                        className={cn("h-13 rounded-2xl font-black uppercase text-[9px] tracking-widest w-24 transition-all", a.is_correct ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" : "text-gray-400 border-2 hover:bg-gray-50")}
                                    >
                                        {a.is_correct ? "Correcta" : "Marcar"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                        
                        <DialogFooter className="pt-8 border-t">
                            <Button type="button" variant="ghost" onClick={() => setIsQuestionModalOpen(false)} className="font-black uppercase text-[10px] tracking-widest h-12">Cancelar</Button>
                            <Button type="submit" disabled={questionForm.processing} className="bg-brand-blue rounded-2xl font-black uppercase tracking-widest px-14 h-13 shadow-xl shadow-brand-blue/30">Guardar Pregunta</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Global Scheduling Modal */}
            <ContentSchedulingModal 
                isOpen={isSchedulingModalOpen}
                onClose={() => setIsSchedulingModalOpen(false)}
                title={schedulingTarget?.title || 'Contenido'}
                type={schedulingType}
                data={{
                    is_scheduled: schedulingTarget?.is_scheduled || false,
                    available_at: schedulingTarget?.available_at || null,
                    expires_at: schedulingTarget?.expires_at || null
                }}
                onSave={handleSaveScheduling}
            />
        </>
    );
}

Builder.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Cursos', href: '/admin/courses' }, { title: 'Constructor', href: '#' }]}>
        {page}
    </AppLayout>
);
