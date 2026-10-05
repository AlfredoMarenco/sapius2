import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    LayoutGrid, 
    Play, 
    Clock, 
    Award,
    MoreVertical,
    Star,
    Compass,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Enrollment {
    id: number;
    scheduled_id: number;
    title: string;
    category: string;
    instructor: string;
    image: string | null;
    progress: number;
    last_accessed: string;
}

interface Props {
    enrollments: Enrollment[];
}

export default function Index({ enrollments }: Props) {
    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
            <Head title="Mis Cursos" />

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">Mis Cursos</h1>
                    <p className="text-muted-foreground font-medium italic">Continúa tu formación de alta especialidad.</p>
                </div>

                <Link href="/user/catalog">
                    <Button variant="outline" className="rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] h-12 gap-2 hover:bg-brand-navy hover:text-white transition-all duration-300">
                        <Compass className="w-4 h-4" />
                        Explorar Catálogo
                    </Button>
                </Link>
            </div>

            {/* Enrolled Courses Grid */}
            {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrollments.map((enrollment, index) => (
                        <motion.div
                            key={enrollment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col hover:border-brand-blue/20 transition-all duration-500"
                        >
                            {/* Course Image & Progress Overlay */}
                            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                                <img 
                                    src={enrollment.image ? (enrollment.image.startsWith('http') ? enrollment.image : `/media/stream/${enrollment.image}`) : 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=2070'} 
                                    alt={enrollment.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-brand-navy/30 group-hover:bg-brand-navy/10 transition-colors" />
                                
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[8px] font-black uppercase tracking-[0.1em] text-brand-navy">
                                        {enrollment.category}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">Progreso</span>
                                        <span className="text-xs font-black text-white drop-shadow-md">{enrollment.progress}%</span>
                                    </div>
                                    <Progress value={enrollment.progress} className="h-1.5 bg-white/20" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex flex-col flex-1 space-y-6">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight leading-[1.1] group-hover:text-brand-blue transition-colors line-clamp-2">
                                        {enrollment.title}
                                    </h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-2 p-2">
                                            <DropdownMenuItem className="rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer">Detalles del Curso</DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl font-bold text-xs uppercase tracking-widest text-destructive cursor-pointer">Darse de baja</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                                        <Star className="w-4 h-4 text-brand-blue" />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Por {enrollment.instructor}</p>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Leído: {enrollment.last_accessed}</span>
                                    </div>

                                    <Link href={`/user/my-courses/${enrollment.id}`}>
                                        <Button className="rounded-xl bg-brand-navy hover:bg-brand-blue h-10 px-4 font-black uppercase text-[9px] tracking-widest shadow-lg shadow-brand-navy/10 group/btn">
                                            Continuar
                                            <Play className="ml-2 w-3 h-3 fill-current group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center space-y-10 bg-white rounded-[4rem] border-2 border-dashed border-gray-200">
                    <div className="space-y-4">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-brand-navy/5">
                            <Compass className="w-10 h-10 text-brand-navy/20" />
                        </div>
                        <div className="max-w-xs mx-auto space-y-2">
                            <h3 className="text-2xl font-black text-brand-navy uppercase">No tienes cursos</h3>
                            <p className="text-gray-500 font-medium italic">Explora nuestro catálogo y comienza tu camino a la alta especialidad hoy mismo.</p>
                        </div>
                    </div>
                    
                    <Link href="/user/catalog">
                        <Button className="h-14 px-8 rounded-2xl bg-brand-navy hover:bg-brand-blue font-black uppercase tracking-widest text-xs group">
                            Ver Catálogo de Cursos
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

Index.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/alumno' },
            { title: 'Mis Cursos', href: '/alumno/my-courses' },
        ]}
    >
        {page}
    </AppLayout>
);
