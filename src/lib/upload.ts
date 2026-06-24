import { createClient } from "@/lib/supabase/client";

const BUCKET = "listings";

/** Upload d'une photo d'annonce vers Supabase Storage. Renvoie l'URL publique. */
export async function uploadListingPhoto(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
