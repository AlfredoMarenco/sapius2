import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Search,
    BookOpen,
    Layers,
    ArrowRight,
    Star,
    Clock,
    ShoppingCart,
    CheckCircle,
    FileText,
    Gamepad2,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { stripHtml } from '@/lib/utils';

interface Course {
    id: number;
    course_id: number;
    title: string;
    category: string;
    instructor: string;
    price: number | string;
    image: string | null;
    description: string | null;
    modules_count: number;
    lessons_count: number;
    start_date: string | null;
}

interface CategoryItem {
    id: number;
    name: string;
}

interface Props {
    courses: Course[];
    categories: CategoryItem[];
    activeTab?: string;
    title?: string;
}

const TAB_CONFIG: Record<
    string,
    {
        badge: string;
        headlinePrefix: string;
        headlineAccent: string;
        subtitle: string;
        emptyLabel: string;
    }
> = {
    cursos: {
        badge: 'Catálogo de Cursos',
        headlinePrefix: 'Potencia tu',
        headlineAccent: 'Futuro Académico',
        subtitle:
            'Descubre cursos especializados de preparación diseñados por expertos para asegurar tu éxito profesional.',
        emptyLabel: 'No hay cursos disponibles',
    },
    guias: {
        badge: 'Guías de Estudio',
        headlinePrefix: 'Material',
        headlineAccent: 'Especializado Sapius',
        subtitle:
            'Accede a nuestras guías de estudio estructuradas por especialistas para reforzar cada tema clave del examen.',
        emptyLabel: 'No hay guías de estudio disponibles',
    },
    simuladores: {
        badge: 'Simuladores de Examen',
        headlinePrefix: 'Practica como en el',
        headlineAccent: 'Examen Real',
        subtitle:
            'Entrena con simuladores cronometrados y retroalimentación detallada para dominar cada área evaluada.',
        emptyLabel: 'No hay simuladores disponibles',
    },
};

