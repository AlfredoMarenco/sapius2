if (typeof window === 'undefined') {
    (global as any).window = {};
    (global as any).document = {};
    (global as any).requestAnimationFrame = (callback: any) => setTimeout(callback, 0);
}

import { createInertiaApp } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import { Toaster } from '@/components/ui/sonner';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = (pages[`./pages/${name}.tsx`] as any).default;

        if (page.layout === undefined) {
            if (name === 'Welcome') {
                page.layout = null;
            } else if (name.startsWith('auth/')) {
                page.layout = (page: any) => <AuthLayout>{page}</AuthLayout>;
            } else if (name.startsWith('settings/')) {
                page.layout = (page: any) => (
                    <AppLayout>
                        <SettingsLayout>{page}</SettingsLayout>
                    </AppLayout>
                );
            } else {
                page.layout = (page: any) => <AppLayout>{page}</AppLayout>;
            }
        }

        return page;
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster position="top-right" />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
