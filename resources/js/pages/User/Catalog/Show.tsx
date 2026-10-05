import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, 
    BookOpen, 
    Clock, 
    Award, 
    CheckCircle2, 
    ChevronRight,
    PlayCircle,
    FileText,
    ShieldCheck,
    Star,
    Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from '@/components/ui/accordion';

import { Separator } from '@/components/ui/separator';

interface Lesson {
    id: number;
    title: string;
}

interface Module {
    id: number;
    title: string;
    description: string | null;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    category: string;
    instructor: string;
    price: number | string;
    image: string | null;
    description: string | null;
    modules: Module[];
}

interface Props {
    course: Course;
}

export default function Show({ course }: Props) {
    const { post, processing } = useForm();

    const handleEnroll = () => {
        post(`/user/catalog/${course.id}/enroll`);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <Head title={course.title} />

            {/* Hero Section */}
            <div className="relative bg-brand-navy text-white pt-12 pb-32 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[100px]" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link 
                            href="/user/catalog" 
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group text-xs font-black uppercase tracking-widest"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Regresar al Catálogo
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-4"
                            >
                                <span className="px-4 py-2 rounded-full bg-brand-coral/20 border border-brand-coral/30 text-brand-coral text-[10px] font-black uppercase tracking-[0.2em]">
                                    {course.category}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                                    {course.title}
                                </h1>
                                <p className="text-white/60 text-lg font-medium max-w-xl italic">
                                    {course.description || 'Domina los conocimientos más avanzados con nuestra metodología de alta especialidad médica.'}
                                </p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-6"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-brand-cyan" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Contenido</p>
                                        <p className="font-bold">{course.modules.length} Módulos</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-brand-coral" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Duración</p>
                                        <p className="font-bold">Acceso Vitalicio</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Award className="w-5 h-5 text-brand-blue" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Certificación</p>
                                        <p className="font-bold">Aval Académico</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative"
                        >
                            <div className="aspect-video rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl relative">
                                <img 
                                    src={course.image ? (course.image.startsWith('http') ? course.image : `/media/stream/${course.image}`) : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2073'} 
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-brand-navy/20" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Syllabus */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-brand-navy uppercase tracking-tighter flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-brand-blue" />
                                Plan de Estudios
                            </h2>
                            
                            <Accordion type="single" collapsible className="space-y-4">
                                {course.modules.map((module, idx) => (
                                    <AccordionItem 
                                        key={module.id} 
                                        value={`item-${idx}`}
                                        className="bg-white rounded-[2rem] border-2 border-gray-100 px-6 shadow-xl shadow-gray-200/50 overflow-hidden"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-6">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                                                    <span className="text-brand-navy font-black text-lg">{idx + 1}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-brand-navy uppercase tracking-tight leading-tight">{module.title}</h3>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{module.lessons.length} Lecciones</p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-6">
                                            <div className="pl-16 space-y-3">
                                                {module.lessons.length > 0 ? module.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                                        <PlayCircle className="w-4 h-4 text-brand-blue/40 group-hover:text-brand-blue transition-colors" />
                                                        <span className="text-sm font-bold text-gray-600 group-hover:text-brand-navy transition-colors">{lesson.title}</span>
                                                    </div>
                                                )) : (
                                                    <p className="text-sm text-gray-400 italic">Contenido en preparación pronto disponible.</p>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                        {/* Description & More */}
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                            <h3 className="text-2xl font-black text-brand-navy uppercase tracking-tighter">Sobre este curso</h3>
                            <div className="prose max-w-none text-gray-500 font-medium leading-relaxed italic">
                                {course.description || 'En este curso aprenderás las bases fundamentales y avanzadas necesarias para tu desarrollo profesional de la mano de expertos en la industria.'}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                {[
                                    'Material descargable exclusivo',
                                    'Acceso móvil y multidispositivo',
                                    'Evaluaciones personalizadas',
                                    'Certificado de finalización'
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                                        <span className="text-sm font-bold text-brand-navy/70">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enrollment Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <Card className="rounded-[3rem] border-2 border-brand-navy overflow-hidden shadow-2xl shadow-brand-navy/10">
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Inversión Total</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-brand-navy">${course.price}</span>
                                            <span className="text-sm font-bold text-gray-400 uppercase">MXN</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-navy/60">
                                            <ShieldCheck className="w-4 h-4 text-brand-coral" />
                                            Garantía de Satisfacción
                                        </div>
                                        <Button 
                                            onClick={handleEnroll}
                                            disabled={processing}
                                            className="w-full h-16 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 text-white font-black uppercase tracking-[0.1em] shadow-xl shadow-brand-navy/20 text-md group"
                                        >
                                            {processing ? 'Procesando...' : (
                                                <>
                                                    Adquirir Curso
                                                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Pago seguro vía Conekta / PayPal
                                        </p>
                                    </div>

                                    <Separator className="bg-gray-100" />

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase text-brand-navy tracking-widest">Instructor</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                                                <Star className="w-6 h-6 text-brand-blue" />
                                            </div>
                                            <div>
                                                <p className="font-black text-brand-navy uppercase tracking-tight">{course.instructor}</p>
                                                <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Especialista Sapius</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-brand-coral/5 rounded-[2.5rem] p-6 border border-brand-coral/10">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-brand-coral" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-brand-navy uppercase tracking-tight mb-1">¿Necesitas ayuda?</p>
                                        <p className="text-[10px] font-medium text-gray-500 italic">Contáctanos vía WhatsApp para planes corporativos.</p>
                                    </div>
                                </div>
                            </div>
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
            { title: 'Catálogo', href: '/user/catalog' },
            { title: 'Detalles del Curso', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
