import { useState } from 'react';
import { Bell, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDate } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, markRead, markAllRead } = useNotificationStore();

  return (
    <>
      {/* Mobile overlay — matches the sidebar's mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-8 sm:w-8" aria-label="Notifications">
            <Bell className="size-5 sm:size-[18px]" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <Button variant="ghost" size="xs" className="gap-1 text-xs" onClick={() => void markAllRead()}>
                <Check size={12} /> Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto size-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((notification) => {
                  const isUnread = !notification.read_at;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => isUnread && void markRead(notification.id)}
                      className={`px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors ${isUnread ? 'bg-muted/40' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {isUnread && <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-xs">{notification.data.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatDate(notification.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
