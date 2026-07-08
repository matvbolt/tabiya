import { supabase } from "./supabase";

export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
};

export const removeAvatar = async (
  userId: string
): Promise<{ error: string | null }> => {
  const { data: files } = await supabase.storage.from("avatars").list(userId);
  if (files && files.length) {
    await supabase.storage
      .from("avatars")
      .remove(files.map((f) => `${userId}/${f.name}`));
  }
  return { error: null };
};
