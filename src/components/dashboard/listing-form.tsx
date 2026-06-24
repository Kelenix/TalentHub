"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { saveListingAction } from "@/lib/listings/actions";
import { uploadListingPhoto } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryOpt = {
  slug: string;
  name: string;
  subcategories: { slug: string; name: string }[];
};

export type ListingFormInitial = {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  cityId: string;
  countryIso: string;
  serviceZone: string;
  availability: "AVAILABLE" | "UNAVAILABLE";
  preparationTime: string;
  dishOrigin: string;
  hairstyleType: string;
  photos: { url: string; isCover: boolean }[];
};

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const labelClass = "text-sm font-medium text-ink";

export function ListingForm({
  categories,
  cities,
  countries,
  initial,
}: {
  categories: CategoryOpt[];
  cities: { id: string; name: string }[];
  countries: { iso: string; name: string }[];
  initial?: ListingFormInitial;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(
    initial?.categorySlug ?? categories[0]?.slug ?? "cuisine",
  );
  const [subcategory, setSubcategory] = useState(initial?.subcategorySlug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [cityId, setCityId] = useState(initial?.cityId ?? "");
  const [countryIso, setCountryIso] = useState(initial?.countryIso ?? "");
  const [serviceZone, setServiceZone] = useState(initial?.serviceZone ?? "");
  const [availability, setAvailability] = useState<
    "AVAILABLE" | "UNAVAILABLE"
  >(initial?.availability ?? "AVAILABLE");
  const [preparationTime, setPreparationTime] = useState(
    initial?.preparationTime ?? "",
  );
  const [dishOrigin, setDishOrigin] = useState(initial?.dishOrigin ?? "");
  const [hairstyleType, setHairstyleType] = useState(
    initial?.hairstyleType ?? "",
  );
  const [photos, setPhotos] = useState<{ url: string; isCover: boolean }[]>(
    initial?.photos ?? [],
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeCategory = categories.find((c) => c.slug === category);
  const isCuisine = category === "cuisine";
  const isBeaute = category === "beaute";

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: { url: string; isCover: boolean }[] = [];
      for (const file of Array.from(files).slice(0, 5)) {
        const url = await uploadListingPhoto(file);
        uploaded.push({ url, isCover: false });
      }
      setPhotos((prev) => {
        const next = [...prev, ...uploaded].slice(0, 5);
        if (!next.some((p) => p.isCover) && next.length) next[0].isCover = true;
        return [...next];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.url !== url);
      if (!next.some((p) => p.isCover) && next.length) next[0].isCover = true;
      return [...next];
    });
  }

  function setCover(url: string) {
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.url === url })));
  }

  async function submit(status: "PUBLISHED" | "DRAFT") {
    setError(null);
    setSubmitting(true);
    try {
      const result = await saveListingAction({
        id: initial?.id,
        title,
        description,
        categorySlug: category,
        subcategorySlug: subcategory || undefined,
        cityId: cityId || undefined,
        countryIso: countryIso || undefined,
        serviceZone: serviceZone || undefined,
        availability,
        status,
        preparationTime: preparationTime || undefined,
        dishOrigin: dishOrigin || undefined,
        hairstyleType: hairstyleType || undefined,
        photos,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit("PUBLISHED");
      }}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-6">
        {/* Catégorie */}
        <div className="space-y-2">
          <p className={labelClass}>Catégorie *</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  setCategory(c.slug);
                  setSubcategory("");
                }}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  category === c.slug
                    ? "border-terracotta bg-terracotta text-primary-foreground"
                    : "border-border bg-card text-ink hover:border-terracotta",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sous-catégorie + origine */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>Sous-catégorie</label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {activeCategory?.subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>
              {isCuisine ? "Origine du plat" : "Origine"}
            </label>
            <select
              value={countryIso}
              onChange={(e) => setCountryIso(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {countries.map((c) => (
                <option key={c.iso} value={c.iso}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Titre */}
        <div className="space-y-1">
          <label className={labelClass}>
            {isCuisine ? "Titre / nom du plat *" : "Titre *"}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className={labelClass}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Bloc spécifique cuisine */}
        {isCuisine && (
          <fieldset className="space-y-4 rounded-xl border border-terracotta-soft bg-terracotta-soft/40 p-4">
            <legend className="px-1 text-sm font-semibold text-terracotta">
              Détails cuisine
            </legend>
            <div className="space-y-1">
              <label className={labelClass}>Temps de préparation</label>
              <input
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                placeholder="2 heures"
                className={inputClass}
              />
            </div>
          </fieldset>
        )}

        {/* Bloc spécifique coiffure / beauté */}
        {isBeaute && (
          <fieldset className="space-y-4 rounded-xl border border-terracotta-soft bg-terracotta-soft/40 p-4">
            <legend className="px-1 text-sm font-semibold text-terracotta-deep">
              Détails coiffure
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>Type de coiffure</label>
                <input
                  value={hairstyleType}
                  onChange={(e) => setHairstyleType(e.target.value)}
                  placeholder="Knotless braids, box braids…"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>
                  Temps moyen de réalisation
                </label>
                <input
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  placeholder="4 heures"
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>
        )}

        {/* Disponibilité */}
        <div className="space-y-2">
          <p className={labelClass}>Disponibilité *</p>
          <div className="flex gap-2">
            {(["AVAILABLE", "UNAVAILABLE"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAvailability(value)}
                className={cn(
                  "rounded-lg border px-5 py-2 text-sm font-medium transition-colors",
                  availability === value
                    ? value === "AVAILABLE"
                      ? "border-green bg-green text-accent-foreground"
                      : "border-ink bg-ink text-cream"
                    : "border-border bg-card text-ink",
                )}
              >
                {value === "AVAILABLE" ? "Disponible" : "Indisponible"}
              </button>
            ))}
          </div>
        </div>

        {/* Ville + zone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>Ville</label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Zone de service</label>
            <input
              value={serviceZone}
              onChange={(e) => setServiceZone(e.target.value)}
              placeholder="Milano et environs (~20 km)"
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || uploading}>
            Publier l&apos;annonce
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting || uploading}
            onClick={() => submit("DRAFT")}
          >
            Enregistrer le brouillon
          </Button>
        </div>
      </div>

      {/* Photos */}
      <aside className="space-y-3">
        <p className={labelClass}>Photos</p>
        <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-center text-sm text-muted-foreground hover:border-terracotta">
          <span className="text-2xl text-terracotta">+</span>
          {uploading ? "Envoi…" : "Glissez vos photos ici"}
          <span className="text-xs">JPG, PNG — 5 photos max</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading || photos.length >= 5}
          />
        </label>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((p) => (
              <div
                key={p.url}
                className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
              >
                <Image
                  src={p.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(p.url)}
                  className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-white"
                  aria-label="Retirer"
                >
                  <X className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setCover(p.url)}
                  className={cn(
                    "absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    p.isCover
                      ? "bg-terracotta text-primary-foreground"
                      : "bg-ink/70 text-white opacity-0 group-hover:opacity-100",
                  )}
                >
                  {p.isCover ? "Couverture" : "Définir"}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
          Astuce : une belle photo principale augmente fortement le nombre de
          contacts.
        </p>
      </aside>
    </form>
  );
}
