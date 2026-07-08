import type { EvalInfo } from "../engine/stockfish";

export type Quality =
  | "book"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export const QUALITY_SYMBOL: Record<Quality, string> = {
  book: "📖",
  best: "★",
  excellent: "!",
  good: "✓",
  inaccuracy: "?!",
  mistake: "?",
  blunder: "??",
};

export const cpFromInfo = (info: EvalInfo): number => {
  if (info.mateIn != null) return info.mateIn > 0 ? 3000 : -3000;
  return info.scoreCp ?? 0;
};

export const classify = (lossCp: number, isBest: boolean): Quality => {
  if (isBest || lossCp <= 10) return "best";
  if (lossCp <= 40) return "excellent";
  if (lossCp <= 90) return "good";
  if (lossCp <= 180) return "inaccuracy";
  if (lossCp <= 350) return "mistake";
  return "blunder";
};
