import React, { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ShieldAlert, LogOut, FileText, MousePointerClick, Keyboard, MonitorX, Copy, Printer, EyeOff, Layout, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';

interface StrikeHistory {
    id: number;
    action: string;
    details: string;
    created_at: string;
}

interface BlockedProps {
    strikesHistory: StrikeHistory[];
}

const getStrikeIcon = (details: string | null) => {
    const d = details || '';
    if (d.includes('pestaña') || d.includes('foco')) return <Layout className="w-5 h-5 text-neutral-500" />;
    if (d.includes('clic derecho')) return <MousePointerClick className="w-5 h-5 text-neutral-500" />;
    if (d.includes('F12') || d.includes('desarrollador')) return <Keyboard className="w-5 h-5 text-neutral-500" />;
    if (d.includes('copiar') || d.includes('Ctrl+C')) return <Copy className="w-5 h-5 text-neutral-500" />;
    if (d.includes('pegar') || d.includes('Ctrl+V')) return <Copy className="w-5 h-5 text-neutral-500" />;
    if (d.includes('impresión') || d.includes('Ctrl+P')) return <Printer className="w-5 h-5 text-neutral-500" />;
    if (d.includes('captura') || d.includes('PrintScreen')) return <MonitorX className="w-5 h-5 text-neutral-500" />;
    return <AlertTriangle className="w-5 h-5 text-neutral-500" />;
};

const getStrikeKeyCombination = (details: string | null) => {
    const d = details || '';
    if (d.includes('clic derecho')) return <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Clic Derecho</kbd>;
    if (d.includes('F12')) return <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">F12</kbd>;
    if (d.includes('Ctrl+C') || d.includes('copiar')) return <><kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Ctrl</kbd> + <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">C</kbd></>;
    if (d.includes('Ctrl+V') || d.includes('pegar')) return <><kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Ctrl</kbd> + <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">V</kbd></>;
    if (d.includes('Ctrl+P') || d.includes('impresión')) return <><kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Ctrl</kbd> + <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">P</kbd></>;
    if (d.includes('captura')) return <><kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Windows</kbd> + <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Shift</kbd> + <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">S</kbd></>;
    if (d.includes('pestaña')) return <><kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Alt</kbd> + <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-md text-xs font-mono font-bold">Tab</kbd></>;
    return null;
};

export default function Blocked({ strikesHistory = [] }: BlockedProps) {
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get('/alumno/check-status');
                if (response.data && !response.data.is_blocked) {
                    router.visit('/alumno/dashboard');
                }
            } catch (e) {
                console.error("Error polling status", e);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    let totalSeverity = 0;
    let itemsCount = 0;
    let isGraveBlock = false;

    [...strikesHistory].slice(0, 10).forEach(h => {
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
            pts = 10; // Accidental usually
        }
        
        if (act.includes('retro') && act.includes('grabe')) {
            isGraveBlock = true;
        }

        totalSeverity += pts;
        itemsCount++;
    });

    let avgSeverity = itemsCount > 0 ? totalSeverity / itemsCount : 0;
    if (isGraveBlock) avgSeverity = 100;
    let visualPercent = Math.min(avgSeverity, 100);

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

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                            <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-500" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        {isGraveBlock ? 'BLOQUEO POR VIOLACIÓN DE SEGURIDAD' : 'Cuenta Suspendida por Seguridad'}
                    </h2>
                    <div className="mt-4 text-center max-w-3xl mx-auto space-y-4">
                        <p className="text-base text-neutral-600 dark:text-neutral-400">
                            {isGraveBlock 
                                ? 'Se ha detectado una violación crítica de los términos de servicio y derechos de autor durante la retroalimentación de tu evaluación.'
                                : 'Nuestro sistema de protección académica ha detectado múltiples violaciones a los términos de servicio. Por políticas de integridad, tu acceso ha sido bloqueado preventivamente.'
                            }
                        </p>
                        
                        <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-lg p-4 text-left shadow-sm">
                            <div className="flex items-start gap-3">
                                <Camera className="w-6 h-6 text-amber-600 dark:text-amber-500 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-lg">Instrucción Importante:</h4>
                                    <p className="text-sm text-amber-700/90 dark:text-amber-300 mt-1">
                                        Para poder desbloquear tu cuenta, <strong>debes tomar una foto de esta pantalla</strong> donde se vean las acciones registradas abajo y enviarla a soporte técnico.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-6xl space-y-6">
                    <Card className={`border-2 shadow-md ${cardBorderClass}`}>
                        <CardContent className="pt-6">
                            <h5 className={`text-lg font-bold flex items-center gap-2 ${semaphoreColorClass}`}>
                                <AlertTriangle className="w-5 h-5" /> Nivel de Intencionalidad Detectado
                            </h5>
                            <p className="text-sm text-neutral-500 mt-2 mb-3">
                                El sistema ha analizado tus acciones recientes: 
                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                                    {semaphoreText}
                                </span>
                            </p>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5 mt-4">
                                <div className={`h-2.5 rounded-full ${semaphoreBgClass}`} style={{ width: `${visualPercent}%` }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50 shadow-xl overflow-hidden">
                        <div className="bg-red-50 dark:bg-red-950/20 px-4 py-5 sm:px-6 border-b border-red-100 dark:border-red-900/30 flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
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
                                        <TableRow className="bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                            <TableHead className="font-semibold text-neutral-900 dark:text-neutral-300">Fecha y Hora</TableHead>
                                            <TableHead className="font-semibold text-neutral-900 dark:text-neutral-300">Motivo</TableHead>
                                            <TableHead className="font-semibold text-neutral-900 dark:text-neutral-300">Ubicación / Detalles</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {strikesHistory.map((strike) => (
                                            <TableRow key={strike.id}>
                                                <TableCell className="whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                                                    {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(strike.created_at))}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                                                    <div className="flex items-center gap-2">
                                                        {getStrikeIcon(strike.details)}
                                                        <span>{strike.action}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="truncate max-w-[200px]" title={strike.details}>{strike.details}</span>
                                                        <div className="flex gap-1 mt-1">
                                                            {getStrikeKeyCombination(strike.details)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 text-center text-neutral-500 flex flex-col items-center">
                                    <FileText className="w-8 h-8 mb-3 opacity-20" />
                                    No se encontraron registros detallados de las infracciones.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="default" size="lg" className="w-full sm:w-auto" asChild>
                            <a href="mailto:soporte@sapius.com.mx">
                                Contactar a Soporte
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                            <Link href="/logout" method="post" as="button">
                                <LogOut className="w-4 h-4 mr-2" />
                                Cerrar Sesión
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}


