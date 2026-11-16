import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    ShieldAlert,
    LogOut,
    FileText,
    MousePointerClick,
    Keyboard,
    MonitorX,
    Copy,
    Printer,
    Layout,
    Camera,
    MessageCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface StrikeHistory {
    id: number;
    action: string;
    details: string;
    created_at: string;
}

interface BlockedProps {
    strikesHistory: StrikeHistory[];
}

const WHATSAPP_URL =
    'https://wa.me/529993648594?text=Hola%2C%20mi%20cuenta%20de%20Sapius%20fue%20suspendida%20por%20seguridad.%20Adjunto%20la%20fotograf%C3%ADa%20de%20mi%20pantalla%20y%20mi%20INE%20para%20solicitar%20apoyo.';

const getStrikeIcon = (details: string | null) => {
    const d = details || '';

    if (d.includes('pestaña') || d.includes('foco')) {
return <Layout className="h-5 w-5 text-neutral-500" />;
}

    if (d.includes('clic derecho')) {
return <MousePointerClick className="h-5 w-5 text-neutral-500" />;
}

    if (
        d.includes('ImprPant') ||
        d.includes('captura') ||
        d.includes('PrintScreen') ||
        d.includes('recorte')
    ) {
return <MonitorX className="h-5 w-5 text-neutral-500" />;
}

    if (
        d.includes('F12') ||
        d.includes('desarrollador') ||
        d.includes('Ctrl') ||
        d.includes('Alt') ||
        d.includes('Windows') ||
        d.includes('Shift')
    ) {
return <Keyboard className="h-5 w-5 text-neutral-500" />;
}

    if (d.includes('copiar') || d.includes('Ctrl+C') || d.includes('pegar') || d.includes('Ctrl+V')) {
return <Copy className="h-5 w-5 text-neutral-500" />;
}

    if (d.includes('impresión') || d.includes('imprimir') || d.includes('Ctrl+P')) {
return <Printer className="h-5 w-5 text-neutral-500" />;
}

    return <AlertTriangle className="h-5 w-5 text-neutral-500" />;
};

const getStrikeKeyCombination = (details: string | null) => {
    const d = details || '';

    if (d.includes('clic derecho')) {
return (
            <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                Clic Derecho
            </kbd>
        );
}

    if (d.includes('F12')) {
return (
            <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                F12
            </kbd>
        );
}

    if (d.includes('Ctrl+Alt+ImprPant')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Alt
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    ImprPant
                </kbd>
            </>
        );
}

    if (d.includes('Alt+ImprPant')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Alt
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    ImprPant
                </kbd>
            </>
        );
}

    if (d.includes('Ctrl+ImprPant')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    ImprPant
                </kbd>
            </>
        );
}

    if (d.includes('ImprPant') || d.includes('PrintScreen')) {
return (
            <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                ImprPant
            </kbd>
        );
}

    if (d.includes('Ctrl+Alt')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Alt
                </kbd>
            </>
        );
}

    if (d.includes('Ctrl+C') || d.includes('copiar')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    C
                </kbd>
            </>
        );
}

    if (d.includes('Ctrl+V') || d.includes('pegar')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    V
                </kbd>
            </>
        );
}

    if (d.includes('Ctrl+P') || d.includes('impresión') || d.includes('imprimir')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Ctrl
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    P
                </kbd>
            </>
        );
}

    if (d.includes('captura') || d.includes('recorte')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Windows
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Shift
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    S
                </kbd>
            </>
        );
}

    if (d.includes('(Ctrl)')) {
return (
            <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                Ctrl
            </kbd>
        );
}

    if (d.includes('(Alt')) {
return (
            <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                Alt / AltGr
            </kbd>
        );
}

    if (d.includes('Shift')) {
return (
            <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                Shift
            </kbd>
        );
}

    if (d.includes('Windows/Cmd')) {
return (
            <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                Windows / Cmd
            </kbd>
        );
}

    if (d.includes('pestaña')) {
return (
            <>
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Alt
                </kbd>{' '}
                +{' '}
                <kbd className="rounded-md bg-neutral-200 px-2 py-1 font-mono text-xs font-bold dark:bg-neutral-800">
                    Tab
                </kbd>
            </>
        );
}

    return null;
};

