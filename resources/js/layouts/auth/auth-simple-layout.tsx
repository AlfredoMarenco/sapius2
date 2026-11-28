import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles, GraduationCap, ArrowLeft } from 'lucide-react';
import { SapiusWordmark, SapiusIsotype } from '@/components/public/SapiusLogo';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div
            style={{ colorScheme: 'light' }}
            className="min-h-svh w-full flex bg-white text-[#101E33] font-display antialiased selection:bg-[#FF6B52]/20 selection:text-[#101E33]"
        >
            {/* Lado Izquierdo: Showcase de Marca Sapius 2026 (Visible en pantallas grandes) */}
            <div className="relative hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#101E33] flex-col justify-between p-12 xl:p-16 text-white overflow-hidden">
                {/* Patrón de fondo geométrico PlusGrid de la Landing */}
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
                    <PlusGridPattern className="w-full h-full text-white" />
                </div>

                {/* Resplandores ambientales corporativos */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF6B52]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2B4C7E]/40 rounded-full blur-3xl pointer-events-none" />

                {/* Isotipo Monumental en Marca de Agua */}
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
                    <SapiusIsotype variant="light" size="hero" className="w-[420px] h-auto drop-shadow-2xl" />
                </div>

                {/* Encabezado Izquierdo */}
                <div className="relative z-10">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 group transition-transform hover:scale-105 duration-200"
                        title="Ir a página principal de Sapius"
                    >
                        <SapiusWordmark variant="light" size="lg" className="h-11" />
                    </Link>
                </div>

                {/* Centro Izquierdo: Propuesta de Valor y Remake Oficial */}
                <div className="relative z-10 max-w-lg space-y-8 my-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#FFD9CE] tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF6B52]" />
                        Plataforma de Alta Especialidad Médica
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.18] text-white">
                            Tu preparación médica al más alto nivel con el{' '}
                            <span className="text-[#FF6B52]">Método SUMA.</span>
                        </h1>
                        <p className="text-sm xl:text-base text-slate-300 leading-relaxed font-normal">
                            Accede a tus cursos interactivos, simuladores EGEL, videoclases y herramientas pedagógicas diseñadas para asegurar tu titulación y excelencia profesional.
                        </p>
                    </div>

                    {/* Mini Credenciales de Confianza */}
                    <div className="pt-2 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center justify-center size-9 rounded-xl bg-[#FF6B52]/20 text-[#FF6B52]">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-base font-extrabold text-white leading-tight">+13 años</p>
                                <p className="text-[11px] text-slate-400 font-medium">De experiencia</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center justify-center size-9 rounded-xl bg-emerald-500/20 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-base font-extrabold text-white leading-tight">99.1%</p>
                                <p className="text-[11px] text-slate-400 font-medium">Aprobación y éxito</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Izquierdo */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
                    <p className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#FF6B52]" />
                        Entorno Seguro y Cifrado
                    </p>
                    <p>&copy; {new Date().getFullYear()} Sapius</p>
                </div>
            </div>

            {/* Lado Derecho: Formulario con la misma línea visual y degradados de la web */}
            <div
                className="w-full lg:w-1/2 xl:w-7/12 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 relative overflow-hidden bg-white"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 85% 15%, rgba(207, 228, 255, 0.7) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(255, 217, 206, 0.7) 0%, transparent 45%)',
                }}
            >
                {/* Botón superior para volver al sitio público */}
                <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#101E33] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Volver al inicio
                    </Link>

                    {/* Logo móvil (cuando la columna izquierda está oculta) */}
                    <div className="lg:hidden">
                        <SapiusWordmark variant="dark" size="sm" className="h-7" />
                    </div>
                </div>

                {/* Contenedor Central del Formulario */}
                <div className="w-full max-w-md mx-auto my-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-200/80 relative"
                        >
                            {/* Acento superior de color */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF6B52] via-[#101E33] to-[#2B4C7E] rounded-t-3xl" />
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer inferior derecho */}
                <div className="w-full max-w-md mx-auto text-center mt-8 pt-4">
                    <p className="text-xs text-slate-400">
                        ¿Necesitas asistencia técnica con tu cuenta?{' '}
                        <a
                            href="https://wa.me/5212211904705"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FF6B52] font-semibold hover:underline"
                        >
                            Contáctanos por WhatsApp
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
