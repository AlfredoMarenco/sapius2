import { Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    FolderGit2, 
    LayoutGrid, 
    Users, 
    GraduationCap, 
    Layers, 
    BarChart3, 
    Settings,
    FileText,
    Tag
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, Auth } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<Auth>().props;
    const userRole = auth.user.role;

    const adminNavItems: NavItem[] = [
        {
            title: 'Panel de Control',
            href: '/admin/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Cursos',
            href: '/admin/courses',
            icon: BookOpen,
        },
        {
            title: 'Gestión Landing',
            href: '/admin/landing/slides',
            icon: Layers,
        },
        {
            title: 'Usuarios',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Reportes',
            href: '/admin/reports',
            icon: BarChart3,
        },
    ];

    const studentNavItems: NavItem[] = [
        {
            title: 'Cursos disponibles',
            href: '/user/catalog',
            icon: Tag,
        },
        {
            title: 'Mi Dashboard',
            href: '/user/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Mis Cursos',
            href: '/user/my-courses',
            icon: GraduationCap,
        },
        {
            title: 'Exámenes',
            href: '/user/exams',
            icon: FileText,
        },
    ];

    const mainNavItems = userRole === 'admin' ? adminNavItems : studentNavItems;

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
                            <Link href={userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
