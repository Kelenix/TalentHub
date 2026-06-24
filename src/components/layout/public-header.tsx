import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { signOutAction } from "@/lib/auth/actions";

const categories = [
  { slug: "cuisine", label: "Cuisine" },
  { slug: "beaute", label: "Beauté" },
  { slug: "couture", label: "Couture" },
  { slug: "services-divers", label: "Services" },
];

export async function PublicHeader() {
  const [t, ta, user] = await Promise.all([
    getTranslations("nav"),
    getTranslations("auth"),
    getCurrentUser(),
  ]);
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/recherche?category=${c.slug}`}
                className="transition-colors hover:text-ink"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          {user ? (
            <>
              <Link href={isAdmin ? "/admin" : "/dashboard"}>
                <Button size="sm" variant={isAdmin ? "ink" : "primary"}>
                  {isAdmin ? "Admin" : t("dashboard")}
                </Button>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
                >
                  {ta("logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="hidden text-sm font-semibold text-ink transition-colors hover:text-terracotta-deep sm:block"
              >
                {t("login")}
              </Link>
              <Link href="/dashboard/annonces/nouvelle">
                <Button size="sm">{t("publish")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
