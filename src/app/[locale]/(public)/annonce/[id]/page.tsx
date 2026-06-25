import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getListingById } from "@/lib/listings";
import { getCurrentUser } from "@/lib/auth/user";
import { formatDate, attr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { AvailabilityBadge } from "@/components/listings/availability-badge";
import { ContactButtons } from "@/components/listings/contact-buttons";
import { ContactMemberButton } from "@/components/messages/contact-member-button";
import { ViewTracker } from "@/components/listings/view-tracker";
import { ReportButton } from "@/components/listings/report-button";
import { JsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: "Annonce" };
  const cover = listing.photos.find((p) => p.isCover) ?? listing.photos[0];
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: cover ? { images: [cover.url] } : undefined,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [listing, t, tc] = await Promise.all([
    getListingById(id),
    getTranslations("listing"),
    getTranslations("common"),
  ]);

  if (!listing) notFound();

  // Visibilité : le public ne voit que les annonces PUBLIÉES.
  // Le propriétaire et l'admin peuvent voir une annonce suspendue / brouillon.
  const isPublished = listing.status === "PUBLISHED";
  const viewer = await getCurrentUser();
  const viewerIsOwner = viewer?.profile?.id === listing.providerId;
  const viewerIsAdmin = viewer?.role === "ADMIN";
  if (!isPublished && !viewerIsOwner && !viewerIsAdmin) notFound();
  // Tout le monde voit le bouton (sauf le propriétaire) ; un visiteur déconnecté
  // est invité à se connecter au clic.
  const canMessage = !viewerIsOwner;

  const cover = listing.photos.find((p) => p.isCover) ?? listing.photos[0];
  const thumbs = listing.photos.filter((p) => p.id !== cover?.id).slice(0, 4);
  const provider = listing.provider;
  const prepTime = attr(listing.attributes, "preparationTime");
  const hairstyle = attr(listing.attributes, "hairstyleType");
  const isCuisine = listing.category.slug === "cuisine";
  const message = `Bonjour, je vous contacte via TalentHub à propos de « ${listing.title} ».`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {!isPublished && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            {listing.status === "SUSPENDED"
              ? viewerIsAdmin
                ? "Annonce suspendue — masquée au public. Visible par vous (admin) et le prestataire."
                : "Votre annonce est suspendue par la modération : elle n'est pas visible publiquement. Contactez l'administration pour toute justification."
              : viewerIsAdmin
                ? "Brouillon — non publié par le prestataire, masqué au public."
                : "Cette annonce est en brouillon : elle n'est pas encore visible publiquement."}
          </span>
          {viewerIsAdmin && (
            <Link
              href="/admin/annonces"
              className="font-semibold text-amber-900 underline hover:no-underline"
            >
              Gérer dans la modération →
            </Link>
          )}
        </div>
      )}
      {isPublished && <ViewTracker listingId={listing.id} />}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: listing.title,
          description: listing.description.slice(0, 300),
          serviceType: listing.category.name,
          ...(cover
            ? {
                image: cover.url.startsWith("http")
                  ? cover.url
                  : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${cover.url}`,
              }
            : {}),
          ...(listing.city ? { areaServed: listing.city.name } : {}),
          provider: {
            "@type": "Person",
            name: `${provider.firstName} ${provider.lastName}`,
          },
        }}
      />

      {/* Fil d'ariane */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/recherche" className="hover:text-terracotta">
          {listing.category.name}
        </Link>
        {listing.subcategory && <> › {listing.subcategory.name}</>}
        <> › </>
        <span className="text-ink">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        {/* Colonne principale */}
        <div>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-secondary">
            {cover ? (
              <Image
                src={cover.url}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-medium uppercase tracking-wide text-slate-400">
                {listing.category.name}
              </div>
            )}
          </div>

          {thumbs.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {thumbs.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-secondary"
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
              ))}
            </div>
          )}

          <h1 className="mt-8 text-3xl font-bold text-ink">{listing.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="terracotta">
              {listing.category.name}
              {listing.subcategory ? ` · ${listing.subcategory.name}` : ""}
            </Badge>
            {listing.countryOfOrigin && (
              <Badge variant="neutral">
                {t("origin")} : {listing.countryOfOrigin.name}
              </Badge>
            )}
            <AvailabilityBadge availability={listing.availability} />
          </div>

          <p className="mt-5 max-w-prose whitespace-pre-line text-muted-foreground">
            {listing.description}
          </p>

          {/* Boîtes d'information */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {hairstyle && (
              <InfoBox label={t("hairstyleType")} value={hairstyle} />
            )}
            {prepTime && (
              <InfoBox
                label={isCuisine ? t("preparationTime") : t("duration")}
                value={prepTime}
              />
            )}
            {listing.serviceZone && (
              <InfoBox label={t("serviceZone")} value={listing.serviceZone} />
            )}
            {listing.publishedAt && (
              <InfoBox
                label={t("publishedOn")}
                value={formatDate(listing.publishedAt, locale)}
              />
            )}
          </div>
        </div>

        {/* Carte prestataire */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-full bg-secondary">
              {provider.photoUrl && (
                <Image
                  src={provider.photoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              )}
            </div>
            <div>
              <p className="font-bold text-ink">
                {provider.firstName} {provider.lastName}
              </p>
            </div>
          </div>

          {provider.description && (
            <p className="mt-4 text-sm text-muted-foreground">
              {provider.description}
            </p>
          )}

          <div className="mt-5 space-y-3">
            <ContactButtons
              listingId={listing.id}
              whatsappNumber={provider.whatsappNumber}
              email={provider.contactEmail}
              message={message}
              whatsappLabel={tc("contactWhatsApp")}
              emailLabel={tc("sendEmail")}
            />
            {canMessage && (
              <ContactMemberButton
                recipientId={provider.userId}
                recipientName={`${provider.firstName} ${provider.lastName}`}
                listingId={listing.id}
                isLoggedIn={Boolean(viewer)}
              />
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {tc("noPaymentNotice")}
          </p>

          <Link
            href={`/prestataire/${provider.id}`}
            className="mt-4 block text-center text-sm font-semibold text-terracotta hover:underline"
          >
            {tc("viewProfile")} →
          </Link>

          <div className="mt-4 border-t border-hairline pt-4">
            <ReportButton listingId={listing.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
