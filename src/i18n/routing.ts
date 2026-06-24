import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Langues V1 : français + italien (architecture extensible à l'Europe)
  locales: ["fr", "it"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
