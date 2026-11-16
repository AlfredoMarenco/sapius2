import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';

export interface AntiCheatOptions {
    enabled?: boolean;
    watermarkText?: string;
    allowTextInputs?: boolean;
    feedbackMode?: boolean;
    onBlocked?: (redirectUrl?: string) => void;
}

interface AntiCheatAuthUser {
    strikes?: number;
    role?: string;
    is_blocked?: boolean;
}

const MAX_STRIKES = 100;
const STRIKE_COOLDOWN_MS = 1500;
const STYLE_ELEMENT_ID = 'sapius-anticheat-styles';

/**
 * Detects mobile/tablet touch devices (including iPadOS in Desktop Mode)
 * while explicitly preserving Windows/Linux desktops and the Electron app.
 */
export function isRestrictedTouchDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    const ua = (navigator.userAgent || '').toLowerCase();
    const isElectron =
        ua.includes('electron') ||
        Boolean((window as unknown as { electronAPI?: unknown }).electronAPI);

    if (isElectron) {
        return false;
    }

    const isWindowsDesktop = ua.includes('windows nt');
    const isLinuxDesktop = ua.includes('linux') && !ua.includes('android');
    const isDesktopOs = isWindowsDesktop || isLinuxDesktop;

    if (isDesktopOs) {
        return false;
    }

    const maxTouchPoints = navigator.maxTouchPoints ?? 0;
    const isMobileUa =
        /ipad|android|iphone|ipod|mobile|blackberry|webos|windows phone|opera mini/.test(ua);

    return maxTouchPoints > 1 || isMobileUa;
}

/**
 * Sets the `is_touch_device=1` cookie and redirects restricted touch devices to `/no-access`.
 */
export function enforceDesktopDevicePolicy(): boolean {
    if (!isRestrictedTouchDevice()) {
        return false;
    }

    if (typeof document !== 'undefined') {
        document.cookie = 'is_touch_device=1; path=/; max-age=86400; SameSite=Lax';
    }

    if (typeof window !== 'undefined' && window.location.pathname !== '/no-access') {
        window.location.replace('/no-access');
    }

    return true;
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) {
        return false;
    }

    const tag = target.tagName.toUpperCase();

    if (tag === 'TEXTAREA' || target.isContentEditable) {
        return true;
    }

    if (tag === 'INPUT') {
        const inputType = ((target as HTMLInputElement).type || 'text').toLowerCase();

        return !['radio', 'checkbox', 'button', 'submit', 'file', 'hidden'].includes(inputType);
    }

    return Boolean(target.closest('textarea, [contenteditable="true"]'));
}

