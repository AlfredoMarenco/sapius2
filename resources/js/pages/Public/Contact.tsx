import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import React from 'react';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import {
    WHATSAPP_PHONE
    
} from '@/components/public/PricingCard';
import type {ScheduledCourseCandidate} from '@/components/public/PricingCard';
import RecaptchaWidget from '@/components/recaptcha-widget';
import LandingLayout from '@/layouts/LandingLayout';

export interface ContactProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

interface SharedContactPageProps {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    recaptcha_site_key?: string | null;
    [key: string]: unknown;
}

export default function Contact({ scheduledCourses }: ContactProps) {
    const { props } = usePage<SharedContactPageProps>();
    const flashSuccess = props.flash?.success ?? null;
    const flashError = props.flash?.error ?? null;
    const recaptchaSiteKey = props.recaptcha_site_key ?? null;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            nombre: '',
            email: '',
            telefono: '',
            mensaje: '',
            'g-recaptcha-response': '',
        });

    const resetRecaptchaIfPresent = () => {
        if (
            recaptchaSiteKey &&
            typeof window !== 'undefined' &&
            window.grecaptcha?.reset
        ) {
            try {
                window.grecaptcha.reset();
            } catch {
                // Ignore if widget not mounted
            }
        }

        setData('g-recaptcha-response', '');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();

        post('/contacto', {
            preserveScroll: true,
            onSuccess: () => {
                reset(
                    'nombre',
                    'email',
                    'telefono',
                    'mensaje',
                    'g-recaptcha-response',
                );
                resetRecaptchaIfPresent();
            },
            onError: () => {
                resetRecaptchaIfPresent();
            },
        });
    };

    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Contacto — Sapius" />

            <section className="relative overflow-hidden bg-white pt-28 pb-20 sm:pt-34 lg:pb-24">
                {/* Degradado celeste suave en esquina inferior derecha fiel a page4.png */}
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
                    {/* Titular centrado exacto a page4.png */}
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
                        </div>

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
                                    <p>+52 999 298 8744</p>
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
                                    <p>+52 999 298 8744</p>
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
                                    <p>Sapius Latinoamérica</p>
                                    <p>
                                        Síguenos y escríbenos para atención directa sobre cursos y convocatorias.
                                    </p>
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
                                    <p>@sapius_latinoamerica</p>
                                    <p>
                                        Tips de estudio, testimonios y fechas clave para tu examen.
                                    </p>
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

                    {/* Formulario de contacto directo conectado a POST /contacto */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.35 }}
                        className="mt-14 rounded-[26px] border border-[#FF6B52]/75 bg-white/95 p-7 shadow-[0_18px_40px_-14px_rgba(16,30,51,0.16)] sm:p-10"
                    >
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
                            <div className="lg:col-span-5">
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#FFD9CE]/60 px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase">
                                    <Send className="h-3.5 w-3.5" />
                                    Escríbenos directamente
                                </span>
                                <h2 className="mt-4 font-display text-2xl leading-[1.1] font-extrabold tracking-tight text-[#101E33] sm:text-3xl">
                                    Envíanos tu{' '}
                                    <span className="text-[#FF6B52]">
                                        consulta académica
                                    </span>
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-[#101E33]/80 sm:text-base">
                                    ¿Dudas sobre inscripciones, modalidades,
                                    universidades o fechas de examen? Completa
                                    el formulario y nuestro equipo te responderá
                                    a tu correo o WhatsApp.
                                </p>

                                <div className="mt-6 space-y-2 rounded-2xl border border-[#101E33]/10 bg-[#CFE4FF]/25 p-4 text-xs leading-relaxed text-[#101E33]/85">
                                    <p className="font-bold text-[#101E33]">
                                        Atención garantizada en horario hábil
                                    </p>
                                    <p>
                                        Tu mensaje llega directo a{' '}
                                        <span className="font-semibold text-[#101E33]">
                                            atencion@sapius.com.mx
                                        </span>{' '}
                                        con copia de respuesta a tu correo.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5 lg:col-span-7"
                                noValidate
                            >
                                <input
                                    type="hidden"
                                    name="g-recaptcha-response"
                                    value={data['g-recaptcha-response']}
                                />

                                {flashSuccess && (
                                    <div
                                        role="status"
                                        className="flex items-start gap-3 rounded-2xl border border-[#06C156]/40 bg-[#06C156]/10 px-4 py-3.5 text-sm font-semibold text-[#0B6330]"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#06C156]" />
                                        <span>{flashSuccess}</span>
                                    </div>
                                )}

                                {flashError && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-3 rounded-2xl border border-[#FF6B52]/60 bg-[#FF6B52]/10 px-4 py-3.5 text-sm font-semibold text-[#9F2511]"
                                    >
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B52]" />
                                        <span>{flashError}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="contact-nombre"
                                            className="mb-1.5 block text-xs font-extrabold tracking-wide text-[#101E33] uppercase"
                                        >
                                            Nombre completo
                                        </label>
                                        <input
                                            id="contact-nombre"
                                            name="nombre"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            value={data.nombre}
                                            onChange={(e) =>
                                                setData(
                                                    'nombre',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ej. María Fernanda López"
                                            aria-invalid={Boolean(
                                                errors.nombre,
                                            )}
                                            className="w-full rounded-2xl border border-[#101E33]/20 bg-white px-4 py-3 text-sm text-[#101E33] transition-colors placeholder:text-[#101E33]/40 focus:border-[#FF6B52] focus:ring-2 focus:ring-[#FF6B52]/20 focus:outline-none"
                                        />
                                        {errors.nombre && (
                                            <p className="mt-1.5 text-xs font-semibold text-[#D9381E]">
                                                {errors.nombre}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="contact-telefono"
                                            className="mb-1.5 block text-xs font-extrabold tracking-wide text-[#101E33] uppercase"
                                        >
                                            Teléfono / WhatsApp
                                        </label>
                                        <input
                                            id="contact-telefono"
                                            name="telefono"
                                            type="tel"
                                            required
                                            autoComplete="tel"
                                            value={data.telefono}
                                            onChange={(e) =>
                                                setData(
                                                    'telefono',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ej. 999 298 8744"
                                            aria-invalid={Boolean(
                                                errors.telefono,
                                            )}
                                            className="w-full rounded-2xl border border-[#101E33]/20 bg-white px-4 py-3 text-sm text-[#101E33] transition-colors placeholder:text-[#101E33]/40 focus:border-[#FF6B52] focus:ring-2 focus:ring-[#FF6B52]/20 focus:outline-none"
                                        />
                                        {errors.telefono && (
                                            <p className="mt-1.5 text-xs font-semibold text-[#D9381E]">
                                                {errors.telefono}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-email"
                                        className="mb-1.5 block text-xs font-extrabold tracking-wide text-[#101E33] uppercase"
                                    >
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="tucorreo@ejemplo.com"
                                        aria-invalid={Boolean(errors.email)}
                                        className="w-full rounded-2xl border border-[#101E33]/20 bg-white px-4 py-3 text-sm text-[#101E33] transition-colors placeholder:text-[#101E33]/40 focus:border-[#FF6B52] focus:ring-2 focus:ring-[#FF6B52]/20 focus:outline-none"
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D9381E]">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-mensaje"
                                        className="mb-1.5 block text-xs font-extrabold tracking-wide text-[#101E33] uppercase"
                                    >
                                        Mensaje
                                    </label>
                                    <textarea
                                        id="contact-mensaje"
                                        name="mensaje"
                                        required
                                        rows={4}
                                        value={data.mensaje}
                                        onChange={(e) =>
                                            setData('mensaje', e.target.value)
                                        }
                                        placeholder="Cuéntanos qué examen vas a presentar y en qué podemos ayudarte..."
                                        aria-invalid={Boolean(errors.mensaje)}
                                        className="w-full resize-y rounded-2xl border border-[#101E33]/20 bg-white px-4 py-3 text-sm text-[#101E33] transition-colors placeholder:text-[#101E33]/40 focus:border-[#FF6B52] focus:ring-2 focus:ring-[#FF6B52]/20 focus:outline-none"
                                    />
                                    {errors.mensaje && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D9381E]">
                                            {errors.mensaje}
                                        </p>
                                    )}
                                </div>

                                {recaptchaSiteKey && (
                                    <RecaptchaWidget
                                        siteKey={recaptchaSiteKey}
                                        onVerify={(token) =>
                                            setData(
                                                'g-recaptcha-response',
                                                token,
                                            )
                                        }
                                        onExpired={() =>
                                            setData('g-recaptcha-response', '')
                                        }
                                        errorMessage={
                                            errors['g-recaptcha-response']
                                        }
                                        className="flex flex-col items-start pt-1"
                                    />
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                                    <p className="text-xs text-[#101E33]/65">
                                        Protegemos tus datos conforme a nuestro
                                        Aviso de Privacidad.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-full bg-[#FF6B52] px-8 py-3.5 text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Send className="h-4 w-4" />
                                        {processing
                                            ? 'Enviando...'
                                            : 'Enviar mensaje'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </LandingLayout>
    );
}
