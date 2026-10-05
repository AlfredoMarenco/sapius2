import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Award, Download, AlertCircle } from 'lucide-react';

interface Certificate {
    id: number;
    course_title: string;
    cohort_id: string;
    validation_code: string;
    issue_date: string;
}

interface Props {
    certificates: Certificate[];
}

export default function CertificatesIndex({ certificates }: Props) {
    return (
        <>
            <Head title="Mis Certificados" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Award className="w-8 h-8 mr-2 text-brand-blue" />
                        Mis Certificados
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Aquí encontrarás los certificados de los cursos que has completado satisfactoriamente.
                    </p>
                </div>

                {certificates.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Aún no tienes certificados</h3>
                        <p className="text-gray-500 text-sm">
                            Cuando completes un curso, tu certificado aparecerá aquí.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
                                <div className="p-5 flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Award className="w-6 h-6 text-brand-blue" />
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Aprobado
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2" title={cert.course_title}>
                                        {cert.course_title}
                                    </h3>
                                    <div className="text-sm text-gray-500 mb-4 space-y-1">
                                        <p>Cohorte: {cert.cohort_id}</p>
                                        <p>Emitido: {cert.issue_date}</p>
                                        <p className="font-mono text-xs">Folio: {cert.validation_code}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                                    <a
                                        href={`/alumno/certificados/${cert.id}/descargar`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Ver / Descargar PDF
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

CertificatesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Mis Certificados', href: '/alumno/certificados' }]}>
        {page}
    </AppLayout>
);
