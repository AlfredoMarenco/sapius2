import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { SapiusIsotype } from '@/components/public/SapiusLogo';

const MIN_LOADER_DURATION_MS = 320;

/**
 * SapiusPageLoader
 * Overlay translúcido claro con el isotipo oficial "s." de Sapius pulsando
 * y un anillo coral giratorio durante las transiciones entre páginas públicas.
 */
export function SapiusPageLoader() {
    const [visible, setVisible] = useState(false);
    const startTimeRef = useRef<number>(0);
    const hideTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const clearHideTimer = () => {
            if (hideTimerRef.current !== null) {
                window.clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
        };

        const removeStart = router.on('start', (event) => {
            const visit = event.detail?.visit;
            if (visit?.prefetch) {
                return;
            }

            clearHideTimer();
            startTimeRef.current = Date.now();
            setVisible(true);
        });

        const removeFinish = router.on('finish', (event) => {
            const visit = event.detail?.visit;
            if (visit?.prefetch) {
                return;
            }

            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, MIN_LOADER_DURATION_MS - elapsed);

            clearHideTimer();
            hideTimerRef.current = window.setTimeout(() => {
                setVisible(false);
                hideTimerRef.current = null;
            }, remaining);
        });

        return () => {
            clearHideTimer();
            removeStart();
            removeFinish();
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="sapius-page-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    role="status"
                    aria-live="polite"
                    aria-label="Cargando página"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-white/75 backdrop-blur-md"
                >
                    <div className="relative flex h-28 w-28 items-center justify-center">
                        {/* Resplandor cálido sutil */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-1 rounded-full bg-[#FFD9CE]/45 blur-xl"
                        />

                        {/* Anillo base tenue */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full border-2 border-[#101E33]/10"
                        />

                        {/* Arco giratorio coral */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#FF6B52] border-r-[#FF6B52]/60"
                        />

                        {/* Isotipo s. oficial pulsando al centro */}
                        <motion.div
                            animate={{ scale: [0.94, 1.05, 0.94] }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="relative z-10 flex items-center justify-center"
                        >
                            <SapiusIsotype
                                variant="dark"
                                className="h-12 w-auto"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SapiusPageLoader;
