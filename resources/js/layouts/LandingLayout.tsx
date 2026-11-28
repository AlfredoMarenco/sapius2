import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import MiniTestModal from '@/components/public/MiniTestModal';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import {
    WHATSAPP_PHONE
    
} from '@/components/public/PricingCard';
import type {ScheduledCourseCandidate} from '@/components/public/PricingCard';
import { SapiusWordmark } from '@/components/public/SapiusLogo';

export interface LandingLayoutProps {
    children: React.ReactNode;
    scheduledCourses?: ScheduledCourseCandidate[];
}

interface SharedPageProps {
    scheduledCourses?: ScheduledCourseCandidate[];
    [key: string]: unknown;
}

const NAV_LINKS = [
    { label: 'Inicio', href: '/', matchExact: true },
    {
        label: 'Cursos',
        href: '/cursos',
        matchPrefixes: ['/cursos', '/egel', '/exani'],
    },
    {
        label: 'Productos',
        href: '/productos',
        matchPrefixes: [
            '/productos',
            '/guias',
            '/simuladores',
            '/grupos-y-paquetes',
        ],
    },
    { label: 'Nosotros', href: '/nosotros', matchPrefixes: ['/nosotros'] },
    {
        label: 'Orgullo Sapius',
        href: '/orgullo-sapius',
        matchPrefixes: ['/orgullo-sapius'],
    },
    { label: 'Contacto', href: '/contacto', matchPrefixes: ['/contacto'] },
];

