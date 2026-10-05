import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, User, BookOpen, AlertTriangle, Info, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    enrollment: any;
    discount: any;
    charge: any;
    openpayError: string | null;
}

export default function ShowEnrollment({ enrollment, discount, charge, openpayError }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Panel de Control', href: '/admin' },
            { title: 'Reportes', href: '/admin/reports' },
            { title: 'Inscripciones', href: '/admin/reports/inscriptions' },
            { title: `Detalles Inscripción #${enrollment.id}` },
        ]}>
            <Head title={`Detalle de Inscripción #${enrollment.id}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div>
                    <Link href="/admin/reports/inscriptions" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-4 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Inscripciones
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Detalles de la Inscripción
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Información del alumno, curso y desglose del pago vía OpenPay.
                    </p>
                </div>

                {openpayError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                        <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5" />
                        <div>
                            <h3 className="text-red-800 font-medium">Atención con OpenPay</h3>
                            <p className="text-red-700 text-sm mt-1">{openpayError}</p>
                            <p className="text-red-700 text-xs mt-1">Para visualizar estos datos en local, asegúrate de tener <code className="bg-red-100 px-1 rounded">OPENPAY_MERCHANT_ID</code> y <code className="bg-red-100 px-1 rounded">OPENPAY_PRIVATE_KEY</code> configurados.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Alumno Info */}
                    <Card className="border-neutral-200/80 shadow-sm">
                        <CardHeader className="bg-neutral-50/50 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-brand-blue" /> 
                                Datos del Alumno
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Nombre</p>
                                <p className="text-neutral-900 font-medium">{enrollment.user?.name} {enrollment.user?.paternal_surname} {enrollment.user?.maternal_surname}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Correo Electrónico</p>
                                <p className="text-neutral-900">{enrollment.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Estado de la cuenta</p>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Activo</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Curso Info */}
                    <Card className="border-neutral-200/80 shadow-sm">
                        <CardHeader className="bg-neutral-50/50 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" /> 
                                Datos del Curso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Curso Adquirido</p>
                                <p className="text-neutral-900 font-medium">{enrollment.scheduled_course?.course?.title || 'Curso Desconocido'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Cohorte (Programado)</p>
                                <p className="text-neutral-900">{enrollment.scheduled_course?.identificador || `ID: ${enrollment.scheduled_course_id}`}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Estatus de Inscripción</p>
                                <Badge variant={enrollment.aceptado === 'si' ? 'default' : 'secondary'} className={enrollment.aceptado === 'si' ? 'bg-emerald-600' : 'bg-amber-500 text-white'}>
                                    {enrollment.aceptado === 'si' ? 'Inscrito y Aprobado' : 'Pendiente'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detalles de Pago / OpenPay */}
                    <Card className="border-neutral-200/80 shadow-sm md:col-span-2">
                        <CardHeader className="bg-neutral-50/50 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-amber-600" /> 
                                Transacción de Pago
                            </CardTitle>
                            <CardDescription>Detalles recuperados de la pasarela de pago o sistema de cupones.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {charge ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Referencia</p>
                                        <p className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded inline-block">{enrollment.referencia}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Estado de Pago</p>
                                        <Badge variant="outline" className={charge.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}>
                                            {charge.status === 'completed' ? 'Completado' : charge.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Monto Cobrado</p>
                                        <p className="text-2xl font-bold text-neutral-900">
                                            ${typeof charge.amount === 'number' ? charge.amount.toFixed(2) : charge.amount} <span className="text-sm font-normal text-neutral-500">{charge.currency || 'MXN'}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Método</p>
                                        <p className="text-neutral-900 capitalize font-medium">{charge.method}</p>
                                        {charge.card && (
                                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                                Terminación {charge.card.card_number} ({charge.card.brand})
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="sm:col-span-2 md:col-span-4 border-t pt-4 mt-2">
                                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">Descripción</p>
                                        <p className="text-neutral-700">{charge.description || 'Sin descripción adicional.'}</p>
                                    </div>

                                    {charge.error_message && (
                                        <div className="sm:col-span-2 md:col-span-4 bg-red-50 p-3 rounded text-red-700 text-sm border border-red-100 flex items-start gap-2">
                                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span><strong>Error en cargo:</strong> {charge.error_message}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-3">
                                        <Info className="w-6 h-6 text-neutral-400" />
                                    </div>
                                    <p className="text-neutral-500 font-medium">Información de cobro no disponible.</p>
                                    <p className="text-sm text-neutral-400 mt-1">Si la referencia es un ID de OpenPay, es probable que no existan las credenciales para acceder a ella en este entorno.</p>
                                </div>
                            )}

                            {discount && (
                                <div className="mt-8 bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-5">
                                    <h4 className="font-semibold text-brand-blue mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Cupón Aplicado
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-brand-blue/70 font-semibold uppercase tracking-wider mb-1">Clave</p>
                                            <p className="font-mono text-brand-navy font-bold">{discount.clave}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-brand-blue/70 font-semibold uppercase tracking-wider mb-1">Descuento</p>
                                            <p className="font-bold text-brand-navy">
                                                {discount.tipo === 'porcentaje' ? `${discount.cantidad}%` : `$${discount.cantidad}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
