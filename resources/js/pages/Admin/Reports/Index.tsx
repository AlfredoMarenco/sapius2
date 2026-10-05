import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
    stats: {
        total: number;
        accepted: number;
        pending: number;
    };
}

export default function ReportsIndex({ stats }: Props) {
    return (
        <>
            <Head title="Reportes Administrativos" />

            <div className="p-6 max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Reportes y Métricas
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Estadísticas de inscripciones, ventas y seguimiento de alumnos.
                        </p>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href="/admin/reports/inscriptions">
                            Ver Reporte Detallado de Inscripciones <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-medium uppercase">Total Inscripciones</p>
                                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-medium uppercase">Inscripciones Aprobadas</p>
                                <h3 className="text-3xl font-bold text-emerald-600">{stats.accepted}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-medium uppercase">Pendientes de Pago / Validación</p>
                                <h3 className="text-3xl font-bold text-amber-600">{stats.pending}</h3>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Reportes', href: '/admin/reports' },
    ]}>
        {page}
    </AppLayout>
);
