import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface AntiCheatOptions {
    enabled?: boolean;
    watermarkText?: string;
    onBlocked?: () => void;
}

export function useAntiCheat(options: AntiCheatOptions = {}) {
    const { enabled = true, watermarkText = '', onBlocked } = options;
    const [isBlurred, setIsBlurred] = useState(false);
    const [strikeCount, setStrikeCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const registerStrike = useCallback(async (reason: string) => {
        try {
            const response = await axios.post('/alumno/strike', { reason });
            const data = response.data;
            setStrikeCount(data.strikes);
            
            if (data.blocked) {
                if (onBlocked) {
                    onBlocked();
                } else if (data.redirect) {
                    router.visit(data.redirect);
                } else {
                    router.visit('/login');
                }
            } else {
                setWarningMessage(`Actividad no permitida (${reason}). Advertencia ${data.strikes}/3. Al llegar a 3, tu cuenta será suspendida.`);
                setShowWarning(true);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                router.visit('/login');
            }
        }
    }, [onBlocked]);

    useEffect(() => {
        if (!enabled) return;

        // 1. Deshabilitar Click Derecho
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setIsBlurred(true);
            registerStrike('Intento de clic derecho detectado');
            setTimeout(() => setIsBlurred(false), 2000);
        };

        // 2. Deshabilitar Atajos de Teclado (F12, Captura, Inspeccionar, Copiar)
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                setIsBlurred(true);
                registerStrike('Intento de abrir consola (F12)');
                setTimeout(() => setIsBlurred(false), 2000);
            }
            // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
                e.preventDefault();
                setIsBlurred(true);
                registerStrike('Intento de inspeccionar elemento');
                setTimeout(() => setIsBlurred(false), 2000);
            }
            // Ctrl+U
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                setIsBlurred(true);
                registerStrike('Intento de ver código fuente');
                setTimeout(() => setIsBlurred(false), 2000);
            }
            // Ctrl+C / Ctrl+P
            if (e.ctrlKey && ['c', 'p', 'C', 'P'].includes(e.key)) {
                e.preventDefault();
                setIsBlurred(true);
                registerStrike('Intento de copiar o imprimir contenido');
                setTimeout(() => setIsBlurred(false), 2000);
            }
            // PrintScreen
            if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
                e.preventDefault();
                setIsBlurred(true);
                registerStrike('Intento de captura de pantalla');
                setTimeout(() => setIsBlurred(false), 2000);
            }
            // Meta+Shift+S (Mac/Windows Snipping tool)
            if (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
                setIsBlurred(true);
                registerStrike('Herramienta de recorte detectada');
                setTimeout(() => setIsBlurred(false), 2000);
            }
        };

        // 3. Detección de pérdida de foco / cambio de pestaña
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            }
        };

        const handleBlur = () => {
            setIsBlurred(true);
            // registerStrike('Se detectó clic fuera de la ventana del curso');
        };

        const handleFocus = () => {
            setTimeout(() => setIsBlurred(false), 1500);
        };

        // Prevenir copiar con mouse
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            setIsBlurred(true);
            registerStrike('Intento de copiar contenido');
            setTimeout(() => setIsBlurred(false), 2000);
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('copy', handleCopy);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('copy', handleCopy);
        };
    }, [enabled, registerStrike]);

    // Componente de Marca de Agua Dinámica
    const Watermark = () => {
        if (!enabled || !watermarkText) return null;

        // Generar múltiples marcas de agua rotadas para cubrir la pantalla
        const marks = Array.from({ length: 20 });
        
        return (
            <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden flex flex-wrap justify-around items-center opacity-[0.03]">
                {marks.map((_, i) => (
                    <div 
                        key={i} 
                        className="text-black font-bold text-2xl md:text-4xl whitespace-nowrap -rotate-45 m-10"
                    >
                        {watermarkText}
                    </div>
                ))}
            </div>
        );
    };

    // Componente de Alerta de Strike (Membretada Sapius)
    const StrikeAlert = () => {
        if (!showWarning) return null;

        return (
            <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#052442]/95 backdrop-blur-sm text-white px-4">
                <img 
                    src="https://sapius.com.mx/img/logo-sapius.png" 
                    alt="Logo Sapius" 
                    className="max-w-[200px] mb-8 drop-shadow-lg"
                />
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 flex items-center gap-3">
                    <span className="text-5xl">⚠️</span> Acción no permitida
                </h2>
                
                <p className="text-lg md:text-2xl text-center max-w-3xl leading-relaxed mb-6 font-light">
                    El contenido de este panel está protegido.<br />
                    Está <strong>prohibido el uso del teclado</strong> y el <strong>clic derecho</strong> mientras navegas en el sitio, así como realizar capturas de pantalla o copiar texto.
                </p>
                
                <div className="bg-[#ffeb3b]/10 border border-[#ffeb3b]/30 rounded-xl p-6 mb-8 max-w-2xl text-center">
                    <p className="text-xl md:text-2xl text-[#ffeb3b] font-bold">
                        {warningMessage}
                    </p>
                    <p className="text-sm text-white/70 mt-2">
                        Las acciones accidentales mostrarán este aviso, pero el uso reiterado bloqueará tu cuenta permanentemente.
                    </p>
                </div>

                <button 
                    onClick={() => setShowWarning(false)}
                    className="bg-[#e11d48] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-colors shadow-lg hover:shadow-rose-900/50"
                >
                    Entendido, no lo volveré a hacer
                </button>
            </div>
        );
    };

    return {
        isBlurred,
        Watermark,
        StrikeAlert
    };
}
