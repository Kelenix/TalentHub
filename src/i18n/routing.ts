import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // FR + IT (V1) + EN (extension Europe — cf. cahier des charges §16)
  locales: ["fr", "it", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
