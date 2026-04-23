import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    BookOpen, 
    CheckCircle2, 
    PlayCircle, 
    Lock,
    Settings,
    FileText,
    MessageSquare,
    Maximize2,
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from '@/components/ui/accordion';
import { useState } from 'react';

interface Lesson {
    id: number;
    title: string;
    is_completed: boolean;
    is_locked: boolean;
    available_at?: string | null;
}

interface Module {
    id: number;
    title: string;
    is_locked: boolean;
    available_at?: string | null;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    description: string | null;
    instructor: string;
    modules: Module[];
}

interface Props {
    enrollment_id: number;
    course: Course;
}

export default function Show({ enrollment_id, course }: Props) {
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(
        course.modules[0]?.lessons[0] || null
    );

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
            <Head title={`Estudiando: ${course.title}`} />

            {/* Left Column: Content Player */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                {/* Top Navigation */}
                <div className="bg-white border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/user/my-courses" className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-brand-navy hover:text-white transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-sm font-black text-brand-navy uppercase tracking-tighter line-clamp-1">{course.title}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeLesson?.title || 'Selecciona una lección'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10"><MessageSquare className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10"><Settings className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 md:p-12 space-y-12">
                    <AnimatePresence mode="wait">
                        {activeLesson ? (
                            <motion.div
                                key={activeLesson.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-12"
                            >
                                {/* Placeholder for Video/Main Content */}
                                {activeLesson.is_locked ? (
                                    <div className="aspect-video bg-gray-100 rounded-[3rem] shadow-inner relative overflow-hidden flex flex-col items-center justify-center p-12 text-center border-4 border-dashed border-gray-200">
                                        <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 animate-pulse">
                                            <Lock className="w-10 h-10 text-brand-blue" />
                                        </div>
                                        <h3 className="text-2xl font-black text-brand-navy uppercase tracking-tight mb-2">Contenido Programado</h3>
                                        <p className="text-gray-400 font-bold italic tracking-wide">
                                            Esta lección estará disponible a partir del:<br/>
                                            <span className="text-brand-blue not-italic">{activeLesson.available_at}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-brand-navy rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle className="w-24 h-24 text-white/20 group-hover:text-brand-coral group-hover:scale-110 transition-all duration-500 cursor-pointer" />
                                        </div>
                                        <div className="absolute bottom-8 left-8 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                                <Maximize2 className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lesson Details */}
                                <div className="max-w-4xl space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em]",
                                                activeLesson.is_locked ? "bg-gray-100 text-gray-400" : "bg-brand-blue/10 text-brand-blue"
                                            )}>
                                                {activeLesson.is_locked ? 'Próximamente' : 'Lección Actual'}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.instructor}</span>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-black text-brand-navy uppercase tracking-tighter leading-tight">
                                            {activeLesson.title}
                                        </h1>
                                    </div>

                                    {activeLesson.is_locked ? (
                                        <div className="p-6 bg-brand-blue/5 rounded-2xl border-2 border-brand-blue/10 flex items-start gap-4">
                                            <Clock className="w-5 h-5 text-brand-blue shrink-0 mt-1" />
                                            <div>
                                                <p className="text-sm font-black text-brand-navy uppercase tracking-tight">Acceso Restringido</p>
                                                <p className="text-xs text-brand-navy/60 font-medium leading-relaxed">
                                                    El administrador ha programado este contenido para liberarse el {activeLesson.available_at}. 
                                                    Te recomendamos seguir con las lecciones disponibles o repasar el material anterior mientras esperas.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="prose text-gray-500 font-medium leading-relaxed italic border-l-4 border-brand-blue/30 pl-6 py-2">
                                                Explora los conceptos avanzados de este tema clave. En esta sesión profundizaremos en la metodología Sapius para garantizar tu dominio total sobre la materia.
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-10">
                                                <Button className="h-14 px-8 rounded-2xl bg-brand-navy hover:bg-brand-blue font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-navy/10 gap-2">
                                                    <CheckCircle2 className="w-4 h-4" /> Marcar como completada
                                                </Button>
                                                <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-2">
                                                    <FileText className="w-4 h-4" /> Recursos (PDF)
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                                    <PlayCircle className="w-10 h-10 text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Comienza a estudiar</h3>
                                    <p className="text-gray-400 font-medium italic">Selecciona una lección del temario para comenzar.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Column: Syllabus Sidebar */}
            <div className="w-96 bg-white border-l h-full flex flex-col hidden lg:flex">
                <div className="p-6 border-b space-y-4">
                    <h3 className="text-sm font-black text-brand-navy uppercase tracking-[0.2em] flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-brand-blue" />
                        Temario del Curso
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                            <span>Progreso General</span>
                            <span>0%</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-blue w-0" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Accordion type="multiple" defaultValue={["item-0"]} className="space-y-1">
                        {course.modules.map((module, mIdx) => (
                            <AccordionItem key={module.id} value={`item-${mIdx}`} className="border-none">
                                <AccordionTrigger className="hover:no-underline hover:bg-gray-50/50 px-6 py-5 text-left border-b group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-brand-navy/5 flex items-center justify-center group-data-[state=open]:bg-brand-navy group-data-[state=open]:text-white transition-colors">
                                            <span className="text-[10px] font-black">{mIdx + 1}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-brand-navy uppercase tracking-tight leading-[1.1]">{module.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <div className="bg-gray-50/50">
                                        {module.lessons.map((lesson) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setActiveLesson(lesson)}
                                                className={`w-full flex items-center gap-4 px-6 py-4 border-b border-white transition-all hover:bg-white text-left group ${activeLesson?.id === lesson.id ? 'bg-white border-l-4 border-l-brand-blue' : ''}`}
                                            >
                                                <div className="shrink-0">
                                                    {lesson.is_locked ? (
                                                        <Lock className="w-4 h-4 text-gray-300" />
                                                    ) : lesson.is_completed ? (
                                                        <div className="w-5 h-5 rounded-full bg-brand-cyan flex items-center justify-center">
                                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                                        </div>
                                                    ) : (
                                                        <PlayCircle className={`w-5 h-5 ${activeLesson?.id === lesson.id ? 'text-brand-blue' : 'text-gray-300 group-hover:text-brand-blue/50'}`} />
                                                    )}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className={`text-[11px] font-bold leading-tight ${activeLesson?.id === lesson.id ? 'text-brand-navy' : lesson.is_locked ? 'text-gray-300' : 'text-gray-500 group-hover:text-brand-navy/70'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {lesson.is_locked ? (
                                                            <span className="text-[7px] font-black text-brand-blue bg-brand-blue/5 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                                Abre el {lesson.available_at}
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3 text-gray-300" />
                                                                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">15 min</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <div className="p-6 bg-gray-50 border-t">
                    <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-coral/10 flex items-center justify-center">
                            <Award className="w-5 h-5 text-brand-coral" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-brand-navy uppercase tracking-tight">Logros académicos</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sigue avanzando</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Mis Cursos', href: '/user/my-courses' },
            { title: 'Estudiando', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
