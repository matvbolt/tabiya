import { Chess, type Move } from "chess.js";
import type { EvalInfo } from "../engine/stockfish";
import type { Lang } from "../i18n";

const PIECE_EN: Record<string, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

const PIECE_RU: Record<string, string> = {
  p: "пешку",
  n: "коня",
  b: "слона",
  r: "ладью",
  q: "ферзя",
  k: "короля",
};

const CENTER = new Set(["d4", "e4", "d5", "e5", "c4", "c5", "f4", "f5"]);

export const explainMove = (move: Move, lang: Lang): string => {
  const san = move.san;
  const ru = lang === "ru";
  const piece = (t: string) => (ru ? PIECE_RU[t] : PIECE_EN[t]);

  if (san.includes("#")) return ru ? "Ставит мат." : "Delivers checkmate.";
  if (move.flags.includes("k"))
    return ru
      ? "Короткая рокировка — безопасность короля и связь ладей."
      : "Castles kingside — king safety and connected rooks.";
  if (move.flags.includes("q"))
    return ru
      ? "Длинная рокировка — безопасность и активная ладья."
      : "Castles queenside — safety while activating a rook.";
  if (san.includes("+"))
    return move.captured
      ? ru
        ? `Взятие на ${move.to} с шахом.`
        : `Captures on ${move.to} with check.`
      : ru
        ? "Шах — вынуждает ответ соперника."
        : "Gives check, forcing the opponent's reply.";
  if (move.flags.includes("p"))
    return ru
      ? "Превращает пешку в сильную фигуру."
      : "Promotes the pawn into a powerful piece.";
  if (move.captured)
    return ru
      ? `Выигрывает материал — берёт ${piece(move.captured)} на ${move.to}.`
      : `Wins material — takes the ${piece(move.captured)} on ${move.to}.`;
  if (move.piece === "p" && CENTER.has(move.to))
    return ru ? "Борется за центр." : "Fights for space in the centre.";

  const homeRank = move.color === "w" ? "1" : "8";
  const fromHome = move.from[1] === homeRank;
  if ((move.piece === "n" || move.piece === "b") && fromHome)
    return ru
      ? `Выводит ${piece(move.piece)} в игру.`
      : `Develops the ${piece(move.piece)} into the game.`;
  if (move.piece === "r")
    return ru
      ? "Активизирует ладью на полезной вертикали."
      : "Activates the rook on a useful file.";
  if (move.piece === "q")
    return ru ? "Вводит ферзя в игру." : "Brings the queen into play.";
  if (move.piece === "p")
    return ru
      ? "Продвигает пешку, захватывая пространство."
      : "Advances a pawn to gain space.";
  return ru ? "Улучшает позицию." : "Improves the position.";
};

export const describeUci = (
  fen: string,
  from: string,
  to: string,
  promotion: string | undefined,
  lang: Lang,
  fallbackReason: string
): { san: string; reason: string } => {
  try {
    const m = new Chess(fen).move({ from, to, promotion });
    return { san: m.san, reason: explainMove(m, lang) };
  } catch {
    return { san: `${from}→${to}`, reason: fallbackReason };
  }
};

export const formatEval = (info: EvalInfo, lang: Lang): string | null => {
  const ru = lang === "ru";
  if (info.mateIn != null)
    return info.mateIn > 0
      ? ru
        ? `мат в ${info.mateIn}`
        : `mate in ${info.mateIn}`
      : ru
        ? `мат через ${-info.mateIn}`
        : `mated in ${-info.mateIn}`;
  if (info.scoreCp != null) {
    const pawns = info.scoreCp / 100;
    const sign = pawns > 0 ? "+" : "";
    return `${sign}${pawns.toFixed(1)}`;
  }
  return null;
};
