import { supabase } from "./supabase";

export const awardCoins = async (userId: string, amount: number) => {
  const { data } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", userId)
    .single();
  const cur = (data as { coins: number } | null)?.coins ?? 0;
  await supabase
    .from("profiles")
    .update({ coins: cur + amount })
    .eq("id", userId);
};

export const spendCoins = async (
  userId: string,
  cost: number
): Promise<{ ok: boolean; coins: number }> => {
  const { data } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", userId)
    .single();
  const cur = (data as { coins: number } | null)?.coins ?? 0;
  if (cur < cost) return { ok: false, coins: cur };
  await supabase
    .from("profiles")
    .update({ coins: cur - cost })
    .eq("id", userId);
  return { ok: true, coins: cur - cost };
};

export const equipBadge = async (userId: string, badge: string | null) => {
  await supabase.from("profiles").update({ badge }).eq("id", userId);
};

export const listRedemptions = async (
  userId: string
): Promise<Record<string, string>> => {
  const { data } = await supabase
    .from("redemptions")
    .select("partner, code")
    .eq("user_id", userId);
  const map: Record<string, string> = {};
  for (const r of (data as { partner: string; code: string }[]) ?? [])
    map[r.partner] = r.code;
  return map;
};

const makeCode = () =>
  "TABIYA-" +
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  Math.random().toString(36).slice(2, 4).toUpperCase();

export const redeemPartner = async (
  userId: string,
  partner: string,
  price: number
): Promise<{ code: string | null; error: string | null }> => {
  const { data: existing } = await supabase
    .from("redemptions")
    .select("code")
    .eq("user_id", userId)
    .eq("partner", partner)
    .maybeSingle();
  if (existing) return { code: (existing as { code: string }).code, error: null };

  const { ok } = await spendCoins(userId, price);
  if (!ok) return { code: null, error: "not_enough" };

  const code = makeCode();
  const { error } = await supabase
    .from("redemptions")
    .insert({ user_id: userId, partner, code });
  if (error) return { code: null, error: error.message };
  return { code, error: null };
};

export const equipStyle = async (userId: string, style: string | null) => {
  await supabase.from("profiles").update({ name_style: style }).eq("id", userId);
};

export const purchaseStyle = async (
  userId: string,
  id: string,
  price: number
): Promise<{ ok: boolean }> => {
  const { data } = await supabase
    .from("profiles")
    .select("coins, owned_styles")
    .eq("id", userId)
    .single();
  const row = data as { coins: number; owned_styles: string[] } | null;
  const coins = row?.coins ?? 0;
  const owned = row?.owned_styles ?? [];
  if (owned.includes(id)) return { ok: true };
  if (coins < price) return { ok: false };
  await supabase
    .from("profiles")
    .update({ coins: coins - price, owned_styles: [...owned, id] })
    .eq("id", userId);
  return { ok: true };
};

export const purchaseBadge = async (
  userId: string,
  emoji: string,
  price: number
): Promise<{ ok: boolean }> => {
  const { data } = await supabase
    .from("profiles")
    .select("coins, owned_badges")
    .eq("id", userId)
    .single();
  const row = data as { coins: number; owned_badges: string[] } | null;
  const coins = row?.coins ?? 0;
  const owned = row?.owned_badges ?? [];
  if (owned.includes(emoji)) return { ok: true };
  if (coins < price) return { ok: false };
  await supabase
    .from("profiles")
    .update({ coins: coins - price, owned_badges: [...owned, emoji] })
    .eq("id", userId);
  return { ok: true };
};
