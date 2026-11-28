import { Head } from '@inertiajs/react';
import React from 'react';
import { WHATSAPP_PHONE } from '@/components/public/PricingCard';
import type { ScheduledCourseCandidate } from '@/components/public/PricingCard';
import ProductBookHero from '@/components/public/ProductBookHero';
import LandingLayout from '@/layouts/LandingLayout';

export interface GroupsPackagesProps {
    scheduledCourses?: ScheduledCourseCandidate[];
}

export default function GroupsPackages({
    scheduledCourses = [],
}: GroupsPackagesProps) {
    return (
        <LandingLayout scheduledCourses={scheduledCourses}>
            <Head title="Grupos y paquetes | Sapius" />

            {/* HERO: Grupos y paquetes (Canva Page 9 v297) */}
            <ProductBookHero
                titleLine1="Grupos y"
                titleLine2="paquetes"
                actions={
                    <a
                        href={`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
                            'Hola Sapius, me gustaría hablar con un asesor sobre grupos y paquetes para el EGEL Plus.',
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#FF6B52] px-7 py-3.5 text-base font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F0563C] sm:w-[290px]"
                    >
                        Hablar con un asesor
                    </a>
                }
            />

            {/* Sección 2: Grupos y descuentos (Canva Page 9 v297) */}
            <section
                id="grupos-descuentos"
                className="bg-white px-5 py-20 text-center lg:py-28"
            >
                <p className="mx-auto max-w-[780px] text-base leading-[1.7] text-[#101E33]/90 sm:text-[18.5px]">
                    <strong className="font-extrabold text-[#101E33]">
                        Grupos y descuentos.
                    </strong>{' '}
                    También trabajamos con grupos de alumnos, para los cuales
                    podemos manejar precios preferenciales o descuentos de
                    acuerdo con el número de integrantes. Esto nos permite
                    trabajar no solamente con alumnos individuales, sino con
                    generaciones o grupos de estudiantes de una misma
                    universidad que presentarán el EGEL Plus en fechas
                    similares. Consideramos que esta modalidad tiene un
                    potencial importante de crecimiento porque permite que la
                    propia experiencia de los alumnos genere posteriormente
                    recomendación dentro de su universidad y entre las
                    siguientes generaciones.
                </p>
            </section>
        </LandingLayout>
    );
}