export default function Blocked({ strikesHistory = [] }: BlockedProps) {
    useEffect(() => {
        // Bloquear botón Atrás del navegador mientras la cuenta permanezca bloqueada
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);

        const interval = setInterval(async () => {
            try {
                const response = await axios.get('/alumno/check-status');

                if (response.data && !response.data.is_blocked) {
                    router.visit('/alumno/dashboard');
                }
            } catch (e) {
                console.error('Error polling status', e);
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    let totalSeverity = 0;
    let itemsCount = 0;
    let isGraveBlock = false;

    [...strikesHistory].slice(0, 10).forEach((h) => {
        let pts = 10;
        const act = (h.details || h.action || '').toLowerCase();

        if (
            act.includes('copiar') ||
            act.includes('ctrl+c') ||
            act.includes('pegar') ||
            act.includes('ctrl+v') ||
            act.includes('impresión') ||
            act.includes('ctrl+p') ||
            act.includes('captura') ||
            act.includes('printscreen') ||
            act.includes('f12') ||
            act.includes('desarrollador')
        ) {
            pts = 100;
        } else if (act.includes('clic derecho')) {
            pts = 50;
        } else if (act.includes('pestaña') || act.includes('foco')) {
            pts = 10;
        }

        if (act.includes('retro') && act.includes('grabe')) {
            isGraveBlock = true;
        }

        totalSeverity += pts;
        itemsCount++;
    });

    let avgSeverity = itemsCount > 0 ? totalSeverity / itemsCount : 0;

    if (isGraveBlock) {
avgSeverity = 100;
}

    const visualPercent = Math.min(avgSeverity, 100);

    let semaphoreText = 'Baja Intencionalidad (Posibles Errores)';
    let semaphoreColorClass = 'text-green-600 dark:text-green-500';
    let semaphoreBgClass = 'bg-green-600';
    let cardBorderClass = 'border-green-500';
    let badgeClass = 'bg-green-600 text-white';

    if (isGraveBlock) {
        semaphoreText = 'VIOLACIÓN CRÍTICA DE SEGURIDAD (MODO RETROALIMENTACIÓN)';
        semaphoreColorClass = 'text-rose-900 dark:text-rose-600';
        semaphoreBgClass = 'bg-rose-900 dark:bg-rose-700';
        cardBorderClass = 'border-rose-900 dark:border-rose-700';
        badgeClass = 'bg-rose-900 dark:bg-rose-700 text-white';
    } else if (avgSeverity >= 70) {
        semaphoreText = 'Alta Intencionalidad (Acciones Prohibidas Detectadas)';
        semaphoreColorClass = 'text-red-600 dark:text-red-500';
        semaphoreBgClass = 'bg-red-600 dark:bg-red-500';
        cardBorderClass = 'border-red-500';
        badgeClass = 'bg-red-600 text-white';
    } else if (avgSeverity >= 30) {
        semaphoreText = 'Intencionalidad Media (Precaución)';
        semaphoreColorClass = 'text-amber-500 dark:text-amber-500';
        semaphoreBgClass = 'bg-amber-500';
        cardBorderClass = 'border-amber-500';
        badgeClass = 'bg-amber-500 text-white';
    }

    return (
        <>
            <Head title="Cuenta Bloqueada" />

            <div className="flex min-h-screen flex-col justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-neutral-950">
                <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                            <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-500" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        {isGraveBlock
                            ? 'BLOQUEO POR VIOLACIÓN DE SEGURIDAD'
                            : 'Cuenta Suspendida por Seguridad'}
                    </h2>
                    <div className="mx-auto mt-4 max-w-3xl space-y-4 text-center">
                        <p className="text-base text-neutral-600 dark:text-neutral-400">
                            {isGraveBlock
                                ? 'Se ha detectado una violación crítica de los términos de servicio y derechos de autor durante la retroalimentación de tu evaluación.'
                                : 'Nuestro sistema de protección académica ha detectado múltiples violaciones a los términos de servicio. Por políticas de integridad, tu acceso ha sido bloqueado preventivamente.'}
                        </p>

                        <div className="rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4 text-left shadow-sm dark:bg-amber-950/30">
                            <div className="flex items-start gap-3">
                                <Camera className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-500" />
                                <div>
                                    <h4 className="text-lg font-bold text-amber-800 dark:text-amber-400">
                                        Instrucciones para solicitar desbloqueo:
                                    </h4>
                                    <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-300">
                                        Para validar tu identidad y revisar tu caso,{' '}
                                        <strong>
                                            toma una fotografía de esta pantalla donde se muestren las acciones registradas abajo junto con tu identificación oficial (INE)
                                        </strong>{' '}
                                        y envíala directamente por WhatsApp a nuestro equipo de soporte técnico.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-6 sm:mx-auto sm:w-full sm:max-w-5xl">
                    <Card className={`border-2 shadow-md ${cardBorderClass}`}>
                        <CardContent className="pt-6">
                            <h5
                                className={`flex items-center gap-2 text-lg font-bold ${semaphoreColorClass}`}
                            >
                                <AlertTriangle className="h-5 w-5" /> Nivel de Intencionalidad Detectado
                            </h5>
                            <p className="mt-2 mb-3 text-sm text-neutral-500">
                                El sistema ha analizado tus acciones recientes:
                                <span
                                    className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
                                >
                                    {semaphoreText}
                                </span>
                            </p>
                            <div className="mt-4 h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
                                <div
                                    className={`h-2.5 rounded-full ${semaphoreBgClass}`}
                                    style={{ width: `${visualPercent}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-red-200 shadow-xl dark:border-red-900/50">
                        <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-4 py-5 sm:px-6 dark:border-red-900/30 dark:bg-red-950/20">
                            <AlertTriangle className="mt-0.5 h-6 w-6 text-red-600" />
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-red-800 dark:text-red-300">
                                    Historial de Infracciones Registradas
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-red-600 dark:text-red-400">
                                    A continuación se muestran los eventos que ocasionaron el bloqueo de tu cuenta.
                                </p>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            {strikesHistory.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-neutral-50 hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-900">
                                            <TableHead className="font-semibold text-neutral-900 dark:text-neutral-300">
                                                Fecha y Hora
                                            </TableHead>
                                            <TableHead className="font-semibold text-neutral-900 dark:text-neutral-300">
                                                Motivo
                                            </TableHead>
                                            <TableHead className="font-semibold text-neutral-900 dark:text-neutral-300">
                                                Ubicación / Detalles
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {strikesHistory.map((strike) => (
                                            <TableRow key={strike.id}>
                                                <TableCell className="whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                                                    {new Intl.DateTimeFormat('es-MX', {
                                                        dateStyle: 'long',
                                                        timeStyle: 'short',
                                                    }).format(new Date(strike.created_at))}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                                                    <div className="flex items-center gap-2">
                                                        {getStrikeIcon(strike.details)}
                                                        <span>{strike.action}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    <div className="flex flex-col gap-1">
                                                        <span
                                                            className="max-w-[240px] truncate"
                                                            title={strike.details}
                                                        >
                                                            {strike.details}
                                                        </span>
                                                        <div className="mt-1 flex gap-1">
                                                            {getStrikeKeyCombination(strike.details)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center p-8 text-center text-neutral-500">
                                    <FileText className="mb-3 h-8 w-8 opacity-20" />
                                    No se encontraron registros detallados de las infracciones.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            variant="default"
                            size="lg"
                            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                            asChild
                        >
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Contactar a Soporte por WhatsApp
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                            <Link href="/logout" method="post" as="button">
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar Sesión
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

Blocked.layout = (page: ReactNode) => page;
