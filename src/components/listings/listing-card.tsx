import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AvailabilityBadge } from "@/components/listings/availability-badge";
import type { ListingWithRelations } from "@/lib/listings";

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const cover = listing.photos.find((p) => p.isCover) ?? listing.photos[0];
  const tag = listing.subcategory?.name ?? listing.category.name;
  const location = [listing.countryOfOrigin?.name, listing.city?.name]
    .filter(Boolean)
    .join(" · ");
  const providerName = `${listing.provider.firstName} ${listing.provider.lastName}`;

  return (
    <Link
      href={`/annonce/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {cover ? (
          <Image
            src={cover.url}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
            {listing.category.name}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur">
          {tag}
        </span>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-ink transition-colors group-hover:text-terracotta-deep">
          {listing.title}
        </h3>
        {location && (
          <p className="text-xs text-muted-foreground">{location}</p>
        )}
        <div className="flex items-center justify-between border-t border-hairline pt-3">
          <span className="line-clamp-1 text-xs font-medium text-muted-foreground">
            {providerName}
          </span>
          <AvailabilityBadge availability={listing.availability} />
        </div>
      </div>
    </Link>
  );
}
