import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/user";
import { getCities, getCountries } from "@/lib/reference";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();

  const [profile, cities, countries] = await Promise.all([
    prisma.providerProfile.findUnique({
      where: { userId: user.id },
      include: { countryOfOrigin: true, city: true },
    }),
    getCities(),
    getCountries(),
  ]);

  const social = (profile?.socialLinks ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Mon profil</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ces informations sont visibles par les visiteurs sur votre profil public.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-ink">Profil public</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Photo, coordonnées, présentation et réseaux sociaux visibles par les
            visiteurs.
          </p>
        </aside>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ProfileForm
            cities={cities.map((c) => ({ id: c.id, name: c.name }))}
            countries={countries.map((c) => ({ iso: c.iso, name: c.name }))}
            initial={{
              firstName: profile?.firstName ?? "",
              lastName: profile?.lastName ?? "",
              whatsappNumber: profile?.whatsappNumber ?? "",
              contactEmail: profile?.contactEmail ?? user.email,
              description: profile?.description ?? "",
              countryIso: profile?.countryOfOrigin?.iso ?? "",
              cityId: profile?.cityId ?? "",
              languages: profile?.languages.join(", ") ?? "",
              photoUrl: profile?.photoUrl ?? "",
              instagram: social.instagram ?? "",
              facebook: social.facebook ?? "",
              tiktok: social.tiktok ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
