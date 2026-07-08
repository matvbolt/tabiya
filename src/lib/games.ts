import { Chess } from "chess.js";
import { supabase } from "./supabase";
import { notifyLobby } from "./realtime";

export type GameMode = "rated" | "training";

export type GameRow = {
  id: string;
  white_id: string | null;
  black_id: string | null;
  opponent_id: string | null;
  mode: string;
  opening_id: string | null;
  fen: string;
  pgn: string;
  status: "waiting" | "active" | "finished" | "aborted";
  winner: "white" | "black" | "draw" | null;
  turn: "white" | "black";
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  game: GameRow;
  from: { id: string; username: string; rating: number };
};

const START_FEN = new Chess().fen();

const randomColor = () : "white" | "black" => {
  return Math.random() < 0.5 ? "white" : "black";
}

const seatFor = (userId: string, color: "white" | "black") => {
  return color === "white"
    ? { white_id: userId, black_id: null }
    : { white_id: null, black_id: userId };
}

const creatorId = (g: GameRow) : string | null => {
  return g.white_id ?? g.black_id;
}

const insertGame = async (fields: Partial<GameRow>) : Promise<string | null> => {
  const { data, error } = await supabase
    .from("games")
    .insert({
      fen: START_FEN,
      status: "waiting",
      turn: "white",
      ...fields,
    })
    .select("id")
    .single();
  if (error) {
    console.error("insertGame", error);
    return null;
  }
  return (data as { id: string }).id;
}

export const joinGame = async (
  gameId: string,
  userId: string
): Promise<{ error: string | null }> => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();
  if (error || !data) return { error: error?.message ?? "Game not found" };
  const g = data as GameRow;
  const patch =
    g.white_id == null
      ? { white_id: userId }
      : g.black_id == null
        ? { black_id: userId }
        : null;
  if (!patch) return { error: "This game already has two players" };
  const { error: upErr } = await supabase
    .from("games")
    .update({
      ...patch,
      opponent_id: null,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId);
  if (!upErr) notifyLobby();
  return { error: upErr?.message ?? null };
}

export const quickMatch = async (
  userId: string,
  myRating: number,
  mode: GameMode
): Promise<{ id: string | null; waiting: boolean; error: string | null }> => {
  const { data } = await supabase
    .from("games")
    .select("*")
    .eq("status", "waiting")
    .eq("mode", mode)
    .is("opponent_id", null);

  const candidates = ((data as GameRow[]) ?? []).filter(
    (g) => creatorId(g) && creatorId(g) !== userId
  );

  if (candidates.length > 0) {
    const ids = candidates.map((g) => creatorId(g)!) as string[];
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, rating")
      .in("id", ids);
    const rating = new Map(
      ((profs as { id: string; rating: number }[]) ?? []).map((p) => [
        p.id,
        p.rating,
      ])
    );
    candidates.sort(
      (a, b) =>
        Math.abs((rating.get(creatorId(a)!) ?? 0) - myRating) -
        Math.abs((rating.get(creatorId(b)!) ?? 0) - myRating)
    );
    const best = candidates[0];
    const { error } = await joinGame(best.id, userId);
    if (!error) return { id: best.id, waiting: false, error: null };
  }

  const id = await insertGame({
    ...seatFor(userId, randomColor()),
    mode,
    opponent_id: null,
  });
  if (id) notifyLobby();
  return { id, waiting: true, error: id ? null : "Could not create game" };
}

export const challengeFriend = async (
  userId: string,
  friendId: string,
  mode: GameMode,
  openingId: string | null = null
): Promise<{ id: string | null; error: string | null }> => {
  const id = await insertGame({
    ...seatFor(userId, randomColor()),
    opponent_id: friendId,
    mode,
    opening_id: mode === "training" ? openingId : null,
  });
  if (id) notifyLobby();
  return { id, error: id ? null : "Could not create challenge" };
}

export const listIncomingChallenges = async (
  userId: string
) : Promise<Challenge[]> => {
  const { data } = await supabase
    .from("games")
    .select("*")
    .eq("opponent_id", userId)
    .eq("status", "waiting")
    .order("created_at", { ascending: false });
  const games = (data as GameRow[]) ?? [];
  if (games.length === 0) return [];

  const fromIds = games.map((g) => creatorId(g)!).filter(Boolean);
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, username, rating")
    .in("id", fromIds);
  const byId = new Map(
    ((profs as { id: string; username: string; rating: number }[]) ?? []).map(
      (p) => [p.id, p]
    )
  );
  return games.map((g) => ({
    game: g,
    from: byId.get(creatorId(g)!) ?? {
      id: creatorId(g)!,
      username: "unknown",
      rating: 0,
    },
  }));
}
