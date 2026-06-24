/** Minuscule + suppression des accents (pour une recherche tolérante). */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Vrai si chaque mot de la requête (sans accent) est présent dans le texte.
 * Ex. "ndole ca" trouve "Ndolé Camerounais".
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const h = fold(haystack);
  return terms.every((t) => h.includes(t));
}