export function useAntiCheat(options: AntiCheatOptions = {}) {
    const {
        enabled = true,
        watermarkText = '',
        allowTextInputs = false,
        feedbackMode = false,
        onBlocked,
    } = options;

    const page = usePage();
    const authUser = (page.props as { auth?: { user?: AntiCheatAuthUser | null } })?.auth?.user;
    const initialStrikes = Number(authUser?.strikes ?? 0);

    const safeInitialStrikes = Number.isFinite(initialStrikes) ? initialStrikes : 0;

    const [isWindowBlurred, setIsWindowBlurred] = useState(false);
    const [isModifierHeld, setIsModifierHeld] = useState(false);
    const [prevAuthStrikes, setPrevAuthStrikes] = useState<number>(safeInitialStrikes);
    const [strikeCount, setStrikeCount] = useState<number>(safeInitialStrikes);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    if (safeInitialStrikes !== prevAuthStrikes) {
        setPrevAuthStrikes(safeInitialStrikes);
        setStrikeCount(safeInitialStrikes);
    }

    const lastStrikeAtRef = useRef<number>(0);
    const strikeCountRef = useRef<number>(safeInitialStrikes);
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        strikeCountRef.current = strikeCount;
    }, [strikeCount]);

    const activateInstantDomShield = useCallback(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-anticheat-shield', 'active');
        }
    }, []);

    const releaseInstantDomShield = useCallback(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.removeAttribute('data-anticheat-shield');
        }
    }, []);

    const clearClipboard = useCallback(() => {
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                navigator.clipboard.writeText('').catch(() => {});
            }
        } catch {
            // Ignorar si el navegador restringe acceso sin foco
        }
    }, []);

    const registerStrike = useCallback(
        async (reason: string, action = 'Restricted Key / Modifier') => {
            const now = Date.now();

            // Mostrar bloqueo y alerta de inmediato en 0ms antes de esperar la red
            activateInstantDomShield();
            setWarningMessage(
                feedbackMode
                    ? `Actividad crítica detectada (${reason}). Verificando seguridad de tu cuenta...`
                    : `Actividad no permitida (${reason}). Registrando incidencia (${strikeCountRef.current}/${MAX_STRIKES} pts)...`,
            );
            setShowWarning(true);

            // Antirrebote para combinaciones de varias teclas (ej. Ctrl + Alt + ImprPant = 1 strike por intento)
            if (now - lastStrikeAtRef.current < STRIKE_COOLDOWN_MS) {
                return;
            }

            lastStrikeAtRef.current = now;

            try {
                const response = await axios.post('/alumno/strike', {
                    reason,
                    action,
                    details: feedbackMode ? 'Feedback Mode' : reason,
                    feedbackMode: Boolean(feedbackMode),
                });
                const data = response.data || {};
                const maxAllowed = Number(data.max_strikes ?? MAX_STRIKES);
                const serverStrikes = Number(data.strikes ?? strikeCountRef.current);
                strikeCountRef.current = serverStrikes;
                setStrikeCount(serverStrikes);

                const isBlocked =
                    Boolean(data.blocked) ||
                    data.status === 'blocked' ||
                    serverStrikes >= maxAllowed;

                if (isBlocked) {
                    const targetUrl = data.redirect || '/alumno/cuenta-bloqueada';

                    if (onBlocked) {
                        onBlocked(targetUrl);
                    } else {
                        router.visit(targetUrl);
                    }
                } else {
                    setWarningMessage(
                        `Actividad no permitida (${reason}). Puntaje acumulado: ${serverStrikes}/${maxAllowed} pts. Al llegar a ${maxAllowed} pts, tu cuenta será suspendida.`,
                    );
                    setShowWarning(true);
                }
            } catch (error: unknown) {
                const axiosErr = error as {
                    response?: { status?: number; data?: { redirect?: string } };
                };

                if (axiosErr?.response?.status === 403) {
                    const redirectUrl =
                        axiosErr.response?.data?.redirect || '/alumno/cuenta-bloqueada';

                    if (onBlocked) {
                        onBlocked(redirectUrl);
                    } else {
                        router.visit(redirectUrl);
                    }
                }
            }
        },
        [activateInstantDomShield, feedbackMode, onBlocked],
    );

    const isBlurred = isWindowBlurred || isModifierHeld || showWarning;

    useEffect(() => {
        if (!isBlurred) {
            releaseInstantDomShield();
        }
    }, [isBlurred, releaseInstantDomShield]);

    // Enforce desktop policy and inject permanent anti-cheat stylesheet when enabled
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        const existingStyle = document.getElementById(STYLE_ELEMENT_ID);

        if (!enabled) {
            if (existingStyle) {
                existingStyle.remove();
            }

            return;
        }

        enforceDesktopDevicePolicy();

        const styleEl = existingStyle || document.createElement('style');
        styleEl.id = STYLE_ELEMENT_ID;
        styleEl.textContent = `
            html, body, body * {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                -webkit-user-drag: none;
            }
            ${
                allowTextInputs
                    ? `
            input, textarea, [contenteditable="true"], [contenteditable="true"] * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
            `
                    : ''
            }
            html[data-anticheat-shield="active"] main {
                filter: blur(28px) !important;
                user-select: none !important;
                pointer-events: none !important;
            }
            @media print {
                body * {
                    visibility: hidden !important;
                }
            }
        `;

        if (!existingStyle) {
            document.head.appendChild(styleEl);
        }

        return () => {
            const el = document.getElementById(STYLE_ELEMENT_ID);

            if (el) {
                el.remove();
            }
        };
    }, [enabled, allowTextInputs]);

    useEffect(() => {
        if (!enabled) {
            releaseInstantDomShield();

            return;
        }

        const isPrintScreenEvent = (e: KeyboardEvent): boolean => {
            return (
                e.key === 'PrintScreen' ||
                e.code === 'PrintScreen' ||
                e.key === 'Snapshot' ||
                e.keyCode === 44
            );
        };

        const buildPrintScreenReason = (e: KeyboardEvent): string => {
            if (e.ctrlKey && e.altKey) {
                return 'Intento de captura de pantalla (Ctrl+Alt+ImprPant)';
            }

            if (e.altKey) {
                return 'Intento de captura de pantalla (Alt+ImprPant)';
            }

            if (e.ctrlKey) {
                return 'Intento de captura de pantalla (Ctrl+ImprPant)';
            }

            return 'Intento de captura de pantalla (ImprPant)';
        };

        // 1. Deshabilitar Click Derecho
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            activateInstantDomShield();
            registerStrike('Intento de clic derecho detectado', 'Right Click');
        };

        // 2. Bloqueo de teclas de captura, DevTools y modificadores (fase capture)
        const handleKeyDown = (e: KeyboardEvent) => {
            const keyLower = (e.key || '').toLowerCase();
            const editable = allowTextInputs && isEditableTarget(e.target);
            const isAltGraph =
                (typeof e.getModifierState === 'function' && e.getModifierState('AltGraph')) ||
                (e.ctrlKey && e.altKey);

            // 2a. ImprPant / PrintScreen (bloqueado siempre, incluso dentro de inputs)
            if (isPrintScreenEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();

                if (!e.repeat) {
                    registerStrike(buildPrintScreenReason(e), 'PrintScreen');
                }

                return;
            }

            // 2b. F12 DevTools (bloqueado siempre, incluso dentro de inputs)
            if (e.key === 'F12') {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();

                if (!e.repeat) {
                    registerStrike('Intento de abrir consola (F12)', 'F12');
                }

                return;
            }

            // 2c. DevTools con combinación (Ctrl/Cmd + Shift + I/J/C) (bloqueado siempre)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);

                if (!e.repeat) {
                    registerStrike('Intento de inspeccionar elemento', 'DevTools');
                }

                return;
            }

            // 2d. Imprimir, Guardar, Ver código fuente (Ctrl/Cmd + P/S/U) (bloqueado siempre; excluye AltGr)
            if ((e.ctrlKey || e.metaKey) && !isAltGraph && ['p', 's', 'u'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();

                if (!e.repeat) {
                    const actionMap: Record<string, string> = {
                        p: 'Shortcut Print',
                        s: 'Save',
                        u: 'View Source',
                    };
                    const reasonMap: Record<string, string> = {
                        p: 'Intento de imprimir contenido (Ctrl+P)',
                        s: 'Intento de guardar contenido (Ctrl+S)',
                        u: 'Intento de ver código fuente (Ctrl+U)',
                    };
                    registerStrike(reasonMap[keyLower], actionMap[keyLower]);
                }

                return;
            }

            // CRÍTICO: Evaluar editable target ANTES del bloqueo de teclas modificadoras (Shift, Alt, AltGraph, Meta)
            // para permitir escritura normal, mayúsculas, acentos y `@` con AltGr sin falsos positivos.
            if (editable) {
                return;
            }

            // 2e. F11 fuera de inputs editables
            if (e.key === 'F11') {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();

                if (!e.repeat) {
                    registerStrike('Uso de tecla restringida (F11)', 'Restricted Key / Modifier');
                }

                return;
            }

            // 2f. Recortes de Windows / Capturas de Mac (Win+Shift+S / Cmd+Shift+3/4/5)
            if (e.metaKey && e.shiftKey && ['s', '3', '4', '5'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();

                if (!e.repeat) {
                    registerStrike(
                        'Intento de captura de pantalla (Herramienta de recorte)',
                        e.metaKey && keyLower === 's' ? 'Snipping Tool' : 'Mac Screenshot',
                    );
                }

                return;
            }

            // 2g. Atajos de extracción con Ctrl / Cmd (C, X, V, A) fuera de inputs editables
            if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();

                if (!e.repeat) {
                    const actionMap: Record<string, string> = {
                        c: 'Copy',
                        x: 'Cut',
                        v: 'Paste',
                        a: 'Shortcut Select All',
                    };
                    registerStrike(
                        `Intento de copiar o extraer contenido (Ctrl+${keyLower.toUpperCase()})`,
                        actionMap[keyLower],
                    );
                }

                return;
            }

            // 2h. Bloqueo de teclas modificadoras fuera de inputs editables (Shift, Control, Alt, AltGraph, Meta)
            const isControlPress =
                e.key === 'Control' || (e.code && e.code.startsWith('Control')) || e.ctrlKey;
            const isAltPress =
                e.key === 'Alt' ||
                e.key === 'AltGraph' ||
                (e.code && e.code.startsWith('Alt')) ||
                e.altKey;
            const isMetaPress =
                e.key === 'Meta' ||
                e.key === 'OS' ||
                (e.code && (e.code.startsWith('Meta') || e.code.startsWith('OS'))) ||
                e.metaKey;
            const isShiftPress =
                e.key === 'Shift' || (e.code && e.code.startsWith('Shift')) || e.shiftKey;

            if (isControlPress || isAltPress || isMetaPress || isShiftPress) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();

                if (!e.repeat) {
                    if (isControlPress && isAltPress) {
                        registerStrike(
                            'Intento de combinación de captura bloqueada (Ctrl+Alt)',
                            'Restricted Key / Modifier',
                        );
                    } else if (isControlPress) {
                        registerStrike('Uso de tecla bloqueada (Ctrl)', 'Restricted Key / Modifier');
                    } else if (isAltPress) {
                        registerStrike(
                            'Uso de tecla bloqueada (Alt / AltGr)',
                            'Restricted Key / Modifier',
                        );
                    } else if (isMetaPress) {
                        registerStrike(
                            'Uso de tecla de sistema bloqueada (Windows/Cmd)',
                            'Restricted Key / Modifier',
                        );
                    } else {
                        registerStrike('Uso de tecla bloqueada (Shift)', 'Shift');
                    }
                }
            }
        };

        // 2i. Capturar keyup (crítico en Windows donde PrintScreen sólo dispara keyup)
        const handleKeyUp = (e: KeyboardEvent) => {
            if (isPrintScreenEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                clearClipboard();
                registerStrike(buildPrintScreenReason(e), 'PrintScreen');
            }

            if (!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
                setIsModifierHeld(false);
            }
        };

        // 3. Detección de pérdida de foco / cambio de pestaña / herramienta externa
        const handleVisibilityChange = () => {
            if (document.hidden) {
                activateInstantDomShield();
                setIsWindowBlurred(true);
            }
        };

        const handleBlur = () => {
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
                focusTimeoutRef.current = null;
            }

            activateInstantDomShield();
            setIsWindowBlurred(true);
        };

        const handleFocus = () => {
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }

            focusTimeoutRef.current = setTimeout(() => {
                setIsWindowBlurred(false);
                setIsModifierHeld(false);
            }, 600);
        };

        // 4. Prevenir copiar, cortar, pegar, seleccionar y arrastrar
        const handleCopyOrCut = (e: ClipboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            activateInstantDomShield();
            clearClipboard();
            registerStrike(
                e.type === 'cut' ? 'Intento de cortar contenido' : 'Intento de copiar contenido',
                e.type === 'cut' ? 'Cut' : 'Copy',
            );
        };

        const handlePaste = (e: ClipboardEvent) => {
            if (allowTextInputs && isEditableTarget(e.target)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            activateInstantDomShield();
            clearClipboard();
            registerStrike('Intento de pegar contenido', 'Paste');
        };

        const handleSelectStart = (e: Event) => {
            if (allowTextInputs && isEditableTarget(e.target)) {
                return;
            }

            e.preventDefault();
        };

        const handleDragStart = (e: DragEvent) => {
            if (allowTextInputs && isEditableTarget(e.target)) {
                return;
            }

            e.preventDefault();
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        document.addEventListener('contextmenu', handleContextMenu, { capture: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('copy', handleCopyOrCut, { capture: true });
        document.addEventListener('cut', handleCopyOrCut, { capture: true });
        document.addEventListener('paste', handlePaste, { capture: true });
        document.addEventListener('selectstart', handleSelectStart, { capture: true });
        document.addEventListener('dragstart', handleDragStart, { capture: true });

        return () => {
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }

            releaseInstantDomShield();
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
            document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('copy', handleCopyOrCut, { capture: true });
            document.removeEventListener('cut', handleCopyOrCut, { capture: true });
            document.removeEventListener('paste', handlePaste, { capture: true });
            document.removeEventListener('selectstart', handleSelectStart, { capture: true });
            document.removeEventListener('dragstart', handleDragStart, { capture: true });
        };
    }, [
        allowTextInputs,
        activateInstantDomShield,
        clearClipboard,
        enabled,
        registerStrike,
        releaseInstantDomShield,
    ]);

    // Componente de Marca de Agua Dinámica
    const Watermark = () => {
        if (!enabled || !watermarkText) {
return null;
}

        const marks = Array.from({ length: 20 });

        return (
            <div
                className={`pointer-events-none fixed inset-0 z-50 flex flex-wrap items-center justify-around overflow-hidden transition-opacity ${
                    isBlurred ? 'opacity-20' : 'opacity-[0.03]'
                }`}
            >
                {marks.map((_, i) => (
                    <div
                        key={i}
                        className="m-10 -rotate-45 whitespace-nowrap text-2xl font-bold text-black md:text-4xl dark:text-white"
                    >
                        {watermarkText}
                    </div>
                ))}
            </div>
        );
    };

    // Componente de Alerta de Strike y Escudo de Protección (Membretada Sapius)
    const StrikeAlert = () => {
        if (!enabled) {
return null;
}

        return (
            <>
                {showWarning ? (
                    <div className="fixed inset-0 z-[99999] flex select-none flex-col items-center justify-center bg-[#052442]/95 px-4 text-white backdrop-blur-md">
                        <img
                            src="https://sapius.com.mx/img/logo-sapius.png"
                            alt="Logo Sapius"
                            draggable={false}
                            className="mb-8 max-w-[200px] drop-shadow-lg"
                        />

                        <h2 className="mb-6 flex items-center gap-3 text-center text-3xl font-black text-white md:text-5xl">
                            <span className="text-5xl">⚠️</span> Acción no permitida
                        </h2>

                        <p className="mb-6 max-w-3xl text-center text-lg font-light leading-relaxed md:text-2xl">
                            El contenido de este panel está protegido.
                            <br />
                            Está{' '}
                            <strong>
                                prohibido el uso de teclas de comando (Ctrl, Alt, Windows, ImprPant)
                            </strong>{' '}
                            y el <strong>clic derecho</strong> mientras navegas en el contenido, así
                            como realizar capturas de pantalla o copiar texto.
                        </p>

                        <div className="mb-8 max-w-2xl rounded-xl border border-[#ffeb3b]/30 bg-[#ffeb3b]/10 p-6 text-center">
                            <p className="text-xl font-bold text-[#ffeb3b] md:text-2xl">
                                {warningMessage}
                            </p>
                            <p className="mt-2 text-sm text-white/70">
                                Las acciones accidentales suman puntos según su gravedad, y al alcanzar{' '}
                                {MAX_STRIKES} pts tu cuenta será bloqueada ({strikeCount}/
                                {MAX_STRIKES} pts).
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowWarning(false);
                                setIsModifierHeld(false);
                            }}
                            className="cursor-pointer rounded-full bg-[#e11d48] px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-rose-700 hover:shadow-rose-900/50"
                        >
                            Entendido, no lo volveré a hacer
                        </button>
                    </div>
                ) : isWindowBlurred ? (
                    <div className="fixed inset-0 z-[99990] flex select-none flex-col items-center justify-center bg-[#052442]/85 px-4 text-white backdrop-blur-md">
                        <h2 className="mb-4 text-center text-2xl font-black text-white md:text-4xl">
                            🔒 Contenido Protegido
                        </h2>
                        <p className="max-w-2xl text-center text-base text-white/90 md:text-xl">
                            Se detectó una ventana o herramienta externa activa. Las capturas y
                            recortes de pantalla están bloqueados en Sapius. Haz clic dentro de esta
                            ventana para continuar.
                        </p>
                    </div>
                ) : null}
            </>
        );
    };

    return {
        isBlurred,
        strikeCount,
        maxStrikes: MAX_STRIKES,
        Watermark,
        StrikeAlert,
    };
}
