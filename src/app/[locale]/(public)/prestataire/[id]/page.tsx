import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProviderById, getProviderListings } from "@/lib/listings";
import { whatsappLink, mailtoLink } from "@/lib/contact";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/listing-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = await getProviderById(id);
  if (!provider) return { title: "Prestataire" };
  return {
    title: `${provider.firstName} ${provider.lastName}`,
    description: provider.description?.slice(0, 160) ?? undefined,
  };
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [provider, tp, tc] = await Promise.all([
    getProviderById(id),
    getTranslations("provider"),
    getTranslations("common"),
  ]);

  if (!provider) notFound();

  const listings = await getProviderListings(provider.id);
  const message = `Bonjour ${provider.firstName}, je vous contacte via TalentHub.`;

  const social = (provider.socialLinks ?? {}) as Record<string, string>;
  const socialLinks = (
    [
      ["Instagram", social.instagram],
      ["Facebook", social.facebook],
      ["TikTok", social.tiktok],
    ] as const
  )
    .filter(([, v]) => Boolean(v))
    .map(([label, v]) => ({
      label,
      href: v!.startsWith("http") ? v! : `https://${v}`,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* En-tête */}
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative size-20 overflow-hidden rounded-full bg-secondary">
              {provider.photoUrl && (
                <Image
                  src={provider.photoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">
                {provider.firstName} {provider.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {[
                  provider.countryOfOrigin?.name,
                  provider.city &&
                    `${provider.city.name}${provider.city.region ? ` (${provider.city.region})` : ""}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {provider.verified && (
                  <Badge variant="green">✓ {tp("verified")}</Badge>
                )}
                <Badge variant="neutral">
                  {listings.length} {locale === "it" ? "annunci" : "annonces"}
                </Badge>
                <Badge variant="muted">
                  {tp("memberSince", {
                    year: provider.memberSince.getFullYear(),
                  })}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <a
              href={whatsappLink(provider.whatsappNumber, message)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "whatsapp", size: "sm" }))}
            >
              {tc("contactWhatsApp")}
            </a>
            <a
              href={mailtoLink(provider.contactEmail, message)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {tc("sendEmail")}
            </a>
          </div>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
        {/* À propos */}
        <aside className="space-y-5">
          {provider.description && (
            <div>
              <h2 className="mb-1 font-bold text-ink">{tp("about")}</h2>
              <p className="text-sm text-muted-foreground">
                {provider.description}
              </p>
            </div>
          )}
          {provider.countryOfOrigin && (
            <AboutRow
              label={tp("countryOfOrigin")}
              value={provider.countryOfOrigin.name}
            />
          )}
          {provider.city && (
            <AboutRow
              label={tp("cityRegion")}
              value={`${provider.city.name}${provider.city.region ? ` · ${provider.city.region}` : ""}`}
            />
          )}
          {provider.languages.length > 0 && (
            <AboutRow
              label={tp("languages")}
              value={provider.languages.join(" · ")}
            />
          )}
          {socialLinks.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {tp("social")}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-terracotta-deep"
                  >
                    {s.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Annonces */}
        <section>
          <h2 className="mb-4 font-bold text-ink">{tp("listings")}</h2>
          {listings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              —
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AboutRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
