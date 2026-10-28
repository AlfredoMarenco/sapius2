import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            flash?: {
                error?: string | null;
                success?: string | null;
                message?: string | null;
                [key: string]: any;
            };
            [key: string]: unknown;
        };
    }
}
