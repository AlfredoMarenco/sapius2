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
}

export default function RecaptchaWidget({
    siteKey,
    onVerify,
    onExpired,
    onError,
    errorMessage,
    className = 'mt-3 mb-2 flex flex-col items-center justify-center',
}: RecaptchaWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!siteKey) return;

        const renderCaptcha = () => {
            if (window.grecaptcha && window.grecaptcha.render && containerRef.current && widgetIdRef.current === null) {
                try {
                    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                        sitekey: siteKey,
                        callback: (token: string) => onVerify(token),
                        'expired-callback': () => onExpired && onExpired(),
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
