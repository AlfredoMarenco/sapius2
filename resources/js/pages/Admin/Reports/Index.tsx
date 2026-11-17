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

            <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101E33] dark:text-neutral-100">
                            Reportes y Métricas
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Estadísticas de inscripciones, ventas y seguimiento de alumnos.
                        </p>
                    </div>
                    <Button asChild size="sm" className="h-9 rounded-lg bg-[#FF6B52] hover:bg-[#F0563C] text-white px-4 text-xs sm:text-sm font-semibold shadow-xs self-start sm:self-auto">
                        <Link href="/admin/reports/inscriptions">
                            Ver Reporte Detallado de Inscripciones <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 sm:p-5 rounded-xl border-neutral-200/80 shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-medium">Total Inscripciones</p>
                                <h3 className="text-2xl font-bold text-[#101E33] dark:text-neutral-100">{stats.total}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-5 rounded-xl border-neutral-200/80 shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-medium">Inscripciones Aprobadas</p>
                                <h3 className="text-2xl font-bold text-emerald-600">{stats.accepted}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-5 rounded-xl border-neutral-200/80 shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 font-medium">Pendientes de Pago / Validación</p>
                                <h3 className="text-2xl font-bold text-amber-600">{stats.pending}</h3>
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
