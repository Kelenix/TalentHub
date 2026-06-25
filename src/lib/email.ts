import { Resend } from "resend";

/**
 * Envoie un email via Resend. No-op silencieux si `RESEND_API_KEY` n'est pas
 * configuré (placeholder), pour ne jamais bloquer le flux applicatif.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("<")) return;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "TalentHub <onboarding@resend.dev>";
  try {
    const resend = new Resend(key);
    await resend.emails.send({ from, to, subject, html });
  } catch (e) {
    console.error("sendEmail error:", e);
  }
}

/** Gabarit HTML minimal et sobre pour les emails transactionnels. */
export function emailLayout(title: string, message: string, ctaUrl?: string) {
  const button = ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:16px;background:#ea580c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Ouvrir TalentHub</a>`
    : "";
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0f172a;">
    <h2 style="color:#0f172a;">${title}</h2>
    <p style="color:#475569;line-height:1.5;">${message}</p>
    ${button}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="color:#94a3b8;font-size:12px;">TalentHub — annuaire de la communauté.</p>
  </div>`;
}
