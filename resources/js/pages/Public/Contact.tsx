import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import { WHATSAPP_PHONE } from '@/components/public/PricingCard';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import LandingLayout from '@/layouts/LandingLayout';

export interface ContactProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

export default function Contact({ scheduledCourses }: ContactProps) {
    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Contacto — Sapius" />

            <section className="relative overflow-hidden bg-white pt-28 pb-20 sm:pt-34 lg:pb-24">
                {/* Degradado celeste suave en esquina inferior derecha fiel a Canva Page 7 */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 88% 72%, rgba(190, 218, 255, 0.92) 0%, rgba(207, 228, 255, 0.4) 36%, transparent 64%)',
                    }}
                />

                {/* Grilla de cruces + en esquina inferior izquierda */}
                <div className="pointer-events-none absolute bottom-6 left-4 opacity-85 sm:left-6">
                    <PlusGridPattern
                        rows={6}
                        cols={4}
                        color="coral"
                        gap={32}
                        size={8}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
                    {/* Titular centrado exacto a Canva Page 7 */}
                    <motion.h1
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mx-auto max-w-2xl text-center font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-[#101E33] sm:text-5xl lg:text-[3.45rem]"
                    >
                        Estamos{' '}
                        <span className="text-[#FF6B52]">listos para</span>
                        <br />
                        <span className="text-[#FF6B52]">resolver</span> tus
                        dudas
                    </motion.h1>

                    {/* Grilla de 6 tarjetas blancas con borde fino coral */}
                    <div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                        {/* 1) Horario de atención */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="flex flex-col justify-between rounded-[22px] border border-[#FF6B52]/75 bg-white p-7 shadow-[0_16px_36px_-14px_rgba(16,30,51,0.15)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FF6B52] hover:shadow-[0_22px_44px_-14px_rgba(16,30,51,0.2)]"
                        >
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
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33] sm:text-[22px]">
                                        Horario de atención
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-3.5 text-sm leading-relaxed text-[#101E33]/90">
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
                        </motion.div>

                        {/* 2) Correo */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-[#FF6B52]/75 bg-white p-7 shadow-[0_16px_36px_-14px_rgba(16,30,51,0.15)]">
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
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33] sm:text-[22px]">
                                        Correo
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-3.5 text-sm leading-relaxed text-[#101E33]/90">
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

                        {/* 3) Teléfono (Auricular lineal outline dentro del círculo coral) */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-[#FF6B52]/75 bg-white p-7 shadow-[0_16px_36px_-14px_rgba(16,30,51,0.15)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FF6B52] text-[#FF6B52]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 stroke-current"
                                            fill="none"
                                            strokeWidth="1.9"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M19 16.9v2.2a1.6 1.6 0 0 1-1.7 1.6A15.8 15.8 0 0 1 3.3 6.7 1.6 1.6 0 0 1 4.9 5h2.2a1.6 1.6 0 0 1 1.6 1.4c.1.8.3 1.5.6 2.2a1.6 1.6 0 0 1-.4 1.7l-1 1a12.8 12.8 0 0 0 4.8 4.8l1-1a1.6 1.6 0 0 1 1.7-.4c.7.3 1.4.5 2.2.6A1.6 1.6 0 0 1 19 16.9Z" />
                                        </svg>
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33] sm:text-[22px]">
                                        Teléfono
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/90">
                                    <p>+ 52 999 298 8744</p>
                                    <p>
                                        Atención directa para dudas sobre
                                        cursos.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href={`tel:+${WHATSAPP_PHONE}`}
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#06C156] px-7 py-2.5 text-[15px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05A84B] sm:w-[220px]"
                                >
                                    Llamar ahora
                                </a>
                            </div>
                        </div>

                        {/* 4) Vía WhatsApp (Outline verde #59CE72) */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-[#FF6B52]/75 bg-white p-7 shadow-[0_16px_36px_-14px_rgba(16,30,51,0.15)]">
                            <div>
                                <div className="flex items-center gap-3.5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#59CE72]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-9 w-9 stroke-current"
                                            fill="none"
                                            strokeWidth="1.9"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M3.5 20.5l1.3-4.6a8.8 8.8 0 1 1 3.3 3.3l-4.6 1.3Z" />
                                            <path d="M9.6 8.8c-.3 0-.7.2-.9.6-.2.4-.6 1.1-.1 2.2.5 1.1 1.6 2.4 3.2 3.2 1.1.5 1.8.3 2.2 0 .4-.2.6-.6.6-.9l-1.5-.8-.8.7c-.7-.3-1.5-1-1.9-1.8l.7-.8-.8-1.5c-.2-.6-.4-.9-.7-.9Z" />
                                        </svg>
                                    </span>
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33] sm:text-[22px]">
                                        Vía WhatsApp
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/90">
                                    <p>+ 52 999 298 8744</p>
                                    <p>
                                        Atención directa para dudas sobre
                                        cursos.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href={`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=Hola%20Sapius%2C%20tengo%20dudas%20sobre%20sus%20cursos.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#06C156] px-7 py-2.5 text-[15px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#05A84B] sm:w-[220px]"
                                >
                                    Enviar WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* 5) Facebook */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-[#FF6B52]/75 bg-white p-7 shadow-[0_16px_36px_-14px_rgba(16,30,51,0.15)]">
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
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33] sm:text-[22px]">
                                        Facebook
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/90">
                                    <p>+ 52 999 298 8744</p>
                                    <p>Visita nuestra fanpage y síguenos.</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href="https://www.facebook.com/Sapius-latinoam%C3%A9rica-104931991400060"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#0A4DA6] px-7 py-2.5 text-[15px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#083E87] sm:w-[220px]"
                                >
                                    Ver Facebook
                                </a>
                            </div>
                        </div>

                        {/* 6) Instagram */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-[#FF6B52]/75 bg-white p-7 shadow-[0_16px_36px_-14px_rgba(16,30,51,0.15)]">
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
                                    <h2 className="font-display text-xl font-extrabold text-[#101E33] sm:text-[22px]">
                                        Instagram
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-1.5 text-sm leading-relaxed text-[#101E33]/90">
                                    <p>+ 52 999 298 8744</p>
                                    <p>Visita nuestra cuenta y síguenos.</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href="https://www.instagram.com/sapius_latinoamerica/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#C11F7E] px-7 py-2.5 text-[15px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A6196B] sm:w-[220px]"
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
