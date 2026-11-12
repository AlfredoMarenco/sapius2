import { Head, Link } from '@inertiajs/react';
import { Cookie, FileText, Lock, ShieldCheck } from 'lucide-react';
import React from 'react';
import PlusGridPattern from '@/components/public/PlusGridPattern';
import LandingLayout from '@/layouts/LandingLayout';

export interface LegalProps {
    type: string;
}

interface LegalSection {
    heading: string;
    body: string;
}

interface LegalDocumentConfig {
    badge: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    sections: LegalSection[];
}

const LEGAL_DOCUMENTS: Record<string, LegalDocumentConfig> = {
    privacidad: {
        badge: 'Protección de Datos',
        title: 'Aviso de Privacidad',
        subtitle:
            'Cómo protegemos, tratamos y resguardamos tus datos personales conforme a la legislación vigente en México.',
        icon: <ShieldCheck className="h-6 w-6 text-[#FF6B52]" />,
        sections: [
            {
                heading: '1. Responsable del tratamiento de tus datos',
                body: 'Sapius es responsable del uso y protección de los datos personales recabados a través de nuestra plataforma educativa, formularios de inscripción y canales oficiales de orientación académica.',
            },
            {
                heading: '2. Finalidades académicas y administrativas',
                body: 'Tus datos se utilizan exclusivamente para gestionar tu acceso al campus virtual, dar seguimiento académico personalizado, emitir comprobantes de inscripción o facturación y enviarte notificaciones relevantes sobre tus cursos, simuladores o asesorías en vivo.',
            },
            {
                heading: '3. Derechos ARCO y contacto',
                body: 'En todo momento puedes ejercer tus derechos de Acceso, Rectificación, Cancelación u Oposición escribiendo directamente a contacto@sapius.com.mx indicando tu nombre completo y correo registrado.',
            },
        ],
    },
    terms: {
        badge: 'Marco Institucional',
        title: 'Términos y Condiciones de Uso',
        subtitle:
            'Condiciones generales de acceso, uso responsable de cuenta y prestación de servicios académicos en Sapius.',
        icon: <FileText className="h-6 w-6 text-[#FF6B52]" />,
        sections: [
            {
                heading: '1. Propiedad intelectual del contenido Sapius',
                body: 'Todos los reactivos, simuladores, videoclases, presentaciones y guías digitales o impresas son propiedad intelectual exclusiva de Sapius. Queda estrictamente prohibida su reproducción, captura, distribución o comercialización total o parcial.',
            },
            {
                heading: '2. Uso personal e intransferible de la cuenta',
                body: 'Las credenciales de acceso a la plataforma son personales e intransferibles. Los sistemas de seguridad de Sapius detectan accesos simultáneos o uso no autorizado para proteger la integridad de nuestra comunidad estudiantil.',
            },
            {
                heading: '3. Modalidades, vigencias y garantía condicionada',
                body: 'Cada paquete especifica claramente su vigencia, número de intentos en simuladores y alcance. En el Curso Completo Premium, la garantía condicionada aplica conforme al cumplimiento puntual de las actividades académicas establecidas al inicio de la cohorte.',
            },
        ],
    },
    cookies: {
        badge: 'Experiencia Digital',
        title: 'Política de Cookies',
        subtitle:
            'Información transparente sobre el uso de cookies técnicas y de sesión en la plataforma Sapius.',
        icon: <Cookie className="h-6 w-6 text-[#FF6B52]" />,
        sections: [
            {
                heading: '1. ¿Qué son las cookies y para qué las utilizamos?',
                body: 'Utilizamos cookies esenciales para mantener activa tu sesión segura dentro del aula virtual, recordar tu avance en videoclases y resguardar el cronómetro e intentos de tus simuladores.',
            },
            {
                heading: '2. Seguridad y rendimiento',
                body: 'Nuestras cookies técnicas previenen pérdida de respuestas ante microcortes de conexión y garantizan que los recursos multimedia se carguen de forma óptima en tu navegador.',
            },
        ],
    },
    'no-access': {
        badge: 'Seguridad de Plataforma',
        title: 'Acceso Restringido',
        subtitle:
            'Esta evaluación o recurso requiere conexión desde un equipo o navegador autorizado conforme a las políticas de seguridad de Sapius.',
        icon: <Lock className="h-6 w-6 text-[#FF6B52]" />,
        sections: [
            {
                heading: '1. Protección del entorno de evaluación',
                body: 'Para brindarte una experiencia fiel a las condiciones oficiales de aplicación y proteger el banco de reactivos, ciertos instrumentos requieren ingresar desde un navegador actualizado y sin herramientas de captura activas.',
            },
            {
                heading: '2. ¿Necesitas soporte técnico?',
                body: 'Si consideras que recibiste este aviso por error, escríbenos a alumnos@sapius.com.mx o contáctanos por WhatsApp para asistirte de inmediato.',
            },
        ],
    },
};

