function intlLocale(locale: string) {
  return locale === "it" ? "it-IT" : "fr-FR";
}

export function formatDate(date: Date | string, locale: string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Lit une valeur string dans le JSON `attributes` d'une annonce. */
export function attr(
  attributes: unknown,
  key: string,
): string | undefined {
  if (attributes && typeof attributes === "object" && key in attributes) {
    const value = (attributes as Record<string, unknown>)[key];
    return value == null ? undefined : String(value);
  }
  return undefined;
}
