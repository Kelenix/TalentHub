"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export function AdminSidebar({ notifCount = 0 }: { notifCount?: number }) {
  const t = useTranslations("admin");
  const ta = useTranslations("auth");
  const pathname = usePathname();

  const items: { href: string; label: string; badge?: number }[] = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/notifications", label: "Notifications", badge: notifCount },
    { href: "/admin/utilisateurs", label: t("users") },
    { href: "/admin/annonces", label: t("listings") },
    { href: "/admin/categories", label: t("categories") },
    { href: "/admin/moderation", label: t("moderation") },
    { href: "/admin/statistiques", label: t("statistics") },
  ];

  return (
    <aside className="flex flex-col bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border p-4 lg:border-b-0 lg:p-5">
        <Link href="/admin" className="flex flex-col">
          <Logo variant="light" />
          <span className="text-xs font-semibold tracking-widest text-sidebar-foreground/50">
            ADMIN
          </span>
        </Link>
        <form action={signOutAction} className="lg:hidden">
          <button
            type="submit"
            className="text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
          >
            {ta("logout")}
          </button>
        </form>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0 lg:pt-2">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              {item.label}
              {item.badge ? (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-sidebar-border p-4 lg:block">
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-2 py-2 text-left text-sm text-sidebar-foreground/60 hover:text-sidebar-accent-foreground"
          >
            {ta("logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
