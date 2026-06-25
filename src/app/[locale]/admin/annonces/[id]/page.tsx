import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/user";
import { getListingById } from "@/lib/listings";
import { formatDate, attr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ListingModerationActions } from "@/components/admin/listing-moderation-actions";

export const dynamic = "force-dynamic";

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const listing = await getListingById(id);
  if (!listing) notFound();

  const cover = listing.photos.find((p) => p.isCover) ?? listing.photos[0];
  const prepTime = attr(listing.attributes, "preparationTime");
  const hairstyle = attr(listing.attributes, "hairstyleType");
  const provider = listing.provider;

  const statusBadge =
    listing.status === "PUBLISHED" ? (
      <Badge variant="green">● Publiée</Badge>
    ) : listing.status === "SUSPENDED" ? (
      <Badge variant="amber">● Suspendue</Badge>
    ) : (
      <Badge variant="muted">● Brouillon</Badge>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <Link
        href="/admin/annonces"
        className="text-sm text-muted-foreground hover:text-ink"
      >
        ← Retour à la modération
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="terracotta">
              {listing.category.name}
              {listing.subcategory ? ` · ${listing.subcategory.name}` : ""}
            </Badge>
            {statusBadge}
            {listing.promoted && (
              <Badge variant="terracotta">★ Sponsorisée</Badge>
            )}
          </div>
        </div>
        <ListingModerationActions
          id={listing.id}
          status={listing.status}
          promoted={listing.promoted}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="relative h-72 overflow-hidden rounded-2xl bg-secondary sm:h-80">
            {cover ? (
              <Image
                src={cover.url}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 640px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                Aucune photo
              </div>
            )}
          </div>

          <p className="mt-5 max-w-prose whitespace-pre-line text-sm text-muted-foreground">
            {listing.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {hairstyle && <InfoBox label="Type de coiffure" value={hairstyle} />}
            {prepTime && <InfoBox label="Durée / préparation" value={prepTime} />}
            {listing.serviceZone && (
              <InfoBox label="Zone" value={listing.serviceZone} />
            )}
            {listing.publishedAt && (
              <InfoBox
                label="Publié le"
                value={formatDate(listing.publishedAt, locale)}
              />
            )}
            <InfoBox label="Vues" value={String(listing.viewsCount)} />
          </div>
        </div>

        <aside className="h-fit space-y-2 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-ink">Prestataire</h2>
          <p className="text-sm font-medium text-ink">
            {provider.firstName} {provider.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{provider.contactEmail}</p>
          <p className="text-sm text-muted-foreground">
            {provider.whatsappNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            {[listing.countryOfOrigin?.name, listing.city?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="space-y-1.5 border-t border-hairline pt-3 text-sm font-semibold">
            <Link
              href={`/prestataire/${listing.providerId}`}
              className="block text-terracotta-deep hover:underline"
            >
              Voir le profil public →
            </Link>
            <Link
              href={`/annonce/${listing.id}`}
              className="block text-terracotta-deep hover:underline"
            >
              Ouvrir la page publique →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
