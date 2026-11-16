import { usePage } from '@inertiajs/react';
import { Bell, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Auth } from '@/types';

interface NotificationData {
    title?: string;
    message?: string;
    description?: string;
    [key: string]: unknown;
}

interface Notification {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

function getCsrfToken(): string {
    return (
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    );
}

export function NotificationDropdown() {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const isStudent = auth?.user?.role?.toLowerCase() === 'alumno';

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isStudent) {
            return;
        }

        let cancelled = false;

        const loadNotifications = async () => {
            try {
                const response = await fetch('/alumno/notifications', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok || cancelled) {
                    return;
                }

                const result = await response.json();

                if (result.success && !cancelled) {
                    setNotifications(result.data || []);
                    setUnreadCount(Number(result.unread_count ?? 0));
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        void loadNotifications();
        const interval = setInterval(() => {
            void loadNotifications();
        }, 60000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [isStudent]);

    if (!isStudent) {
        return null;
    }

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/alumno/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
                    ),
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/alumno/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(`/alumno/notifications/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (response.ok) {
                const target = notifications.find((n) => n.id === id);
                setNotifications((prev) => prev.filter((n) => n.id !== id));

                if (target && !target.read_at) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const deleteAllNotifications = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch('/alumno/notifications/delete-all', {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (response.ok) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="Notificaciones"
                >
                    <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96">
                <div className="flex items-center justify-between gap-2 px-4 py-2">
                    <DropdownMenuLabel className="p-0 text-base font-semibold">
                        Notificaciones
                    </DropdownMenuLabel>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-auto px-2 py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                            >
                                Marcar leídas
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={deleteAllNotifications}
                                className="h-auto px-2 py-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                title="Vaciar notificaciones"
                            >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Vaciar
                            </Button>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-neutral-500">
                            No tienes notificaciones
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex cursor-pointer flex-col items-start gap-1 p-4 transition-colors ${!notification.read_at ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();

                                    if (!notification.read_at) {
                                        markAsRead(notification.id);
                                    }
                                }}
                            >
                                <div className="flex w-full items-start justify-between gap-2">
                                    <span
                                        className={`text-sm font-medium ${!notification.read_at ? 'text-indigo-900 dark:text-indigo-100' : 'text-neutral-700 dark:text-neutral-300'}`}
                                    >
                                        {notification.data?.title || 'Nueva notificación'}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {!notification.read_at && (
                                            <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => deleteNotification(notification.id, e)}
                                            className="rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                            title="Eliminar notificación"
                                            aria-label="Eliminar notificación"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <span
                                    className={`text-sm ${!notification.read_at ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-500 dark:text-neutral-400'}`}
                                >
                                    {notification.data?.message ||
                                        notification.data?.description ||
                                        'Tienes un nuevo aviso'}
                                </span>
                                <span className="mt-1 text-xs text-neutral-400">
                                    {new Date(notification.created_at).toLocaleString()}
                                </span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
