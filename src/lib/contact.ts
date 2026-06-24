/** Lien WhatsApp (wa.me) — aucun appel d'API, simple lien externe. */
export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/[^0-9]/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Lien mailto. */
export function mailtoLink(email: string, subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${query}`;
}
