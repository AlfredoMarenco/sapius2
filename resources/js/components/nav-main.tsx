import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem, NavGroup } from '@/types';

export function NavMain({
    items = [],
    groups,
}: {
    items?: NavItem[];
    groups?: NavGroup[];
}) {
    const { currentUrl, isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const isItemInActiveGroup = (href: NavItem['href']): boolean => {
        if (isCurrentUrl(href)) {
            return true;
        }

        const path = typeof href === 'string' ? href : href.url;
        if (path && path !== '/' && path !== '/admin' && path !== '/instructor' && path !== '/alumno') {
            return isCurrentOrParentUrl(path);
        }

        return false;
    };

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};

        for (const group of groups ?? []) {
            if (!group.label) {
                continue;
            }

            initial[group.label] = group.items.some((item) =>
                isItemInActiveGroup(item.href),
            );
        }

        return initial;
    });

    useEffect(() => {
        if (!groups?.length) {
            return;
        }

        setOpenGroups((prev) => {
            let changed = false;
            const next = { ...prev };

            for (const group of groups) {
                if (!group.label) {
                    continue;
                }

                const hasActive = group.items.some((item) =>
                    isItemInActiveGroup(item.href),
                );
                if (hasActive && !next[group.label]) {
                    next[group.label] = true;
                    changed = true;
                }
            }

            return changed ? next : prev;
        });
    }, [currentUrl]);

    if (groups && groups.length > 0) {
        return (
            <div className="space-y-1.5">
                {groups.map((group, idx) => {
                    if (!group.label) {
                        return (
                            <SidebarGroup key={idx} className="px-2 py-0">
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
                                                    {item.icon && (
                                                        <item.icon className="w-4 h-4 mr-2 shrink-0" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroup>
                        );
                    }

                    const groupKey = group.label;
                    const isOpen = Boolean(openGroups[groupKey]);
                    const hasActiveItem = group.items.some((item) =>
                        isItemInActiveGroup(item.href),
                    );

                    return (
                        <Collapsible
                            key={groupKey}
                            open={isOpen}
                            onOpenChange={(open) =>
                                setOpenGroups((prev) => ({
                                    ...prev,
                                    [groupKey]: open,
                                }))
                            }
                            className="group/collapsible"
                        >
                            <SidebarGroup className="px-2 py-0">
                                <SidebarGroupLabel
                                    asChild
                                    className={`text-[11px] font-bold uppercase tracking-wider px-2 mb-0.5 cursor-pointer rounded-md hover:bg-white/5 hover:text-white transition-colors ${
                                        hasActiveItem
                                            ? 'text-white/95'
                                            : 'text-neutral-400/90'
                                    }`}
                                >
                                    <CollapsibleTrigger className="flex w-full items-center justify-between">
                                        <span>{group.label}</span>
                                        <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarMenu className="mt-0.5">
                                        {group.items.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isCurrentUrl(item.href)}
                                                    tooltip={{ children: item.title }}
                                                    className="text-neutral-200 hover:text-white hover:bg-white/10 data-[active=true]:bg-blue-600 data-[active=true]:text-white font-medium"
                                                >
                                                    <Link href={item.href} prefetch>
                                                        {item.icon && (
                                                            <item.icon className="w-4 h-4 mr-2 shrink-0" />
                                                        )}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    );
                })}
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
                                {item.icon && (
                                    <item.icon className="w-4 h-4 mr-2 shrink-0" />
                                )}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
