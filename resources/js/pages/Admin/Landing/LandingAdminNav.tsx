import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export function LandingAdminNav({ active }: { active: 'slides' | 'prides' | 'teachers' | 'reviews' }) {
    const navItems = [
        { id: 'slides', title: 'Slides Hero', href: '/admin/landing/slides' },
        { id: 'prides', title: 'Orgullos Sapius', href: '/admin/landing/prides' },
        { id: 'teachers', title: 'Docentes', href: '/admin/landing/teachers' },
        { id: 'reviews', title: 'Reseñas', href: '/admin/landing/reviews' },
    ];

    return (
        <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto">
            {navItems.map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                        active === item.id 
                            ? "border-brand-orange text-brand-orange" 
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </div>
    );
}
