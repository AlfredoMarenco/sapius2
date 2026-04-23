import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden bg-brand-navy">
            {/* Premium Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-coral/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/30 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <AnimatePresence mode="wait">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col gap-10"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <Link
                                href={home()}
                                className="group flex flex-col items-center gap-4 transition-transform hover:scale-105"
                            >
                                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-2xl shadow-brand-coral/20 ring-4 ring-white/10 group-hover:ring-brand-coral/30 transition-all duration-500">
                                    <AppLogoIcon className="size-10 fill-brand-navy" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-1">Ecosistema Sapius</h2>
                                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase whitespace-nowrap">Suite Pedagógica</h1>
                                </div>
                            </Link>

                            {description && (
                                <p className="text-center text-sm font-bold text-white/50 uppercase tracking-widest max-w-[280px] leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/40 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-coral via-brand-blue to-brand-cyan opacity-80" />
                            {children}
                        </div>

                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/20">
                            &copy; {new Date().getFullYear()} Sapius Intellectual Property. v2.0
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
