import { supabase } from "@/integrations/supabase/client";

const MEDIA_BUCKET = "media";

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "uploads";

const getExtension = (file: File) => {
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt && nameExt !== file.name.toLowerCase()) return nameExt;
  const mimeExt = file.type.split("/").pop()?.replace("jpeg", "jpg");
  return mimeExt || "bin";
};

export async function uploadPublicMedia(file: File, folder = "uploads") {
  const safeFolder = folder
    .split("/")
    .map(sanitizeSegment)
    .filter(Boolean)
    .join("/");
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${safeFolder}/${Date.now()}-${randomId}.${getExtension(file)}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error("Upload completed, but no public URL was returned.");
  return data.publicUrl;
}