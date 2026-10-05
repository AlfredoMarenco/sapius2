import { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
    id: string;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Opcional: Polling cada X minutos
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/alumno/notifications');
            const result = await response.json();
            if (result.success) {
                setNotifications(result.data);
                setUnreadCount(result.unread_count);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch(`/alumno/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            // Actualizar localmente
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch('/alumno/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    {unreadCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="font-semibold text-base p-0">Notificaciones</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
                            Marcar todo como leído
                        </Button>
                    )}
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
                                className={`flex flex-col items-start p-4 gap-1 cursor-pointer transition-colors ${!notification.read_at ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!notification.read_at) {
                                        markAsRead(notification.id);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <span className={`text-sm font-medium ${!notification.read_at ? 'text-indigo-900 dark:text-indigo-100' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                        {notification.data?.title || 'Nueva notificación'}
                                    </span>
                                    {!notification.read_at && (
                                        <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
                                    )}
                                </div>
                                <span className={`text-sm ${!notification.read_at ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                    {notification.data?.message || notification.data?.description || 'Tienes un nuevo aviso'}
                                </span>
                                <span className="text-xs text-neutral-400 mt-1">
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
