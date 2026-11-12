import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import LandingLayout from '@/layouts/LandingLayout';

export interface ContactProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

export default function Contact({ scheduledCourses }: ContactProps) {
    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Contacto — Sapius" />

            <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
                {/* Degradado celeste suave en esquina inferior derecha fiel a Canva Page 4 */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 88% 72%, rgba(207, 228, 255, 0.92) 0%, rgba(207, 228, 255, 0.35) 36%, transparent 64%)',
                    }}
                />

                {/* Grilla de cruces + en esquina inferior izquierda */}
                <div className="pointer-events-none absolute bottom-6 left-4 opacity-75 sm:left-8">
                    <PlusGridPattern rows={6} cols={4} color="coral" gap={32} size={8} />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Titular centrado exacto a page4.png */}
                    <motion.h1
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mx-auto max-w-2xl text-center font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.35rem]"
                    >
                        Estamos{' '}
                        <span className="text-[#FF6B52]">listos para</span>
                        <br />
                        <span className="text-[#FF6B52]">resolver</span> tus
                        dudas
                    </motion.h1>

                    {/* Grilla de 6 tarjetas blancas con borde fino coral */}
                    <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* 1) Horario de atención */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-7 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FF6B52] text-[#FF6B52]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 stroke-current"
                                            fill="none"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <circle cx="12" cy="12" r="9" />
                                            <path d="M12 7v5l3.5 2" />
                                        </svg>
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33]">
                                        Horario de atención
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#101E33]/85">
                                    <div>
                                        <p>Lunes a Viernes:</p>
                                        <p>8:00 a.m. - 6:00 p.m.</p>
                                    </div>
                                    <div>
                                        <p>Sábado y Domingo:</p>
                                        <p>8:00 a.m. - 2:00 p.m.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2) Correo */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-7 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FF6B52] text-[#FF6B52]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 stroke-current"
                                            fill="none"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <rect
                                                x="4"
                                                y="6"
                                                width="16"
                                                height="12"
                                                rx="2"
                                            />
                                            <path d="m4 8 8 5 8-5" />
                                        </svg>
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33]">
                                        Correo
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#101E33]/85">
                                    <div>
                                        <p className="font-bold text-[#101E33]">
                                            Nuevo ingreso, pagos y facturación:
                                        </p>
                                        <a
                                            href="mailto:contacto@sapius.com.mx"
                                            className="transition-colors hover:text-[#FF6B52]"
                                        >
                                            contacto@sapius.com.mx
                                        </a>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#101E33]">
                                            Dudas, temas, academia:
                                        </p>
                                        <a
                                            href="mailto:alumnos@sapius.com.mx"
                                            className="transition-colors hover:text-[#FF6B52]"
                                        >
                                            alumnos@sapius.com.mx
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3) Teléfono */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-7 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FF6B52] text-[#FF6B52]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 fill-current"
                                            aria-hidden="true"
                                        >
                                            <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
                                        </svg>
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33]">
                                        Teléfono
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/85">
                                    <p>+ 52 123 456 7890</p>
                                    <p>
                                        Atención directa para dudas sobre
                                        cursos.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href="tel:+521234567890"
                                    className="inline-flex min-w-[195px] items-center justify-center rounded-full bg-[#06C156] px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05A84B]"
                                >
                                    Llamar ahora
                                </a>
                            </div>
                        </div>

                        {/* 4) Vía WhatsApp */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-7 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#59CE72]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-9 w-9 fill-current"
                                            aria-hidden="true"
                                        >
                                            <path d="M12.04 2a9.94 9.94 0 0 0-8.52 15.05L2.2 22l5.1-1.34A9.94 9.94 0 1 0 12.04 2Zm0 18.1a8.15 8.15 0 0 1-4.15-1.14l-.3-.18-3.03.8.81-2.95-.2-.3A8.16 8.16 0 1 1 12.04 20.1Zm4.47-6.11c-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.28.19-.53.06-.24-.12-1.03-.38-1.97-1.21a7.4 7.4 0 0 1-1.36-1.7c-.14-.24-.02-.38.1-.5.11-.11.25-.28.37-.43.12-.14.16-.24.25-.41.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.64 4.2 3.7.58.25 1.04.4 1.4.52.58.18 1.12.16 1.54.1.47-.07 1.45-.6 1.66-1.17.2-.57.2-1.06.14-1.17-.06-.1-.22-.16-.47-.28Z" />
                                        </svg>
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33]">
                                        Vía WhatsApp
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/85">
                                    <p>+ 52 123 456 7890</p>
                                    <p>
                                        Atención directa para dudas sobre
                                        cursos.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href="https://api.whatsapp.com/send?phone=521234567890&text=Hola%20Sapius%2C%20tengo%20dudas%20sobre%20sus%20cursos."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-w-[195px] items-center justify-center rounded-full bg-[#06C156] px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05A84B]"
                                >
                                    Enviar WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* 5) Facebook */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-7 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#101E33]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-8 w-8 stroke-current"
                                            fill="none"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Z" />
                                            <path d="M7 10l4.3-6.5A1.5 1.5 0 0 1 14 4.3V9h5.2a2 2 0 0 1 2 2.3l-1.1 7A2 2 0 0 1 18.1 20H7" />
                                        </svg>
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33]">
                                        Facebook
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/85">
                                    <p>+ 52 123 456 7890</p>
                                    <p>
                                        Atención directa para dudas sobre
                                        cursos.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href="https://www.facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-w-[195px] items-center justify-center rounded-full bg-[#0A4DA6] px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#083E87]"
                                >
                                    Ver Facebook
                                </a>
                            </div>
                        </div>

                        {/* 6) Instagram */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#FF6B52]/55 bg-white/95 p-7 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#C11F7E]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-8 w-8 stroke-current"
                                            fill="none"
                                            strokeWidth="2.1"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
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
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33]">
                                        Instagram
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/85">
                                    <p>+ 52 123 456 7890</p>
                                    <p>
                                        Atención directa para dudas sobre
                                        cursos.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href="https://www.instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-w-[195px] items-center justify-center rounded-full bg-[#C11F7E] px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A6196B]"
                                >
                                    Ver Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
