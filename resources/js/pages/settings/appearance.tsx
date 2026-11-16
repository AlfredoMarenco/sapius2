import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Apariencia" />

            <h1 className="sr-only">Configuración de Apariencia</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Apariencia"
                    description="Personaliza el tema visual de tu plataforma"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Apariencia', href: editAppearance() }]}>
        <SettingsLayout>{page}</SettingsLayout>
    </AppLayout>
);