export default function Catalog({
    courses = [],
    categories = [],
    activeTab = 'cursos',
    title = 'Cursos Disponibles',
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const tabMeta = TAB_CONFIG[activeTab] || TAB_CONFIG.cursos;

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || course.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <Head title={title} />

            <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
                {/* Navigation Tabs between /alumno/cursos, /alumno/guias, /alumno/simuladores */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-brand-navy uppercase">
                            {title}
                        </h2>
                        <p className="text-xs font-medium text-neutral-500">
                            Explora los programas disponibles para inscripción inmediata
                        </p>
                    </div>
                    <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-100/80 p-1">
                        <Link
                            href="/alumno/cursos"
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wider uppercase transition-all ${
                                activeTab === 'cursos'
                                    ? 'bg-brand-navy text-white shadow-sm'
                                    : 'text-neutral-600 hover:text-brand-navy'
                            }`}
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            Cursos
                        </Link>
                        <Link
                            href="/alumno/guias"
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wider uppercase transition-all ${
                                activeTab === 'guias'
                                    ? 'bg-brand-navy text-white shadow-sm'
                                    : 'text-neutral-600 hover:text-brand-navy'
                            }`}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Guías
                        </Link>
                        <Link
                            href="/alumno/simuladores"
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wider uppercase transition-all ${
                                activeTab === 'simuladores'
                                    ? 'bg-brand-navy text-white shadow-sm'
                                    : 'text-neutral-600 hover:text-brand-navy'
                            }`}
                        >
                            <Gamepad2 className="h-3.5 w-3.5" />
                            Simuladores
                        </Link>
                    </div>
                </div>

                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-[3rem] bg-brand-navy p-8 shadow-2xl md:p-16">
                    <div className="absolute top-[-20%] right-[-10%] h-96 w-96 rounded-full bg-brand-coral/20 blur-[100px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-brand-cyan/10 blur-[100px]" />

                    <div className="relative z-10 max-w-2xl space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-md"
                        >
                            <Star className="h-4 w-4 fill-brand-coral text-brand-coral" />
                            <span className="text-[10px] font-black tracking-widest text-white/80 uppercase">
                                {tabMeta.badge}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl leading-tight font-black tracking-tighter text-white uppercase md:text-6xl"
                        >
                            {tabMeta.headlinePrefix} <br />
                            <span className="text-brand-coral italic">
                                {tabMeta.headlineAccent}
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-md text-lg font-medium text-white/60"
                        >
                            {tabMeta.subtitle}
                        </motion.p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col items-center justify-between gap-6 border-b border-gray-100 pb-4 md:flex-row">
                    <div className="group relative w-full md:w-96">
                        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-brand-navy" />
                        <Input
                            placeholder="Buscar en el catálogo..."
                            className="h-14 rounded-2xl border-2 border-gray-100 pl-12 font-bold transition-all focus-visible:border-brand-navy focus-visible:ring-brand-navy"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="scrollbar-hide flex w-full items-center gap-3 overflow-x-auto pb-2 md:w-auto md:pb-0">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('all')}
                            className={`rounded-full px-6 text-[10px] font-black tracking-widest uppercase ${
                                selectedCategory === 'all' ? 'bg-brand-navy' : 'border-2'
                            }`}
                        >
                            Todos
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={
                                    selectedCategory === cat.name ? 'default' : 'outline'
                                }
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`rounded-full px-6 text-[10px] font-black tracking-widest uppercase ${
                                    selectedCategory === cat.name
                                        ? 'bg-brand-navy'
                                        : 'border-2'
                                }`}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Catalog Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group flex flex-col overflow-hidden rounded-[2.5rem] border-2 border-gray-50 bg-white shadow-xl shadow-gray-200/50 transition-all duration-500 hover:border-brand-navy/5 hover:shadow-2xl hover:shadow-brand-navy/10"
                            >
                                {/* Course Image */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                    <div className="absolute inset-0 z-10 bg-brand-navy/20 transition-colors duration-500 group-hover:bg-brand-navy/0" />
                                    <img
                                        src={
                                            course.image
                                                ? course.image.startsWith('http')
                                                    ? course.image
                                                    : `/media/stream/${course.image}`
                                                : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2073'
                                        }
                                        alt={course.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2073';
                                        }}
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="rounded-full bg-white/90 px-4 py-2 text-[9px] font-black tracking-widest text-brand-navy uppercase shadow-lg backdrop-blur-md">
                                            {course.category}
                                        </span>
                                    </div>
                                    <div className="absolute right-4 bottom-4 z-20">
                                        <div className="rounded-xl bg-brand-coral px-4 py-2 shadow-lg ring-2 ring-white/50">
                                            <span className="text-lg font-black text-white">
                                                ${course.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Content */}
                                <div className="flex flex-1 flex-col space-y-6 p-8">
                                    <div className="space-y-4">
                                        <h3 className="text-2xl leading-tight font-black tracking-tight text-brand-navy uppercase transition-colors group-hover:text-brand-coral">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 italic">
                                            {stripHtml(course.description) ||
                                                'Sin descripción disponible por el momento.'}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-auto flex items-center gap-6 border-t border-gray-100 pt-6">
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-brand-blue" />
                                            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                {course.modules_count} Módulos
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-brand-blue" />
                                            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                                {course.lessons_count} Lecciones
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/alumno/checkout/${course.id}`}
                                        className="w-full"
                                    >
                                        <Button className="group/btn h-14 w-full rounded-2xl bg-brand-navy text-xs font-black tracking-widest uppercase shadow-xl shadow-brand-navy/10 hover:bg-brand-navy/90">
                                            Inscribirme Ahora
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 py-24 text-center">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                            <BookOpen className="h-10 w-10 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-brand-navy uppercase">
                                {tabMeta.emptyLabel}
                            </h3>
                            <p className="font-medium text-gray-500 italic">
                                Intenta ajustando los filtros de búsqueda o revisa otra sección del catálogo.
                            </p>
                        </div>
                    </div>
                )}

                {/* Benefits Section */}
                <div className="grid grid-cols-1 gap-10 rounded-[3rem] border border-brand-cyan/10 bg-brand-cyan/5 p-8 md:grid-cols-3 md:p-12">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl">
                            <CheckCircle className="h-6 w-6 text-brand-cyan" />
                        </div>
                        <div>
                            <h4 className="mb-2 font-black tracking-tight text-brand-navy uppercase">
                                Acceso garantizado
                            </h4>
                            <p className="text-xs font-medium text-gray-500">
                                Estudia a tu ritmo durante la vigencia completa de tu programa
                                adquirido.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl">
                            <Clock className="h-6 w-6 text-brand-cyan" />
                        </div>
                        <div>
                            <h4 className="mb-2 font-black tracking-tight text-brand-navy uppercase">
                                Soporte continuo
                            </h4>
                            <p className="text-xs font-medium text-gray-500">
                                Nuestro equipo de expertos está siempre listo para resolver tus
                                dudas académicas.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl">
                            <ShoppingCart className="h-6 w-6 text-brand-cyan" />
                        </div>
                        <div>
                            <h4 className="mb-2 font-black tracking-tight text-brand-navy uppercase">
                                Pago Seguro
                            </h4>
                            <p className="text-xs font-medium text-gray-500">
                                Transacciones protegidas con los más altos estándares de
                                seguridad.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Catalog.layout = (page: ReactElement<{ title?: string; activeTab?: string }>) => {
    const title = page.props?.title || 'Catálogo';
    const activeTab = page.props?.activeTab || 'cursos';
    const href =
        activeTab === 'guias'
            ? '/alumno/guias'
            : activeTab === 'simuladores'
              ? '/alumno/simuladores'
              : '/alumno/cursos';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Panel de Alumno', href: '/alumno' },
                { title, href },
            ]}
        >
            {page}
        </AppLayout>
    );
};
