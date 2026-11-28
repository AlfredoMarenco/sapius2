import AppLayout from '@/layouts/app-layout';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Clock,
    Loader2,
    Lock,
    Radio,
    ShieldCheck,
    Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ZoomRoomProps {
    zoomClass: {
        id: number;
        title: string;
        description: string | null;
        scheduled_at_iso: string | null;
        scheduled_date_formatted: string | null;
        scheduled_time_formatted: string | null;
        ends_time_formatted: string | null;
        duration_minutes: number;
        status: 'scheduled' | 'live' | 'ended' | 'cancelled';
        is_joinable: boolean;
        course_title: string;
        cohort_identifier: string;
        instructor_name: string;
        module_title?: string | null;
        lesson_title?: string | null;
        lesson_id?: number | null;
        scheduled_id: number;
    };
    viewerRole: 'alumno' | 'instructor' | 'admin';
    sdkConfigured: boolean;
    signatureUrl: string;
    backUrl: string;
}

declare global {
    interface Window {
        ZoomMtgEmbedded?: {
            createClient: () => {
                init: (config: Record<string, unknown>) => Promise<void>;
                join: (config: Record<string, unknown>) => Promise<void>;
                leaveMeeting?: () => Promise<void>;
            };
        };
    }
}

const ZOOM_SDK_VERSION = '3.11.2';
const ZOOM_CDN_SCRIPTS = [
    `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib/vendor/react.min.js`,
    `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib/vendor/react-dom.min.js`,
    `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib/vendor/redux.min.js`,
    `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib/vendor/redux-thunk.min.js`,
    `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib/vendor/lodash.min.js`,
    `https://source.zoom.us/${ZOOM_SDK_VERSION}/zoom-meeting-embedded-${ZOOM_SDK_VERSION}.min.js`,
];

function loadScriptOnce(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
        document.body.appendChild(script);
    });
}