export default function LandingLayout({
    children,
    scheduledCourses: propScheduledCourses,
}: LandingLayoutProps) {
    const [mobileMenuOpenedPath, setMobileMenuOpenedPath] = useState<
        string | null
    >(null);
    const [scrolled, setScrolled] = useState(false);

    const page = usePage<SharedPageProps>();
    const currentPath = (page.url || '/').split('?')[0].split('#')[0] || '/';
    const mobileOpen = mobileMenuOpenedPath === currentPath;
    const setMobileOpen = (value: boolean | ((prev: boolean) => boolean)) => {
        setMobileMenuOpenedPath((prevPath) => {
            const prevOpen = prevPath === currentPath;
            const nextOpen =
                typeof value === 'function' ? value(prevOpen) : value;

            return nextOpen ? currentPath : null;
        });
    };

    const resolvedCourses =
        propScheduledCourses ??
        (Array.isArray(page.props?.scheduledCourses)
            ? page.props.scheduledCourses
            : undefined);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActiveLink = (item: (typeof NAV_LINKS)[number]): boolean => {
        if (item.matchExact) {
            return currentPath === '/';
        }

        return (
            item.matchPrefixes?.some((prefix) =>
                currentPath.startsWith(prefix),
            ) ?? false
        );
    };

    return (
        <div
            style={{ colorScheme: 'light' }}
            className="min-h-screen bg-white font-display text-[#101E33] antialiased selection:bg-[#FF6B52]/20 selection:text-[#101E33]"
        >
            {/* Navbar Superior Transparente sobre Hero y Translúcido al Hacer Scroll */}
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
                    !scrolled && !mobileOpen
                        ? 'border-b border-transparent bg-transparent'
                        : 'border-b border-[#101E33]/8 bg-white/92 shadow-[0_4px_20px_-12px_rgba(16,30,51,0.12)] backdrop-blur-md'
                }`}
            >
                <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 sm:px-8 lg:h-[88px] lg:px-10">
                    {/* Izquierda: Wordmark sapius. */}
                    <Link
                        href="/"
                        aria-label="Sapius Inicio"
                        className="inline-flex shrink-0 items-center focus:outline-none"
                    >
                        <SapiusWordmark
                            variant="dark"
                            className="h-7 sm:h-[30px]"
                        />
                    </Link>

                    {/* Derecha agrupada (Desktop): Enlaces + Botones Pill */}
                    <div className="hidden items-center gap-8 lg:flex xl:gap-10">
                        <nav
                            aria-label="Navegación principal"
                            className="flex items-center gap-7 xl:gap-9"
                        >
                            {NAV_LINKS.map((item) => {
                                const active = isActiveLink(item);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative text-[15.5px] transition-colors duration-150 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-[#FF6B52] after:transition-all after:duration-200 ${
                                            active
                                                ? 'font-extrabold text-[#101E33] after:w-full'
                                                : 'font-normal text-[#101E33] after:w-0 hover:text-[#FF6B52] hover:after:w-full'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-full bg-[#101E33] px-6 py-2 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                            >
                                Regístrate
                            </Link>
                        </div>
                    </div>

                    {/* Botón Menú Móvil */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-[#101E33] transition-colors hover:bg-[#101E33]/5 lg:hidden"
                    >
                        {mobileOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Menú Móvil Desplegable */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="overflow-hidden border-t border-[#101E33]/10 bg-white lg:hidden"
                        >
                            <div className="space-y-4 px-5 py-6 sm:px-8">
                                <nav className="flex flex-col space-y-2">
                                    {NAV_LINKS.map((item) => {
                                        const active = isActiveLink(item);

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className={`flex min-h-[46px] items-center rounded-xl px-4 py-2.5 text-base transition-colors ${
                                                    active
                                                        ? 'bg-[#CFE4FF]/40 font-extrabold text-[#101E33]'
                                                        : 'font-medium text-[#101E33]/85 hover:bg-[#101E33]/5 hover:text-[#101E33]'
                                                }`}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="flex flex-col gap-3 border-t border-[#101E33]/10 pt-4 sm:flex-row">
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#FF6B52] px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#F0563C]"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#101E33] px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#192B47]"
                                    >
                                        Regístrate
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Contenido de la Página */}
            <main>{children}</main>

            {/* Modal global del Mini-Test de 6 preguntas */}
            <MiniTestModal
                scheduledCourses={resolvedCourses}
                listenToGlobalEvent={true}
            />

            {/* Footer Oscuro fiel a page1_s6_y5250.png */}
            <footer className="relative overflow-hidden bg-[#101E33] text-white">
                <div className="relative z-10 mx-auto max-w-[1280px] px-5 pt-16 pb-14 sm:px-8 lg:px-10 lg:pt-20 lg:pb-16">
                    {/* Bloque superior: CTA izquierda + Navegación derecha */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end"
                    >
                        <div className="max-w-2xl">
                            <h2 className="font-display text-3xl leading-[1.06] font-extrabold tracking-tight text-white sm:text-4xl lg:text-[3.15rem]">
                                ¿Tienes dudas sobre
                                <br />
                                qué{' '}
                                <span className="text-[#FF6B52]">
                                    curso necesitas?
                                </span>
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-white/90 sm:text-[17px]">
                                Escríbenos y nuestro equipo te orientará según tu
                                objetivo académico
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/contacto"
                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-10 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Contactar ahora
                                </Link>
                            </div>
                        </div>

                        {/* Lista vertical derecha */}
                        <ul className="text-[16px] leading-[1.75] text-white/90 lg:text-right">
                            <li>
                                <Link
                                    href="/cursos"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    Cursos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/nosotros"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    Nosotros
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/preguntas-frecuentes"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    Preguntas frecuentes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/orgullo-sapius"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    Orgullo Sapius
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/grupos-y-paquetes"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    Universidades y equipos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/orgullo-sapius"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Bloque inferior SIN border-t */}
                    <div className="mt-14 grid grid-cols-1 items-end gap-10 md:grid-cols-3 lg:mt-16">
                        {/* Izquierda inferior: Contacto */}
                        <div className="space-y-1.5 text-[15px] text-white/90">
                            <h3 className="text-base font-extrabold text-white">
                                Contacto
                            </h3>
                            <p>
                                <a
                                    href="mailto:contacto@sapius.com.mx"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    contacto@sapius.com.mx
                                </a>
                            </p>
                            <p>
                                <a
                                    href={`tel:+${WHATSAPP_PHONE}`}
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    +52 999 298 8744
                                </a>
                            </p>
                            <p className="pt-0.5">
                                <Link
                                    href="/privacidad"
                                    className="text-white/95 underline underline-offset-4 transition-colors hover:text-[#FF6B52]"
                                >
                                    Aviso de privacidad
                                </Link>
                            </p>
                        </div>

                        {/* Centro inferior: Wordmark blanco/coral + lema + 4 redes sociales exactas */}
                        <div className="flex flex-col items-start md:items-center md:text-center">
                            <Link href="/" aria-label="Sapius Inicio">
                                <SapiusWordmark
                                    variant="light"
                                    className="h-8 sm:h-9"
                                />
                            </Link>
                            <p className="mt-2 text-xs text-white/85 sm:text-[13px]">
                                Tu formación, nuestra pasión
                            </p>

                            {/* 4 círculos blancos h-10 w-10: Instagram, Twitter, Facebook, LinkedIn */}
                            <div className="mt-5 flex items-center gap-3.5">
                                <a
                                    href="https://www.instagram.com/sapius_latinoamerica/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram de Sapius"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5 fill-none stroke-current"
                                        strokeWidth="2.1"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="3"
                                            y="3"
                                            width="18"
                                            height="18"
                                            rx="5"
                                        />
                                        <circle cx="12" cy="12" r="4" />
                                        <circle
                                            cx="17.5"
                                            cy="6.5"
                                            r="1.1"
                                            className="fill-current stroke-none"
                                        />
                                    </svg>
                                </a>

                                <a
                                    href="https://x.com/SapiusMx"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Twitter de Sapius"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M21.5 6.4c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.2 1.7-2.1-.7.4-1.6.8-2.4.9a3.8 3.8 0 0 0-6.6 3.5A10.8 10.8 0 0 1 4.2 5.3a3.8 3.8 0 0 0 1.2 5.1c-.6 0-1.2-.2-1.7-.5v.1a3.8 3.8 0 0 0 3 3.7c-.5.1-1.1.2-1.7.1a3.8 3.8 0 0 0 3.6 2.6A7.7 7.7 0 0 1 3 18c1.7 1.1 3.7 1.7 5.8 1.7 7 0 10.9-5.8 10.9-10.9v-.5c.7-.5 1.3-1.2 1.8-1.9Z" />
                                    </svg>
                                </a>

                                <a
                                    href="https://www.facebook.com/Sapius-latinoam%C3%A9rica-104931991400060"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook de Sapius"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M13.6 21v-7.8h2.6l.4-3h-3V8.3c0-.9.3-1.5 1.5-1.5h1.6V4.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3.1Z" />
                                    </svg>
                                </a>

                                <a
                                    href="https://www.linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn de Sapius"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4.5 w-4.5 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M6.9 8.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM5.2 10h3.4v9.8H5.2V10Zm5.5 0h3.2v1.3h.1c.5-.9 1.6-1.6 3.2-1.6 3.4 0 4 2.2 4 5.1v5h-3.4v-4.4c0-1.1 0-2.4-1.5-2.4s-1.7 1.2-1.7 2.3v4.5h-3.4V10Z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Esquina inferior derecha: Grilla de + en BLANCO */}
                        <div className="hidden justify-end opacity-85 md:flex">
                            <PlusGridPattern
                                rows={4}
                                cols={6}
                                color="white"
                                gap={30}
                                size={8}
                            />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
