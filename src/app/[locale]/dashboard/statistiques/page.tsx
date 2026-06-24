import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function StatisticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireProvider();

  const [views, whatsapp, email] = await Promise.all([
    prisma.contactEvent.count({
      where: { type: "VIEW", listing: { providerId: user.profile.id } },
    }),
    prisma.contactEvent.count({
      where: { type: "WHATSAPP", listing: { providerId: user.profile.id } },
    }),
    prisma.contactEvent.count({
      where: { type: "EMAIL", listing: { providerId: user.profile.id } },
    }),
  ]);

  const stats = [
    { label: "Vues totales", value: views },
    { label: "Contacts WhatsApp", value: whatsapp },
    { label: "Contacts email", value: email },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Statistiques</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
