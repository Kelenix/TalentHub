"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { updateProfileAction } from "@/lib/profile/actions";
import { uploadListingPhoto } from "@/lib/upload";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const labelClass = "text-sm font-medium text-ink";

export type ProfileFormInitial = {
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  contactEmail: string;
  description: string;
  countryIso: string;
  cityId: string;
  languages: string;
  photoUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
};

export function ProfileForm({
  initial,
  cities,
  countries,
}: {
  initial: ProfileFormInitial;
  cities: { id: string; name: string }[];
  countries: { iso: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ProfileFormInitial>(
    key: K,
    value: ProfileFormInitial[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onAvatar(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setPhotoUrl(await uploadListingPhoto(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateProfileAction({ ...form, photoUrl });
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative size-16 overflow-hidden rounded-full bg-secondary">
          {photoUrl && (
            <Image src={photoUrl} alt="" fill className="object-cover" sizes="64px" />
          )}
        </div>
        <label className="cursor-pointer text-sm font-medium text-terracotta hover:underline">
          {uploading ? "Envoi…" : "Changer la photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onAvatar(e.target.files?.[0])}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Prénom *">
          <input
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Nom *">
          <input
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Numéro WhatsApp *">
          <input
            value={form.whatsappNumber}
            onChange={(e) => set("whatsappNumber", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Email de contact *">
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Pays d'origine">
          <select
            value={form.countryIso}
            onChange={(e) => set("countryIso", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {countries.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ville">
          <select
            value={form.cityId}
            onChange={(e) => set("cityId", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Langues (séparées par des virgules)">
        <input
          value={form.languages}
          onChange={(e) => set("languages", e.target.value)}
          placeholder="Français, Italien, Anglais"
          className={inputClass}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>

      <div className="space-y-2">
        <p className={labelClass}>Réseaux sociaux (optionnel)</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            placeholder="Instagram (lien)"
            className={inputClass}
          />
          <input
            value={form.facebook}
            onChange={(e) => set("facebook", e.target.value)}
            placeholder="Facebook (lien)"
            className={inputClass}
          />
          <input
            value={form.tiktok}
            onChange={(e) => set("tiktok", e.target.value)}
            placeholder="TikTok (lien)"
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-green">Profil enregistré.</p>}

      <Button type="submit" disabled={saving || uploading}>
        Enregistrer
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
