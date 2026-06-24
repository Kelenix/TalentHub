"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label="Langue"
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink outline-none focus:ring-2 focus:ring-ring"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
