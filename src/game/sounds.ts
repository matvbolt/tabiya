import type { Move } from "chess.js";

export type SoundType =
  | "move"
  | "capture"
  | "check"
  | "castle"
  | "promote"
  | "gameStart"
  | "gameEnd"
  | "resign";

const FILES = {
  move: "/sounds/Move.mp3",
  capture: "/sounds/Capture.mp3",
  confirm: "/sounds/Confirmation.mp3",
  notify: "/sounds/GenericNotify.mp3",
  end: "/sounds/Berserk.mp3",
  boom: "/sounds/Explosion.mp3",
} as const;

const MAP: Record<SoundType, keyof typeof FILES> = {
  move: "move",
  capture: "capture",
  check: "notify",
  castle: "move",
  promote: "confirm",
  gameStart: "confirm",
  gameEnd: "end",
  resign: "boom",
};

const players: Partial<Record<keyof typeof FILES, HTMLAudioElement>> = {};

const get = (key: keyof typeof FILES): HTMLAudioElement | null => {
  if (typeof Audio === "undefined") return null;
  if (!players[key]) {
    const a = new Audio(FILES[key]);
    a.preload = "auto";
    a.volume = 0.6;
    players[key] = a;
  }
  return players[key]!;
};

export const playSound = (type: SoundType) => {
  const audio = get(MAP[type]);
  if (!audio) return;
  try {
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  } catch {

  }
};

export const playMoveSound = (
  move: Move,
  opts: { inCheck: boolean; gameOver: boolean }
) => {
  if (opts.gameOver) {
    playSound("gameEnd");
    return;
  }
  if (opts.inCheck) {
    playSound("check");
    return;
  }
  const flags = move.flags;
  if (flags.includes("k") || flags.includes("q")) playSound("castle");
  else if (flags.includes("p")) playSound("promote");
  else if (flags.includes("c") || flags.includes("e")) playSound("capture");
  else playSound("move");
};
