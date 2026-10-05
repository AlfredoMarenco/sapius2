import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, NavGroup } from '@/types';

export function NavMain({ items = [], groups }: { items?: NavItem[]; groups?: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    if (groups && groups.length > 0) {
        return (
            <div className="space-y-3">
                {groups.map((group, idx) => (
                    <SidebarGroup key={idx} className="px-2 py-0">
                        {group.label && (
                            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-neutral-400/90 px-2 mb-1">
                                {group.label}
                            </SidebarGroupLabel>
                        )}
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                        className="text-neutral-200 hover:text-white hover:bg-white/10 data-[active=true]:bg-blue-600 data-[active=true]:text-white font-medium"
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon className="w-4 h-4 mr-2 shrink-0" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </div>
        );
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className="text-neutral-200 hover:text-white hover:bg-white/10 data-[active=true]:bg-blue-600 data-[active=true]:text-white font-medium"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon className="w-4 h-4 mr-2 shrink-0" />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
