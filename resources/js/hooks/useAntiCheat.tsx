import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface AntiCheatOptions {
    enabled?: boolean;
    watermarkText?: string;
    allowTextInputs?: boolean;
    onBlocked?: (redirectUrl?: string) => void;
}

const STRIKE_COOLDOWN_MS = 1500;

export function useAntiCheat(options: AntiCheatOptions = {}) {
    const { enabled = true, watermarkText = '', allowTextInputs = false, onBlocked } = options;
    const [isWindowBlurred, setIsWindowBlurred] = useState(false);
    const [isModifierHeld, setIsModifierHeld] = useState(false);
    const [strikeCount, setStrikeCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const lastStrikeAtRef = useRef<number>(0);
    const strikeCountRef = useRef<number>(0);
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const registerStrike = useCallback(async (reason: string) => {
        const now = Date.now();

        // Mostrar bloqueo y alerta de inmediato en 0ms antes de esperar la red
        activateInstantDomShield();
        const optimisticNext = Math.min(strikeCountRef.current + 1, 3);
        setWarningMessage(
            `Actividad no permitida (${reason}). Advertencia ${optimisticNext}/3. Al llegar a 3, tu cuenta será suspendida.`
        );
        setShowWarning(true);

        // Antirrebote para combinaciones de varias teclas (ej. Ctrl + Alt + ImprPant = 1 strike por intento)
        if (now - lastStrikeAtRef.current < STRIKE_COOLDOWN_MS) {
            return;
        }
        lastStrikeAtRef.current = now;

        try {
            const response = await axios.post('/alumno/strike', { reason });
            const data = response.data;
            const currentStrikes = Number(data.strikes ?? optimisticNext);
            strikeCountRef.current = currentStrikes;
            setStrikeCount(currentStrikes);

            if (data.blocked) {
                const targetUrl = data.redirect || '/alumno/cuenta-bloqueada';
                if (onBlocked) {
                    onBlocked(targetUrl);
                } else {
                    router.visit(targetUrl);
                }
            } else {
                setWarningMessage(
                    `Actividad no permitida (${reason}). Advertencia ${currentStrikes}/3. Al llegar a 3, tu cuenta será suspendida.`
                );
                setShowWarning(true);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                const redirectUrl = error.response?.data?.redirect || '/alumno/cuenta-bloqueada';
                router.visit(redirectUrl);
            }
        }
    }, [activateInstantDomShield, onBlocked]);

    const isBlurred = isWindowBlurred || isModifierHeld || showWarning;

    useEffect(() => {
        if (!isBlurred) {
            releaseInstantDomShield();
        }
    }, [isBlurred, releaseInstantDomShield]);

    useEffect(() => {
        if (!enabled) {
            releaseInstantDomShield();
            return;
        }

        const isEditableTarget = (target: EventTarget | null): boolean => {
            if (!target || !(target instanceof HTMLElement)) return false;
            const tag = target.tagName.toUpperCase();
            if (tag === 'TEXTAREA' || target.isContentEditable) return true;
            if (tag === 'INPUT') {
                const inputType = ((target as HTMLInputElement).type || 'text').toLowerCase();
                return !['radio', 'checkbox', 'button', 'submit', 'file', 'hidden'].includes(inputType);
            }
            return Boolean(target.closest('textarea, [contenteditable="true"]'));
        };

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
            registerStrike('Intento de clic derecho detectado');
        };

        // 2. Bloqueo inmediato de teclas modificadoras y comandos de captura (fase capture)
        const handleKeyDown = (e: KeyboardEvent) => {
            const keyLower = (e.key || '').toLowerCase();

            // 2a. ImprPant / PrintScreen directo o combinado (Ctrl+Alt+ImprPant)
            if (isPrintScreenEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();
                if (!e.repeat) {
                    registerStrike(buildPrintScreenReason(e));
                }
                return;
            }

            // 2b. Herramientas de desarrollador (F12 / F11)
            if (e.key === 'F12' || e.key === 'F11') {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                if (!e.repeat) {
                    registerStrike(e.key === 'F12' ? 'Intento de abrir consola (F12)' : 'Uso de tecla restringida (F11)');
                }
                return;
            }

            // 2c. Recortes de Windows / Capturas de Mac (Win+Shift+S / Cmd+Shift+3/4/5)
            if (e.metaKey && e.shiftKey && ['s', '3', '4', '5'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();
                if (!e.repeat) {
                    registerStrike('Intento de captura de pantalla (Herramienta de recorte)');
                }
                return;
            }

            // 2d. DevTools con combinación (Ctrl/Cmd + Shift + I/J/C)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                if (!e.repeat) {
                    registerStrike('Intento de inspeccionar elemento');
                }
                return;
            }

            // 2e. Atajos específicos con Ctrl / Cmd (C, P, U, S, X, V, A)
            if ((e.ctrlKey || e.metaKey) && ['c', 'p', 'u', 's', 'x', 'v', 'a'].includes(keyLower)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();
                if (!e.repeat) {
                    const reason =
                        keyLower === 'u'
                            ? 'Intento de ver código fuente (Ctrl+U)'
                            : keyLower === 'p'
                              ? 'Intento de imprimir contenido (Ctrl+P)'
                              : 'Intento de copiar o extraer contenido (Ctrl+' + keyLower.toUpperCase() + ')';
                    registerStrike(reason);
                }
                return;
            }

            // 2f. Bloqueo directo de teclas modificadoras (Control, Alt, AltGraph, Windows/Meta)
            // Impide preparar Ctrl+Alt+ImprPant, Alt+ImprPant o Win+Shift+S antes de capturar
            const isControlPress = e.key === 'Control' || (e.code && e.code.startsWith('Control')) || e.ctrlKey;
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

            if (isControlPress || isAltPress || isMetaPress) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                setIsModifierHeld(true);
                clearClipboard();

                if (!e.repeat) {
                    if (isControlPress && isAltPress) {
                        registerStrike('Intento de combinación de captura bloqueada (Ctrl+Alt)');
                    } else if (isControlPress) {
                        registerStrike('Uso de tecla bloqueada (Ctrl)');
                    } else if (isAltPress) {
                        registerStrike('Uso de tecla bloqueada (Alt)');
                    } else {
                        registerStrike('Uso de tecla de sistema bloqueada (Windows/Cmd)');
                    }
                }
                return;
            }

            // Si estamos en un campo de texto permitido (ej. PDF interactivo), permitir escritura alfanumérica normal
            if (allowTextInputs && isEditableTarget(e.target)) {
                return;
            }
        };

        // 2g. Capturar keyup (crítico en Windows donde PrintScreen sólo dispara keyup)
        const handleKeyUp = (e: KeyboardEvent) => {
            if (isPrintScreenEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
                activateInstantDomShield();
                clearClipboard();
                registerStrike(buildPrintScreenReason(e));
            }

            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                setIsModifierHeld(false);
            }
        };

        // 3. Detección de pérdida de foco / cambio de pestaña / herramienta externa de Windows
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

        // 4. Prevenir copiar o cortar con menú / navegador
        const handleCopyOrCut = (e: ClipboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            activateInstantDomShield();
            clearClipboard();
            registerStrike('Intento de copiar contenido');
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        document.addEventListener('contextmenu', handleContextMenu, { capture: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('copy', handleCopyOrCut, { capture: true });
        document.addEventListener('cut', handleCopyOrCut, { capture: true });

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
        };
    }, [allowTextInputs, activateInstantDomShield, clearClipboard, enabled, registerStrike, releaseInstantDomShield]);

    // Componente de Marca de Agua Dinámica
    const Watermark = () => {
        if (!enabled || !watermarkText) return null;

        const marks = Array.from({ length: 20 });

        return (
            <div
                className={`pointer-events-none fixed inset-0 z-50 overflow-hidden flex flex-wrap justify-around items-center transition-opacity ${
                    isBlurred ? 'opacity-20' : 'opacity-[0.03]'
                }`}
            >
                {marks.map((_, i) => (
                    <div
                        key={i}
                        className="text-black dark:text-white font-bold text-2xl md:text-4xl whitespace-nowrap -rotate-45 m-10"
                    >
                        {watermarkText}
                    </div>
                ))}
            </div>
        );
    };

    // Componente de Alerta de Strike y Escudo de Protección (Membretada Sapius)
    const StrikeAlert = () => {
        if (!enabled) return null;

        return (
            <>
                <style>{`
                    html[data-anticheat-shield="active"] main {
                        filter: blur(28px) !important;
                        user-select: none !important;
                        pointer-events: none !important;
                    }
                `}</style>

                {showWarning ? (
                    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#052442]/95 backdrop-blur-md text-white px-4 select-none">
                        <img
                            src="https://sapius.com.mx/img/logo-sapius.png"
                            alt="Logo Sapius"
                            className="max-w-[200px] mb-8 drop-shadow-lg"
                        />

                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 flex items-center gap-3 text-center">
                            <span className="text-5xl">⚠️</span> Acción no permitida
                        </h2>

                        <p className="text-lg md:text-2xl text-center max-w-3xl leading-relaxed mb-6 font-light">
                            El contenido de este panel está protegido.<br />
                            Está <strong>prohibido el uso de teclas de comando (Ctrl, Alt, Windows, ImprPant)</strong> y el <strong>clic derecho</strong> mientras navegas en el contenido, así como realizar capturas de pantalla o copiar texto.
                        </p>

                        <div className="bg-[#ffeb3b]/10 border border-[#ffeb3b]/30 rounded-xl p-6 mb-8 max-w-2xl text-center">
                            <p className="text-xl md:text-2xl text-[#ffeb3b] font-bold">
                                {warningMessage}
                            </p>
                            <p className="text-sm text-white/70 mt-2">
                                Las acciones accidentales mostrarán este aviso, pero el uso reiterado bloqueará tu cuenta permanentemente ({strikeCount || 1}/3).
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowWarning(false);
                                setIsModifierHeld(false);
                            }}
                            className="bg-[#e11d48] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-colors shadow-lg hover:shadow-rose-900/50 cursor-pointer"
                        >
                            Entendido, no lo volveré a hacer
                        </button>
                    </div>
                ) : isWindowBlurred ? (
                    <div className="fixed inset-0 z-[99990] flex flex-col items-center justify-center bg-[#052442]/85 backdrop-blur-md text-white px-4 select-none">
                        <h2 className="text-2xl md:text-4xl font-black text-white mb-4 text-center">
                            🔒 Contenido Protegido
                        </h2>
                        <p className="text-base md:text-xl text-center max-w-2xl text-white/90">
                            Se detectó una ventana o herramienta externa activa. Las capturas y recortes de pantalla están bloqueados en Sapius. Haz clic dentro de esta ventana para continuar.
                        </p>
                    </div>
                ) : null}
            </>
        );
    };

    return {
        isBlurred,
        Watermark,
        StrikeAlert,
    };
}
