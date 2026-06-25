"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  userName,
  notifCount = 0,
  msgCount = 0,
}: {
  userName: string;
  notifCount?: number;
  msgCount?: number;
}) {
  const t = useTranslations("dashboard");
  const ta = useTranslations("auth");
  const pathname = usePathname();

  const items: { href: string; label: string; badge?: number }[] = [
    { href: "/dashboard", label: t("myListings") },
    { href: "/dashboard/messages", label: t("messages"), badge: msgCount },
    { href: "/dashboard/notifications", label: "Notifications", badge: notifCount },
    { href: "/dashboard/profil", label: t("myProfile") },
    { href: "/dashboard/disponibilite", label: t("availability") },
    { href: "/dashboard/statistiques", label: t("statistics") },
  ];

  return (
    <aside className="flex flex-col bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
      {/* En-tête : logo + déconnexion mobile */}
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border p-4 lg:border-b-0 lg:p-5">
        <Link href="/dashboard">
          <Logo variant="light" />
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

      {/* Nav : onglets horizontaux (mobile) → colonne (desktop) */}
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0 lg:pt-2">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
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

      {/* Pied : nom + déconnexion (desktop uniquement) */}
      <div className="mt-auto hidden border-t border-sidebar-border p-4 lg:block">
        <p className="px-2 text-sm font-medium text-sidebar-foreground/80">
          {userName}
        </p>
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
