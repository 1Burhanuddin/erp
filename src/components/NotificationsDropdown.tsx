
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, useUnreadCount, useMarkAllRead, useMarkRead } from "@/api/notifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function NotificationsDropdown() {
    const navigate = useNavigate();
    const { data: notifications } = useNotifications();
    const { data: unreadCount } = useUnreadCount();
    const markAllRead = useMarkAllRead();
    const markRead = useMarkRead();

    const handleNotificationClick = (id: string, link?: string) => {
        markRead.mutate(id);
        if (link) navigate(link);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Notifications</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            You have {unreadCount} unread messages
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications?.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-1">
                            {notifications?.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                        !notification.read && "bg-muted/50 font-medium"
                                    )}
                                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                                >
                                    <div className="flex justify-between w-full">
                                        <span className="text-sm font-semibold">{notification.title}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer justify-center text-primary"
                    onClick={() => markAllRead.mutate()}
                    disabled={unreadCount === 0}
                >
                    <Check className="mr-2 h-4 w-4" /> Mark all as read
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
