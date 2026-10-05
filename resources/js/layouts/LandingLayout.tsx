import { Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';

interface NavItemProps {
    title: string;
    href?: string;
    children?: { title: string; href: string }[];
}

const NavItem = ({ title, href, children }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!children) {
        return (
            <a 
                href={href || '#'} 
                className="text-xs font-bold tracking-widest text-white hover:text-brand-coral transition-colors uppercase"
            >
                {title}
            </a>
        );
    }

    return (
        <div 
            className="relative group"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className="flex items-center gap-1 text-xs font-bold tracking-widest text-white group-hover:text-brand-coral transition-colors uppercase">
                {title} <ChevronDown className={Math.abs(isOpen ? 180 : 0) === 180 ? "w-3 h-3 rotate-180 transition-transform" : "w-3 h-3 transition-transform"} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                    >
                        {children.map((item, idx) => (
                            <a 
                                key={idx} 
                                href={item.href} 
                                className="block px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-navy transition-all"
                            >
                                {item.title}
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { auth } = usePage().props as any;

    const navLinks = [
        { title: 'INICIO', href: '#' },
        { 
            title: 'EXANI', 
            children: [
                { title: 'EXANI-I', href: '#' },
                { title: 'EXANI-II', href: '#' },
                { title: 'EXANI-III', href: '#' },
            ] 
        },
        { 
            title: 'EGEL PLUS', 
            children: [
                { title: 'EGEL PLUS', href: '#objetivos' },
                { title: 'Medicina', href: '#' },
                { title: 'Nutrición', href: '#' },
            ] 
        },
        { title: 'ENARM', href: '#' },
        { 
            title: 'SIMULADORES', 
            children: [
                { title: 'Medicina', href: '#' },
                { title: 'Nutrición', href: '#' },
            ] 
        },
        { 
            title: 'GUIAS', 
            children: [
                { title: 'Medicina', href: '#' },
                { title: 'Nutrición', href: '#' },
            ] 
        },
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-brand-coral selection:text-white">
            {/* Header / Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-brand-navy/95 backdrop-blur-md border-b border-white/5 h-20 flex items-center">
                <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-full">
                        {/* Logo */}
                        <div className="flex items-center gap-12">
                            <Link href="/" className="flex items-center">
                                <span className="text-3xl font-black tracking-tighter text-white">sapius</span>
                                <span className="h-2 w-2 rounded-full bg-brand-coral ml-0.5 mt-2"></span>
                            </Link>

                            {/* Desktop Nav Items */}
                            <nav className="hidden lg:flex items-center gap-8">
                                {navLinks.map((link, idx) => (
                                    <NavItem key={idx} {...link} />
                                ))}
                            </nav>
                        </div>

                        {/* Right side Actions */}
                        <div className="hidden lg:flex items-center gap-8">
                            <Link href="/register" className="text-xs font-bold tracking-widest text-white hover:text-brand-coral transition-colors uppercase">
                                Registrarme
                            </Link>
                            <Link 
                                href={auth.user ? (auth.user.roles?.[0]?.name === 'admin' ? '/admin/dashboard' : '/alumno') : '/login'} 
                                className="group relative flex items-center justify-center rounded-lg bg-brand-coral px-6 py-3.5 text-xs font-bold tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-coral/20 uppercase overflow-hidden"
                            >
                                <span className="relative z-10 mr-2">IR AL PANEL</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-white relative z-10"></span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-xs bg-brand-navy p-8 shadow-2xl lg:hidden overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <Link href="/" className="flex items-center">
                                    <span className="text-2xl font-black tracking-tighter text-white">Sapius</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-coral ml-0.5 mt-1.5"></span>
                                </Link>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-brand-coral">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-6">
                                {navLinks.map((link, idx) => (
                                    <div key={idx} className="flex flex-col gap-4">
                                        <div className="text-xs font-bold tracking-widest text-white/50 uppercase">{link.title}</div>
                                        {link.children ? (
                                            <div className="flex flex-col gap-3 pl-4 border-l border-white/10">
                                                {link.children.map((sub, sidx) => (
                                                    <a key={sidx} href={sub.href} className="text-sm font-medium text-white hover:text-brand-coral">{sub.title}</a>
                                                ))}
                                            </div>
                                        ) : (
                                            <a href={link.href} className="text-sm font-medium text-white hover:text-brand-coral pl-4">Entrar</a>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            <div className="mt-12 pt-12 border-t border-white/10 flex flex-col gap-6">
                                <Link href="/register" className="text-xs font-bold tracking-widest text-white hover:text-brand-coral uppercase">Registrarme</Link>
                                <Link href="/login" className="flex items-center justify-center rounded-lg bg-brand-coral py-4 text-xs font-bold tracking-widest text-white uppercase">IR AL PANEL <span className="ml-2 h-1.5 w-1.5 rounded-full bg-white"></span></Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-20">
                {children}
            </main>

            {/* Footer Placeholder (as in older version) */}
            <footer className="bg-brand-navy py-20 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-2">
                            <Link href="/" className="flex items-center mb-6">
                                <span className="text-2xl font-black tracking-tighter text-white">sapius</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral ml-0.5 mt-1.5"></span>
                            </Link>
                            <p className="text-white/60 max-w-sm">"Tu formación, nuestra pasión". Expertos en preparación para exámenes de ingreso y acreditación profesional.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Cursos</h4>
                            <ul className="space-y-4 text-white/50 text-sm">
                                <li><a href="#" className="hover:text-brand-coral">EXANI-II</a></li>
                                <li><a href="#" className="hover:text-brand-coral">EGEL Plus</a></li>
                                <li><a href="#" className="hover:text-brand-coral">ENARM</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Contacto</h4>
                            <ul className="space-y-4 text-white/50 text-sm">
                                <li>Mérida, Yucatán</li>
                                <li>999 298 8744</li>
                                <li>contacto@sapius.edu.mx</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
