import LandingLayout from '@/layouts/LandingLayout';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GraduationCap, BookOpen, MessageCircle, ArrowRight, Star } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface Props {
    slides: any[];
    prides: any[];
    teachers: any[];
    reviews: any[];
}

const OBJECTIVES = [
    { id: 'prepa', title: 'Ingresar a la prepa', subtitle: 'Juntos lograremos tu admisión a la Preparatoria', desc: 'En este curso obtendrás todo lo que necesitas para aprobar el examen.', img: '/img/v1/1.png', color: 'orange' },
    { id: 'univ', title: 'Ingresar a la Universidad', subtitle: 'Juntos lograremos tu admisión a la Universidad', desc: 'En este curso obtendrás todo lo que necesitas para aprobar el examen.', img: '/img/v1/2.png', color: 'blue' },
    { id: 'egel', title: 'Aprobar el EGEL Plus', subtitle: 'Juntos lograremos aprobar el EGEL Plus', desc: 'En este curso obtendrás todo lo que necesitas para aprobar el examen.', img: '/img/egel.png', color: 'orange' },
    { id: 'maestria', title: 'Ingresar a la Maestría', subtitle: 'Juntos lograremos aprobar la Maestría', desc: 'En este curso obtendrás todo lo que necesitas para aprobar el examen.', img: '/img/v1/4.png', color: 'blue' },
    { id: 'enarm', title: 'Aprobar el ENARM', subtitle: 'Juntos lograremos aprobar el ENARM', desc: 'En este curso obtendrás todo lo que necesitas para aprobar el examen.', img: '/img/v1/5.png', color: 'orange' },
];

