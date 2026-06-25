"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  date: string;
};

export function NotificationsList({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const hasUnread = items.some((i) => !i.read);

  function open(item: NotificationItem) {
    start(async () => {
      if (!item.read) await markNotificationRead(item.id);
      if (item.link) router.push(item.link as never);
      else router.refresh();
    });
  }

  function allRead() {
    start(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Aucune notification.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={allRead}
            disabled={pending}
          >
            Tout marquer comme lu
          </Button>
        </div>
      )}
      <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => open(i)}
              disabled={pending}
              className={cn(
                "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/60",
                !i.read && "bg-terracotta-soft/40",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  i.read ? "bg-transparent" : "bg-primary",
                )}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm",
                    i.read ? "font-medium text-ink" : "font-semibold text-ink",
                  )}
                >
                  {i.title}
                </span>
                {i.body && (
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {i.body}
                  </span>
                )}
                <span className="mt-1 block text-xs text-ink-muted">
                  {i.date}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
