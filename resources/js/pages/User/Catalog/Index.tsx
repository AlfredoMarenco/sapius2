import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Search, 
    Filter, 
    BookOpen, 
    Layers, 
    ArrowRight, 
    Star,
    Clock,
    ShoppingCart,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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

interface Props {
    courses: Course[];
    categories: any[];
}

export default function Catalog({ courses, categories }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            
            {/* Hero Header */}
            <div className="relative rounded-[3rem] bg-brand-navy p-8 md:p-16 overflow-hidden shadow-2xl">
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-brand-coral/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-brand-cyan/10 rounded-full blur-[100px]" />
                
                <div className="relative z-10 max-w-2xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md"
                    >
                        <Star className="w-4 h-4 text-brand-coral fill-brand-coral" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Oportunidades de Aprendizaje</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter uppercase"
                    >
                        Potencia tu <br />
                        <span className="text-brand-coral italic">Futuro Académico</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-lg font-medium max-w-md"
                    >
                        Descubre cursos especializados, simuladores y guías diseñadas por expertos para asegurar tu éxito profesional.
                    </motion.p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-4 border-b border-gray-100">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-navy transition-colors" />
                    <Input 
                        placeholder="Buscar en el catálogo..." 
                        className="pl-12 h-14 rounded-2xl border-2 border-gray-100 focus-visible:ring-brand-navy focus-visible:border-brand-navy font-bold transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <Button 
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('all')}
                        className={`rounded-full px-6 font-black uppercase text-[10px] tracking-widest ${selectedCategory === 'all' ? 'bg-brand-navy' : 'border-2'}`}
                    >
                        Todos
                    </Button>
                    {categories.map((cat) => (
                        <Button 
                            key={cat.id}
                            variant={selectedCategory === cat.name ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`rounded-full px-6 font-black uppercase text-[10px] tracking-widest ${selectedCategory === cat.name ? 'bg-brand-navy' : 'border-2'}`}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Catalog Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-[2.5rem] border-2 border-gray-50 overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-brand-navy/10 hover:border-brand-navy/5 transition-all duration-500 flex flex-col"
                        >
                            {/* Course Image */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-brand-navy/0 transition-colors duration-500 z-10" />
                                <img 
                                    src={course.image 
                                        ? (course.image.startsWith('http') ? course.image : `/storage/${course.image}`) 
                                        : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2073'} 
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2073';
                                    }}
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-[9px] font-black uppercase tracking-widest text-brand-navy">
                                        {course.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 right-4 z-20">
                                    <div className="bg-brand-coral px-4 py-2 rounded-xl shadow-lg ring-2 ring-white/50">
                                        <span className="text-white font-black text-lg">${course.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="p-8 flex flex-col flex-1 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-brand-navy tracking-tight leading-tight uppercase group-hover:text-brand-coral transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-3 italic">
                                        {course.description || 'Sin descripción disponible por el momento.'}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 pt-6 border-t border-gray-100 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-brand-blue" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{course.modules_count} Módulos</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-brand-blue" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{course.lessons_count} Lecciones</span>
                                    </div>
                                </div>

                                <Link href={`/user/catalog/${course.id}`} className="w-full">
                                    <Button className="w-full h-14 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-navy/10 group/btn">
                                        Explorar y Adquirir
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center space-y-6">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                        <BookOpen className="w-10 h-10 text-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-brand-navy uppercase">No hay cursos disponibles</h3>
                        <p className="text-gray-500 font-medium italic">Intenta ajustando los filtros de búsqueda.</p>
                    </div>
                </div>
            )}

            {/* Benefits Section */}
            <div className="bg-brand-cyan/5 rounded-[3rem] p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-10 border border-brand-cyan/10">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <div>
                        <h4 className="font-black text-brand-navy uppercase tracking-tight mb-2">Acceso de por vida</h4>
                        <p className="text-xs text-gray-500 font-medium">Estudia a tu ritmo sin límites de tiempo en tus contenidos adquiridos.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <div>
                        <h4 className="font-black text-brand-navy uppercase tracking-tight mb-2">Soporte 24/7</h4>
                        <p className="text-xs text-gray-500 font-medium">Nuestro equipo de expertos está siempre listo para resolver tus dudas académicas.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <div>
                        <h4 className="font-black text-brand-navy uppercase tracking-tight mb-2">Pago Seguro</h4>
                        <p className="text-xs text-gray-500 font-medium">Transacciones protegidas con los más altos estándares de seguridad.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

Catalog.layout = (page: any) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Panel de Alumno', href: '/user/dashboard' },
            { title: 'Cursos disponibles', href: '/user/catalog' },
        ]}
    >
        {page}
    </AppLayout>
);
