import { Link, usePage } from '@inertiajs/react';
import { 
    Home, 
    Users, 
    List, 
    Plus, 
    Copy, 
    CalendarDays, 
    Tv, 
    LayoutTemplate, 
    CheckCircle, 
    UploadCloud, 
    PieChart, 
    Calendar, 
    Flag, 
    Info, 
    MessageSquare, 
    Settings 
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Award } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, NavGroup, Auth } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<Auth>().props;
    const userRole = auth.user?.role?.toLowerCase();
    const isAdmin = userRole === 'admin' || userRole === 'administrador';
    const isInstructor = userRole === 'instructor';

    const adminGroups: NavGroup[] = [
        {
            items: [
                {
                    title: 'Cursos Activos',
                    href: '/admin',
                    icon: Home,
                },
            ],
        },
        {
            label: 'Usuarios',
            items: [
                {
                    title: 'Lista',
                    href: '/admin/users',
                    icon: Users,
                },
            ],
        },
        {
            label: 'Cursos',
            items: [
                {
                    title: 'Lista',
                    href: '/admin/cursos',
                    icon: List,
                },
                {
                    title: 'Agregar',
                    href: '/admin/cursos/create',
                    icon: Plus,
                },
                {
                    title: 'Copiar',
                    href: '/admin/cursos/copy',
                    icon: Copy,
                },
                {
                    title: 'Programación',
                    href: '/admin/registro/programacion',
                    icon: CalendarDays,
                },
                {
                    title: 'Certificados',
                    href: '/admin/certificates',
                    icon: Award,
                },
            ],
        },
        {
            label: 'Configuraciones',
            items: [
                {
                    title: 'Landing',
                    href: '/admin/configuraciones',
                    icon: Tv,
                },
                {
                    title: 'Administrables',
                    href: '/admin/manageable',
                    icon: LayoutTemplate,
                },
                {
                    title: 'Reviews',
                    href: '/admin/reviews',
                    icon: CheckCircle,
                },
                {
                    title: 'Actualizador App',
                    href: '/admin/electron/updater',
                    icon: UploadCloud,
                },
            ],
        },
        {
            label: 'Reportes',
            items: [
                {
                    title: 'Reportes',
                    href: '/admin/reports',
                    icon: PieChart,
                },
            ],
        },
    ];

    const instructorGroups: NavGroup[] = [
        {
            items: [
                {
                    title: 'Dashboard',
                    href: '/instructor',
                    icon: Home,
                },
            ],
        },
        {
            label: 'Opciones',
            items: [
                {
                    title: 'Mis Cursos',
                    href: '/instructor/cursos',
                    icon: List,
                },
                {
                    title: 'Mis Alumnos',
                    href: '/instructor/cursos',
                    icon: Users,
                },
                {
                    title: 'Soporte Técnico',
                    href: '/instructor/soporte',
                    icon: Info,
                },
            ],
        },
    ];

    const studentGroups: NavGroup[] = [
        {
            items: [
                {
                    title: 'Cursos Activos',
                    href: '/alumno',
                    icon: Home,
                },
            ],
        },
        {
            label: 'Opciones',
            items: [
                {
                    title: 'Mi Calendario',
                    href: '/alumno/calendario',
                    icon: Calendar,
                },
                {
                    title: 'Mis Certificados',
                    href: '/alumno/certificados',
                    icon: Award,
                },
                {
                    title: 'Cursos disponibles',
                    href: '/alumno/cursos',
                    icon: Flag,
                },
                {
                    title: 'Guias disponibles',
                    href: '/alumno/guias',
                    icon: Flag,
                },
                {
                    title: 'Simuladores disponibles',
                    href: '/alumno/simuladores',
                    icon: Flag,
                },
                {
                    title: 'Tu Opinión',
                    href: '/alumno/tu-opinion',
                    icon: MessageSquare,
                },
                {
                    title: 'Soporte Técnico',
                    href: '/alumno/soporte',
                    icon: Info,
                },
            ],
        },
    ];

    const groups = isAdmin ? adminGroups : (isInstructor ? instructorGroups : studentGroups);

    const footerNavItems: NavItem[] = [
        {
            title: 'Configuración',
            href: '/settings',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdmin ? '/admin' : (isInstructor ? '/instructor' : '/alumno')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={groups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