export default function Legal({ type }: LegalProps) {
    const doc = LEGAL_DOCUMENTS[type] ?? {
        badge: 'Información Institucional',
        title: 'Información Legal',
        subtitle:
            'Lineamientos generales de uso y privacidad de la plataforma académica Sapius.',
        icon: <ShieldCheck className="h-6 w-6 text-[#FF6B52]" />,
        sections: LEGAL_DOCUMENTS.privacidad.sections,
    };

    return (
        <LandingLayout>
            <Head title={`${doc.title} — Sapius`} />

            <section className="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-34 sm:pb-20">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 12% 18%, rgba(207, 228, 255, 0.7) 0%, transparent 52%), radial-gradient(circle at 88% 30%, rgba(255, 217, 206, 0.65) 0%, transparent 55%)',
                    }}
                />

                <div className="pointer-events-none absolute top-24 right-6 hidden opacity-60 md:block">
                    <PlusGridPattern rows={5} cols={4} color="coral" gap={28} size={7} />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">
                    {/* Encabezado */}
                    <div className="rounded-3xl border border-[#FF6B52]/45 bg-white/95 p-6 shadow-[0_14px_34px_-16px_rgba(16,30,51,0.14)] sm:p-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD9CE]/50">
                                {doc.icon}
                            </div>
                            <span className="text-xs font-extrabold tracking-wider text-[#FF6B52] uppercase">
                                {doc.badge}
                            </span>
                        </div>

                        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-[#101E33] sm:text-4xl">
                            {doc.title}
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-[#101E33]/75 sm:text-base">
                            {doc.subtitle}
                        </p>

                        {/* Navegación rápida entre documentos legales */}
                        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#101E33]/10 pt-5">
                            {[
                                {
                                    key: 'privacidad',
                                    label: 'Aviso de privacidad',
                                    href: '/privacidad',
                                },
                                {
                                    key: 'terms',
                                    label: 'Términos y condiciones',
                                    href: '/terms/conditions',
                                },
                                {
                                    key: 'cookies',
                                    label: 'Política de cookies',
                                    href: '/cookies',
                                },
                            ].map((tab) => {
                                const active = type === tab.key;
                                return (
                                    <Link
                                        key={tab.key}
                                        href={tab.href}
                                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                                            active
                                                ? 'bg-[#101E33] text-white'
                                                : 'border border-[#101E33]/15 bg-white text-[#101E33]/75 hover:border-[#FF6B52] hover:text-[#101E33]'
                                        }`}
                                    >
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenido del documento */}
                    <div className="mt-8 space-y-5">
                        {doc.sections.map((section) => (
                            <div
                                key={section.heading}
                                className="rounded-2xl border border-[#101E33]/10 bg-white p-6 shadow-xs sm:p-8"
                            >
                                <h2 className="font-display text-lg font-extrabold text-[#101E33] sm:text-xl">
                                    {section.heading}
                                </h2>
                                <p className="mt-2.5 text-sm leading-relaxed text-[#101E33]/80 sm:text-base">
                                    {section.body}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Pie de ayuda */}
                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#101E33] px-6 py-5 text-white sm:px-8">
                        <p className="text-sm text-white/85">
                            ¿Tienes alguna consulta adicional? Escríbenos a{' '}
                            <a
                                href="mailto:contacto@sapius.com.mx"
                                className="font-bold text-[#FF6B52] underline underline-offset-4"
                            >
                                contacto@sapius.com.mx
                            </a>
                        </p>
                        <Link
                            href="/contacto"
                            className="inline-flex items-center justify-center rounded-full bg-[#FF6B52] px-6 py-2 text-xs font-bold text-white transition-colors hover:bg-[#F0563C]"
                        >
                            Ir a Contacto
                        </Link>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
