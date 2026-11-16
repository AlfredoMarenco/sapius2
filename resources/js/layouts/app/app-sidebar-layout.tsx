import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowRight, FileCheck2 } from 'lucide-react';
import { useEffect } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { enforceDesktopDevicePolicy } from '@/hooks/useAntiCheat';
import type { AppLayoutProps, Auth } from '@/types';

interface SidebarAuthUser {
    role?: string;
    profile_incomplete?: boolean;
    is_validated?: boolean;
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const page = usePage<{ auth?: Auth }>();
    const user = page.props.auth?.user as SidebarAuthUser | undefined;
    const userRole = user?.role?.toLowerCase();

    useEffect(() => {
        if (userRole === 'alumno' || userRole === 'instructor') {
            enforceDesktopDevicePolicy();
        }
    }, [userRole]);

    const isStudent = userRole === 'alumno';
    const profileIncomplete = Boolean(user?.profile_incomplete);
    const isNotValidated = user?.is_validated === false;
    const showExpedienteBanner = isStudent && (profileIncomplete || isNotValidated);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {showExpedienteBanner && (
                    <div
                        role="status"
                        className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 bg-amber-50/90 px-4 py-2.5 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
                    >
                        <div className="flex items-center gap-2">
                            {profileIncomplete ? (
                                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <FileCheck2 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            )}
                            <span>
                                {profileIncomplete
                                    ? 'Tu expediente de alumno está incompleto. Completa tus datos y documentos para agilizar tu validación.'
                                    : 'Tu expediente está pendiente de validación académica. Puedes revisar tus datos y documentos aquí.'}
                            </span>
                        </div>
                        <Link
                            href="/alumno/users/alumno/complete"
                            className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-amber-700"
                        >
                            {profileIncomplete ? 'Completar expediente' : 'Revisar expediente'}
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
                {children}
            </AppContent>
        </AppShell>
    );
}
