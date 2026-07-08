import { supabase } from "./supabase";

export const uploadMedia = async (
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
};