export default function Welcome({ slides, prides, teachers, reviews }: Props) {
    const [activeTab, setActiveTab] = useState('egel');
    const [heroTextIndex, setHeroTextIndex] = useState(0);
    const heroTexts = ['EXANI-I', 'EXANI-II', 'EXANI-III', 'ENARM', 'EGEL PLUS'];

    useEffect(() => {
        const timer = setInterval(() => {
            setHeroTextIndex((prev) => (prev + 1) % heroTexts.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    const activeObjective = OBJECTIVES.find(o => o.id === activeTab) || OBJECTIVES[0];

    return (
        <LandingLayout>
            <Head title="Cursos online para aprobar el EGEL PLUS - Sapius®" />

            {/* Hero Section */}
            <section id="inicio" className="relative overflow-hidden bg-white py-24 lg:py-32 min-h-[80vh] flex items-center">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-7 flex flex-col justify-center">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl font-black tracking-tighter text-brand-navy sm:text-[5.5rem] leading-[1.1]"
                            >
                                Prepárate con Sapius <br />
                                <span className="inline-block mt-2 text-brand-coral min-w-[300px]">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={heroTextIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.5 }}
                                            className="block uppercase"
                                        >
                                            {heroTexts[heroTextIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </span >
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-8 text-xl text-gray-500 max-w-lg italic font-medium"
                            >
                                "Tu formación, nuestra pasión"
                            </motion.p>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-10 flex flex-wrap gap-4"
                            >
                                <Link href="/register" className="rounded-full bg-brand-coral px-10 py-5 text-center text-sm font-black tracking-widest text-white shadow-2xl shadow-brand-coral/30 hover:scale-105 active:scale-95 transition-all uppercase">
                                    COMENZAR
                                </Link>
                                <a href="https://api.whatsapp.com/send?phone=529992988744" className="rounded-full bg-white border-2 border-brand-navy/5 px-10 py-5 text-sm font-black tracking-widest text-brand-navy hover:bg-brand-navy hover:text-white transition-all uppercase flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Información
                                </a>
                            </motion.div>
                        </div>
                        <div className="mt-16 lg:mt-0 lg:col-span-5 relative">
                            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,28,61,0.2)] skew-y-1 lg:skew-y-3 ring-8 ring-white">
                                {slides.length > 0 ? (
                                    <img src={`/storage/${slides[0].img}`} alt="Sapius Slide" className="w-full h-auto aspect-[4/5] object-cover" />
                                ) : (
                                    <div className="bg-gray-50 aspect-[4/5] flex items-center justify-center">
                                        <GraduationCap className="w-32 h-32 text-brand-navy/10" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-coral/10 rounded-full blur-[80px] -z-10"></div>
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-navy/10 rounded-full blur-[80px] -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-brand-navy/5 py-24 relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="text-center group p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-coral/10 text-brand-coral transition-all group-hover:bg-brand-coral group-hover:text-white group-hover:rotate-6">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="mt-8 text-2xl font-black text-brand-navy uppercase tracking-tighter">99.1% de éxito</h3>
                            <p className="mt-3 text-gray-500 font-medium leading-relaxed">Nuestros estudiantes logran sus metas académicas superiores.</p>
                        </div>
                        <div className="text-center group p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-cyan transition-all group-hover:bg-brand-cyan group-hover:text-white group-hover:-rotate-6">
                                <GraduationCap className="h-10 w-10" />
                            </div>
                            <h3 className="mt-8 text-2xl font-black text-brand-navy uppercase tracking-tighter">Método SUMA</h3>
                            <p className="mt-3 text-gray-500 font-medium leading-relaxed">Metodología exclusiva que maximiza tus resultados en exámenes.</p>
                        </div>
                        <div className="text-center group p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-navy text-white transition-all group-hover:bg-brand-navy group-hover:scale-110">
                                <BookOpen className="h-10 w-10" />
                            </div>
                            <h3 className="mt-8 text-2xl font-black text-brand-navy uppercase tracking-tighter">Cursos Completos</h3>
                            <p className="mt-3 text-gray-500 font-medium leading-relaxed">El material más actualizado y robusto disponible en el mercado.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Objectives Section */}
            <section id="objetivos" className="py-24 lg:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black tracking-tighter text-brand-navy sm:text-6xl uppercase">
                            ¿Cuál es tu objetivo?
                        </h2>
                        <p className="mt-6 text-xl text-gray-500 font-medium">Selecciona el curso que transformará tu futuro</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-16 px-4">
                        {OBJECTIVES.map((obj) => (
                            <button
                                key={obj.id}
                                onClick={() => setActiveTab(obj.id)}
                                className={`px-8 py-4 rounded-full text-xs font-black tracking-widest transition-all uppercase ${
                                    activeTab === obj.id 
                                        ? 'bg-brand-navy text-white shadow-xl shadow-brand-navy/20' 
                                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-brand-coral/30'
                                }`}
                            >
                                {obj.title}
                            </button>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-[4rem] p-8 lg:p-20 overflow-hidden relative border border-gray-100 shadow-sm">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid md:grid-cols-12 gap-16 items-center"
                            >
                                <div className="md:col-span-7">
                                    <h3 className="text-5xl lg:text-7xl font-black text-brand-navy leading-[1] tracking-tighter uppercase mb-8">
                                        {activeObjective.subtitle.split(' ').map((word, i) => (
                                            <span key={i} className={word.toLowerCase() === activeObjective.title.split(' ').slice(-1)[0].toLowerCase() ? 'text-brand-coral' : ''}>
                                                {word}{' '}
                                            </span>
                                        ))}
                                    </h3>
                                    <p className="mt-10 text-xl text-gray-600 leading-relaxed max-w-xl font-medium">
                                        {activeObjective.desc}
                                    </p>
                                    <Link href="/register" className="mt-12 inline-flex items-center gap-3 rounded-full bg-brand-coral px-10 py-5 text-sm font-black tracking-widest text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-coral/20 uppercase">
                                        COMENZAR <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                                <div className="md:col-span-5 relative">
                                    <motion.div 
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: 3 }}
                                        className="relative z-10 p-6 rounded-[2.5rem] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100"
                                    >
                                        <img src={activeObjective.img} alt={activeObjective.title} className="w-full h-auto rounded-[1.5rem]" />
                                    </motion.div>
                                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-brand-coral blur-[100px] -z-10 opacity-10"></div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <section id="orgullos" className="bg-brand-navy py-24 lg:py-32 rounded-[4rem] mx-4 lg:mx-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[120px] -z-0"></div>
                
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:flex lg:items-end lg:justify-between mb-20">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-black tracking-tighter text-white sm:text-7xl leading-none uppercase">
                                Nuestros <br /><span className="text-brand-coral">orgullos Sapius</span>
                            </h2>
                            <p className="mt-8 text-xl text-white/60 font-medium">Alumnos que han logrado transformar su futuro con nosotros.</p>
                        </div>
                        <div className="mt-10 lg:mt-0">
                            <a href="https://api.whatsapp.com/send?phone=529992988744" className="inline-flex items-center gap-2 rounded-full bg-white border-2 border-white px-10 py-5 font-black tracking-widest text-brand-navy hover:bg-brand-coral hover:border-brand-coral hover:text-white transition-all uppercase text-sm">
                                SOLICITAR CLASE MUESTRA
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {prides.length > 0 ? prides.map((p) => (
                            <div key={p.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all group">
                                <div className="relative w-36 h-36 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-brand-coral/20 rounded-full scale-110 group-hover:scale-125 transition-all"></div>
                                    <img src={`/storage/${p.img}`} alt={p.name} className="relative w-full h-full object-cover rounded-full border-4 border-white/5 shadow-2xl" />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">{p.name}</h4>
                                    <p className="mt-6 text-white/50 italic text-lg leading-relaxed">"{p.text}"</p>
                                    <div className="mt-10 pt-8 border-t border-white/5">
                                        <span className="text-brand-coral font-black uppercase tracking-[0.2em] text-xs leading-none">{p.text2}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-24 text-center text-white/20 font-black uppercase tracking-widest text-xl">
                                Próximamente más historias...
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Teachers Section */}
            <section id="docentes" className="py-24 lg:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl font-black tracking-tighter text-brand-navy sm:text-6xl uppercase">Cuerpo Docente</h2>
                        <p className="mt-6 text-xl text-gray-500 font-medium">Expertos de alto nivel comprometidos con tu excelencia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                        {teachers.slice(0, 6).map((t) => (
                            <div key={t.id} className="text-center group">
                                <div className="relative inline-block mb-10">
                                    <div className="absolute inset-0 bg-brand-coral/5 rounded-full scale-[1.3] group-hover:scale-[1.8] group-hover:opacity-0 transition-all duration-1000"></div>
                                    <img src={`/storage/${t.img}`} alt={t.name} className="relative w-56 h-56 object-cover rounded-full border-4 border-gray-50 shadow-[0_20px_50px_rgba(0,28,61,0.15)] group-hover:scale-105 transition-all duration-500" />
                                </div>
                                <h4 className="text-3xl font-black text-brand-navy uppercase tracking-tighter">{t.name}</h4>
                                <p className="mt-3 text-brand-coral font-black uppercase tracking-widest text-xs">{t.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section id="reseñas" className="bg-brand-navy py-32 rounded-t-[4rem] relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-20 text-white">
                        <h2 className="text-4xl font-black sm:text-6xl mb-6 uppercase tracking-tighter">Testimonios</h2>
                        <div className="flex justify-center gap-1.5 pt-2">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-8 h-8 fill-brand-coral text-brand-coral" />)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {reviews.length > 0 ? reviews.map((r) => (
                            <div key={r.id} className="bg-white/5 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] hover:bg-white/10 hover:-translate-y-2 transition-all duration-500">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-brand-coral text-brand-coral" />)}
                                </div>
                                <p className="text-white/70 italic text-xl leading-relaxed mb-10 font-medium">"{r.content}"</p>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-coral flex items-center justify-center font-black text-white text-xl shadow-lg shadow-brand-coral/20">
                                        {r.user_name[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-white uppercase text-base">{r.user_name}</span>
                                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Estudiante</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-24 text-center text-white/20 font-black uppercase tracking-[0.3em]">
                                Próximamente más testimonios...
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Final Contact CTA */}
            <section className="bg-brand-navy pb-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-brand-coral p-16 rounded-[4rem] text-white overflow-hidden relative group shadow-2xl shadow-brand-coral/20">
                            <div className="relative z-10">
                                <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter leading-none">¿Deseas más información?</h3>
                                <p className="text-white/80 text-xl font-medium mb-12 max-w-xs">Nuestros asesores expertos están para apoyarte y resolver tus dudas de inmediato.</p>
                                <a href="https://api.whatsapp.com/send?phone=529992988744" className="inline-block bg-brand-navy text-white px-12 py-5 rounded-full font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-navy/20 uppercase">
                                    Enviar WhatsApp
                                </a>
                            </div>
                            <MessageCircle className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12 group-hover:scale-125 group-hover:rotate-[24deg] transition-all duration-[1500ms]" />
                        </div>
                        <div className="bg-white border-2 border-brand-navy/5 p-16 rounded-[4rem] text-brand-navy overflow-hidden relative group">
                            <div className="relative z-10">
                                <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter leading-none">Modalidad <br />Presencial</h3>
                                <p className="text-gray-500 text-xl font-medium mb-12 max-w-[240px]">¿Prefieres aprender en nuestras aulas? Conoce nuestra oferta académica en sitio.</p>
                                <Link href="/cursos-presenciales" className="inline-block bg-brand-navy text-white px-12 py-5 rounded-full font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-navy/20 uppercase">
                                    Ver Detalles
                                </Link>
                            </div>
                            <GraduationCap className="absolute -right-12 -bottom-12 w-64 h-64 text-brand-navy/5 -rotate-12 group-hover:scale-125 group-hover:-rotate-[24deg] transition-all duration-[1500ms]" />
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
