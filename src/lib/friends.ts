import { supabase } from "./supabase";
import { notifyLobby } from "./realtime";

export type FriendProfile = {
  id: string;
  username: string;
  rating: number;
  avatar_url: string | null;
  badge: string | null;
  name_style: string | null;
};

const PROFILE_COLS = "id, username, rating, avatar_url, badge, name_style";

export type Friendship = {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";

  other: FriendProfile;

  incoming: boolean;
};

export const searchUsers = async (
  query: string,
  selfId: string
) : Promise<FriendProfile[]> => {
  const q = query.trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .ilike("username", `%${q}%`)
    .neq("id", selfId)
    .limit(10);
  if (error) console.error("searchUsers", error);
  return (data as FriendProfile[]) ?? [];
}

export const sendRequest = async (selfId: string, friendId: string) => {
  const { error } = await supabase
    .from("friendships")
    .insert({ user_id: selfId, friend_id: friendId, status: "pending" });
  if (!error) notifyLobby();
  return { error: error?.message ?? null };
}

export const acceptRequest = async (friendshipId: string) => {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (!error) notifyLobby();
  return { error: error?.message ?? null };
}

export const removeFriendship = async (friendshipId: string) => {
  await supabase.from("friendships").delete().eq("id", friendshipId);
  notifyLobby();
}

export const listFriendships = async (selfId: string) : Promise<Friendship[]> => {
  const { data: rows, error } = await supabase
    .from("friendships")
    .select("id, user_id, friend_id, status")
    .or(`user_id.eq.${selfId},friend_id.eq.${selfId}`);
  if (error) {
    console.error("listFriendships", error);
    return [];
  }
  const raw = (rows as Omit<Friendship, "other" | "incoming">[]) ?? [];
  if (raw.length === 0) return [];

  const otherIds = Array.from(
    new Set(raw.map((r) => (r.user_id === selfId ? r.friend_id : r.user_id)))
  );
  const { data: profs } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .in("id", otherIds);
  const byId = new Map(
    ((profs as FriendProfile[]) ?? []).map((p) => [p.id, p])
  );

  return raw.map((r) => {
    const otherId = r.user_id === selfId ? r.friend_id : r.user_id;
    return {
      ...r,
      other: byId.get(otherId) ?? {
        id: otherId,
        username: "unknown",
        rating: 0,
        avatar_url: null,
        badge: null,
        name_style: null,
      },
      incoming: r.friend_id === selfId,
    };
  });
}
