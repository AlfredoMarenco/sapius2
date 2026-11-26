import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface AntiCheatOptions {
    enabled?: boolean;
    watermarkText?: string;
    allowTextInputs?: boolean;
    feedbackMode?: boolean;
    onBlocked?: (redirectUrl?: string) => void;
}

interface AntiCheatAuthUser {
    id?: number | string;
    name?: string;
    nombre_completo?: string;
    email?: string;
    username?: string;
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
    const [unlockCountdown, setUnlockCountdown] = useState<number | null>(null);
    const [fullscreenEl, setFullscreenEl] = useState<Element | null>(null);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }
        const syncFullscreen = () => {
            setFullscreenEl(document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', syncFullscreen);
        return () => document.removeEventListener('fullscreenchange', syncFullscreen);
    }, []);

    if (safeInitialStrikes !== prevAuthStrikes) {
        setPrevAuthStrikes(safeInitialStrikes);
        setStrikeCount(safeInitialStrikes);
    }

    const lastStrikeAtRef = useRef<number>(0);
    const lastStrikeActionRef = useRef<string>('');
    const lastModifierDownAtRef = useRef<number>(0);
    const hasWindowFocusRef = useRef<boolean>(
        typeof document !== 'undefined' ? document.hasFocus() : true,
    );
    const isMouseInsideRef = useRef<boolean>(true);
    const strikeCountRef = useRef<number>(safeInitialStrikes);
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        strikeCountRef.current = strikeCount;
    }, [strikeCount]);

    const activateInstantDomShield = useCallback(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-anticheat-shield', 'active');
            document.querySelectorAll('video, audio').forEach((el) => {
                try {
                    (el as HTMLMediaElement).pause();
                } catch {
                    // Ignorar errores de reproducción
                }
            });
            void document.documentElement.offsetHeight;
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

            const highSeverityActions = [
                'Browser Screenshot',
                'Snipping Tool',
                'Mac Screenshot',
                'PrintScreen',
                'Screen Capture',
                'DevTools',
                'F12',
                'Copy',
                'Shortcut Print',
                'Save',
            ];
            const isUpgradeFromModifier =
                ['Restricted Key / Modifier', 'Shift'].includes(lastStrikeActionRef.current) &&
                highSeverityActions.includes(action);

            // Antirrebote para combinaciones de varias teclas (permite escalar si primero se detectó solo el modificador)
            if (!isUpgradeFromModifier && now - lastStrikeAtRef.current < STRIKE_COOLDOWN_MS) {
                return;
            }

            lastStrikeAtRef.current = now;
            lastStrikeActionRef.current = action;

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

    useEffect(() => {
        if (unlockCountdown === null) {
            return;
        }

        if (unlockCountdown <= 0) {
            setShowWarning(false);
            setIsWindowBlurred(false);
            setIsModifierHeld(false);
            setUnlockCountdown(null);
            releaseInstantDomShield();
            return;
        }

        const timer = window.setTimeout(() => {
            if (typeof document !== 'undefined' && (!document.hasFocus() || document.hidden || !isMouseInsideRef.current)) {
                setUnlockCountdown(null);
                return;
            }
            setUnlockCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [unlockCountdown, releaseInstantDomShield]);

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
            html[data-anticheat-shield="active"] main:not(:has([data-anticheat-portal="true"])) {
                filter: blur(28px) !important;
                user-select: none !important;
                pointer-events: none !important;
            }
            html[data-anticheat-shield="active"] [data-anticheat-portal="true"] {
                filter: none !important;
                pointer-events: auto !important;
            }
            html[data-anticheat-shield="active"] .anticheat-blackout,
            html[data-anticheat-shield="active"] main canvas,
            html[data-anticheat-shield="active"] main video {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                filter: blur(32px) !important;
                transition: none !important;
                animation: none !important;
            }
            #sapius-instant-shield {
                display: none;
                opacity: 0;
                visibility: hidden;
                transition: none !important;
                animation: none !important;
            }
            html[data-anticheat-shield="active"] #sapius-instant-shield {
                display: flex !important;
                opacity: 1 !important;
                visibility: visible !important;
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

            // 2c. DevTools con combinación (Ctrl/Cmd + Shift + I/J/C) y captura de navegador (Ctrl/Cmd + Shift + S)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c', 's'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);

                if (!e.repeat) {
                    registerStrike(
                        keyLower === 's'
                            ? 'Intento de captura de pantalla del navegador (Ctrl+Shift+S)'
                            : 'Intento de inspeccionar elemento',
                        keyLower === 's' ? 'Browser Screenshot' : 'DevTools',
                    );
                }

                return;
            }

            // 2c-bis. Windows Game Bar (Win+G / Win+Alt+R)
            if (e.metaKey && (keyLower === 'g' || (e.altKey && keyLower === 'r'))) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();

                if (!e.repeat) {
                    registerStrike(
                        'Intento de grabación/captura de pantalla (Game Bar)',
                        'Screen Capture',
                    );
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
                lastModifierDownAtRef.current = Date.now();
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

            hasWindowFocusRef.current = false;
            activateInstantDomShield();
            setIsWindowBlurred(true);
            setUnlockCountdown(null);

            if (Date.now() - lastModifierDownAtRef.current < 2000) {
                lastModifierDownAtRef.current = 0;
                registerStrike(
                    'Intento de captura o grabación de pantalla (Ctrl/Win+Shift+S)',
                    'Screen Capture',
                );
            } else {
                registerStrike(
                    'Apertura de herramienta externa o pérdida de foco de la ventana',
                    'Window Blur',
                );
            }
        };

        const handleMouseLeave = () => {
            isMouseInsideRef.current = false;
            activateInstantDomShield();
            setIsWindowBlurred(true);
            setUnlockCountdown(null);
        };

        const handleMouseEnter = () => {
            isMouseInsideRef.current = true;
        };

        const handleFocus = () => {
            hasWindowFocusRef.current = true;
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
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        document.documentElement.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('copy', handleCopyOrCut, { capture: true });
        document.addEventListener('cut', handleCopyOrCut, { capture: true });
        document.addEventListener('paste', handlePaste, { capture: true });
        document.addEventListener('selectstart', handleSelectStart, { capture: true });
        document.addEventListener('dragstart', handleDragStart, { capture: true });

        const focusWatchInterval = window.setInterval(() => {
            if (document.hidden || !document.hasFocus()) {
                const wasFocused = hasWindowFocusRef.current;
                hasWindowFocusRef.current = false;
                activateInstantDomShield();
                setIsWindowBlurred(true);
                setUnlockCountdown(null);

                if (wasFocused) {
                    if (Date.now() - lastModifierDownAtRef.current < 2000) {
                        lastModifierDownAtRef.current = 0;
                        registerStrike(
                            'Intento de captura o grabación de pantalla (Ctrl/Win+Shift+S)',
                            'Screen Capture',
                        );
                    } else {
                        registerStrike(
                            'Apertura de herramienta externa o pérdida de foco de la ventana',
                            'Window Blur',
                        );
                    }
                }
            } else {
                hasWindowFocusRef.current = true;
            }
        }, 250);

        return () => {
            window.clearInterval(focusWatchInterval);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
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

    // Componente de Marca de Agua Forense Dinámica
    const Watermark = () => {
        if (!enabled || !watermarkText || typeof document === 'undefined') {
            return null;
        }

        const fullName = authUser?.nombre_completo || authUser?.name || 'Alumno';
        const emailOrText = authUser?.email || authUser?.username || watermarkText;
        const userId = authUser?.id ?? '0';
        const todayStr = new Date().toLocaleDateString('es-MX');
        const forensicText = `${fullName} · ${emailOrText} · ID #${userId} · ${todayStr} · PROHIBIDA SU CAPTURA`;

        const marks = Array.from({ length: 24 });
        const portalTarget = fullscreenEl || document.body;

        return createPortal(
            <div
                data-anticheat-portal="true"
                className={`pointer-events-none fixed inset-0 z-50 flex flex-wrap items-center justify-around overflow-hidden transition-opacity ${
                    isBlurred ? 'opacity-25' : 'opacity-[0.075]'
                }`}
            >
                {marks.map((_, i) => (
                    <div
                        key={i}
                        className="m-8 -rotate-30 whitespace-nowrap text-sm font-extrabold tracking-wider text-black md:text-base dark:text-white"
                    >
                        {forensicText}
                    </div>
                ))}
            </div>,
            portalTarget,
        );
    };

    // Componente de Alerta de Strike y Escudo de Protección (Membretada Sapius)
    const StrikeAlert = () => {
        if (!enabled || typeof document === 'undefined') {
            return null;
        }

        const portalTarget = fullscreenEl || document.body;

        return createPortal(
            <div data-anticheat-portal="true">
                {/* Escudo instantáneo de 0ms controlado por CSS puro antes de que React re-renderice */}
                <div
                    id="sapius-instant-shield"
                    className="fixed inset-0 z-[99980] flex select-none flex-col items-center justify-center bg-[#052442] px-4 text-white"
                >
                    <h2 className="mb-3 text-center text-2xl font-black text-white md:text-4xl">
                        🔒 Contenido Protegido
                    </h2>
                    <p className="max-w-xl text-center text-sm text-white/80 md:text-base">
                        Protección activa contra capturas y grabaciones de pantalla.
                    </p>
                </div>
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
                            disabled={unlockCountdown !== null}
                            onClick={() => setUnlockCountdown(5)}
                            className="cursor-pointer rounded-full bg-[#e11d48] px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-rose-700 hover:shadow-rose-900/50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {unlockCountdown !== null
                                ? `Verificando ventana segura... (${unlockCountdown}s) — Mantén el cursor dentro`
                                : 'Entendido, reanudar lectura (5s)'}
                        </button>
                    </div>
                ) : isWindowBlurred ? (
                    <div className="fixed inset-0 z-[99990] flex select-none flex-col items-center justify-center bg-[#052442]/95 px-4 text-white backdrop-blur-md">
                        <h2 className="mb-4 text-center text-2xl font-black text-white md:text-4xl">
                            🔒 Contenido Protegido
                        </h2>
                        <p className="mb-8 max-w-2xl text-center text-base text-white/90 md:text-xl">
                            Se detectó una ventana o herramienta externa activa, o el cursor salió del
                            área protegida. Las capturas y grabaciones de pantalla están bloqueadas en
                            Sapius.
                        </p>
                        <button
                            type="button"
                            disabled={unlockCountdown !== null}
                            onClick={() => setUnlockCountdown(5)}
                            className="cursor-pointer rounded-full bg-[#e11d48] px-8 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70 md:text-lg"
                        >
                            {unlockCountdown !== null
                                ? `Verificando ventana segura... (${unlockCountdown}s) — Mantén el cursor dentro`
                                : 'Reanudar contenido (5s)'}
                        </button>
                    </div>
                ) : null}
            </div>,
            portalTarget,
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
