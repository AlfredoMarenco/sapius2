import { Link } from '@inertiajs/react';
import { SapiusWordmark } from '@/components/public/SapiusLogo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden bg-brand-navy">
            {/* Ambient Background Elements matching Landing */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-coral/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <AnimatePresence mode="wait">
                    <motion.div 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col gap-8"
                    >
                        {/* Header con logotipo oficial Sapius 2026 */}
                        <div className="flex flex-col items-center gap-3">
                            <Link
                                href={home()}
                                className="group flex flex-col items-center transition-transform hover:scale-105 duration-200"
                                title="Volver al inicio de Sapius"
                            >
                                <SapiusWordmark variant="light" size="lg" className="h-10 sm:h-12 drop-shadow-md" />
                            </Link>

                            {description && (
                                <p className="text-center text-xs font-semibold text-white/70 max-w-[320px] leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Card del Formulario */}
                        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/40 border border-white/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-coral via-brand-navy to-brand-blue opacity-90" />
                            {children}
                        </div>

                        {/* Footer discreto */}
                        <div className="flex flex-col items-center gap-2 text-center text-xs text-white/50">
                            <p>
                                &copy; {new Date().getFullYear()} Sapius. Todos los derechos reservados.
                            </p>
                            <Link href={home()} className="text-white/40 hover:text-brand-coral transition-colors text-[11px] underline">
                                &larr; Regresar al sitio público
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
