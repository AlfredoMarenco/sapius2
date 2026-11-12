import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import MiniTestModal from '@/components/public/MiniTestModal';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import { SapiusWordmark } from '@/components/public/SapiusLogo';

export interface LandingLayoutProps {
    children: React.ReactNode;
    scheduledCourses?: ScheduledCourseCandidate[];
}

interface SharedPageProps {
    auth?: {
        user?: {
            id: number;
            name?: string;
            roles?: Array<{ name: string }>;
        } | null;
    };
    scheduledCourses?: ScheduledCourseCandidate[];
    [key: string]: unknown;
}

const NAV_LINKS = [
    { label: 'Inicio', href: '/', matchExact: true },
    {
        label: 'Cursos',
        href: '/cursos',
        matchPrefixes: ['/cursos', '/egel', '/exani', '/guias', '/simuladores'],
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
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage<SharedPageProps>();
    const currentPath = (page.url || '/').split('?')[0].split('#')[0] || '/';
    const user = page.props?.auth?.user;
    const resolvedCourses =
        propScheduledCourses ??
        (Array.isArray(page.props?.scheduledCourses)
            ? page.props.scheduledCourses
            : undefined);

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
            {/* Navbar Superior fiel al rediseño Canva */}
            <header className="sticky top-0 z-50 border-b border-[#101E33]/5 bg-white/85 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Izquierda: Wordmark sapius. */}
                    <Link
                        href="/"
                        aria-label="Sapius Inicio"
                        className="inline-flex shrink-0 items-center focus:outline-none"
                    >
                        <SapiusWordmark variant="dark" size="md" />
                    </Link>

                    {/* Centro (Desktop): Enlaces */}
                    <nav
                        aria-label="Navegación principal"
                        className="hidden items-center gap-7 lg:flex xl:gap-9"
                    >
                        {NAV_LINKS.map((item) => {
                            const active = isActiveLink(item);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-[15px] transition-colors duration-150 ${
                                        active
                                            ? 'font-extrabold text-[#101E33]'
                                            : 'font-normal text-[#101E33]/80 hover:text-[#FF6B52]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Derecha (Desktop): Botones Pill */}
                    <div className="hidden items-center gap-3 lg:flex">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                            >
                                Ir a mi panel
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center rounded-full bg-[#101E33] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#192B47]"
                                >
                                    Regístrate
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Botón Menú Móvil */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                        className="inline-flex items-center justify-center rounded-xl p-2 text-[#101E33] transition-colors hover:bg-[#101E33]/5 lg:hidden"
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
                            <div className="space-y-4 px-4 py-6 sm:px-6">
                                <nav className="flex flex-col space-y-3">
                                    {NAV_LINKS.map((item) => {
                                        const active = isActiveLink(item);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className={`rounded-xl px-3 py-2 text-base transition-colors ${
                                                    active
                                                        ? 'bg-[#CFE4FF]/35 font-extrabold text-[#101E33]'
                                                        : 'font-medium text-[#101E33]/80 hover:bg-[#101E33]/5 hover:text-[#101E33]'
                                                }`}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="flex flex-col gap-2.5 border-t border-[#101E33]/10 pt-4">
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-6 py-3 text-sm font-bold text-white shadow-sm"
                                        >
                                            Ir a mi panel
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-6 py-3 text-sm font-semibold text-white shadow-sm"
                                            >
                                                Iniciar sesión
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className="inline-flex w-full items-center justify-center rounded-full bg-[#101E33] px-6 py-3 text-sm font-semibold text-white shadow-sm"
                                            >
                                                Regístrate
                                            </Link>
                                        </>
                                    )}
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

            {/* Footer Oscuro fiel a Canva Page 1 */}
            <footer className="relative overflow-hidden bg-[#101E33] text-white">
                {/* Grilla decorativa de + en coral en esquina inferior derecha */}
                <div className="pointer-events-none absolute right-6 bottom-6 hidden opacity-70 md:block">
                    <PlusGridPattern rows={4} cols={7} color="coral" gap={26} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8 lg:pt-20">
                    {/* Bloque superior: CTA + Navegación derecha */}
                    <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
                        <div className="max-w-xl">
                            <h2 className="font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
                                ¿Tienes dudas sobre qué{' '}
                                <span className="text-[#FF6B52]">
                                    curso necesitas?
                                </span>
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                                Escríbenos y nuestro equipo te orientará según tu
                                objetivo académico
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/contacto"
                                    className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C]"
                                >
                                    Contactar ahora
                                </Link>
                            </div>
                        </div>

                        {/* Lista vertical derecha */}
                        <ul className="space-y-2 text-sm text-white/85 lg:text-right">
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
                                    href="/orgullo-sapius"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    Orgullo Sapius
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contacto"
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
                    </div>

                    {/* Bloque inferior en 3 columnas */}
                    <div className="mt-14 grid grid-cols-1 items-end gap-10 border-t border-white/10 pt-10 md:grid-cols-3">
                        {/* Columna izquierda: Contacto */}
                        <div className="space-y-1.5 text-sm text-white/80">
                            <h3 className="font-bold text-white">Contacto</h3>
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
                                    href="tel:1234567890"
                                    className="transition-colors hover:text-[#FF6B52]"
                                >
                                    123-456-7890
                                </a>
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
                                <Link
                                    href="/privacidad"
                                    className="font-medium text-white/90 underline underline-offset-4 transition-colors hover:text-[#FF6B52]"
                                >
                                    Aviso de privacidad
                                </Link>
                                <Link
                                    href="/terms/conditions"
                                    className="text-white/55 transition-colors hover:text-white/90"
                                >
                                    Términos
                                </Link>
                                <Link
                                    href="/cookies"
                                    className="text-white/55 transition-colors hover:text-white/90"
                                >
                                    Cookies
                                </Link>
                            </div>
                        </div>

                        {/* Columna central: Wordmark blanco/coral + lema + redes sociales */}
                        <div className="flex flex-col items-start md:items-center md:text-center">
                            <Link href="/" aria-label="Sapius Inicio">
                                <SapiusWordmark variant="light" size="md" />
                            </Link>
                            <p className="mt-1.5 text-xs text-white/75">
                                Tu formación, nuestra pasión
                            </p>

                            {/* 4 botones circulares blancos con íconos oscuros (Facebook, Instagram, TikTok, WhatsApp) */}
                            <div className="mt-4 flex items-center gap-3">
                                <a
                                    href="https://www.facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook de Sapius"
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
                                    </svg>
                                </a>

                                <a
                                    href="https://www.instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram de Sapius"
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4 fill-none stroke-current"
                                        strokeWidth="2"
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
                                            r="1"
                                            className="fill-current stroke-none"
                                        />
                                    </svg>
                                </a>

                                <a
                                    href="https://www.tiktok.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok de Sapius"
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B52] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M16.6 5.8A4.1 4.1 0 0 1 15.3 3h-2.9v11.4a2.4 2.4 0 1 1-1.7-2.3V9.1a5.3 5.3 0 1 0 4.6 5.3V8.7a6.9 6.9 0 0 0 4 1.3V7.2c-1 0-2-.5-2.7-1.4Z" />
                                    </svg>
                                </a>

                                <a
                                    href="https://api.whatsapp.com/send?phone=521234567890&text=Hola%20Sapius%2C%20me%20gustar%C3%ADa%20recibir%20orientaci%C3%B3n%20sobre%20sus%20cursos."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="WhatsApp de Sapius"
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#101E33] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#06C156] hover:text-white"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M12.04 3a8.94 8.94 0 0 0-7.66 13.54L3.2 21l4.6-1.2a8.94 8.94 0 1 0 4.24-16.8Zm4.97 12.64c-.21.6-1.22 1.14-1.7 1.21-.45.07-1.02.1-1.65-.1a15.1 15.1 0 0 1-1.5-.55c-2.63-1.14-4.35-3.8-4.48-3.98-.13-.18-1.07-1.42-1.07-2.71 0-1.29.67-1.92.91-2.19.24-.26.53-.33.7-.33h.5c.16 0 .38-.06.6.45.21.52.73 1.78.79 1.91.07.13.11.29.02.47-.09.18-.13.29-.26.44-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.16.26.69 1.14 1.48 1.85 1.02.91 1.88 1.19 2.14 1.32.26.13.42.11.58-.07.15-.18.66-.77.84-1.03.18-.26.35-.22.6-.13.24.09 1.54.73 1.8.86.27.13.45.2.51.31.07.11.07.64-.14 1.23Z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Espacio derecho para equilibrar con la grilla de cruces */}
                        <div className="hidden md:block" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