export default function ZoomRoom({
    zoomClass,
    viewerRole,
    sdkConfigured,
    signatureUrl,
    backUrl,
}: ZoomRoomProps) {
    const { auth } = usePage<{ auth?: { user?: { email?: string; username?: string } } }>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno Sapius';

    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: viewerRole === 'alumno',
        watermarkText: userEmail,
        allowTextInputs: true,
    });

    const zoomContainerRef = useRef<HTMLDivElement | null>(null);
    const zoomClientRef = useRef<ReturnType<NonNullable<Window['ZoomMtgEmbedded']>['createClient']> | null>(null);

    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (zoomClientRef.current && typeof zoomClientRef.current.leaveMeeting === 'function') {
                zoomClientRef.current.leaveMeeting().catch(() => {});
            }
        };
    }, []);

    const handleJoinMeeting = async () => {
        if (!sdkConfigured) {
            setErrorMsg('El servidor aún no tiene configuradas las credenciales de Zoom Meeting SDK.');
            return;
        }

        setJoining(true);
        setErrorMsg(null);

        try {
            const sigResponse = await axios.post(signatureUrl);
            const { signature, sdkKey, meetingNumber, password, userName, userEmail: sigEmail } = sigResponse.data;

            for (const src of ZOOM_CDN_SCRIPTS) {
                await loadScriptOnce(src);
            }

            if (!window.ZoomMtgEmbedded || !zoomContainerRef.current) {
                throw new Error('No se pudo inicializar el cliente embebido de Zoom.');
            }

            const client = window.ZoomMtgEmbedded.createClient();
            zoomClientRef.current = client;

            await client.init({
                zoomAppRoot: zoomContainerRef.current,
                language: 'es-ES',
                patchJsMedia: true,
                leaveOnPageUnload: true,
                customize: {
                    video: {
                        isResizable: true,
                        viewSizes: {
                            default: {
                                width: Math.min(960, Math.max(320, zoomContainerRef.current.clientWidth - 24)),
                                height: 540,
                            },
                        },
                    },
                },
            });

            await client.join({
                sdkKey,
                signature,
                meetingNumber,
                password: password || '',
                userName,
                userEmail: sigEmail,
            });

            setJoined(true);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
            setErrorMsg(
                axiosErr?.response?.data?.message ||
                    axiosErr?.message ||
                    'Ocurrió un error al conectar con la sala de Zoom.',
            );
        } finally {
            setJoining(false);
        }
    };

    return (
        <>
            <Head title={`Clase en Vivo: ${zoomClass.title}`} />
            {viewerRole === 'alumno' && <StrikeAlert />}

            <div
                className={`mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 ${
                    isBlurred ? 'pointer-events-none blur-xl' : ''
                }`}
                onContextMenu={viewerRole === 'alumno' ? (e) => e.preventDefault() : undefined}
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-neutral-600">
                        <Link href={backUrl}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Volver
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                            {zoomClass.cohort_identifier}
                        </Badge>
                        {zoomClass.status === 'live' ? (
                            <Badge className="animate-pulse bg-red-600 text-white">
                                <Radio className="mr-1 h-3 w-3" /> EN VIVO
                            </Badge>
                        ) : (
                            <Badge variant="secondary">
                                {zoomClass.status === 'ended' ? 'Finalizada' : 'Programada'}
                            </Badge>
                        )}
                    </div>
                </div>

                <Card className="overflow-hidden border-neutral-200/80 shadow-sm dark:border-neutral-800">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
                                    {zoomClass.course_title}
                                </p>
                                <CardTitle className="mt-1 text-xl font-bold text-white sm:text-2xl">
                                    {zoomClass.title}
                                </CardTitle>
                                <CardDescription className="mt-1 flex flex-wrap items-center gap-3 text-xs text-blue-100/80">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> {zoomClass.scheduled_date_formatted}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" /> {zoomClass.scheduled_time_formatted} -{' '}
                                        {zoomClass.ends_time_formatted} ({zoomClass.duration_minutes} min)
                                    </span>
                                    <span>Instructor: {zoomClass.instructor_name}</span>
                                </CardDescription>
                            </div>
                            {viewerRole === 'alumno' && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-blue-100">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                    <span>Sala Protegida Sapius</span>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                        {errorMsg && (
                            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                <div>
                                    <p className="font-semibold">No se pudo iniciar la sala</p>
                                    <p className="mt-0.5 text-xs">{errorMsg}</p>
                                </div>
                            </div>
                        )}

                        {!joined && (
                            <div className="mb-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Video className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    {zoomClass.is_joinable
                                        ? 'La sala de clase en vivo está lista'
                                        : 'Sala aún no disponible para alumnos'}
                                </h3>
                                <p className="mt-1 max-w-md text-xs text-neutral-500">
                                    {zoomClass.is_joinable
                                        ? 'Al unirte, la transmisión de Zoom se cargará directamente dentro de Sapius con tu nombre oficial y marca de agua.'
                                        : 'Podrás ingresar a la sala desde 15 minutos antes de la hora programada.'}
                                </p>

                                {zoomClass.description && (
                                    <p className="mt-3 max-w-lg rounded-lg bg-white p-3 text-xs text-neutral-600 shadow-xs dark:bg-neutral-800 dark:text-neutral-300">
                                        {zoomClass.description}
                                    </p>
                                )}

                                <div className="mt-5">
                                    {zoomClass.is_joinable ? (
                                        <Button
                                            type="button"
                                            size="lg"
                                            disabled={joining || !sdkConfigured}
                                            onClick={handleJoinMeeting}
                                            className="bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700"
                                        >
                                            {joining ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Conectando con Zoom...
                                                </>
                                            ) : (
                                                <>
                                                    <Video className="mr-2 h-4 w-4" /> Unirse a la Clase en Vivo
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button type="button" disabled variant="outline">
                                            <Lock className="mr-2 h-4 w-4" /> Disponible 15 min antes del inicio
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contenedor del Zoom Meeting SDK Embedded + Watermark */}
                        <div className="relative min-h-[560px] w-full overflow-hidden rounded-xl bg-slate-950">
                            <div ref={zoomContainerRef} id="sapius-zoom-embedded-root" className="h-full min-h-[560px] w-full" />
                            {viewerRole === 'alumno' && (
                                <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                                    <Watermark />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ZoomRoom.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Clases en Vivo', href: '#' },
            { title: 'Sala Zoom', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
