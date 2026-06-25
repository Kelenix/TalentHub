import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="font-display text-xl font-extrabold text-white">
              Talent<span className="text-terracotta">Hub</span>{" "}
              <span className="text-sm font-normal text-sidebar-foreground">
                Italia
              </span>
            </div>
            <p className="text-sm leading-relaxed text-sidebar-foreground">
              {t("tagline")}
            </p>
          </div>

          <div className="flex gap-14 text-sm">
            <div className="space-y-2.5">
              <p className="font-semibold text-white">{t("navigationTitle")}</p>
              <Link href="/" className="block transition-colors hover:text-white">
                {tn("home")}
              </Link>
              <Link
                href="/recherche"
                className="block transition-colors hover:text-white"
              >
                {tn("search")}
              </Link>
            </div>
            <div className="space-y-2.5">
              <p className="font-semibold text-white">{t("legalTitle")}</p>
              <Link
                href="/mentions-legales"
                className="block transition-colors hover:text-white"
              >
                {t("legal")}
              </Link>
              <Link
                href="/confidentialite"
                className="block transition-colors hover:text-white"
              >
                {t("privacy")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{t("bottomNote")}</span>
          <span>© {year} TalentHub</span>
        </div>
      </div>
    </footer>
  );
}
