import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        grecaptcha: any;
        onRecaptchaLoaded: () => void;
    }
}

interface RecaptchaWidgetProps {
    siteKey?: string;
    onVerify: (token: string) => void;
    onExpired?: () => void;
    onError?: () => void;
    errorMessage?: string;
    className?: string;
    /** Change this value to force a reset (reCAPTCHA tokens are single-use). */
    resetKey?: number;
}

export default function RecaptchaWidget({
    siteKey,
    onVerify,
    onExpired,
    onError,
    errorMessage,
    className = 'mt-3 mb-2 flex flex-col items-center justify-center',
    resetKey = 0,
}: RecaptchaWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (resetKey === 0 || widgetIdRef.current === null || !window.grecaptcha?.reset) {
            return;
        }
        try {
            window.grecaptcha.reset(widgetIdRef.current);
        } catch (e) {
            console.error('Error resetting reCAPTCHA:', e);
        }
        const hiddenInput = containerRef.current
            ?.closest('form')
            ?.querySelector('input[name="g-recaptcha-response"]') as HTMLInputElement | null;
        if (hiddenInput) {
            hiddenInput.value = '';
        }
        if (onExpired) onExpired();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    useEffect(() => {
        if (!siteKey) return;

        const renderCaptcha = () => {
            if (window.grecaptcha && window.grecaptcha.render && containerRef.current && widgetIdRef.current === null) {
                try {
                    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                        sitekey: siteKey,
                        callback: (token: string) => {
                            // 1. Actualizar el input hidden en el DOM para que el formulario de Inertia lo capture
                            const form = containerRef.current?.closest('form');
                            if (form) {
                                const hiddenInput = form.querySelector('input[name="g-recaptcha-response"]') as HTMLInputElement;
                                if (hiddenInput) {
                                    hiddenInput.value = token;
                                    hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
                                    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }
                            // 2. Notificar al estado de React
                            onVerify(token);
                        },
                        'expired-callback': () => {
                            const form = containerRef.current?.closest('form');
                            if (form) {
                                const hiddenInput = form.querySelector('input[name="g-recaptcha-response"]') as HTMLInputElement;
                                if (hiddenInput) {
                                    hiddenInput.value = '';
                                    hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
                                    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }
                            if (onExpired) onExpired();
                        },
                        'error-callback': () => onError && onError(),
                    });
                } catch (e) {
                    console.error('Error rendering reCAPTCHA:', e);
                }
            }
        };

        if (window.grecaptcha && window.grecaptcha.render) {
            renderCaptcha();
        } else {
            const scriptId = 'google-recaptcha-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            }

            window.onRecaptchaLoaded = () => {
                renderCaptcha();
            };
        }

        return () => {
            // Cleanup on unmount if needed
        };
    }, [siteKey]);

    if (!siteKey) return null;

    return (
        <div className={className}>
            <div ref={containerRef} />
            {errorMessage && (
                <p className="text-[11px] font-bold text-destructive mt-1.5">{errorMessage}</p>
            )}
        </div>
    );
}
