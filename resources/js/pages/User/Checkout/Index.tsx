import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    CreditCard, 
    ShieldCheck, 
    Lock, 
    CheckCircle2, 
    BookOpen, 
    ArrowLeft,
    Sparkles,
    Ticket,
    X,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

declare global {
    interface Window {
        OpenPay: any;
    }
}

interface CheckoutProps {
    course: {
        id: number;
        identifier: string;
        title: string;
        description: string;
        category: string;
        originalPrice: number;
        price: number;
        image: string | null;
    };
    coupon: {
        code: string;
        discount: number;
    } | null;
    user: {
        name: string;
        email: string;
        phone: string;
    };
    openpay: {
        merchantId: string;
        publicKey: string;
        sandbox: boolean;
    };
}

export default function Checkout({ course, coupon, user, openpay }: CheckoutProps) {
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        curso_id: course.id,
        user_name: user.name,
        user_email: user.email,
        user_phone: user.phone || '',
        card_number: '',
        card_holder: user.name,
        card_month: '',
        card_year: '',
        card_cvv: '',
        token_id: '',
        device_session_id: '',
    });

    const [isTokenizing, setIsTokenizing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentError(null);

        // Envía todo al backend, el backend decide si redirige a Smart Checkout de OpenPay o inscribe si es gratis
        post('/alumno/payout', {
            onError: (errors) => {
                const errMsg = errors.payment || "Ocurrió un error inesperado al procesar la solicitud.";
                setPaymentError(errMsg);
            }
        });
    };

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        router.post('/alumno/checkout/check-coupon', {
            clave: couponCode,
            curso_id: course.id
        }, {
            preserveScroll: true,
            onFinish: () => setIsApplyingCoupon(false)
        });
    };

    const handleRemoveCoupon = () => {
        setIsApplyingCoupon(true);
        router.post('/alumno/checkout/remove-coupon', {}, {
            preserveScroll: true,
            onFinish: () => setIsApplyingCoupon(false)
        });
    };

    const isFree = course.price <= 0;

    return (
        <>
            <Head title={`Inscripción - ${course.title}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-3 text-neutral-600 dark:text-neutral-400">
                        <Link href="/alumno/cursos">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al Catálogo
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Payment Form */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className="bg-blue-600 text-white">Paso Final</Badge>
                                </div>
                                <CardTitle className="text-2xl font-bold">Información de Pago</CardTitle>
                                <CardDescription>
                                    Completa tus datos para confirmar tu inscripción al curso
                                </CardDescription>
                            </CardHeader>

                            {usePage().props.flash?.error && (
                                <div className="px-6 pb-2">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{usePage().props.flash.error}</span>
                                    </div>
                                </div>
                            )}

                            <form id="checkout-form" onSubmit={handleSubmit}>
                                <CardContent className="space-y-6">
                                    {/* Student Data */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                                            Tus Datos
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="user_name">Nombre Completo</Label>
                                                <Input
                                                    id="user_name"
                                                    value={data.user_name}
                                                    onChange={e => setData('user_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="user_email">Correo Electrónico</Label>
                                                <Input
                                                    id="user_email"
                                                    type="email"
                                                    value={data.user_email}
                                                    onChange={e => setData('user_email', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <Label htmlFor="user_phone">Teléfono (Opcional)</Label>
                                                <Input
                                                    id="user_phone"
                                                    type="tel"
                                                    value={data.user_phone}
                                                    onChange={e => setData('user_phone', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!isFree && <Separator />}

                                    {/* Smart Checkout Information */}
                                    {!isFree && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" /> Pago Seguro
                                                </h3>
                                                <Lock className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            
                                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg p-5 flex flex-col gap-3 text-sm text-blue-800 dark:text-blue-300">
                                                <div className="flex gap-3">
                                                    <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                                                    <p className="leading-relaxed">
                                                        Al dar clic en <strong>Pagar con OpenPay</strong>, serás redirigido a una página segura alojada por OpenPay para completar tu pago con tarjeta de crédito o débito, protegiendo tus datos al 100%.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 justify-center py-2 bg-white/50 dark:bg-black/20 rounded-md">
                                                    {/* Tarjetas soportadas */}
                                                    <div className="font-bold text-xs uppercase tracking-wider text-neutral-400">Tarjetas soportadas:</div>
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-blue-600">Visa</span>
                                                        <span className="font-bold text-orange-500">Mastercard</span>
                                                        <span className="font-bold text-sky-500">Amex</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentError && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 mt-4 mb-2">
                                            {paymentError}
                                        </div>
                                    )}

                                    {isFree && (
                                         <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg p-5 flex flex-col items-center justify-center gap-3 text-emerald-800 dark:text-emerald-300 text-center">
                                            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center mb-2">
                                                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <h4 className="font-bold text-lg">¡Inscripción Gratuita!</h4>
                                            <p className="text-sm px-4">
                                                Tu cupón de descuento cubre el costo total del curso. No se requiere tarjeta de crédito. Da clic en el botón de abajo para finalizar.
                                            </p>
                                         </div>
                                    )}
                                </CardContent>

                                <CardFooter className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <Button
                                        type="submit"
                                        disabled={processing || isTokenizing}
                                        className={`w-full h-12 text-base font-bold shadow-lg ${
                                            isFree 
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-white' 
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white'
                                        }`}
                                    >
                                        {(processing || isTokenizing) ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Procesando inscripción...
                                            </>
                                        ) : (
                                            isFree ? 'Completar Inscripción Gratuita' : `Pagar $${course.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                            <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                {course.image ? (
                                    <img
                                        src={course.image.startsWith('http') ? course.image : `/media/stream/${course.image}`}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            const fallback = 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=2070';
                                            if (target.src !== fallback && !target.dataset.fallbackApplied) {
                                                target.dataset.fallbackApplied = 'true';
                                                target.src = fallback;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-neutral-800">
                                        <BookOpen className="w-12 h-12 text-blue-500/40" />
                                    </div>
                                )}
                                <Badge className="absolute top-3 left-3 bg-black/60 text-white border-none backdrop-blur-sm">
                                    {course.category}
                                </Badge>
                            </div>

                            <CardHeader className="p-5 pb-3">
                                <CardTitle className="text-xl font-bold leading-snug">
                                    {course.title}
                                </CardTitle>
                                {course.identifier && (
                                    <CardDescription className="text-xs">
                                        Identificador: {course.identifier}
                                    </CardDescription>
                                )}
                            </CardHeader>

                            <CardContent className="p-5 pt-0 space-y-4">
                                <div 
                                    className="text-xs text-neutral-500 line-clamp-3 prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: course.description }} 
                                />

                                <Separator />

                                {/* Coupon Section */}
                                <div>
                                    <Label className="text-sm font-semibold mb-2 block">¿Tienes un cupón de descuento?</Label>
                                    
                                    {coupon ? (
                                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                                                <Ticket className="w-4 h-4" />
                                                <span>{coupon.code}</span>
                                            </div>
                                            <button 
                                                onClick={handleRemoveCoupon}
                                                disabled={isApplyingCoupon}
                                                className="text-neutral-400 hover:text-red-500 p-1"
                                                title="Remover cupón"
                                            >
                                                {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Ingresa tu código" 
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="uppercase"
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                            />
                                            <Button 
                                                variant="secondary" 
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode || isApplyingCoupon}
                                            >
                                                {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                                        <span>Precio regular:</span>
                                        <span className={coupon ? 'line-through opacity-70' : ''}>
                                            ${course.originalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                        </span>
                                    </div>
                                    
                                    {coupon && (
                                        <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                            <span>Descuento aplicado:</span>
                                            <span>-${coupon.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                                        </div>
                                    )}
                                    
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                        <span>Total a Pagar:</span>
                                        <span className={isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
                                            ${course.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                        </span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-3 text-xs text-blue-900 dark:text-blue-200">
                                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                                <span>Garantía de acceso inmediato una vez completado el pago.</span>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Checkout.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Cursos Disponibles', href: '/alumno/cursos' },
        { title: 'Inscripción y Pago', href: '#' },
    ]}>
        {page}
    </AppLayout>
);
